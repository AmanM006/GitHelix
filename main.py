import os
import time
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
# ---------------------------------------------------------
# CHANGED: Removed HuggingFace, Added Google GenAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
# ---------------------------------------------------------
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
import httpx

load_dotenv()

# --- Config ---
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
SERVER_GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") 
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") # Ensure this is in your .env file

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY is missing from .env")

app = FastAPI()

# --- Initialize AI Brain (The Fix) ---
# We use 'models/text-embedding-004' which is Google's latest efficient embedding model
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    google_api_key=GOOGLE_API_KEY
)

# Connect to Pinecone using Google's embeddings
vector_store = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings)

# --- Models ---
class ScanRequest(BaseModel):
    repo_name: str
    access_token: str

class GitHubIssue(BaseModel):
    title: str
    body: str | None = ""
    number: int
    html_url: str

class Repository(BaseModel):
    full_name: str

class WebhookPayload(BaseModel):
    action: str
    issue: GitHubIssue
    repository: Repository

# --- Helper Functions ---
async def fetch_repo_issues(repo_name: str, access_token: str, state: str):
    # Added timestamp 't' to force fresh data
    url = f"https://api.github.com/repos/{repo_name}/issues?state={state}&per_page=100&t={time.time()}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code != 200:
            print(f" Error fetching {state} issues: {response.text}")
            return []
        return response.json()

async def add_github_label(repo_full_name: str, issue_number: int, label_name: str):
    url = f"https://api.github.com/repos/{repo_full_name}/issues/{issue_number}/labels"
    headers = {
        "Authorization": f"Bearer {SERVER_GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    payload = {"labels": [label_name]}

    async with httpx.AsyncClient() as client:
        await client.post(url, json=payload, headers=headers)

# --- Routes ---

@app.get("/")
def health_check():
    return {"status": "GitHelix Engine Ready (Powered by Google Gemini)"}

@app.post("/scan")
async def start_scan(request: ScanRequest):
    print(f"STARTING SCAN: {request.repo_name}")
    scan_results = []

    # --- PHASE 1: LEARN (Ingest Closed Issues) ---
    print("--- Phase 1: Learning from Closed Issues ---")
    closed_issues = await fetch_repo_issues(request.repo_name, request.access_token, "closed")
    
    ingest_count = 0
    # Collect docs to batch insert (Faster than one by one)
    docs_to_add = []
    
    for issue in closed_issues:
        if "pull_request" in issue: continue 

        text = f"{issue['title']}. {issue.get('body', '')}"
        doc = Document(
            page_content=text,
            metadata={
                "issue_number": issue['number'],
                "html_url": issue['html_url'],
                "source": "historical_closed"
            }
        )
        docs_to_add.append(doc)
        ingest_count += 1
        
    if docs_to_add:
        try:
            vector_store.add_documents(docs_to_add)
        except Exception as e:
            print(f"Error saving batch: {e}")
            
    scan_results.append({
        "type": "info",
        "message": f"Brain trained on {ingest_count} closed issues."
    })

    # --- PHASE 2: CHECK (Scan Open Issues) ---
    print("--- Phase 2: Checking Open Issues ---")
    open_issues = await fetch_repo_issues(request.repo_name, request.access_token, "open")
    
    duplicates_found = 0
    
    for issue in open_issues:
        if "pull_request" in issue: continue

        existing_labels = [l['name'] for l in issue.get('labels', [])]
        if "Duplicate_detected_by_AI" in existing_labels:
            scan_results.append({
                "type": "clean",
                "issue_id": issue['number'],
                "title": f"{issue['title']} (Already Flagged)"
            })
            continue

        query_text = f"{issue['title']}. {issue.get('body', '')}"
        
        # Search Pinecone using Google Embeddings
        results = vector_store.similarity_search_with_score(query_text, k=1)
        
        if not results: 
            scan_results.append({"type": "clean", "issue_id": issue['number'], "title": issue['title']})
            continue
        
        best_doc, score = results[0]
        
        # Note: Google Embeddings might have different score distributions than HuggingFace.
        # You might need to tweak this 0.65 threshold after testing.
        if score > 0.65: 
            match_id = best_doc.metadata['issue_number']
            print(f"DUPLICATE FOUND: Issue #{issue['number']} matches #{match_id}")
            
            await add_github_label(
                repo_full_name=request.repo_name,
                issue_number=issue['number'],
                label_name="Duplicate_detected_by_AI"
            )
            duplicates_found += 1
            
            scan_results.append({
                "type": "duplicate",
                "issue_id": issue['number'],
                "match_id": match_id,
                "score": round(score * 100, 1),
                "title": issue['title'],
                "url": issue['html_url']
            })
        else:
            scan_results.append({
                "type": "clean",
                "issue_id": issue['number'],
                "title": issue['title']
            })

    return {
        "status": "success",
        "summary": f"Scanned {len(open_issues)} open issues. Found {duplicates_found} duplicates.",
        "logs": scan_results
    }

# --- Webhook ---
@app.post("/webhook")
async def receive_github_webhook(payload: WebhookPayload):
    if payload.action not in ["opened", "reopened"]:
        return {"message": "Ignored"}
    new_issue = payload.issue
    repo_name = payload.repository.full_name
    query_text = f"{new_issue.title}. {new_issue.body}"
    
    results = vector_store.similarity_search_with_score(query_text, k=1)
    
    if results and results[0][1] > 0.75:
        match = results[0][0]
        await add_github_label(repo_name, new_issue.number, "Duplicate_detected_by_AI")
        return {"verdict": "DUPLICATE"}
    else:
        new_doc = Document(
            page_content=query_text,
            metadata={"issue_number": new_issue.number, "source": "webhook"}
        )
        vector_store.add_documents([new_doc])
        return {"verdict": "NEW"}