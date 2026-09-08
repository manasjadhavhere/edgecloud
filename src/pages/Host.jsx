// src/pages/Host.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, set, update } from "firebase/database";
import { generateGameId, countBlanks, computeWordFrequencies } from "../utils/wordCount";
import { useGame } from "../hooks/useGame";
import FloatingOrbs from "../components/FloatingOrbs";
import QRDisplay from "../components/QRDisplay";
import WordCloudViz from "../components/WordCloudViz";
import { Plus, StopCircle, Eye, Users, ChevronLeft } from "lucide-react";

// ── Sentence editor ──────────────────────────────────────────
function SentenceEditor({ sentence, setSentence, textareaRef }) {
  function insertBlank() {
    const el = textareaRef.current;
    if (!el) {
      setSentence((s) => s + "__");
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = sentence.slice(0, start) + "__" + sentence.slice(end);
    setSentence(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 2;
      el.focus();
    });
  }

  // Render preview with highlighted blanks
  const parts = sentence.split("__");

  return (
    <div>
      <label style={{ display: "block", fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.9rem" }}>
        Your sentence
      </label>
      <textarea
        ref={textareaRef}
        className="input"
        rows={3}
        placeholder='Type your sentence, click "Insert Blank" where you want a gap…'
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem" }}
      />
      <div className="flex gap-1" style={{ marginTop: "0.6rem" }}>
        <button className="btn btn-outline-blue btn-sm" onClick={insertBlank} type="button">
          <Plus size={14} /> Insert Blank ( __ )
        </button>
        <span style={{ fontSize: "0.8rem", color: "var(--muted)", alignSelf: "center", marginLeft: "auto" }}>
          {countBlanks(sentence)} blank{countBlanks(sentence) !== 1 ? "s" : ""} detected
        </span>
      </div>

      {/* Preview */}
      {sentence && (
        <div className="card card-sm" style={{ marginTop: "1rem", background: "rgba(232,33,60,0.04)" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
            Preview
          </p>
          <p className="sentence-display" style={{ fontSize: "1.1rem" }}>
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && (
                  <span style={{
                    display: "inline-block",
                    minWidth: 80,
                    borderBottom: "3px solid #E8213C",
                    marginInline: "4px",
                    color: "#E8213C",
                    fontFamily: "var(--font-display)",
                  }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
  const uniqueResponses = responses.filter((r) => {
    if (seen.has(r.name)) return false;
    seen.add(r.name); return true;
  });

  const joinedNames = new Set(Object.values(game?.participants || {}));
  // Ensure those who answered are in the joined set (in case of legacy/direct answers)
  uniqueResponses.forEach((r) => joinedNames.add(r.name));

  const joinedCount = joinedNames.size;
  const answeredCount = uniqueResponses.length;

  return (
    <div>
      <div className="flex items-center gap-1" style={{ marginBottom: "0.75rem" }}>
        <span className="live-dot" />
        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
          Joined: {joinedCount} | Answered: {answeredCount}
        </span>
      </div>
      <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
        {Array.from(joinedNames).map((name, i) => {
          const hasAnswered = seen.has(name);
          return (
            <div className="participant-chip" key={i} style={{ opacity: hasAnswered ? 1 : 0.5 }}>
              <div className="participant-avatar">
                {name?.charAt(0)?.toUpperCase()}
              </div>
              {name}
            </div>
          );
        })}
        {joinedCount === 0 && (
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            Waiting for participants to join…
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Host page ───────────────────────────────────────────
export default function Host() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=compose, 2=live
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
    setError("");
    setCreating(true);

    const id = generateGameId();
    try {
      await set(ref(db, `games/${id}`), {
        sentence: sentence.trim(),
        status: "active",
        createdAt: Date.now(),
      });
      // Mark as globally active game
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
    <>
      <FloatingOrbs />
      <div className="page page-top">
        <div className="container-wide" style={{ paddingBottom: "3rem" }}>

          {/* Header */}
          <div className="flex items-center gap-2" style={{ marginBottom: "2rem" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
              <ChevronLeft size={16} /> Back
            </button>
            <div style={{ flex: 1 }} />
            <img
              src="/EdgeCloud Image.png"
              alt="EdgeCloud"
              style={{ height: 38, width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Step 1: Compose */}
          {step === 1 && (
            <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
              <div className="card">
                {/* Step indicator */}
                <div className="step-indicator">
                  <div className="step-dot active">1</div>
                  <div className="step-line" />
                  <div className="step-dot">2</div>
                  <div className="step-line" />
                  <div className="step-dot">3</div>
                </div>

                <h2 className="section-title" style={{ marginBottom: "0.4rem" }}>
                  Craft Your Sentence
                </h2>
                <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
                  Write a fill-in-the-blank sentence. Place your cursor and click{" "}
                  <strong>Insert Blank</strong> to add a gap.
                </p>

                <SentenceEditor
                  sentence={sentence}
                  setSentence={setSentence}
                  textareaRef={textareaRef}
                />

                {error && (
                  <p style={{ color: "#EF4444", fontSize: "0.85rem", marginTop: "0.75rem" }}>{error}</p>
                )}

                <div style={{ marginTop: "1.75rem" }}>
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%" }}
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? "Creating…" : (
                      <><Eye size={20} /> Launch Game &amp; Show QR</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Live */}
          {step === 2 && gameId && (
            <div className="fade-in">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 340px",
                  gap: "1.5rem",
                  alignItems: "start",
                }}
              >
                {/* Left: live status */}
                <div className="flex flex-col gap-3">

                  {/* Status card */}
                  <div className="card">
                    <div className="step-indicator">
                      <div className="step-dot done">✓</div>
                      <div className="step-line" />
                      <div className="step-dot active">2</div>
                      <div className="step-line" />
                      <div className="step-dot">3</div>
                    </div>
                    <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
                      <span className="badge badge-green">
                        <span className="live-dot" style={{ width: 6, height: 6 }} />
                        LIVE
                      </span>
                      <span style={{ fontWeight: 700, color: "var(--muted)", fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>
                        #{gameId}
                      </span>
                    </div>
                    <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
                      Game is Live!
                    </h2>
                    <p className="text-muted">
                      Participants are responding. Watch the word cloud update in real-time, and stop the game when ready.
                    </p>
                  </div>

                  {/* Real-time Word Cloud */}
                  <div className="card scale-in">
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
                      Real-time Word Cloud
                    </p>
                    <div style={{ height: "300px", background: "linear-gradient(135deg,#F0F7FF 0%,#FFF5F0 50%,#F5F0FF 100%)", borderRadius: "var(--radius-md)" }}>
                      {responses.length > 0 ? (
                        <WordCloudViz words={computeWordFrequencies(responses)} />
                      ) : (
                        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                          Waiting for words...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sentence preview */}
                  <div className="card">
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
                      Active Sentence
                    </p>
                    <p className="sentence-display" style={{ fontSize: "1.1rem" }}>
                      {sentence.split("__").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span style={{
                              display: "inline-block",
                              minWidth: 80,
                              borderBottom: "3px solid #E8213C",
                              marginInline: "4px",
                              color: "#E8213C",
                            }}>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                          )}
                        </span>
                      ))}
                    </p>
                  </div>

                  {/* Participants */}
                  <div className="card">
                    <ParticipantList responses={responses} game={game} />
                  </div>

                  {/* End game */}
                  <button
                    className="btn btn-coral btn-lg"
                    style={{ width: "100%" }}
                    onClick={handleEnd}
                  >
                    <StopCircle size={22} /> Stop Game &amp; Reveal Results
                  </button>
                </div>

                {/* Right: QR */}
                <div className="card" style={{ position: "sticky", top: "2rem" }}>
                  <div className="step-indicator" style={{ marginBottom: "1rem" }}>
                    <Users size={16} style={{ color: "var(--muted)" }} />
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Share with attendees
                    </span>
                  </div>
                  <QRDisplay url={joinUrl} gameId={gameId} />
                  <div className="divider" />
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", textAlign: "center", wordBreak: "break-all" }}>
                    {joinUrl}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
