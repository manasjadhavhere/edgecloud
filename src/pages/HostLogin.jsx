// src/pages/HostLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingOrbs from "../components/FloatingOrbs";
import { ChevronRight, Lock } from "lucide-react";

export default function HostLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    if (password === "edgecloud2026") {
      navigate("/select-event");
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <>
      <FloatingOrbs />
      <div className="page" style={{ padding: "2rem 1rem", minHeight: "100vh", justifyContent: "center" }}>
        <div className="card scale-in" style={{ width: "100%", maxWidth: 400, padding: "3rem 2rem", textAlign: "center" }}>
          <div
            style={{
              width: 56, height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--red), var(--coral))",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: "0 8px 24px rgba(232,33,60,0.3)",
            }}
          >
            <Lock size={28} color="#fff" />
          </div>
          
          <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>Host Login</h2>
          <p className="text-muted" style={{ marginBottom: "2rem" }}>
            Enter the host password to create a game.
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              style={{ marginBottom: "1rem" }}
            />
            {error && (
              <p style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "1rem", textAlign: "left" }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Login <ChevronRight size={18} />
            </button>
          </form>
          
          <button 
            type="button"
            className="btn btn-ghost btn-sm" 
            style={{ marginTop: "1rem", width: "100%" }}
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </>
  );
}
