// src/pages/HostSelectEvent.jsx
import { useNavigate } from "react-router-dom";
import FloatingOrbs from "../components/FloatingOrbs";
import { ChevronRight, Calendar } from "lucide-react";

export default function HostSelectEvent() {
  const navigate = useNavigate();

  const events = [
    {
      id: "iconic-brands",
      name: "ET Edge Iconic Brands 2026",
      theme: "iconic", // Will map to CSS classes
      colors: ["#C5A059", "#8B1818"],
    },
    {
      id: "best-tech",
      name: "ET Edge Best Tech Brands 2026",
      theme: "tech",
      colors: ["#00529B", "#00AEEF"],
    },
  ];

  function selectEvent(eventId) {
    // Navigate to host compose and pass eventId in state
    navigate("/host", { state: { eventId } });
  }

  return (
    <>
      <FloatingOrbs />
      <div className="page" style={{ padding: "2rem 1rem", minHeight: "100vh", justifyContent: "center" }}>
        <div className="fade-in" style={{ width: "100%", maxWidth: 800, textAlign: "center" }}>
          <h2 className="display-title" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "1rem" }}>
            Select Event Theme
          </h2>
          <p className="text-muted" style={{ marginBottom: "3rem", fontSize: "1.1rem" }}>
            Choose the event context for your game. The branding will adapt automatically.
          </p>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                className="card scale-in"
                style={{
                  flex: "1 1 300px",
                  maxWidth: "350px",
                  cursor: "pointer",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onClick={() => selectEvent(evt.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
              >
                <div
                  style={{
                    width: 64, height: 64,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${evt.colors[0]}, ${evt.colors[1]})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1.5rem",
                    boxShadow: `0 8px 24px ${evt.colors[0]}40`,
                  }}
                >
                  <Calendar size={32} color="#fff" />
                </div>
                <h3 className="section-title" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
                  {evt.name}
                </h3>
                
                <div style={{ flex: 1 }} />
                
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    background: `linear-gradient(135deg, ${evt.colors[0]}, ${evt.colors[1]})`,
                    color: "white"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectEvent(evt.id);
                  }}
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: "3rem" }}>
            <button 
              type="button"
              className="btn btn-ghost btn-sm" 
              onClick={() => navigate("/host-login")}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
