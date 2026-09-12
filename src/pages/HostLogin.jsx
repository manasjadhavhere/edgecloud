import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, setLoggedIn } from "../utils/theme";
import { Lock, ArrowRight } from "lucide-react";

export default function HostLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in this session, skip straight to event selection
  useEffect(() => {
    if (isLoggedIn()) navigate("/select-event", { replace: true });
  }, [navigate]);

  function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === "edgecloud2026") {
        setLoggedIn();
        navigate("/select-event");
      } else {
        setError("Incorrect password. Please try again.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh", background: "#ffffff", overflow: "hidden" }}>

      {/* ══════════════════════════════════════════
          RESPONSIVE STYLES
      ══════════════════════════════════════════ */}
      <style>{`
        html, body { margin: 0; padding: 0; }

        /* Hide photo on mobile, show full-bleed content */
        @media (max-width: 860px) {
          .lp-photo-layer { display: none !important; }
          .lp-right-col   { display: none !important; }
          .lp-left-col    { width: 100% !important; max-width: 100% !important; padding-right: 2rem !important; }
          .lp-outer        { padding-left: 1.5rem !important; }
          .lp-bottom-waves { width: 55% !important; height: 32% !important; }
        }
        @media (max-width: 540px) {
          .lp-logo-et      { font-size: 1.1rem !important; }
          .lp-logo-edge    { font-size: 1.4rem !important; }
          .lp-bottom-waves { width: 70% !important; }
        }

        .auth-btn:hover {
          background: #B71C1C !important;
          box-shadow: 0 6px 20px rgba(183,28,28,0.45) !important;
          transform: translateY(-1px);
        }
        .auth-btn:active { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .auth-input:focus {
          border-color: #6366F1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
          background: #ffffff !important;
        }

        .spinner-small {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-right-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* ══════════════════════════════════════════
          LAYER 1: RIGHT SIDE AUDIENCE PHOTO
      ══════════════════════════════════════════ */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="lp-photo-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0 0 L 1 0 L 1 1 L 0 1 Q 0.13 0.5 0 0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Photo */}
      <div className="lp-photo-layer" style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: "60%",
        backgroundImage: "url('/audience.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        clipPath: "url(#lp-photo-clip)",
        zIndex: 0
      }} />

      {/* Subtle blue-tinted overlay on photo */}
      <div className="lp-photo-layer" style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: "60%",
        background: "linear-gradient(160deg, rgba(200,220,255,0.18) 0%, rgba(100,150,255,0.08) 50%, transparent 100%)",
        clipPath: "url(#lp-photo-clip)",
        zIndex: 1
      }} />

      {/* ══════════════════════════════════════════
          LAYER 2: BOTTOM-LEFT WAVES DECORATION
      ══════════════════════════════════════════ */}
      <div className="lp-bottom-waves" style={{
        position: "absolute", bottom: 0, left: 0,
        width: "38%", height: "38%",
        zIndex: 3, pointerEvents: "none"
      }}>
        <svg
          viewBox="0 0 400 240"
          preserveAspectRatio="xMinYMax meet"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id="lp-blue-grad" x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stopColor="#1E50E8" />
              <stop offset="100%" stopColor="#0B2880" />
            </linearGradient>
            <linearGradient id="lp-red-grad" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#E83030" />
              <stop offset="100%" stopColor="#991010" />
            </linearGradient>
          </defs>
          <path d="M 0 240 L 0 55 Q 210 240 400 240 Z" fill="url(#lp-blue-grad)" />
          <path d="M 0 240 L 0 140 Q 115 240 210 240 Z" fill="url(#lp-red-grad)" />
          {[0,1,2,3,4].flatMap(row =>
            [0,1,2,3].map(col => (
              <circle
                key={`d-${row}-${col}`}
                cx={18 + col * 20}
                cy={145 + row * 18}
                r="2.8"
                fill="rgba(255,255,255,0.35)"
              />
            ))
          )}
        </svg>
      </div>

      {/* ══════════════════════════════════════════
          LAYER 3: MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div
        className="lp-outer"
        style={{
          position: "relative", zIndex: 10,
          display: "flex", minHeight: "100vh",
          paddingLeft: "5vw"
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <div
          className="lp-left-col"
          style={{
            width: "42%", maxWidth: "580px",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            paddingTop: "2.25rem",
            paddingBottom: "3rem",
            paddingRight: "2rem"
          }}
        >
          {/* ET EDGE LOGO */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                className="lp-logo-et"
                style={{
                  background: "#D32F2F", color: "#fff",
                  fontWeight: 900, fontSize: "1.25rem",
                  padding: "3px 7px", borderRadius: "3px",
                  lineHeight: 1.25, fontFamily: "var(--font-sans)"
                }}
              >
                ET
              </div>
              <div
                className="lp-logo-edge"
                style={{
                  fontSize: "1.6rem", fontWeight: 400,
                  color: "#111", lineHeight: 1,
                  fontFamily: "var(--font-sans)"
                }}
              >
                Edge
              </div>
            </div>
            <div style={{
              fontSize: "0.56rem", color: "#888",
              letterSpacing: "0.18em", marginTop: "5px",
              fontWeight: 700, fontFamily: "var(--font-sans)"
            }}>
              BUSINESS | TECHNOLOGY | FUTURE
            </div>
          </div>

          {/* LOGIN FORM */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "0.5rem" }}>
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "10px",
                background: "rgba(99,102,241,0.08)", display: "flex",
                alignItems: "center", justifyContent: "center",
                marginBottom: "1.25rem", border: "1px solid rgba(99,102,241,0.15)",
              }}>
                <Lock size={20} color="#6366F1" />
              </div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1A1F36", marginBottom: "0.5rem" }}>
                Host Access
              </h2>
              <p style={{ color: "#6B7280", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Enter your credentials to manage live word-cloud sessions.
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ maxWidth: "380px" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Password
                </label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Enter host password"
                  value={password}
                  autoFocus
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "8px",
                    background: "#F9FAFB",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: "#1A1F36",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                    transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s"
                  }}
                />
                {error && (
                  <p style={{ color: "#EF4444", fontSize: "0.82rem", marginTop: "0.6rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span>⚠</span> {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-btn"
                style={{
                  width: "100%",
                  height: "48px",
                  background: "#D32F2F",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: "0.04em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(211,47,47,0.38)",
                  transition: "background 0.15s, box-shadow 0.15s, transform 0.15s"
                }}
                disabled={!password || loading}
              >
                {loading ? <div className="spinner-small" /> : <>Access Dashboard <ArrowRight size={16} strokeWidth={2.5} /></>}
              </button>
            </form>
          </div>

          <div style={{ height: "70px" }} />
        </div>

        {/* ── RIGHT COLUMN: INFO BOX OVER PHOTO ── */}
        <div
          className="lp-right-col"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 5
          }}
        >
          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            padding: "2.5rem",
            borderRadius: "16px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255,255,255,0.5)",
            maxWidth: "400px",
            width: "90%",
            transform: "translateY(-40px)"
          }}>
            <img
              src="/EdgeCloud Image.png"
              alt="EdgeCloud"
              style={{ width: 140, height: "auto", objectFit: "contain", marginBottom: "1.5rem" }}
            />
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.75rem", color: "#1A1F36" }}>
              Host Command Center
            </h1>
            <p style={{ color: "#4F566B", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Manage live word-cloud sessions for conferences and summits. Secure, real-time, and audience-ready.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Select your event", "Craft your sentence", "Watch responses live", "Reveal the word cloud"].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "6px",
                    background: "rgba(99,102,241,0.1)", color: "#6366F1",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                    border: "1px solid rgba(99,102,241,0.2)"
                  }}>{i + 1}</div>
                  <span style={{ color: "#374151", fontSize: "0.9rem", fontWeight: 500 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
