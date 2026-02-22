"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Settings, LogOut, ExternalLink } from "lucide-react";
import styles from "./dashboard.module.css";
import NeuralNetworkBackground from "@/components/NeuralNetworkBackground";

// --- Types ---
interface ScanLog {
  type: "info" | "duplicate" | "clean";
  message?: string;
  issue_id?: number;
  match_id?: number;
  score?: number;
  title?: string;
  url?: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ScanLog[]>([]); 
  const [summary, setSummary] = useState("");
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [loadingRepos, setLoadingRepos] = useState(true);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchRepos();
  }, [status, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await axios.get("/api/repos");
      setRepos(res.data.repos);
      if (res.data.repos.length > 0) setSelectedRepo(res.data.repos[0].full_name); 
    } catch (error) {
      console.error(error);
      setSummary("SYSTEM ERROR: Failed to load repository list.");
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleScan = async () => {
    if (!selectedRepo) return;
    setLoading(true);
    setLogs([]); 
    setSummary(`Scanning ${selectedRepo}...`);
    try {
      const res = await axios.post("/api/scan", { repo_full_name: selectedRepo });
      setSummary(res.data.summary);
      setLogs(res.data.logs); 
    } catch (e: any) {
      console.error(e);
      setSummary(`Error: ${e.response?.data?.error || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Light mode loading screen
  if (status === "loading" || loadingRepos) {
    return <div className="min-h-screen bg-[#F3F2ED] text-[#1a1a1a] flex items-center justify-center font-serif text-xl">Loading Engine...</div>;
  }

  return (
    <div className={styles.container}>
      
      {/* Background Effect (Subtle on beige) */}
      <div style={{position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.5}}>
        <NeuralNetworkBackground />
      </div>

      {/* --- HEADER --- */}
      <header className={styles.header}>
        <div className={styles.logo}>GitHelix Console</div>
        
        <div className={styles.profileSection} ref={dropdownRef}>
          <button 
            className={styles.avatarBtn} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img 
              src={session?.user?.image || "https://github.com/ghost.png"} 
              alt="Profile" 
              className={styles.avatarImg}
            />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                {session?.user?.name || "User Account"}
              </div>
              <button 
      className={styles.dropdownItem}
      onClick={() => router.push('/settings')} // <--- This actually navigates
    >
                <Settings size={18} /> Settings
              </button>
              <button 
                className={styles.dropdownItem} 
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className={styles.main}>
        
        {/* Controls (White Card) */}
        <div className={styles.controlsSection}>
          <div className={styles.sectionTitle}>Target Repository</div>
          <div className={styles.inputGroup}>
            <select 
              value={selectedRepo} 
              onChange={(e) => setSelectedRepo(e.target.value)}
              className={styles.select}
            >
              {repos.map((repo) => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.full_name}
                </option>
              ))}
            </select>

            <button 
              onClick={handleScan}
              disabled={loading || !selectedRepo}
              className={styles.scanBtn}
            >
              {loading ? "Scanning..." : "Start Scan"}
            </button>
          </div>
          {summary && <div className={styles.status}>{summary}</div>}
        </div>

        {/* Results (Light Logs) */}
        {logs.length > 0 && (
          <div>
            <div className={styles.sectionTitle} style={{marginTop: '2rem'}}>Live Analysis</div>
            <div className={styles.logsContainer}>
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`${styles.logEntry} ${log.type === "duplicate" ? styles.duplicate : log.type === "clean" ? styles.clean : ""}`}
                >
                  
                  {log.type === "clean" && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                       <span style={{ color: '#10b981' }}>●</span>
                       <strong>#{log.issue_id}</strong>: {log.title}
                    </div>
                  )}

                  {log.type === "duplicate" && (
                    <div>
                      <div className={styles.logHeader}>
                        <span style={{ color: '#ef4444', fontWeight: '800', letterSpacing: '0.05em' }}>⚠️ DUPLICATE DETECTED</span>
                        <span className={styles.matchScore}>{log.score}% Match</span>
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'Times New Roman, serif' }}>{log.title}</div>
                      <div style={{ color: '#666', fontFamily: 'monospace' }}>
                         Matches existing issue <strong>#{log.match_id}</strong>
                      </div>
                      <a href={log.url} target="_blank" className={styles.logLink}>
                         View Issue on GitHub <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                  
                  {log.type === "info" && <div style={{color: '#666', fontStyle: 'italic'}}>{log.message}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}