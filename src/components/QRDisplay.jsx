// src/components/QRDisplay.jsx
import { QRCodeSVG } from "qrcode.react";

export default function QRDisplay({ url, gameId }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
      <div className="qr-container">
        <QRCodeSVG
          value={url}
          size={180}
          bgColor="#ffffff"
          fgColor="#0D1117"
          level="M"
          includeMargin={false}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.35rem" }}>
          Scan to join
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          background: "var(--accent-glow)", border: "1px solid var(--accent)",
          borderRadius: "var(--radius-sm)", padding: "0.25rem 0.75rem",
        }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Game ID:</span>
          <span style={{ fontFamily: "monospace", fontSize: "1rem", color: "var(--accent-text)", fontWeight: 700, letterSpacing: "0.15em" }}>
            {gameId}
          </span>
        </div>
      </div>
    </div>
  );
}
