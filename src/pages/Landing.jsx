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
    <div className="landing-page" style={{ 
      minHeight: "100vh", 
      background: "#ffffff", 
      display: "flex", 
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Global Responsive Styles embedded for this page */}
      <style>{`
        .landing-page {
          flex-direction: row;
        }
        .landing-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 3rem 4rem;
          position: relative;
          z-index: 10;
        }
        .landing-right {
          flex: 1;
          position: relative;
          z-index: 5;
        }
        .landing-right-bg {
          position: absolute;
          inset: 0;
          background-image: url('/audience.jpg');
          background-size: cover;
          background-position: center;
          clip-path: url(#rightClip);
        }
        .landing-right-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,255,0.1) 100%);
          clip-path: url(#rightClip);
        }
        .story-text {
          background: linear-gradient(90deg, #FF3366, #FF9933);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          display: inline-block;
        }
        .sparks-svg {
          position: absolute;
          top: -20px;
          right: -40px;
          width: 80px;
          height: 80px;
          pointer-events: none;
        }
        .join-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          max-width: 480px;
          border: 1px solid rgba(0,0,0,0.05);
          position: relative;
          z-index: 20;
        }
        .bottom-abstract {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 300px;
          z-index: 1;
          pointer-events: none;
        }
        @media (max-width: 968px) {
          .landing-page {
            flex-direction: column;
          }
          .landing-left {
            padding: 2rem;
          }
          .landing-right {
            min-height: 400px;
          }
          .landing-right-bg, .landing-right-overlay {
            clip-path: none;
          }
        }
      `}</style>

      {/* SVG Clip Path Definitions */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="rightClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.05 0 L 1 0 L 1 1 L 0 1 Q 0.15 0.5 0.05 0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ── Left Column ── */}
      <div className="landing-left">
        {/* Abstract Bottom Left Background */}
        <div className="bottom-abstract">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            {/* Dark Blue Swoosh */}
            <path d="M 0 300 L 0 50 Q 300 300 700 300 Z" fill="#0B40E8" opacity="0.9" />
            {/* Red Swoosh */}
            <path d="M 0 300 L 0 150 Q 200 300 500 300 Z" fill="#D32F2F" />
            {/* Dotted pattern overlay */}
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle fill="rgba(255,255,255,0.3)" cx="10" cy="10" r="1.5"></circle>
            </pattern>
            <rect x="0" y="150" width="300" height="150" fill="url(#dots)" />
          </svg>
          <div style={{ position: 'absolute', bottom: '2rem', left: '4rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 600 }}>
            IDEAS / CONNECTIONS / IMPACT
          </div>
        </div>

        {/* Header / Logo */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4rem" }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#D32F2F', color: 'white', padding: '2px 8px', fontWeight: 800, fontSize: '1.4rem', borderRadius: '2px' }}>ET</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#111' }}>Edge</div>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#666', letterSpacing: '0.15em', marginTop: '4px', fontWeight: 600 }}>BUSINESS | TECHNOLOGY | FUTURE</div>
          </div>
        </div>

        {/* Hero Content */}
        <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: "4rem" }}>
          
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1, color: '#1A1F36', marginBottom: "1.5rem" }}>
            Turn Your Audience <br/>
            Into a <span className="story-text">
              Story
              {/* Sparks SVG */}
              <svg className="sparks-svg" viewBox="0 0 100 100">
                <line x1="20" y1="20" x2="10" y2="10" stroke="#FF3366" strokeWidth="4" strokeLinecap="round" />
                <line x1="80" y1="20" x2="90" y2="10" stroke="#FF9933" strokeWidth="4" strokeLinecap="round" />
                <line x1="100" y1="50" x2="115" y2="50" stroke="#FF3366" strokeWidth="4" strokeLinecap="round" />
                <line x1="90" y1="80" x2="100" y2="90" stroke="#FF9933" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          
          <p style={{ color: "#4F566B", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: 450, marginBottom: "3rem", fontWeight: 500 }}>
            Real-time fill-in-the-blank word clouds for conferences, summits, and live events. Powered by ET Edge.
          </p>

          {/* Join Card */}
          <div className="join-card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem", color: "#1A1F36", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em" }}>
              <Users size={16} /> JOIN A SESSION
            </div>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8792A2" }}>
                  <Ticket size={18} />
                </div>
                <input
                  className="input"
                  placeholder="ENTER GAME ID..."
                  value={joinId}
                  onChange={(e) => { setJoinId(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  style={{ textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "40px", height: "48px", border: "1px solid #E3E8EE", background: "#F7F9FC", fontWeight: 600 }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleJoin}
                style={{ height: "48px", padding: "0 2rem", background: "#D32F2F", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}
              >
                JOIN <ArrowRight size={16} />
              </button>
            </div>
            {error && <p style={{ color: "#F85149", fontSize: "0.85rem", marginTop: "0.75rem", fontWeight: 500 }}>{error}</p>}
          </div>
        </div>
      </div>

      {/* ── Right Column ── */}
      <div className="landing-right">
        <div className="landing-right-bg"></div>
        <div className="landing-right-overlay"></div>
        
        {/* Top Right Host Login button */}
        <div style={{ position: "absolute", top: "2rem", right: "2rem", zIndex: 30 }}>
          <button 
            className="btn btn-ghost" 
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", borderRadius: "20px", fontWeight: 700, fontSize: "0.75rem", padding: "0.5rem 1.25rem", color: "#1A1F36", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} 
            onClick={() => navigate("/host-login")}
          >
            <LogIn size={14} /> HOST LOGIN
          </button>
        </div>

        {/* Center Logo on Right Side */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
          <img 
            src="/EdgeCloud Image.png" 
            alt="EdgeCloud Wordcloud Mockup" 
            style={{ width: "80%", maxWidth: "500px", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }} 
          />
        </div>
      </div>
    </div>
  );
}
