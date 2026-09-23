// src/pages/Join.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, push, goOffline, goOnline } from "firebase/database";
import { useGame } from "../hooks/useGame";
import { countBlanks } from "../utils/wordCount";
import BgGrid from "../components/BgGrid";
import BottomRightWaves from "../components/BottomRightWaves";
import { EVENTS } from "../utils/theme";
import { Send, Loader, CheckCircle, ArrowRight } from "lucide-react";
import badWords from "../utils/badWords.json";
import GoldSparkles from "../components/GoldSparkles";

function NameEntry({ onSubmit, eventId }) {
  const [name, setName] = useState("");
  const event = EVENTS[eventId];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <BgGrid />
      <BottomRightWaves />
      <GoldSparkles />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }} className="animate-slide-right">
        <div style={{ textAlign: "center", marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          {event ? (
            <img src={event.logo} alt={event.name} style={{ height: 120, width: "auto", objectFit: "contain" }} />
          ) : (
            <img src="/EdgeCloud Image.png" alt="EdgeCloud" style={{ height: 90, width: "auto", objectFit: "contain" }} />
          )}
          <span className="badge badge-green" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <span className="live-dot" style={{ width: 8, height: 8 }} /> Live Session
          </span>
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
  const [isRocketing, setIsRocketing] = useState(false);
  const [rocketWords, setRocketWords] = useState([]);
  const event = EVENTS[eventId];

  function setAnswer(i, val) { setAnswers((p) => { const n=[...p]; n[i]=val; return n; }); }

  async function handleSubmit() {
    if (answers.some((a) => !a.trim())) { setError("Please fill in all the blanks before submitting."); return; }
    setError(""); setSubmitting(true);
    try {
      // Filter out abusive words
      const cleanWords = answers.map((a) => a.trim()).filter((word) => {
        const lower = word.toLowerCase();
        const parts = lower.split(/[\s-_]+/);
        return !badWords.some(bw => {
          const b = bw.toLowerCase();
          return lower === b || parts.includes(b);
        });
      });

      // Only push to DB if there's at least one clean word left
      if (cleanWords.length > 0) {
        await push(ref(db, `games/${gameId}/responses`), {
          name: participantName, 
          words: cleanWords, 
          submittedAt: Date.now(),
        });
      }
      // Show rocket animation before navigating to Thank You
      setRocketWords(cleanWords.length > 0 ? cleanWords : answers.map(a => a.trim()));
      setIsRocketing(true);
      setTimeout(() => {
        onSubmitted();
      }, 3500);
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
      <GoldSparkles />
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

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: "1.25rem" }} className="animate-slide-right">

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

      {isRocketing && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "var(--bg)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "screen-glow 3.5s ease-in-out forwards"
        }}>
          {rocketWords.map((word, i) => (
            <div
              key={i}
              className="rocket-word"
              style={{ "--delay": `${i * 0.4}s` }}
            >
              {word}
            </div>
          ))}
          <style>{`
            @keyframes screen-glow {
              0% { box-shadow: inset 0 0 0px rgba(255, 215, 0, 0); }
              20% { box-shadow: inset 0 0 60px rgba(255, 165, 0, 0.5); }
              50% { box-shadow: inset 0 0 150px rgba(255, 215, 0, 0.8), inset 0 0 40px rgba(255, 69, 0, 0.6); }
              80% { box-shadow: inset 0 0 80px rgba(255, 165, 0, 0.5); }
              100% { box-shadow: inset 0 0 0px rgba(255, 215, 0, 0); }
            }
            .rocket-word {
              font-size: clamp(2rem, 10vw, 3.5rem);
              font-weight: 900;
              color: #000000;
              opacity: 0;
              transform: translateY(100vh);
              position: absolute;
              text-transform: uppercase;
              text-align: center;
              max-width: 90vw;
              overflow-wrap: break-word;
              line-height: 1.1;
              animation: rocket-fly 3.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
              animation-delay: var(--delay);
              text-shadow: 0 0 10px rgba(255,255,255,0.8);
            }
            .rocket-word::before {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 120%;
              height: 120%;
              background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0.6) 40%, transparent 70%);
              z-index: -1;
              border-radius: 50%;
              filter: blur(10px);
            }
            .rocket-word::after {
              content: '';
              position: absolute;
              top: 80%;
              left: 50%;
              transform: translateX(-50%);
              width: 80%;
              height: 0;
              background: linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.9) 5%, rgba(255,140,0,0.8) 20%, rgba(255,69,0,0.3) 60%, transparent 100%);
              filter: blur(12px);
              z-index: -2;
              opacity: 0;
              animation: rocket-trail 3.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
              animation-delay: var(--delay);
            }
            @keyframes rocket-fly {
              0% { opacity: 0; transform: translateY(100vh) scale(0.5); }
              15% { opacity: 1; transform: translateY(25vh) scale(1.1); }
              45% { opacity: 1; transform: translateY(-5vh) scale(1.3); }
              75% { opacity: 1; transform: translateY(-15vh) scale(1.3); }
              100% { opacity: 0; transform: translateY(-100vh) scale(0.5); }
            }
            @keyframes rocket-trail {
              0% { opacity: 0; height: 0; }
              15% { opacity: 1; height: 40vh; }
              45% { opacity: 1; height: 120vh; }
              75% { opacity: 1; height: 120vh; }
              100% { opacity: 0; height: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

function ThankYouScreen({ eventId, onPlayAgain, isEnded, participantName }) {
  const event = EVENTS[eventId];
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <BgGrid />
      <BottomRightWaves />
      <GoldSparkles />
      <div className="card animate-slide-right" style={{ position: "relative", zIndex: 1, maxWidth: 400, width: "100%", textAlign: "center", borderRadius: "2px", padding: "2rem 1rem" }}>
        <CheckCircle size={48} style={{ color: "#16A34A", margin: "0 auto 1.25rem" }} />
        {event && <img src={event.logo} alt={event.name} style={{ height: 80, objectFit: "contain", margin: "0 auto 1.5rem", display: "block" }} />}
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--text)" }}>
          {isEnded ? "Session Ended" : (participantName ? `Thank You, ${participantName}! 🥳` : "Thank You! 🥳")}
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          {isEnded 
            ? "This live session has concluded. Check the main screen for the final results!" 
            : "Your response has been successfully submitted. Watch the main screen to see the live word cloud!"}
        </p>
        {!isEnded && (
          <button 
            className="btn btn-outline" 
            style={{ width: "100%", borderRadius: "2px" }}
            onClick={onPlayAgain}
          >
            Play Again
          </button>
        )}
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

  // ── Session Timeout on Inactivity (Minimize) ──
  useEffect(() => {
    let timeoutId;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Start a 30-second timer when minimized/hidden
        timeoutId = setTimeout(() => {
          setParticipantName(null);
          setSubmitted(false);
          goOffline(db);
          navigate("/");
        }, 30000);
      } else {
        // Clear timer if user returns before 30 seconds
        if (timeoutId) clearTimeout(timeoutId);
        goOnline(db);
      }
    };

    goOnline(db);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );

  if (error || !game) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <BgGrid />
      <BottomRightWaves />
      <div className="card animate-slide-right" style={{ position: "relative", zIndex: 1, maxWidth: 360, width: "100%", textAlign: "center" }}>
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

  if (game?.status === "ended") return <ThankYouScreen eventId={game?.eventId} isEnded={true} participantName={participantName} />;
  if (!participantName) return <NameEntry onSubmit={handleNameSubmit} eventId={game?.eventId} />;
  if (submitted)        return <ThankYouScreen eventId={game?.eventId} participantName={participantName} onPlayAgain={() => { setParticipantName(null); setSubmitted(false); }} />;

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
