// src/components/WordCloudViz.jsx
import { useEffect, useRef, useCallback } from "react";
import { getMaskCanvas } from "../utils/masks";
import { drawIconicTrophy } from "../utils/drawIconicTrophy";

const THEME_COLORS = {
  // Golden & black — perfect contrast for the red wax-seal trophy
  iconic:   ["#FFD700", "#F5C518", "#DAA520", "#FFC200", "#FFE566", "#FFF3B0", "#C5A000", "#FFDF00", "#E8B800", "#FFD060"],
  tech:     ["#003D73", "#00529B", "#0277BD", "#0288D1", "#006064", "#00838F", "#1565C0", "#01579B", "#0097A7", "#004D87"],
  consumer: ["#0B132C", "#D4AF37", "#131A2D", "#C5A059", "#1A2639", "#B8860B", "#8B1818", "#0A192F", "#F9E596", "#040B18"],
  default:  ["#8B1818", "#00529B", "#16A34A", "#B45309", "#4338CA", "#BE123C", "#0F766E", "#0369A1"],
};

/**
 * For the iconic theme the word cloud is rendered onto a high-resolution
 * offscreen canvas sized exactly to the inner circle, then composited inside
 * the fully code-drawn trophy (see drawIconicTrophy.js).
 *
 * For other themes the existing SVG mask strategy is used unchanged.
 */
export default function WordCloudViz({ words, forwardedRef, theme = "default", fillShape = false }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);

  const drawCloud = useCallback(async () => {
    if (!words || words.length === 0) return;
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const colors = THEME_COLORS[theme] || THEME_COLORS.default;
    const { default: WordCloud } = await import("wordcloud");

    const w = container.offsetWidth  || 1280;
    const h = container.offsetHeight || 720;
    canvas.width  = w;
    canvas.height = h;
    if (forwardedRef) forwardedRef.current = canvas;

    const ctx = canvas.getContext("2d");

    // ── ICONIC THEME ────────────────────────────────────────────────────────────
    if (theme === "iconic") {
      // Step 1 — Draw trophy background + decoration; get inner circle position
      ctx.clearRect(0, 0, w, h);
      const { cx, cy, r } = drawIconicTrophy(canvas);

      // Step 2 — Render word cloud on its own offscreen canvas, circle-shaped
      // Use 2× pixels for crispness
      const diam   = Math.round(r * 2);
      const scale  = 2;
      const off    = document.createElement("canvas");
      off.width    = diam * scale;
      off.height   = diam * scale;
      const offCtx = off.getContext("2d");

      // Paint the occupied-area mask: white = blocked, transparent = free
      // We want the circle to be free so the wordcloud library fills it
      offCtx.clearRect(0, 0, off.width, off.height);
      offCtx.fillStyle = "#fff";
      offCtx.fillRect(0, 0, off.width, off.height);
      offCtx.globalCompositeOperation = "destination-out";
      offCtx.beginPath();
      offCtx.arc(off.width / 2, off.height / 2, off.width / 2 - 2, 0, Math.PI * 2);
      offCtx.fill();
      offCtx.globalCompositeOperation = "source-over";

      // Word list
      let processedWords = [...words];
      if (fillShape && processedWords.length < 350 && processedWords.length > 0) {
        const need = 350 - processedWords.length;
        for (let i = 0; i < need; i++) {
          const si = Math.floor(Math.random() * words.length);
          processedWords.push({ text: words[si].text, value: words[si].value * 0.08 });
        }
      }

      const maxVal  = processedWords[0]?.value || 1;
      const minFont = Math.round(off.width / 55);
      const maxFont = Math.round(off.width / 4.5);
      const list    = processedWords.map(({ text, value }) => [
        text,
        Math.max(minFont, Math.round(minFont + ((value / maxVal) ** 1.1) * (maxFont - minFont))),
      ]);

      await new Promise((resolve) => {
        WordCloud(off, {
          list,
          gridSize:        Math.max(2, Math.round(off.width / 160)),
          weightFactor:    1,
          fontFamily:      "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          fontWeight:      "700",
          color:           (_w, _wt, _fs, _d, theta) => {
            const idx = Math.abs(Math.floor((theta / (Math.PI * 2)) * colors.length)) % colors.length;
            return colors[idx];
          },
          rotateRatio:     0,
          backgroundColor: "transparent",
          clearCanvas:     false,
          drawOutOfBound:  false,
          shrinkToFit:     true,
          minSize:         4,
          shuffle:         true,
          shape:           "circle",
        });
        setTimeout(resolve, 600);
      });

      // Step 3 — Composite word cloud clipped to the inner circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(off, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();

      // Step 4 — Re-draw the gold ring on top so it overlaps the word cloud edges cleanly
      const ringW = r * 0.065;
      const ringOuterR = r + ringW;

      const goldGrad = ctx.createLinearGradient(cx - ringOuterR, cy, cx + ringOuterR, cy);
      goldGrad.addColorStop(0.00, "#7a5400");
      goldGrad.addColorStop(0.15, "#C8A000");
      goldGrad.addColorStop(0.35, "#FFE066");
      goldGrad.addColorStop(0.50, "#FFD700");
      goldGrad.addColorStop(0.65, "#FFE066");
      goldGrad.addColorStop(0.85, "#C8A000");
      goldGrad.addColorStop(1.00, "#7a5400");

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, ringOuterR, 0, Math.PI * 2);
      ctx.arc(cx, cy, r - 1, 0, Math.PI * 2, true);
      ctx.fillStyle = goldGrad;
      ctx.fill("evenodd");
      ctx.restore();

      return;
    }

    // ── OTHER THEMES: Original mask strategy ──────────────────────────────────
    const maskCanvas = await getMaskCanvas(theme, w, h);

    if (maskCanvas) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(maskCanvas, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    let processedWords = [...words];
    if (fillShape && processedWords.length < 350 && processedWords.length > 0) {
      const fillerNeeded = 350 - processedWords.length;
      for (let i = 0; i < fillerNeeded; i++) {
        const si = Math.floor(Math.random() * processedWords.length);
        processedWords.push({ text: processedWords[si].text, value: processedWords[si].value * 0.1 });
      }
    }

    const maxVal  = processedWords[0]?.value || 1;
    const minFont = 6;
    const maxFont = Math.min(Math.round(w / 3.5), 180);
    const list    = processedWords.map(({ text, value }) => [
      text,
      Math.round(minFont + ((value / maxVal) ** 1.2) * (maxFont - minFont)),
    ]);

    WordCloud(canvas, {
      list,
      gridSize:        Math.max(2, Math.round(2 * w / 800)),
      weightFactor:    1,
      fontFamily:      "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      fontWeight:      "700",
      color:           (_word, _weight, _fontSize, _distance, theta) => {
        const idx = Math.abs(Math.floor((theta / (Math.PI * 2)) * colors.length)) % colors.length;
        return colors[idx];
      },
      rotateRatio:     0,
      backgroundColor: "transparent",
      clearCanvas:     false,
      drawOutOfBound:  false,
      shrinkToFit:     true,
      minSize:         4,
      shuffle:         true,
      shape:           "square",
    });
  }, [JSON.stringify(words), theme, forwardedRef]);

  useEffect(() => {
    drawCloud();
  }, [drawCloud]);

  const isIconic = theme === "iconic";

  return (
    <div
      ref={containerRef}
      className="wordcloud-wrapper"
      style={{
        position:     "relative",
        width:        "100%",
        aspectRatio:  isIconic ? "16 / 9" : "1000 / 600",
        background:   isIconic ? "#0d0000" : "#fff",
        margin:       "0 auto",
        borderRadius: isIconic ? "8px" : undefined,
        overflow:     "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
