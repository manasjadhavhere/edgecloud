// src/pages/Join.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, push } from "firebase/database";
import { useGame } from "../hooks/useGame";
import { countBlanks } from "../utils/wordCount";
import BgGrid from "../components/BgGrid";
import BottomRightWaves from "../components/BottomRightWaves";
import { EVENTS } from "../utils/theme";
import { Send, Loader, CheckCircle, ArrowRight } from "lucide-react";

function NameEntry({ onSubmit, eventId }) {
  const [name, setName] = useState("");
  const event = EVENTS[eventId];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <BgGrid />
      <BottomRightWaves />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }} className="fade-in">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          {event ? (
            <img src={event.logo} alt={event.name} style={{ height: 48, width: "auto", objectFit: "contain", marginBottom: "1rem" }} />
          ) : (
            <img src="/EdgeCloud Image.png" alt="EdgeCloud" style={{ height: 32, width: "auto", objectFit: "contain", marginBottom: "1rem" }} />
          )}
          <span className="badge badge-green"><span className="live-dot" style={{ width: 6, height: 6 }} /> Live Session</span>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem" }}>Enter Your Name</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            Your name will appear on the host screen when you respond.
          </p>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
            Name
          </label>
          <input
            className="input"
            placeholder="Your name…"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && onSubmit(name.trim())}
            style={{ marginBottom: "1rem" }}
          />
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={!name.trim()}
            onClick={() => onSubmit(name.trim())}
          >
            Continue <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AnswerForm({ sentence, participantName, gameId, onSubmitted, eventId }) {
  const blanks  = countBlanks(sentence);
  const [answers, setAnswers]     = useState(Array(blanks).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const event = EVENTS[eventId];

  function setAnswer(i, val) { setAnswers((p) => { const n=[...p]; n[i]=val; return n; }); }

  async function handleSubmit() {
    if (answers.some((a) => !a.trim())) { setError("Please fill in all the blanks before submitting."); return; }
    setError(""); setSubmitting(true);
    try {
      await push(ref(db, `games/${gameId}/responses`), {
        name: participantName, words: answers.map((a) => a.trim()), submittedAt: Date.now(),
      });
      onSubmitted();
    } catch (err) {
      setError("Submission failed: " + err.message); setSubmitting(false);
    }
  }

  const parts = sentence.split("__");
  let blankIdx = 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <BgGrid />
      <BottomRightWaves />
      {/* Topbar */}
      <div style={{ position: "relative", zIndex: 1, height: 52, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 1.5rem", background: "var(--bg-secondary)", gap: "1rem" }}>
        {event ? (
          <img src={event.logo} alt={event.name} style={{ height: 28, width: "auto", objectFit: "contain" }} />
        ) : (
          <img src="/EdgeCloud Image.png" alt="EdgeCloud" style={{ height: 24, width: "auto", objectFit: "contain" }} />
        )}
        <div style={{ flex: 1 }} />
        <span className="badge badge-green"><span className="live-dot" style={{ width: 5, height: 5 }} /> LIVE</span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          Playing as <strong style={{ color: "var(--text)" }}>{participantName}</strong>
        </span>
      </div>

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
        <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: "1.25rem" }} className="fade-in">

          {/* Sentence card */}
          <div className="card">
            <p className="label-caps" style={{ marginBottom: "1rem" }}>Complete the sentence</p>
            <p className="sentence-display" style={{ textAlign: "center" }}>
              {parts.map((part, i) => {
                const isLast = i === parts.length - 1;
                const idx = blankIdx;
                if (!isLast) blankIdx++;
                return (
                  <span key={i}>
                    {part}
                    {!isLast && (
                      <input
                        className="blank-input"
                        placeholder={`word ${idx + 1}`}
                        value={answers[idx] || ""}
                        onChange={(e) => setAnswer(idx, e.target.value)}
                        style={{ minWidth: Math.max(90, (answers[idx]?.length || 5) * 14) }}
                      />
                    )}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Separate inputs for each blank */}
          {blanks > 1 && (
            <div className="card">
              <p className="label-caps" style={{ marginBottom: "0.75rem" }}>Your answers</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {Array.from({ length: blanks }).map((_, i) => (
                  <div key={i}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                      Blank {i + 1}
                    </label>
                    <input
                      className="input"
                      placeholder={`Fill blank ${i + 1}…`}
                      value={answers[i] || ""}
                      onChange={(e) => setAnswer(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p style={{ color: "#F85149", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}

          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            onClick={handleSubmit}
            disabled={submitting || answers.some((a) => !a.trim())}
          >
            {submitting
              ? <><Loader size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Submitting…</>
              : <><Send size={16} /> Submit Answer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThankYouScreen({ eventId }) {
  const event = EVENTS[eventId];
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <BgGrid />
      <BottomRightWaves />
      <div className="card fade-in" style={{ position: "relative", zIndex: 1, maxWidth: 400, width: "100%", textAlign: "center", borderRadius: "2px", padding: "2.5rem 2rem" }}>
        <CheckCircle size={48} style={{ color: "#16A34A", margin: "0 auto 1.25rem" }} />
        {event && <img src={event.logo} alt={event.name} style={{ height: 40, objectFit: "contain", margin: "0 auto 1.5rem", display: "block" }} />}
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--text)" }}>Thank You!</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          Your response has been successfully submitted. Watch the main screen to see the live word cloud!
        </p>
        <button 
          className="btn btn-outline" 
          style={{ width: "100%", borderRadius: "2px" }}
          onClick={() => window.location.href = "/"}
        >
          Back to Home Page
        </button>
      </div>
    </div>
  );
}

export default function Join() {
  const { gameId } = useParams();
  const navigate   = useNavigate();
  const [participantName, setParticipantName] = useState(null);
  const [submitted, setSubmitted]             = useState(false);
  const { game, loading, error } = useGame(gameId);

  // Removed the useEffect that redirects players to the results page.

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );

  if (error || !game) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <BgGrid />
      <BottomRightWaves />
      <div className="card" style={{ position: "relative", zIndex: 1, maxWidth: 360, width: "100%", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem" }}>Session Not Found</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Double-check your Game ID or scan the QR code again.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
      </div>
    </div>
  );

  async function handleNameSubmit(name) {
    setParticipantName(name);
    try { await push(ref(db, `games/${gameId}/participants`), name); }
    catch (err) { console.error("Participant registration failed:", err); }
  }

  if (!participantName) return <NameEntry onSubmit={handleNameSubmit} eventId={game?.eventId} />;
  if (submitted)        return <ThankYouScreen eventId={game?.eventId} />;

  return (
    <AnswerForm
      sentence={game.sentence}
      participantName={participantName}
      gameId={gameId}
      eventId={game?.eventId}
      onSubmitted={() => setSubmitted(true)}
    />
  );
}
