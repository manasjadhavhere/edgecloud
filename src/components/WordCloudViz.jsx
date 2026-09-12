// src/components/WordCloudViz.jsx
import { useEffect, useRef, useCallback } from "react";
import { getMaskCanvas } from "../utils/masks";

const THEME_COLORS = {
  iconic: ["#8B1818", "#C5A059", "#A0522D", "#8B6914", "#5A0F0F", "#990000", "#6B4226", "#B8860B", "#C5832A", "#7B3F00"],
  tech:   ["#003D73", "#00529B", "#0277BD", "#0288D1", "#006064", "#00838F", "#1565C0", "#01579B", "#0097A7", "#004D87"],
  default:["#8B1818", "#00529B", "#16A34A", "#B45309", "#4338CA", "#BE123C", "#0F766E", "#0369A1"],
};

/**
 * Renders the wordcloud2 library onto a canvas using shape masking.
 * 
 * Strategy for shape masking:
 *   wordcloud2 treats non-transparent canvas pixels as "occupied space".
 *   So we:
 *   1. Paint the whole canvas with a fully opaque black fill (all occupied)
 *   2. Use destination-out to "punch out" the mask shape (making those pixels free)
 *   3. wordcloud2 then places words only in the transparent (free) region = inside the shape
 */
export default function WordCloudViz({ words, forwardedRef, theme = "default" }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);

  const drawCloud = useCallback(async () => {
    if (!words || words.length === 0) return;
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const colors = THEME_COLORS[theme] || THEME_COLORS.default;
    const { default: WordCloud } = await import("wordcloud");

    const w = container.offsetWidth  || 800;
    const h = container.offsetHeight || 500;
    canvas.width  = w;
    canvas.height = h;
    if (forwardedRef) forwardedRef.current = canvas;

    const ctx = canvas.getContext("2d");

    // Get mask canvas (black shape on transparent background)
    const maskCanvas = await getMaskCanvas(theme, w, h);

    if (maskCanvas) {
      // Step 1: Fill everything with near-transparent pixel — means "all occupied" for wordcloud2
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.01)";
      ctx.fillRect(0, 0, w, h);

      // Step 2: Punch out the shape area using the mask (black pixels in mask = free zone)
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(maskCanvas, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    // Scale font sizes to fill the available area well regardless of word count
    const wordCount = words.length;
    const maxVal    = words[0]?.value || 1;
    const minVal    = words[words.length - 1]?.value || 1;
    
    // Use area-based scaling so fewer words = bigger fonts (filling the shape)
    const shapeArea = maskCanvas ? (w * h * 0.45) : (w * h * 0.7); // approx usable px
    const avgChars  = words.reduce((a, b) => a + b.text.length, 0) / wordCount;
    
    // Compute a dynamic font scale factor
    const baseFontScale = Math.sqrt(shapeArea / (wordCount * avgChars * 15));
    const minFont = Math.max(8, Math.round(baseFontScale * 6));
    const maxFont = Math.min(Math.round(w / 4), Math.round(baseFontScale * 50)); // Allow larger max fonts for anchors

    const list = words.map(({ text, value }) => [
      text,
      Math.round(minFont + ((value / maxVal) ** 0.8) * (maxFont - minFont)), // increased power for sharper dropoff
    ]);

    WordCloud(canvas, {
      list,
      gridSize:        Math.max(2, Math.round(2 * w / 800)), // smaller grid = denser packing
      weightFactor:    1,
      fontFamily:      "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      fontWeight:      "700",
      color:           (_word, _weight, _fontSize, _distance, theta) => {
        const idx = Math.abs(Math.floor((theta / (2 * Math.PI)) * colors.length)) % colors.length;
        return colors[idx];
      },
      rotateRatio:     0,           // all horizontal — professional B2B look
      backgroundColor: "transparent",
      clearCanvas:     false,       // IMPORTANT: keep the mask we painted
      drawOutOfBound:  false,
      shrinkToFit:     true,
      minSize:         4,           // allow very small words to fill gaps
      shuffle:         true,
      shape:           "square",
    });
  }, [words, theme, forwardedRef]);

  useEffect(() => {
    drawCloud();
  }, [drawCloud]);

  return (
    <div
      ref={containerRef}
      className="wordcloud-wrapper"
      style={{ position: "relative", minHeight: 420, background: "#fff" }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
