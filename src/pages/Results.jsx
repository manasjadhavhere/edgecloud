// src/pages/Results.jsx
import { useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { computeWordFrequencies } from "../utils/wordCount";
import BgGrid from "../components/BgGrid";
import BottomRightWaves from "../components/BottomRightWaves";
import WordCloudViz from "../components/WordCloudViz";
import Top10Table from "../components/Top10Table";
import Confetti from "../components/Confetti";
import { EVENTS } from "../utils/theme";
import { Download, RotateCcw, Trophy, ChevronLeft, ChevronRight, BarChart2, Cloud } from "lucide-react";

export default function Results() {
  const { gameId }   = useParams();
  const navigate     = useNavigate();
  const { game, responses, loading } = useGame(gameId);
  const canvasRef    = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [viewIndex, setViewIndex]     = useState(0); // 0 = cloud, 1 = table

  const frequencies = useMemo(() => computeWordFrequencies(responses), [responses]);
  const event = EVENTS[game?.eventId];

  async function handleDownload() {
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const wrapper = document.getElementById("wordcloud-capture");
      if (!wrapper) return;
      const canvas = await html2canvas(wrapper, { backgroundColor: null, scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `edgecloud-${game?.eventId || "wordcloud"}-${gameId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally { setDownloading(false); }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );

  const VIEWS = [
    { label: "Word Cloud", icon: Cloud },
    { label: "Top Words",  icon: BarChart2 },
  ];

  return (
    <div className="admin-layout">
      <BgGrid />
      <BottomRightWaves />
      <Confetti active={true} />

      {/* Sidebar */}
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

          <p className="label-caps" style={{ padding: "0.5rem 0.5rem 0.35rem", color: "rgba(255,255,255,0.5)" }}>Results</p>
          {VIEWS.map((v, i) => {
            const Icon = v.icon;
            return (
              <button
                key={i}
                className={`nav-item dark-nav ${viewIndex === i ? "active" : ""}`}
                onClick={() => setViewIndex(i)}
              >
                <Icon size={15} /> {v.label}
              </button>
            );
          })}

          <div style={{ marginTop: "1.5rem" }}>
            <p className="label-caps" style={{ padding: "0.5rem 0.5rem 0.35rem" }}>Session</p>
            <div style={{ padding: "0.75rem 1rem", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                <Trophy size={12} color="var(--accent-text)" />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-text)" }}>Game Ended</span>
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>#{gameId}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                {responses.length} total response{responses.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={() => navigate("/select-event")}>
            <RotateCcw size={13} /> New Game
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <Trophy size={15} color="var(--accent-text)" />
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Results — What the Room Said</span>
          <div style={{ flex: 1 }} />
          <span className="badge badge-muted">{responses.length} responses</span>
          {event && <span className="badge badge-accent">{event.shortName}</span>}
        </div>

        {/* Content */}
        <div className="admin-content animate-slide-right" key={viewIndex}>
          {/* Sentence */}
          {game?.sentence && (
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <p className="label-caps" style={{ marginBottom: "0.5rem" }}>Session Sentence</p>
              <p className="sentence-display" style={{ fontSize: "1rem", textAlign: "left" }}>
                {game.sentence.split("__").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span style={{ display: "inline-block", minWidth: 60, borderBottom: "2px solid var(--accent)", marginInline: 4, color: "var(--accent-text)" }}>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </div>
          )}

          {frequencies.length === 0 ? (
            <div className="card" style={{ textAlign: "center", maxWidth: 380, margin: "3rem auto" }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem" }}>No Responses</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Nobody submitted answers before the game ended.</p>
            </div>
          ) : (
            <>
              {/* View selector tabs */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                {VIEWS.map((v, i) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={i}
                      className={`btn btn-sm ${viewIndex === i ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setViewIndex(i)}
                    >
                      <Icon size={13} /> {v.label}
                    </button>
                  );
                })}
                {/* Arrow nav */}
                <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
                  <button className="btn btn-ghost btn-icon" onClick={() => setViewIndex(0)} disabled={viewIndex === 0}>
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ display: "flex", alignItems: "center", fontSize: "0.78rem", color: "var(--text-muted)", padding: "0 0.25rem" }}>
                    {viewIndex + 1} / {VIEWS.length}
                  </span>
                  <button className="btn btn-ghost btn-icon" onClick={() => setViewIndex(1)} disabled={viewIndex === 1}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Word Cloud view */}
              <div className="card scale-in" style={{ display: viewIndex === 0 ? "block" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h2 className="section-title">Word Cloud</h2>
                  <button className="btn btn-outline btn-sm" onClick={handleDownload} disabled={downloading}>
                    <Download size={13} /> {downloading ? "Saving…" : "Download PNG"}
                  </button>
                </div>
                <div id="wordcloud-capture" style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", textAlign: "center", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {event?.name || "EdgeCloud"} · Game #{gameId}
                  </p>
                  {game?.finalCloudImage ? (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <img src={game.finalCloudImage} alt="Word Cloud" style={{ width: "100%", maxWidth: "1000px", height: "auto", objectFit: "contain", borderRadius: "var(--radius-sm)" }} />
                    </div>
                  ) : (
                    <WordCloudViz words={frequencies} forwardedRef={canvasRef} theme={game?.eventId} fillShape={true} />
                  )}
                </div>
              </div>

              {/* Table view */}
              <div className="card scale-in" style={{ display: viewIndex === 1 ? "block" : "none" }}>
                <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>Top Words by Frequency</h2>
                <Top10Table words={frequencies} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
