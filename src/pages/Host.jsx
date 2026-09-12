// src/pages/Host.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { ref, set, update } from "firebase/database";
import { generateGameId, countBlanks, computeWordFrequencies } from "../utils/wordCount";
import { useGame } from "../hooks/useGame";
import BgGrid from "../components/BgGrid";
import QRDisplay from "../components/QRDisplay";
import WordCloudViz from "../components/WordCloudViz";
import { EVENTS, isLoggedIn, getStoredTheme, storeTheme, applyTheme } from "../utils/theme";
import { Plus, StopCircle, Eye, Users, ChevronLeft, LayoutDashboard, Zap } from "lucide-react";

// ── Sentence editor ──────────────────────────────────────────
function SentenceEditor({ sentence, setSentence, textareaRef }) {
  function insertBlank() {
    const el = textareaRef.current;
    if (!el) { setSentence((s) => s + "__"); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setSentence(sentence.slice(0, start) + "__" + sentence.slice(end));
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 2;
      el.focus();
    });
  }
  const parts = sentence.split("__");
  const blankCount = countBlanks(sentence);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
          Sentence
        </label>
        <textarea
          ref={textareaRef}
          className="input"
          rows={3}
          placeholder='Write your sentence, then place cursor and click "Insert Blank" to add gaps…'
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: 1.7 }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button className="btn btn-outline btn-sm" onClick={insertBlank} type="button">
          <Plus size={13} /> Insert Blank
        </button>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          {blankCount} blank{blankCount !== 1 ? "s" : ""} detected
        </span>
      </div>

      {sentence && (
        <div style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", border: "1px solid var(--border)" }}>
          <p className="label-caps" style={{ marginBottom: "0.5rem" }}>Preview</p>
          <p className="sentence-display" style={{ fontSize: "1rem", textAlign: "left" }}>
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && (
                  <span style={{
                    display: "inline-block", minWidth: 80,
                    borderBottom: "2px solid var(--accent)",
                    marginInline: "4px", color: "var(--accent-text)",
                  }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                )}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Participant list ─────────────────────────────────────────
function ParticipantList({ responses, game }) {
  const seen = new Set();
  const uniqueResponses = responses.filter((r) => { if (seen.has(r.name)) return false; seen.add(r.name); return true; });
  const joinedNames = new Set(Object.values(game?.participants || {}));
  uniqueResponses.forEach((r) => joinedNames.add(r.name));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <p className="label-caps">Participants</p>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <span className="live-dot" style={{ width: 6, height: 6, marginRight: 4 }} />
          {joinedNames.size} joined · {uniqueResponses.length} answered
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {Array.from(joinedNames).map((name, i) => (
          <div className="participant-chip" key={i} style={{ opacity: seen.has(name) ? 1 : 0.5 }}>
            <div className="participant-avatar">{name?.charAt(0)?.toUpperCase()}</div>
            {name}
          </div>
        ))}
        {joinedNames.size === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Waiting for participants to join…</p>}
      </div>
    </div>
  );
}

// ── Main Host page ───────────────────────────────────────────
export default function Host() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get eventId from route state or sessionStorage fallback
  const eventId = location.state?.eventId || getStoredTheme();
  const event = EVENTS[eventId] || null;

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/host-login", { replace: true }); return; }
    if (!eventId) { navigate("/select-event", { replace: true }); return; }
    storeTheme(eventId);
    applyTheme(eventId);
  }, [eventId, navigate]);

  const [step, setStep] = useState(1);
  const [sentence, setSentence] = useState("");
  const [gameId, setGameId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);
  const { game, responses } = useGame(gameId);
  const joinUrl = `${window.location.origin}/join/${gameId}`;

  async function handleCreate() {
    if (!sentence.trim()) { setError("Please enter a sentence first."); return; }
    if (countBlanks(sentence) === 0) { setError("Add at least one blank ( __ ) to your sentence."); return; }
    setError(""); setCreating(true);
    const id = generateGameId();
    try {
      await set(ref(db, `games/${id}`), {
        sentence: sentence.trim(),
        status: "active",
        createdAt: Date.now(),
        eventId: eventId || "default",
      });
      await set(ref(db, "activeGame"), id);
      setGameId(id);
      setStep(2);
    } catch (err) {
      setError("Failed to create game: " + err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleEnd() {
    if (!gameId) return;
    await update(ref(db, `games/${gameId}`), { status: "ended" });
    await set(ref(db, "activeGame"), null);
    navigate(`/results/${gameId}`);
  }

  return (
    <div className="admin-layout">
      <BgGrid />

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="admin-sidebar glossy-dark">
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <img src="/EdgeCloud Image.png" alt="EdgeCloud" style={{ height: 28, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        </div>

        <div style={{ padding: "0.75rem", flex: 1 }}>
          {event && (
            <div style={{ padding: "0.75rem 1rem", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "1rem" }}>
              <img src={event.logo} alt={event.shortName} style={{ height: 32, width: "auto", objectFit: "contain", marginBottom: "0.4rem", background: "#fff", padding: 2, borderRadius: 2 }} />
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>{event.shortName}</p>
            </div>
          )}

          <p className="label-caps" style={{ padding: "0.5rem 0.5rem 0.35rem", color: "rgba(255,255,255,0.5)" }}>Navigation</p>
          <button className={`nav-item dark-nav ${step === 1 ? "active" : ""}`} onClick={() => setStep(1)}>
            <LayoutDashboard size={15} /> Compose Sentence
          </button>
          <button className={`nav-item dark-nav ${step === 2 ? "active" : ""}`} onClick={() => setStep(2)} disabled={!gameId}>
            <Users size={15} /> Live Session
          </button>

          {step === 2 && gameId && (
            <div style={{ marginTop: "1.5rem" }}>
              <p className="label-caps" style={{ padding: "0.5rem 0.5rem 0.35rem" }}>Session</p>
              <div style={{ padding: "0.75rem 1rem", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#3FB950" }}>LIVE</span>
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>Game #{gameId}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {responses.length} response{responses.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button className="nav-item" onClick={() => navigate("/select-event")}>
            <ChevronLeft size={15} /> Change Event
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────── */}
      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={15} color="var(--accent-text)" />
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {step === 1 ? "Compose Sentence" : "Live Session"}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          {event && (
            <span className="badge badge-accent">{event.shortName}</span>
          )}
          {step === 2 && (
            <span className="badge badge-green">
              <span className="live-dot" style={{ width: 5, height: 5 }} /> LIVE
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", background: "var(--accent-glow)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-text)" }}>H</span>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>Host</span>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          {/* ── Step 1: Compose ── */}
          {step === 1 && (
            <div className="fade-in" style={{ maxWidth: 720, margin: "0 auto" }}>
              {/* Step indicator */}
              <div className="step-indicator" style={{ marginBottom: "1.5rem" }}>
                <div className="step-dot active">1</div>
                <div className="step-line" />
                <div className="step-dot">2</div>
                <div className="step-line" />
                <div className="step-dot">3</div>
                <span style={{ marginLeft: "0.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>Compose → Launch → Results</span>
              </div>

              <div className="card" style={{ marginBottom: "1rem" }}>
                <h2 className="section-title" style={{ marginBottom: "0.35rem" }}>Craft Your Sentence</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                  Write a fill-in-the-blank sentence. Audience members will submit words to complete it — generating your live word cloud.
                </p>
                <SentenceEditor sentence={sentence} setSentence={setSentence} textareaRef={textareaRef} />
                {error && <p style={{ color: "#F85149", fontSize: "0.82rem", marginTop: "0.75rem" }}>{error}</p>}
                <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary btn-lg" onClick={handleCreate} disabled={creating}>
                    {creating ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Eye size={16} /> Launch Game & Show QR</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Live ── */}
          {step === 2 && gameId && (
            <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
              {/* Left */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Status */}
                <div className="card">
                  <div className="step-indicator">
                    <div className="step-dot done">✓</div>
                    <div className="step-line" />
                    <div className="step-dot active">2</div>
                    <div className="step-line" />
                    <div className="step-dot">3</div>
                  </div>
                  <h2 className="section-title" style={{ marginBottom: "0.35rem" }}>Game is Live</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                    Participants are filling in the sentence. The word cloud updates in real-time. Stop the game to reveal final results.
                  </p>
                </div>

                {/* Sentence preview */}
                <div className="card">
                  <p className="label-caps" style={{ marginBottom: "0.5rem" }}>Active Sentence</p>
                  <p className="sentence-display" style={{ fontSize: "1rem", textAlign: "left" }}>
                    {sentence.split("__").map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span style={{ display: "inline-block", minWidth: 80, borderBottom: "2px solid var(--accent)", marginInline: "4px", color: "var(--accent-text)" }}>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          </span>
                        )}
                      </span>
                    ))}
                  </p>
                </div>

                {/* Word Cloud */}
                <div className="card" style={{ minHeight: 400 }}>
                  <p className="label-caps" style={{ marginBottom: "0.75rem" }}>Live Word Cloud</p>
                  <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", minHeight: 320, overflow: "hidden" }}>
                    {responses.length > 0 ? (
                      <WordCloudViz words={computeWordFrequencies(responses)} theme={eventId} />
                    ) : (
                      <div style={{ display: "flex", height: 320, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.75rem", color: "var(--text-muted)" }}>
                        <div className="spinner" />
                        <span style={{ fontSize: "0.85rem" }}>Waiting for first responses…</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* End game */}
                <button className="btn btn-danger btn-lg" style={{ width: "100%" }} onClick={handleEnd}>
                  <StopCircle size={18} /> Stop Game & Reveal Results
                </button>
              </div>

              {/* Right */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "sticky", top: "2rem" }}>
                {/* QR */}
                <div className="card">
                  <p className="label-caps" style={{ marginBottom: "0.75rem" }}>
                    <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                    Share with Audience
                  </p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="qr-container">
                      <QRDisplay url={joinUrl} gameId={gameId} />
                    </div>
                  </div>
                  <div className="divider" />
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", wordBreak: "break-all", fontFamily: "monospace" }}>
                    {joinUrl}
                  </p>
                </div>

                {/* Participants */}
                <div className="card">
                  <ParticipantList responses={responses} game={game} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
