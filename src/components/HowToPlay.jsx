// src/components/HowToPlay.jsx
import { useEffect } from "react";
import { X, QrCode, PenLine, BarChart2, Zap, Users, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: "zap",
    gradient: "linear-gradient(135deg, #E8213C, #F97316)",
    shadow: "rgba(232,33,60,0.35)",
    title: "Host creates a game",
    desc: 'Click "Create Game", craft your sentence with blanks (e.g. "I wish I had better ___ before ___"), then launch the session.',
  },
  {
    icon: "qr",
    gradient: "linear-gradient(135deg, #F97316, #FBBF24)",
    shadow: "rgba(249,115,22,0.35)",
    title: "Players scan & join",
    desc: "A QR code appears on the host screen. Players scan it (or enter the Game ID) to open the join page on their phones.",
  },
  {
    icon: "pen",
    gradient: "linear-gradient(135deg, #EC4899, #A855F7)",
    shadow: "rgba(236,72,153,0.35)",
    title: "Everyone fills the blank",
    desc: "Each player types their word(s) to complete the sentence and submits. All responses are collected in real-time.",
  },
  {
    icon: "bar",
    gradient: "linear-gradient(135deg, #6366F1, #06B6D4)",
    shadow: "rgba(99,102,241,0.35)",
    title: "Results light up the room",
    desc: "The host reveals a live Word Cloud plus a Top-10 table — the most popular answers glow biggest. Discuss and enjoy!",
  },
];

export default function HowToPlay({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const iconMap = {
    zap: <Zap size={22} color="#fff" />,
    qr: <QrCode size={22} color="#fff" />,
    pen: <PenLine size={22} color="#fff" />,
    bar: <BarChart2 size={22} color="#fff" />,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How to play EdgeCloud"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.22s ease",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 540,
          position: "relative",
          padding: "2rem 1.75rem",
          animation: "scaleIn 0.25s cubic-bezier(.34,1.56,.64,1)",
          maxHeight: "90vh",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(232,33,60,0.4) transparent",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close tutorial"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "50%",
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted)",
            transition: "background 0.18s, color 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232,33,60,0.2)";
            e.currentTarget.style.color = "#E8213C";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          <X size={16} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, borderRadius: 16,
            background: "linear-gradient(135deg, #E8213C, #F97316)",
            boxShadow: "0 6px 24px rgba(232,33,60,0.35)", marginBottom: "0.85rem",
          }}>
            <Users size={26} color="#fff" />
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.3rem, 4vw, 1.6rem)",
            marginBottom: "0.35rem",
            background: "linear-gradient(135deg, #E8213C, #F97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            How to Play EdgeCloud
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            A live word-cloud game for any crowd — in 4 easy steps.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: "1rem", alignItems: "flex-start",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "1rem 1.1rem",
                transition: "background 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            >
              <div style={{
                flexShrink: 0, width: 42, height: 42, borderRadius: 12,
                background: step.gradient,
                boxShadow: `0 4px 14px ${step.shadow}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {iconMap[step.icon]}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em",
                    color: "#E8213C", textTransform: "uppercase",
                  }}>Step {i + 1}</span>
                </div>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", marginBottom: "0.3rem", color: "var(--text)" }}>
                  {step.title}
                </h4>
                <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.55 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <button className="btn btn-primary btn-sm" onClick={onClose} style={{ gap: "0.4rem" }}>
            Got it — let's play! <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
