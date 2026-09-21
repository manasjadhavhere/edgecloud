import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { computeWordFrequencies } from "../utils/wordCount";
import { Lock, ArrowRight, Download, StopCircle, CheckCircle, Table, BarChart2 } from "lucide-react";
import { db } from "../firebase";
import { ref, update, set } from "firebase/database";
import * as XLSX from "xlsx";
import BgGrid from "../components/BgGrid";
import BottomRightWaves from "../components/BottomRightWaves";

export default function LiveResults() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { game, responses } = useGame(gameId);

  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'top'

  // Authentication
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "edgecloud2026") {
      setIsAuthenticated(true);
    } else {
      setError("Incorrect password.");
    }
  };

  // Stop Game Logic
  const handleStopGame = async () => {
    if (!gameId) return;
    try {
      await update(ref(db, `games/${gameId}`), {
        status: "ended",
        endedAt: Date.now(),
      });
      await set(ref(db, "activeGame"), null);
    } catch (err) {
      console.error("Failed to stop game", err);
    }
  };

  // Data processing
  const topWords = useMemo(() => computeWordFrequencies(responses), [responses]);
  
  // Create a map for quick frequency lookup
  const wordFreqMap = useMemo(() => {
    const map = {};
    topWords.forEach(tw => {
      map[tw.text.toLowerCase()] = tw.value;
    });
    return map;
  }, [topWords]);

  // Flatten live data
  const liveData = useMemo(() => {
    const data = [];
    responses.forEach(r => {
      r.words.forEach(w => {
        const cleanWord = w.trim();
        if (cleanWord) {
          const count = wordFreqMap[cleanWord.toLowerCase()] || 1;
          data.push({
            playerName: r.name,
            word: cleanWord,
            count: count,
            submittedAt: r.submittedAt
          });
        }
      });
    });
    // Sort descending by time
    return data.sort((a, b) => b.submittedAt - a.submittedAt);
  }, [responses, wordFreqMap]);

  // Excel Download
  const downloadExcel = () => {
    // 1. Live Results Sheet
    const liveHeaders = ["Player Name", "Word Submitted", "Repeated Count", "Submission Time"];
    const liveRows = liveData.map(d => [
      d.playerName,
      d.word,
      `X${d.count}`,
      new Date(d.submittedAt).toLocaleString()
    ]);
    const wsLive = XLSX.utils.aoa_to_sheet([liveHeaders, ...liveRows]);

    // 2. Top Words Sheet
    const topHeaders = ["Rank", "Word", "Total Count"];
    const topRows = topWords.map((d, i) => [
      i + 1,
      d.text,
      d.value
    ]);
    const wsTop = XLSX.utils.aoa_to_sheet([topHeaders, ...topRows]);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsLive, "Live Results");
    XLSX.utils.book_append_sheet(wb, wsTop, "Top Words");

    // Download
    XLSX.writeFile(wb, `Live_Results_${gameId}.xlsx`);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ background: "#fff", padding: "3rem", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", maxWidth: 400, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Lock size={32} color="#901b1e" style={{ margin: "0 auto", marginBottom: "1rem" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b" }}>Live Results Access</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.5rem" }}>Enter password to view live game data.</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              autoFocus
              style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "1rem", outline: "none" }}
            />
            {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}
            <button type="submit" style={{ width: "100%", padding: "0.8rem", background: "#901b1e", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#a92124"} onMouseLeave={e => e.currentTarget.style.background = "#901b1e"}>
              Enter <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isEnded = game?.status === "ended";

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", position: "relative" }}>
      <BgGrid />
      <BottomRightWaves />
      
      <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", background: "#fff", padding: "1.5rem 2rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>Live Dashboard</h1>
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Game ID: <strong>{gameId}</strong> · {responses.length} responses</p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {isEnded ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#10b981", fontWeight: 600, background: "#ecfdf5", padding: "0.5rem 1rem", borderRadius: "6px" }}>
                <CheckCircle size={18} /> Game Ended
              </span>
            ) : (
              <button onClick={handleStopGame} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#901b1e", color: "#fff", border: "none", padding: "0.75rem 1.25rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 10px rgba(144,27,30,0.3)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#a92124"} onMouseLeave={e => e.currentTarget.style.background = "#901b1e"}>
                <StopCircle size={18} /> Stop Game
              </button>
            )}
          </div>
        </div>

        {/* Tabs & Content */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          
          {/* Tab Headers */}
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
            <button 
              onClick={() => setActiveTab("live")}
              style={{ flex: 1, padding: "1.25rem", background: activeTab === "live" ? "#fff" : "#f8fafc", border: "none", borderBottom: activeTab === "live" ? "3px solid #901b1e" : "3px solid transparent", color: activeTab === "live" ? "#901b1e" : "#64748b", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }}>
              <Table size={18} /> Live Data Feed
            </button>
            <button 
              onClick={() => setActiveTab("top")}
              style={{ flex: 1, padding: "1.25rem", background: activeTab === "top" ? "#fff" : "#f8fafc", border: "none", borderBottom: activeTab === "top" ? "3px solid #901b1e" : "3px solid transparent", color: activeTab === "top" ? "#901b1e" : "#64748b", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }}>
              <BarChart2 size={18} /> Top Words
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: "2rem" }}>
            
            {activeTab === "live" && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                  <button onClick={downloadExcel} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#901b1e", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#a92124"; }} onMouseLeave={e => { e.currentTarget.style.background = "#901b1e"; }}>
                    <Download size={16} /> Download Excel
                  </button>
                </div>
                
                <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        <th style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 }}>Player Name</th>
                        <th style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 }}>Word Submitted</th>
                        <th style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveData.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "1rem", color: "#334155", fontWeight: 500 }}>{row.playerName}</td>
                          <td style={{ padding: "1rem", color: "#0f172a", fontWeight: 700 }}>
                            {row.word} 
                            {row.count > 1 && (
                              <span style={{ marginLeft: "8px", fontSize: "0.75rem", background: "#fef08a", color: "#854d0e", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>
                                X{row.count}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "1rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                            {new Date(row.submittedAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                      {liveData.length === 0 && (
                        <tr>
                          <td colSpan="3" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>No data yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "top" && (
              <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e2e8f0", maxWidth: 600, margin: "0 auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 }}>Rank</th>
                      <th style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 }}>Word</th>
                      <th style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 }}>Total Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topWords.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem", color: "#94a3b8", fontWeight: 600 }}>#{i + 1}</td>
                        <td style={{ padding: "1rem", color: "#0f172a", fontWeight: 700 }}>{row.text}</td>
                        <td style={{ padding: "1rem", color: "#901b1e", fontWeight: 800 }}>{row.value}</td>
                      </tr>
                    ))}
                    {topWords.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>No words submitted yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
