import os
from dotenv import load_dotenv
from github import Github
from langchain_google_genai import GoogleGenerativeAIEmbeddings
# -----------------------------------------------------
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document

# 1. Load Secrets
load_dotenv()

# Configuration
REPO_NAME = os.getenv("GITHUB_REPO")  
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")    
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def ingest_issues():
    print(f"🚀 Starting ingestion for {REPO_NAME}...")

    # 2. Setup GitHub Connection
    if not GITHUB_TOKEN:
        print("❌ Error: GITHUB_TOKEN is missing in .env")
        return
    if not GOOGLE_API_KEY:
        print("❌ Error: GOOGLE_API_KEY is missing in .env")
        return

    g = Github(GITHUB_TOKEN)
    try:
        repo = g.get_repo(REPO_NAME)
    except Exception as e:
        print(f"❌ Error fetching repo: {e}")
        return

    # 3. Setup AI (Updated to Google Gemini)
    # Using 'models/text-embedding-004' (768 dimensions)
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=GOOGLE_API_KEY
    )
    
    vector_store = PineconeVectorStore(
        index_name=os.getenv("PINECONE_INDEX_NAME"),
        embedding=embeddings
    )

    # 4. Fetch Issues
    print("📥 Fetching closed issues from GitHub...")
    # Fetching both closed AND open issues ensures comprehensive history
    issues = repo.get_issues(state='closed') 
    
    docs_to_upload = []
    
    count = 0
    # Increased limit from 20 to 100 since you have Tier 1 API
    LIMIT = 100 
    
    for issue in issues:
        if issue.pull_request:
            continue

        full_text = f"Title: {issue.title}\nBody: {issue.body}"
        
        doc = Document(
            page_content=full_text,
            metadata={
                "issue_number": issue.number,
                "author": issue.user.login,
                "url": issue.html_url
            }
        )
        docs_to_upload.append(doc)
        print(f"   - Processed Issue #{issue.number}: {issue.title[:30]}...")
        count += 1
        
        if count >= LIMIT: 
            print(f"Stopping at {LIMIT} issues for this run.")
            break

    if docs_to_upload:
        print(f"Uploading {len(docs_to_upload)} vectors to Pinecone...")
        try:
            vector_store.add_documents(docs_to_upload)
            print("✅ Ingestion Complete! Your AI now has memories.")
        except Exception as e:
            print(f"❌ Error uploading to Pinecone: {e}")
    else:
        print("No issues found to upload.")

if __name__ == "__main__":
    ingest_issues()
