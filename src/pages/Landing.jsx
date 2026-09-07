// src/pages/Landing.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingOrbs from "../components/FloatingOrbs";
import { useActiveGame } from "../hooks/useGame";
import { Zap, Users, ChevronRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { activeGameId } = useActiveGame();
  const [joinId, setJoinId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [error, setError] = useState("");

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
      <div className="page">
        <div className="container text-center fade-in">

          {/* Logo mark */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72, height: 72,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              boxShadow: "0 8px 30px rgba(59,130,246,0.4)",
              marginBottom: "1.25rem",
            }}
          >
            <Zap size={36} color="#fff" fill="#fff" />
          </div>

          {/* Title */}
          <h1 className="display-title" style={{ marginBottom: "0.5rem" }}>
            EdgeCloud
          </h1>

          <p style={{
            fontSize: "1.15rem",
            color: "var(--muted)",
            fontWeight: 500,
            marginBottom: "3rem",
            fontStyle: "italic",
          }}>
            Turn the room into a story ✨
          </p>

          {/* Cards */}
          <div className="flex gap-3" style={{ flexWrap: "wrap", justifyContent: "center" }}>

            {/* Host card */}
            <div
              className="card scale-in"
              style={{
                width: 280,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                textAlign: "left",
              }}
              onClick={() => navigate("/host")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(59,130,246,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div style={{
                width: 48, height: 48,
                borderRadius: 14,
                background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem",
                boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
              }}>
                <Zap size={24} color="#fff" />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.4rem" }}>
                Create Game
              </h3>
              <p className="text-muted" style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
                Host a live session — craft your sentence, share the QR, and reveal the results.
              </p>
              <div
                className="btn btn-primary btn-sm"
                style={{ marginTop: "1.25rem", width: "100%", justifyContent: "center" }}
              >
                Start as Host <ChevronRight size={16} />
              </div>
            </div>

            {/* Join card */}
            <div
              className="card scale-in"
              style={{
                width: 280,
                textAlign: "left",
                animationDelay: "0.1s",
              }}
            >
              <div style={{
                width: 48, height: 48,
                borderRadius: 14,
                background: "linear-gradient(135deg,#F97316,#EC4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem",
                boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
              }}>
                <Users size={24} color="#fff" />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.4rem" }}>
                Join Game
              </h3>
              <p className="text-muted" style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
                Scan the QR code at the venue, or enter your game ID below.
              </p>

              {activeGameId && !showJoinInput && (
                <button
                  className="btn btn-coral btn-sm"
                  style={{ marginTop: "1.25rem", width: "100%" }}
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
                  {error && <p style={{ color: "#EF4444", fontSize: "0.83rem", marginBottom: "0.5rem" }}>{error}</p>}
                  <button className="btn btn-coral btn-sm" style={{ width: "100%" }} onClick={handleJoin}>
                    Join <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {activeGameId && !showJoinInput && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: "0.5rem", width: "100%" }}
                  onClick={() => setShowJoinInput(true)}
                >
                  Enter game ID manually
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <p style={{ marginTop: "3rem", fontSize: "0.78rem", color: "#CBD5E1", fontWeight: 500 }}>
            Powered by ET Edge · EdgeCloud v1.0
          </p>
        </div>
      </div>
    </>
  );
}
