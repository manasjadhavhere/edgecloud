// src/pages/Landing.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingOrbs from "../components/FloatingOrbs";
import HowToPlay from "../components/HowToPlay";
import { useActiveGame } from "../hooks/useGame";
import { Zap, Users, ChevronRight, Info } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { activeGameId } = useActiveGame();
  const [joinId, setJoinId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [error, setError] = useState("");
  const [showHowTo, setShowHowTo] = useState(false);

  function handleJoin() {
    const id = joinId.trim().toUpperCase() || activeGameId;
    if (!id) {
      setError("Please enter a Game ID.");
      return;
    }
    navigate(`/join/${id}`);
  }

  return (
    <>
      <FloatingOrbs />

      {/* ── How-to-Play info button ─── */}
      <button
        onClick={() => setShowHowTo(true)}
        aria-label="How to play"
        title="How to play"
        style={{
          position: "fixed",
          top: "clamp(0.75rem, 2vw, 1.25rem)",
          right: "clamp(0.75rem, 2vw, 1.25rem)",
          zIndex: 900,
          width: "clamp(36px, 5vw, 44px)",
          height: "clamp(36px, 5vw, 44px)",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--muted)",
          transition: "background 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(232,33,60,0.18)";
          e.currentTarget.style.color = "#E8213C";
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(232,33,60,0.28)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          e.currentTarget.style.color = "var(--muted)";
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.18)";
        }}
      >
        <Info size={18} />
      </button>

      <HowToPlay open={showHowTo} onClose={() => setShowHowTo(false)} />

      <div className="page" style={{ padding: "2rem 1rem", minHeight: "100vh", justifyContent: "center" }}>
        <div
          className="fade-in"
          style={{
            width: "100%",
            maxWidth: 900,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2.5rem",
          }}
        >
          {/* ── Brand Image ──────────────────────────────────── */}
          <div style={{ width: "100%", textAlign: "center" }}>
            <img
              src="/EdgeCloud Image.png"
              alt="EdgeCloud — Turn the room into a story"
              style={{
                width: "100%",
                maxWidth: 520,
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "0 auto",
                /* Subtle drop shadow so it floats on white */
                filter: "drop-shadow(0 12px 40px rgba(232,33,60,0.15))",
                borderRadius: 16,
              }}
            />
          </div>

          {/* ── Tagline ──────────────────────────────────────── */}
          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--muted)",
              fontWeight: 500,
              fontStyle: "italic",
              textAlign: "center",
              marginTop: "-1rem",
            }}
          >
            Turn the room into a story ✨
          </p>

          {/* ── Action Cards ─────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: "clamp(0.5rem, 3vw, 1.5rem)",
              flexWrap: "nowrap",
              justifyContent: "center",
              alignItems: "stretch",
              width: "100%",
            }}
          >
            <div
              className="card scale-in"
              style={{
                flex: "1 1 0",
                minWidth: 0,
                maxWidth: 320,
                padding: "clamp(1rem, 3vw, 2rem)",
                cursor: "pointer",
                transition: "transform 0.22s, box-shadow 0.22s",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={() => navigate("/host")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(232,33,60,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div
                style={{
                  width: 48, height: 48,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #E8213C, #F97316)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1rem",
                  boxShadow: "0 4px 16px rgba(232,33,60,0.30)",
                }}
              >
                <Zap size={24} color="#fff" />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 3vw, 1.3rem)", marginBottom: "0.4rem" }}>
                Create Game
              </h3>
              <p className="text-muted" style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>
                Host a live session — craft your sentence, share the QR, and reveal the results.
              </p>
              {/* Spacer pushes button to bottom */}
              <div style={{ flex: 1 }} />
              <div
                className="btn btn-primary btn-sm"
                style={{ marginTop: "1.25rem", width: "100%", justifyContent: "center", whiteSpace: "normal", textAlign: "center", padding: "0.55rem 0.5rem" }}
              >
                Start as Host <ChevronRight size={16} />
              </div>
            </div>

            {/* Join card */}
            <div
              className="card scale-in"
              style={{
                flex: "1 1 0",
                minWidth: 0,
                maxWidth: 320,
                padding: "clamp(1rem, 3vw, 2rem)",
                textAlign: "left",
                animationDelay: "0.1s",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: 48, height: 48,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #F97316, #EC4899)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1rem",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.30)",
                }}
              >
                <Users size={24} color="#fff" />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 3vw, 1.3rem)", marginBottom: "0.4rem" }}>
                Join Game
              </h3>
              <p className="text-muted" style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>
                Scan the QR code at the venue, or enter your game ID below.
              </p>

              {/* Spacer pushes action area to bottom */}
              <div style={{ flex: 1 }} />

              {activeGameId && !showJoinInput && (
                <button
                  className="btn btn-coral btn-sm"
                  style={{ marginTop: "1.25rem", width: "100%", whiteSpace: "normal", padding: "0.55rem 0.5rem" }}
                  onClick={() => navigate(`/join/${activeGameId}`)}
                >
                  Join Active Game <ChevronRight size={16} />
                </button>
              )}

              {(!activeGameId || showJoinInput) && (
                <div style={{ marginTop: "1.25rem" }}>
                  <input
                    className="input"
                    placeholder="Enter Game ID…"
                    value={joinId}
                    onChange={(e) => { setJoinId(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    style={{ marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
                  />
                  {error && (
                    <p style={{ color: "#EF4444", fontSize: "0.83rem", marginBottom: "0.5rem" }}>{error}</p>
                  )}
                  <button className="btn btn-coral btn-sm" style={{ width: "100%", whiteSpace: "normal", padding: "0.55rem 0.5rem" }} onClick={handleJoin}>
                    Join <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {activeGameId && !showJoinInput && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: "0.5rem", width: "100%", whiteSpace: "normal", padding: "0.55rem 0.5rem" }}
                  onClick={() => setShowJoinInput(true)}
                >
                  Enter game ID manually
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <p style={{ fontSize: "0.78rem", color: "#CBD5E1", fontWeight: 500 }}>
            Powered by ET Edge · EdgeCloud v1.1
          </p>
        </div>
      </div>
    </>
  );
}
