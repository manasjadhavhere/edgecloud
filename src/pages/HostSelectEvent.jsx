// src/pages/HostSelectEvent.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BgGrid from "../components/BgGrid";
import { EVENTS, storeTheme, getStoredTheme, isLoggedIn, applyTheme } from "../utils/theme";
import { Share2, Layers } from "lucide-react";

export default function HostSelectEvent() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/host-login", { replace: true }); return; }
    const stored = getStoredTheme();
    if (stored) applyTheme(stored);
  }, [navigate]);

  function selectEvent(eventId) {
    storeTheme(eventId);
    navigate("/host", { state: { eventId } });
  }

  return (
    <div className="admin-layout">
      <BgGrid />

      {/* Sidebar */}
      <aside className="admin-sidebar glossy-dark">
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <img src="/EdgeCloud Image.png" alt="EdgeCloud" style={{ height: 28, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        </div>
        <div style={{ padding: "0.75rem", flex: 1 }}>
          <p className="label-caps" style={{ padding: "0.5rem 0.5rem 0.35rem", color: "rgba(255,255,255,0.5)" }}>Events</p>
          {Object.values(EVENTS).map((evt) => (
            <button key={evt.id} className="nav-item dark-nav" onClick={() => selectEvent(evt.id)}>
              <img src={evt.logo} alt={evt.shortName} style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 3, background: "#fff", padding: 2 }} />
              <span>{evt.shortName}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <span className="badge badge-green" style={{ background: "rgba(63,185,80,0.15)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.2)" }}>
            <span className="live-dot" style={{ width: 5, height: 5 }} /> Host Session Active
          </span>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <Layers size={16} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Select Event</span>
        </div>
        <div className="admin-content">
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
                  <button className="btn-action">
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
