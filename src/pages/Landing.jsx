// src/pages/Landing.jsx
import { useNavigate } from "react-router-dom";
import B2BBackground from "../components/B2BBackground";
import { useActiveGame } from "../hooks/useGame";
import { useState } from "react";
import { LogIn, Users, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { activeGameId } = useActiveGame();
  const [joinId, setJoinId] = useState("");
  const [error, setError] = useState("");

  function handleJoin() {
    const id = joinId.trim().toUpperCase() || activeGameId;
    if (!id) { setError("Please enter a Game ID."); return; }
    navigate(`/join/${id}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", position: "relative" }}>
      <B2BBackground />

      {/* Side Images and Borders */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        
        {/* Left Image */}
        <img 
          src="/left_side_image.webp" 
          alt=""
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            objectFit: "cover", clipPath: "polygon(0 0, 30% 0, 10% 100%, 0% 100%)"
          }} 
        />
        {/* Right Image */}
        <img 
          src="/right_image.jpg" 
          alt=""
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            objectFit: "cover", clipPath: "polygon(80% 0, 100% 0, 100% 100%, 60% 100%)"
          }} 
        />
        
        {/* Borders */}
        <svg 
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          preserveAspectRatio="none" 
          viewBox="0 0 100 100"
        >
          {/* Left Line */}
          <line x1="30" y1="0" x2="10" y2="100" stroke="black" strokeWidth="6" vectorEffect="non-scaling-stroke" />
          <line x1="30" y1="0" x2="10" y2="100" stroke="#D32F2F" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          
          {/* Right Line */}
          <line x1="80" y1="0" x2="60" y2="100" stroke="black" strokeWidth="6" vectorEffect="non-scaling-stroke" />
          <line x1="80" y1="0" x2="60" y2="100" stroke="#D32F2F" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* Top right Host Login */}
      <div style={{ position: "absolute", top: "1.5rem", right: "2rem", zIndex: 10 }}>
        <button className="btn btn-ghost btn-sm" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }} onClick={() => navigate("/host-login")}>
          <LogIn size={14} /> Host Login
        </button>
      </div>

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Hero */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
          <div style={{ textAlign: "center", maxWidth: 640 }} className="fade-in">

            {/* Logo */}
            <div style={{ marginBottom: "2.5rem" }}>
              <img
                src="/EdgeCloud Image.png"
                alt="EdgeCloud"
                style={{ height: 60, width: "auto", objectFit: "contain", margin: "0 auto" }}
              />
            </div>

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

            {/* Join area (Square/Sharp container) */}
            <div className="card" style={{ maxWidth: 420, margin: "0 auto", background: "var(--surface)", borderRadius: "2px", padding: "2rem", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <p className="label-caps" style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
                <Users size={12} style={{ display: "inline", marginRight: 6 }} />
                Join a Session
              </p>
              {activeGameId && (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", marginBottom: "1rem" }}
                  onClick={() => navigate(`/join/${activeGameId}`)}
                >
                  Join Active Game <ArrowRight size={16} style={{ marginLeft: "6px" }} />
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
              {error && <p style={{ color: "#F85149", fontSize: "0.8rem", marginTop: "0.75rem" }}>{error}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", position: "relative", zIndex: 10 }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>Powered by ET Edge</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>EdgeCloud v2.0</span>
        </div>
      </div>
    </div>
  );
}
