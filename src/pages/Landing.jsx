// src/pages/Landing.jsx
import { useNavigate } from "react-router-dom";
import BgGrid from "../components/BgGrid";
import { useActiveGame } from "../hooks/useGame";
import { useState } from "react";
import { LogIn, Users, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { activeGameId } = useActiveGame();
  const [joinId, setJoinId]   = useState("");
  const [error, setError]     = useState("");

  function handleJoin() {
    const id = joinId.trim().toUpperCase() || activeGameId;
    if (!id) { setError("Please enter a Game ID."); return; }
    navigate(`/join/${id}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <BgGrid />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div style={{ height: 56, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 2rem", background: "var(--bg-secondary)" }}>
          <img src="/EdgeCloud Image.png" alt="EdgeCloud" style={{ height: 26, width: "auto", objectFit: "contain" }} />
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/host-login")}>
            <LogIn size={14} /> Host Login
          </button>
        </div>

        {/* Hero */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
          <div style={{ textAlign: "center", maxWidth: 640 }} className="fade-in">
            <span className="badge badge-accent" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>
              Live Word Cloud Platform
            </span>
            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
              fontWeight: 800, marginBottom: "1rem", lineHeight: 1.1,
              background: "linear-gradient(135deg, var(--text) 0%, var(--text-secondary) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Turn Your Audience Into a Story
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: 500, margin: "0 auto 2.5rem" }}>
              Real-time fill-in-the-blank word clouds for conferences, summits, and live events. Powered by ET Edge.
            </p>

            {/* Join area */}
            <div className="card" style={{ maxWidth: 420, margin: "0 auto", background: "var(--surface)" }}>
              <p className="label-caps" style={{ marginBottom: "0.75rem" }}>
                <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                Join a Session
              </p>
              {activeGameId && (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", marginBottom: "0.75rem" }}
                  onClick={() => navigate(`/join/${activeGameId}`)}
                >
                  Join Active Game <ArrowRight size={15} />
                </button>
              )}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="input"
                  placeholder="Enter Game ID…"
                  value={joinId}
                  onChange={(e) => { setJoinId(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  style={{ textTransform: "uppercase", letterSpacing: "0.08em", flex: 1 }}
                />
                <button className="btn btn-primary" onClick={handleJoin}>
                  Join
                </button>
              </div>
              {error && <p style={{ color: "#F85149", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Powered by ET Edge</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>EdgeCloud v2.0</span>
        </div>
      </div>
    </div>
  );
}
