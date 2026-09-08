// src/pages/Join.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, push, set } from "firebase/database";
import { useGame } from "../hooks/useGame";
import { countBlanks } from "../utils/wordCount";
import FloatingOrbs from "../components/FloatingOrbs";
import { Send, Loader, CheckCircle } from "lucide-react";

// ── Name entry screen ────────────────────────────────────────
function NameEntry({ onSubmit }) {
  const [name, setName] = useState("");

  return (
    <div className="page">
      <FloatingOrbs />
      <div className="container text-center fade-in" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <img
          src="/EdgeCloud Image.png"
          alt="EdgeCloud"
          style={{
            width: "auto",
            maxWidth: 220,
            height: "auto",
            objectFit: "contain",
            display: "block",
            margin: "0 auto 1.5rem",
          }}
        />

        <p className="text-muted" style={{ marginBottom: "2.5rem" }}>
          Welcome! Enter your name to join the game.
        </p>

        <div className="card" style={{ textAlign: "left" }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: "0.5rem" }}>
            Your Name
          </label>
          <input
            className="input"
            placeholder="e.g. Priya Sharma"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && onSubmit(name.trim())}
          />
          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={!name.trim()}
            onClick={() => onSubmit(name.trim())}
          >
            Join the Game →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Answer form ──────────────────────────────────────────────
function AnswerForm({ sentence, participantName, gameId, onSubmitted }) {
  const blanks = countBlanks(sentence);
  const [answers, setAnswers] = useState(Array(blanks).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function setAnswer(i, val) {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  }

  async function handleSubmit() {
    if (answers.some((a) => !a.trim())) {
      setError("Please fill in all the blanks before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await push(ref(db, `games/${gameId}/responses`), {
        name: participantName,
        words: answers.map((a) => a.trim()),
        submittedAt: Date.now(),
      });
      onSubmitted();
    } catch (err) {
      setError("Submission failed: " + err.message);
      setSubmitting(false);
    }
  }

  // Build sentence parts for rendering with inputs
  const parts = sentence.split("__");
  let blankIdx = 0;

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <FloatingOrbs />
      <div className="page page-top">
        <div className="container" style={{ paddingBottom: "3rem" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <img
              src="/EdgeCloud Image.png"
              alt="EdgeCloud"
              style={{ height: 36, width: "auto", objectFit: "contain", marginBottom: "0.35rem" }}
            />
            <div className="badge badge-blue" style={{ marginTop: "0.25rem" }}>
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              LIVE GAME
            </div>
          </div>

          {/* Sentence card */}
          <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
              Complete the sentence
            </p>
            <p className="sentence-display">
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
                        style={{ minWidth: Math.max(100, (answers[idx]?.length || 6) * 14) }}
                      />
                    )}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Individual input cards for each blank */}
          {blanks > 1 && (
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
                Your answers
              </p>
              <div className="flex flex-col gap-2">
                {Array.from({ length: blanks }).map((_, i) => (
                  <div key={i}>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: "0.3rem" }}>
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

          {/* Greeting */}
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.88rem", marginBottom: "1rem" }}>
            Responding as <strong style={{ color: "var(--text)" }}>{participantName}</strong>
          </p>

          {error && (
            <p style={{ color: "#EF4444", fontSize: "0.85rem", textAlign: "center", marginBottom: "0.75rem" }}>
              {error}
            </p>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            onClick={handleSubmit}
            disabled={submitting || answers.some((a) => !a.trim())}
          >
            {submitting ? <><Loader size={18} style={{ animation: "spin 0.9s linear infinite" }} /> Submitting…</> : <><Send size={18} /> Submit My Answer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Waiting screen ───────────────────────────────────────────
function WaitingScreen() {
  return (
    <div style={{ position: "relative" }}>
      <FloatingOrbs />
      <div className="page text-center">
        <div className="card fade-in" style={{ maxWidth: 420, margin: "0 auto" }}>
          <CheckCircle size={56} style={{ color: "#10B981", margin: "0 auto 1rem" }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", marginBottom: "0.5rem" }}>
            Answer submitted! 🎉
          </h2>
          <p className="text-muted" style={{ marginBottom: "2rem" }}>
            Great job! Hang tight — the host will reveal the word cloud soon.
          </p>
          <div className="spinner" />
          <p className="text-muted" style={{ marginTop: "1rem", fontSize: "0.83rem" }}>
            Waiting for results…
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Join page ───────────────────────────────────────────
export default function Join() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [participantName, setParticipantName] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const { game, loading, error } = useGame(gameId);

  // Auto-redirect when host ends game
  useEffect(() => {
    if (game?.status === "ended") {
      navigate(`/results/${gameId}`, { replace: true });
    }
  }, [game?.status, gameId, navigate]);

  if (loading) {
    return (
      <div style={{ position: "relative" }}>
        <FloatingOrbs />
        <div className="page">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div style={{ position: "relative" }}>
        <FloatingOrbs />
        <div className="page text-center">
          <div className="card" style={{ maxWidth: 360 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", marginBottom: "0.5rem" }}>
              Game not found
            </h2>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Double-check your Game ID or scan the QR again.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleNameSubmit(name) {
    setParticipantName(name);
    try {
      // Use push or sanitize the name for set. Using push is simpler to avoid invalid Firebase keys.
      await push(ref(db, `games/${gameId}/participants`), name);
    } catch (err) {
      console.error("Failed to register participant:", err);
    }
  }

  if (!participantName) {
    return <NameEntry onSubmit={handleNameSubmit} />;
  }

  if (submitted) {
    return <WaitingScreen />;
  }

  return (
    <AnswerForm
      sentence={game.sentence}
      participantName={participantName}
      gameId={gameId}
      onSubmitted={() => setSubmitted(true)}
    />
  );
}
