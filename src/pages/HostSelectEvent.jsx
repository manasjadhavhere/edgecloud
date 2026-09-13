// src/pages/HostSelectEvent.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BgGrid from "../components/BgGrid";
import BottomRightWaves from "../components/BottomRightWaves";
import { EVENTS, storeTheme, getStoredTheme, isLoggedIn, applyTheme, setLoggedOut } from "../utils/theme";
import { Share2, Layers, StopCircle, Zap, LogOut } from "lucide-react";
import { useActiveGame, useGame } from "../hooks/useGame";
import { db } from "../firebase";
import { ref, update, set } from "firebase/database";

export default function HostSelectEvent() {
  const navigate = useNavigate();
  const { activeGameId } = useActiveGame();
  const { game: activeGame } = useGame(activeGameId);

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/host-login", { replace: true }); return; }
    const stored = getStoredTheme();
    if (stored) applyTheme(stored);
  }, [navigate]);

  function selectEvent(eventId) {
    storeTheme(eventId);
    navigate("/host", { state: { eventId } });
  }

  async function cancelActiveGame() {
    if (!activeGameId) return;
    await update(ref(db, `games/${activeGameId}`), { status: "ended" });
    await set(ref(db, "activeGame"), null);
  }

  function enterActiveGame() {
    if (!activeGameId || !activeGame) return;
    storeTheme(activeGame.eventId);
    navigate("/host", { state: { eventId: activeGame.eventId, step: 2, gameId: activeGameId } });
  }

  return (
    <div className="admin-layout">
      <BgGrid />
      <BottomRightWaves />

      {/* Sidebar */}
      <aside className="admin-sidebar glossy-dark">
        <div className="sidebar-header" style={{ padding: "1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center" }}>
          <img src="/EdgeCloud Image.png" alt="EdgeCloud" style={{ height: 64, width: "auto", objectFit: "contain" }} className="sidebar-logo-img" />
        </div>
        
        <div className="sidebar-content" style={{ padding: "0.75rem", flex: 1 }}>
          {/* Active Sessions Ribbon */}
          {activeGameId && (
            <div style={{ marginBottom: "1.5rem" }}>
              <p className="label-caps" style={{ padding: "0.5rem 0.5rem 0.35rem", color: "rgba(255,255,255,0.5)" }}>Active Sessions</p>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.75rem 0.75rem 0.5rem", position: "relative", overflow: "hidden" }}>
                {/* Green Ribbon */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#3FB950" }} />
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span className="live-dot" style={{ width: 6, height: 6 }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#3FB950" }}>LIVE GAME</span>
                </div>
                
                <p style={{ fontSize: "0.8rem", color: "#E2E8F0", marginBottom: "0.75rem", fontFamily: "monospace" }}>#{activeGameId}</p>
                
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: "0.4rem", fontSize: "0.7rem", borderRadius: "2px" }} onClick={enterActiveGame}>
                    <Zap size={12} style={{ marginRight: 4 }} /> Enter
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1, padding: "0.4rem", fontSize: "0.7rem", color: "#F85149", borderColor: "#F85149", borderRadius: "2px" }} onClick={cancelActiveGame}>
                    <StopCircle size={12} style={{ marginRight: 4 }} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="sidebar-events-list">
            <p className="label-caps" style={{ padding: "0.5rem 0.5rem 0.35rem", color: "rgba(255,255,255,0.5)" }}>Events</p>
            {Object.values(EVENTS).map((evt) => (
              <button key={evt.id} className="nav-item dark-nav" onClick={() => selectEvent(evt.id)}>
                <img src={evt.logo} alt={evt.shortName} style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 3, background: "#fff", padding: 2 }} />
                <span>{evt.shortName}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar-footer" style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div className="host-session-active" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="badge badge-green" style={{ background: "rgba(63,185,80,0.15)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.2)", width: "100%", justifyContent: "center" }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} /> Host Session Active
            </span>
          </div>
          <button className="nav-item" onClick={() => { setLoggedOut(); navigate("/host-login"); }} style={{ color: "#F85149", padding: "0.5rem" }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <Layers size={16} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Select Event</span>
        </div>
        <div className="admin-content animate-slide-right">
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" }}>Choose an Event</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Select the event to configure the word-cloud game theme, colors, and branding.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {Object.values(EVENTS).map((evt) => (
              <div key={evt.id} className="event-card scale-in" onClick={() => selectEvent(evt.id)}>
                {/* Top Logo Area */}
                <div className="event-card-logo">
                  <img src={evt.logo} alt={evt.shortName} />
                </div>
                
                {/* Red Date Banner */}
                <div className="event-card-date">
                  {evt.date}
                </div>

                {/* Content Area */}
                <div className="event-card-content">
                  <h3>{evt.name.toUpperCase()}</h3>
                  <p>{evt.location}</p>
                </div>

                {/* Footer Actions */}
                <div className="event-card-footer">
                  <button className="btn-share" onClick={(e) => e.stopPropagation()}>
                    <Share2 size={16} />
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }}>
                    VIEW DETAIL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
