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
          .lp-host-btn     { top: 1rem !important; right: 1rem !important; }
        }
        @media (max-width: 540px) {
          .lp-headline     { font-size: 2.2rem !important; }
          .lp-join-card    { padding: 1.25rem !important; }
          .lp-logo-et      { font-size: 1.1rem !important; }
          .lp-logo-edge    { font-size: 1.4rem !important; }
          .lp-bottom-waves { width: 70% !important; }
        }

        /* Join button hover */
        .lp-join-btn:hover {
          background: #B71C1C !important;
          box-shadow: 0 6px 20px rgba(183,28,28,0.45) !important;
          transform: translateY(-1px);
        }
        .lp-join-btn:active { transform: translateY(0); }
        .lp-host-btn-inner:hover { background: rgba(255,255,255,1) !important; }

        /* Input focus */
        .lp-input:focus {
          border-color: #6366F1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
          background: #ffffff !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════
          LAYER 1: RIGHT SIDE AUDIENCE PHOTO
          Covers right ~58%, from top to bottom edge.
          Left edge has a concave curve bowing rightward.
      ══════════════════════════════════════════ */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          {/* objectBoundingBox coords: left-edge of this element curves rightward.
              M 0 0 → top-left of photo element
              Q 0.13 0.5 → control point bows 13% rightward at midpoint
              → 0 1 → bottom-left of photo element
              This creates a concave-left / convex-right curve */}
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

          {/* Big blue wave: rises from bottom-left, sweeps to the right */}
          <path d="M 0 240 L 0 55 Q 210 240 400 240 Z" fill="url(#lp-blue-grad)" />

          {/* Smaller red wave: sits over blue, bottom-left corner */}
          <path d="M 0 240 L 0 140 Q 115 240 210 240 Z" fill="url(#lp-red-grad)" />

          {/* White dot grid — 4 cols × 5 rows, sits inside the blue area */}
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

        {/* IDEAS / CONNECTIONS / IMPACT */}
        <div style={{
          position: "absolute", bottom: "14px", left: "18px",
          color: "rgba(255,255,255,0.8)",
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.2em",
          fontFamily: "var(--font-sans)",
          userSelect: "none"
        }}>
          IDEAS / CONNECTIONS / IMPACT
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LAYER 3: HOST LOGIN — Top Right
      ══════════════════════════════════════════ */}
      <button
        className="lp-host-btn lp-host-btn-inner"
        onClick={() => navigate("/host-login")}
        style={{
          position: "absolute", top: "1.6rem", right: "2rem", zIndex: 50,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "999px",
          padding: "0.5rem 1.15rem",
          display: "flex", alignItems: "center", gap: "6px",
          fontWeight: 700, fontSize: "0.75rem",
          letterSpacing: "0.05em", textTransform: "uppercase",
          color: "#1A1F36", cursor: "pointer",
          boxShadow: "0 2px 14px rgba(0,0,0,0.08)",
          transition: "background 0.15s"
        }}
      >
        <LogIn size={13} strokeWidth={2.5} />
        HOST LOGIN
      </button>

      {/* ══════════════════════════════════════════
          LAYER 4: MAIN CONTENT (Left col + Right col)
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

          {/* HERO SECTION */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "0.5rem" }}>

            {/* Main Headline */}
            <h1
              className="lp-headline"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 3.7vw, 4rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                color: "#1A1F36",
                marginBottom: "1rem",
                letterSpacing: "-0.02em"
              }}
            >
              <span style={{ whiteSpace: "nowrap" }}>Turn Your Audience</span><br />
              Into a{" "}
              <span style={{
                background: "linear-gradient(88deg, #E8304A 0%, #FF9000 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                position: "relative",
                display: "inline-block",
                paddingRight: "4px"
              }}>
                Story
                {/* Spark lines bursting outward from right of "Story" */}
                <svg
                  style={{
                    position: "absolute", top: "-6px", right: "-32px",
                    width: "48px", height: "48px",
                    overflow: "visible", pointerEvents: "none"
                  }}
                  viewBox="0 0 48 48"
                >
                  {/* upper-left spark — purple */}
                  <line x1="6"  y1="8"  x2="-2" y2="0"  stroke="#6366F1" strokeWidth="3.2" strokeLinecap="round" />
                  {/* upper-right spark — orange */}
                  <line x1="38" y1="5"  x2="48" y2="-4" stroke="#FF9000" strokeWidth="3.2" strokeLinecap="round" />
                  {/* right-middle spark — red */}
                  <line x1="46" y1="23" x2="58" y2="23" stroke="#E8304A" strokeWidth="3.2" strokeLinecap="round" />
                  {/* lower-right spark — orange */}
                  <line x1="40" y1="40" x2="48" y2="48" stroke="#FF9000" strokeWidth="3.2" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              color: "#6B7280",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              maxWidth: "380px",
              marginBottom: "2.25rem",
              fontWeight: 400
            }}>
              Real-time fill-in-the-blank word clouds for conferences,<br />
              summits, and live events. Powered by ET Edge.
            </p>

            {/* JOIN A SESSION CARD */}
            <div
              className="lp-join-card"
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "1.5rem 1.75rem 1.75rem",
                boxShadow: "0 6px 36px rgba(0,0,0,0.09), 0 1px 6px rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.07)",
                maxWidth: "430px"
              }}
            >
              {/* Label */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                marginBottom: "1rem",
                color: "#374151",
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "0.09em",
                textTransform: "uppercase"
              }}>
                <Users size={15} color="#6366F1" strokeWidth={2.5} />
                JOIN A SESSION
              </div>

              {/* Input + Button row */}
              <div style={{ display: "flex", gap: "0.7rem" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span style={{
                    position: "absolute", left: "11px", top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9CA3AF",
                    display: "flex", alignItems: "center"
                  }}>
                    <Ticket size={15} strokeWidth={1.8} />
                  </span>
                  <input
                    className="lp-input"
                    value={joinId}
                    onChange={(e) => { setJoinId(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    placeholder="ENTER GAME ID..."
                    style={{
                      width: "100%",
                      height: "44px",
                      paddingLeft: "34px",
                      paddingRight: "10px",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: "8px",
                      background: "#F9FAFB",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#374151",
                      outline: "none",
                      fontFamily: "var(--font-sans)",
                      transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s"
                    }}
                  />
                </div>

                <button
                  className="lp-join-btn"
                  onClick={handleJoin}
                  style={{
                    height: "44px",
                    padding: "0 1.2rem",
                    background: "#D32F2F",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "flex", alignItems: "center", gap: "5px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 14px rgba(211,47,47,0.38)",
                    transition: "background 0.15s, box-shadow 0.15s, transform 0.15s"
                  }}
                >
                  JOIN <ArrowRight size={14} strokeWidth={2.8} />
                </button>
              </div>

              {error && (
                <p style={{ color: "#EF4444", fontSize: "0.78rem", marginTop: "0.6rem", fontWeight: 500 }}>
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Spacer so content doesn't overlap bottom waves */}
          <div style={{ height: "70px" }} />
        </div>

        {/* ── RIGHT COLUMN: EdgeCloud logo centered over photo ── */}
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
          <img
            src="/EdgeCloud Image.png"
            alt="EdgeCloud Word Cloud"
            style={{
              width: "88%",
              maxWidth: "530px",
              objectFit: "contain",
              filter: "drop-shadow(0 10px 40px rgba(0,0,0,0.2))",
              transform: "translateY(-60px)"
            }}
          />
        </div>
      </div>
    </div>
  );
}
