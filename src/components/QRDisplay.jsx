// src/components/QRDisplay.jsx
import { QRCodeSVG } from "qrcode.react";

export default function QRDisplay({ url, gameId }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      {/* QR frame */}
      <div
        style={{
          padding: "1.25rem",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.08)",
          border: "3px solid rgba(59,130,246,0.15)",
          position: "relative",
        }}
      >
        {/* Corner accent dots */}
        {[
          { top: 6, left: 6 }, { top: 6, right: 6 },
          { bottom: 6, left: 6 }, { bottom: 6, right: 6 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 10, height: 10,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              ...pos,
            }}
          />
        ))}

        <QRCodeSVG
          value={url}
          size={200}
          bgColor="#ffffff"
          fgColor="#1A1A2E"
          level="M"
          includeMargin={false}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          color: "var(--text)",
          marginBottom: "0.25rem",
        }}>
          Scan to join the game!
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "999px",
            padding: "0.3rem 0.9rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>
            Game ID:
          </span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            color: "var(--blue)",
            letterSpacing: "0.15em",
          }}>
            {gameId}
          </span>
        </div>
      </div>
    </div>
  );
}
