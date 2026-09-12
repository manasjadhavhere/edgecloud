// src/pages/HostLogin.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BgGrid from "../components/BgGrid";
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
    <div className="auth-page">
      <BgGrid />
      {/* Brand panel */}
      <div className="auth-brand">
        <img
          src="/EdgeCloud Image.png"
          alt="EdgeCloud"
          style={{ width: 180, height: "auto", objectFit: "contain", marginBottom: "2rem", filter: "brightness(0.9)" }}
        />
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem", color: "var(--text)" }}>
            Host Command Center
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
            Manage live word-cloud sessions for ET Edge conferences and summits. Secure, real-time, and audience-ready.
          </p>
        </div>
        <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: 280 }}>
          {["Select your event", "Craft your sentence", "Watch responses live", "Reveal the word cloud"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: 24, height: 24, borderRadius: "4px",
                background: "var(--accent-glow)", color: "var(--accent-text)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form">
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "8px",
            background: "var(--accent-glow)", display: "flex",
            alignItems: "center", justifyContent: "center",
            marginBottom: "1.25rem", border: "1px solid var(--accent)",
          }}>
            <Lock size={18} color="var(--accent-text)" />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.4rem" }}>Host Access</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Enter your credentials to access the Host Dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="Enter host password"
              value={password}
              autoFocus
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              style={{ fontSize: "0.9rem" }}
            />
            {error && (
              <p style={{ color: "#F85149", fontSize: "0.8rem", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span>⚠</span> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={!password || loading}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <>Access Dashboard <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ marginTop: "2rem", padding: "0.75rem 1rem", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", textAlign: "center" }}>
            Participant? Scan the QR code displayed at the venue.
          </p>
        </div>
      </div>
    </div>
  );
}
