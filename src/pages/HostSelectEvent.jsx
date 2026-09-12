// src/pages/HostSelectEvent.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BgGrid from "../components/BgGrid";
import { EVENTS, storeTheme, getStoredTheme, isLoggedIn, applyTheme } from "../utils/theme";
import { ChevronRight, Layers } from "lucide-react";

export default function HostSelectEvent() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/host-login", { replace: true }); return; }
    // Re-apply stored theme if returning to this page
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
      <aside className="admin-sidebar">
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid var(--border)" }}>
          <img src="/EdgeCloud Image.png" alt="EdgeCloud" style={{ height: 28, width: "auto", objectFit: "contain" }} />
        </div>
        <div style={{ padding: "0.75rem", flex: 1 }}>
          <p className="label-caps" style={{ padding: "0.5rem 0.5rem 0.35rem" }}>Events</p>
          {Object.values(EVENTS).map((evt) => (
            <button key={evt.id} className="nav-item" onClick={() => selectEvent(evt.id)}>
              <img src={evt.logo} alt={evt.shortName} style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 3 }} />
              <span style={{ fontSize: "0.82rem" }}>{evt.shortName}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
          <span className="badge badge-green"><span className="live-dot" style={{ width: 5, height: 5 }} /> Host Session Active</span>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {Object.values(EVENTS).map((evt) => (
              <div
                key={evt.id}
                className="card scale-in"
                style={{ cursor: "pointer", transition: "border-color 0.2s", display: "flex", flexDirection: "column", gap: "1.25rem" }}
                onClick={() => selectEvent(evt.id)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                {/* Logo */}
                <div style={{
                  height: 80, borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid var(--border)", overflow: "hidden", padding: "0.75rem",
                }}>
                  <img
                    src={evt.logo}
                    alt={evt.name}
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  />
                </div>

                <div>
                  <p className="label-caps" style={{ marginBottom: "0.35rem" }}>Event</p>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.3rem" }}>{evt.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    Word cloud will use the {evt.id === "iconic" ? "crown" : "cloud"} shape with event-specific branding.
                  </p>
                </div>

                {/* Color preview */}
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: evt.colors.accent }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: evt.colors.dark }} />
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "0.2rem" }}>Event palette</span>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ marginTop: "auto" }}
                  onClick={(e) => { e.stopPropagation(); selectEvent(evt.id); }}
                >
                  Launch Game <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
