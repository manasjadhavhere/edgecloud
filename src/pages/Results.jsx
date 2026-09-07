// src/pages/Results.jsx
import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { computeWordFrequencies } from "../utils/wordCount";
import FloatingOrbs from "../components/FloatingOrbs";
import WordCloudViz from "../components/WordCloudViz";
import Top10Table from "../components/Top10Table";
import Confetti from "../components/Confetti";
import { Download, RotateCcw, Trophy } from "lucide-react";

export default function Results() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { game, responses, loading } = useGame(gameId);
  const canvasRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const frequencies = computeWordFrequencies(responses);

  async function handleDownload() {
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const wrapper = document.getElementById("wordcloud-capture");
      if (!wrapper) return;

      const canvas = await html2canvas(wrapper, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `edgecloud-wordcloud-${gameId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

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

  return (
    <>
      <FloatingOrbs />
      <Confetti active={true} />

      <div className="page page-top">
        <div className="container-wide" style={{ paddingBottom: "4rem" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }} className="fade-in">
            <img
              src="/EdgeCloud Image.png"
              alt="EdgeCloud"
              style={{ height: 42, width: "auto", objectFit: "contain", marginBottom: "0.75rem" }}
            />

            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: "linear-gradient(135deg,#F59E0B,#EF4444)",
                borderRadius: 999, padding: "0.35rem 1rem",
                color: "#fff", fontWeight: 700, fontSize: "0.82rem",
                letterSpacing: "0.06em", textTransform: "uppercase",
                marginBottom: "1rem",
              }}>
                <Trophy size={14} /> Results · {responses.length} response{responses.length !== 1 ? "s" : ""}
              </div>
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              background: "linear-gradient(135deg,#1A1A2E,#E8213C)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: "0.75rem",
            }}>
              What the Room Said
            </h1>

            {/* Sentence */}
            {game?.sentence && (
              <div style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.15)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1.5rem",
                display: "inline-block",
                maxWidth: 700,
              }}>
                <p style={{
                  fontFamily: "var(--font-display)", fontSize: "1.05rem",
                  color: "var(--text)", lineHeight: 1.6,
                }}>
                  {game.sentence.split("__").map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span style={{
                          display: "inline-block", minWidth: 60,
                          borderBottom: "2px solid #E8213C",
                          marginInline: 4,
                        }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>

          {frequencies.length === 0 ? (
            <div className="card text-center" style={{ maxWidth: 420, margin: "0 auto" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", marginBottom: "0.5rem" }}>
                No responses yet 😔
              </p>
              <p className="text-muted">Nobody submitted answers before the game ended.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">

              {/* Word Cloud */}
              <div className="card scale-in">
                <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
                  <h2 className="section-title">Word Cloud</h2>
                  <button
                    className="btn btn-emerald btn-sm"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    <Download size={15} />
                    {downloading ? "Saving…" : "Download PNG"}
                  </button>
                </div>

                {/* Capture target for html2canvas */}
                <div
                  id="wordcloud-capture"
                  style={{
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    background: "linear-gradient(135deg,#F0F7FF 0%,#FFF5F0 50%,#F5F0FF 100%)",
                    padding: "1rem",
                  }}
                >
                  {/* Title inside capture */}
                  <p style={{
                    fontFamily: "var(--font-display)", fontSize: "1.1rem",
                    textAlign: "center", color: "var(--muted)",
                    marginBottom: "0.5rem",
                  }}>
                    EdgeCloud · Game #{gameId}
                  </p>
                  <WordCloudViz words={frequencies} forwardedRef={canvasRef} />
                </div>
              </div>

              {/* Top 10 table */}
              <div className="card fade-in" style={{ animationDelay: "0.3s" }}>
                <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>
                  🏆 Top Words
                </h2>
                <Top10Table words={frequencies} />
              </div>

              {/* Actions */}
              <div className="flex gap-2" style={{ justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate("/")}
                >
                  <RotateCcw size={16} /> Play Again
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  <Download size={16} />
                  {downloading ? "Saving…" : "Download Word Cloud"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
