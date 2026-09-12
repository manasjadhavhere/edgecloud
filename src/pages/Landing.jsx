import { useNavigate } from "react-router-dom";
import { useActiveGame } from "../hooks/useGame";
import { useState } from "react";
import { LogIn, Users, ArrowRight, Ticket } from "lucide-react";

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
    <div style={{ position: "relative", minHeight: "100vh", background: "#F8FAFC", overflow: "hidden" }}>
      
      {/* ── 1. GLOBAL BACKGROUND LAYER ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* SVG Defs for Clip Path */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <clipPath id="audienceClip" clipPathUnits="objectBoundingBox">
              {/* Curve bows left: top at x=0.55, control point at x=0.35, bottom at x=0.50 */}
              <path d="M 0.55 0 L 1 0 L 1 1 L 0.45 1 Q 0.35 0.5 0.55 0 Z" />
            </clipPath>
          </defs>
        </svg>
        {/* Right side audience photo */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/audience.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          clipPath: "url(#audienceClip)"
        }} />
        {/* Soft overlay on audience photo */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 60%, rgba(0,0,255,0.15) 100%)",
          clipPath: "url(#audienceClip)"
        }} />
      </div>

      {/* ── 2. BOTTOM LEFT ABSTRACT WAVES ── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "60%", height: "45%", pointerEvents: "none", zIndex: 1 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0B40E8" />
              <stop offset="100%" stopColor="#062075" />
            </linearGradient>
            <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D32F2F" />
              <stop offset="100%" stopColor="#9A1212" />
            </linearGradient>
            <pattern id="dotsPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle fill="rgba(255,255,255,0.15)" cx="1" cy="1" r="0.5" />
            </pattern>
          </defs>
          {/* Deep Blue Wave */}
          <path d="M 0 100 L 0 50 Q 50 100 100 100 Z" fill="url(#blueGrad)" />
          {/* Red Wave */}
          <path d="M 0 100 L 0 70 Q 30 100 60 100 Z" fill="url(#redGrad)" />
          {/* Dotted pattern applied to blue wave */}
          <path d="M 0 100 L 0 50 Q 50 100 100 100 Z" fill="url(#dotsPattern)" />
        </svg>
      </div>

      {/* ── 3. CONTENT LAYER ── */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexWrap: "wrap", minHeight: "100vh", padding: "3rem 4rem" }}>
        
        {/* LEFT COLUMN */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", maxWidth: "600px", paddingBottom: "4rem" }}>
          
          {/* Top Logo */}
          <div style={{ marginBottom: "6rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ background: "#D32F2F", color: "white", padding: "4px 6px", fontWeight: 800, fontSize: "1.5rem", borderRadius: "2px", lineHeight: 1 }}>ET</div>
              <div style={{ fontSize: "1.9rem", fontWeight: 400, color: "#111", lineHeight: 1 }}>Edge</div>
            </div>
            <div style={{ fontSize: "0.6rem", color: "#666", letterSpacing: "0.15em", marginTop: "8px", fontWeight: 600 }}>BUSINESS | TECHNOLOGY | FUTURE</div>
          </div>

          {/* Hero Content */}
          <div style={{ flex: 1 }}>
            {/* Dashes */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
              <div style={{ width: "32px", height: "4px", background: "#D32F2F", borderRadius: "2px" }} />
              <div style={{ width: "32px", height: "4px", background: "#6366F1", borderRadius: "2px" }} />
            </div>

            {/* Main Headline */}
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 4.5vw, 4.2rem)", fontWeight: 800, lineHeight: 1.15, color: "#1A1F36", marginBottom: "1.5rem" }}>
              Turn Your Audience <br/>
              Into a <span style={{ 
                background: "linear-gradient(90deg, #FF3366, #FF9933)", 
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", 
                position: "relative", display: "inline-block", paddingRight: "10px"
              }}>
                Story
                {/* Sparks */}
                <svg style={{ position: "absolute", top: "-10px", right: "-30px", width: "50px", height: "50px", pointerEvents: "none", overflow: "visible" }}>
                  <line x1="10" y1="10" x2="-5" y2="-5" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" />
                  <line x1="40" y1="5" x2="55" y2="-10" stroke="#FF9933" strokeWidth="4" strokeLinecap="round" />
                  <line x1="50" y1="25" x2="70" y2="25" stroke="#FF3366" strokeWidth="4" strokeLinecap="round" />
                  <line x1="45" y1="45" x2="60" y2="55" stroke="#FF9933" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            
            <p style={{ color: "#4F566B", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: "450px", marginBottom: "3rem", fontWeight: 500 }}>
              Real-time fill-in-the-blank word clouds for conferences, summits, and live events. Powered by ET Edge.
            </p>

            {/* Join Card */}
            <div style={{ 
              background: "#ffffff", borderRadius: "12px", padding: "1.75rem 2rem", 
              boxShadow: "0 20px 40px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)",
              maxWidth: "480px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem", color: "#1A1F36", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em" }}>
                <Users size={16} color="#6366F1" /> JOIN A SESSION
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8792A2" }}>
                    <Ticket size={18} />
                  </div>
                  <input
                    placeholder="ENTER GAME ID..."
                    value={joinId}
                    onChange={(e) => { setJoinId(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    style={{ 
                      width: "100%", textTransform: "uppercase", letterSpacing: "0.05em", 
                      paddingLeft: "40px", height: "48px", border: "1px solid #E3E8EE", 
                      borderRadius: "6px", background: "#ffffff", fontWeight: 600, outline: "none",
                      color: "#1A1F36"
                    }}
                  />
                </div>
                <button 
                  onClick={handleJoin}
                  style={{ 
                    height: "48px", padding: "0 1.5rem", background: "#D32F2F", color: "white",
                    borderRadius: "6px", fontWeight: 700, fontSize: "0.9rem", border: "none",
                    display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(211,47,47,0.25)"
                  }}
                >
                  JOIN <ArrowRight size={16} />
                </button>
              </div>
              {error && <p style={{ color: "#F85149", fontSize: "0.85rem", marginTop: "0.75rem", fontWeight: 500 }}>{error}</p>}
            </div>
          </div>
          
          {/* Bottom Footer Text */}
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 600, position: "absolute", bottom: "2rem", left: "4rem" }}>
            IDEAS / CONNECTIONS / IMPACT
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: "1 1 400px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
          
          {/* Host Login Button */}
          <button 
            onClick={() => navigate("/host-login")}
            style={{ 
              position: "absolute", top: "0", right: "0",
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", 
              borderRadius: "20px", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em",
              padding: "0.6rem 1.25rem", color: "#1A1F36", border: "1px solid rgba(0,0,0,0.05)", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "6px",
              cursor: "pointer", zIndex: 30
            }} 
          >
            <LogIn size={14} /> HOST LOGIN
          </button>

          {/* Center Logo on Right Side */}
          <img 
            src="/EdgeCloud Image.png" 
            alt="EdgeCloud Logo" 
            style={{ width: "85%", maxWidth: "550px", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))", zIndex: 20 }} 
          />
        </div>
      </div>
    </div>
  );
}
