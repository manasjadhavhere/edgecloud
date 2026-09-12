// src/components/WordCloudViz.jsx
import { useEffect, useRef, useCallback } from "react";
import { getMaskCanvas } from "../utils/masks";

const THEME_COLORS = {
  iconic: ["#C5A059","#E8C179","#8B1818","#D4AF37","#A0522D","#CD853F","#B8860B","#8B6914"],
  tech:   ["#00529B","#00AEEF","#40C4FF","#003D73","#0288D1","#01579B","#29B6F6","#4FC3F7"],
  default:["#C5A059","#8B1818","#00529B","#00AEEF","#3FB950","#F85149","#D4AF37","#40C4FF"],
};

export default function WordCloudViz({ words, forwardedRef, theme = "default" }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const cleanupRef   = useRef(null);

  const drawCloud = useCallback(async () => {
    if (!words || words.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    const colors = THEME_COLORS[theme] || THEME_COLORS.default;
    const { default: WordCloud } = await import("wordcloud");

    const w = container.offsetWidth  || 800;
    const h = container.offsetHeight || 450;

    const canvas = canvasRef.current;
    canvas.width  = w;
    canvas.height = h;
    if (forwardedRef) forwardedRef.current = canvas;

    const maxVal  = words[0]?.value || 1;
    const minFont = Math.max(14, Math.round(w / 60));
    const maxFont = Math.min(Math.round(w / 6), 110);

    const list = words.map(({ text, value }) => [
      text,
      Math.round(minFont + ((value / maxVal) ** 0.6) * (maxFont - minFont)),
    ]);

    // Get mask
    const maskCanvas = await getMaskCanvas(theme, w, h);

    if (maskCanvas) {
      // Paint mask as the initial canvas state
      // wordcloud2 respects pixels with alpha > 0 (occupied) and alpha === 0 (free)
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);

      // Fill canvas with a near-transparent pixel so wordcloud2 treats it as "occupied"
      ctx.fillStyle = "rgba(1,1,1,0.01)";
      ctx.fillRect(0, 0, w, h);

      // Punch through the mask shape to alpha=0 ("free" zone)
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(maskCanvas, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }

    // Cancel previous wordcloud if any
    if (cleanupRef.current) { try { WordCloud.stop?.(); } catch(_) {} }

    WordCloud(canvas, {
      list,
      gridSize:       Math.round(6 * w / 800),
      weightFactor:   1,
      fontFamily:     "'Montserrat', 'Inter', sans-serif",
      fontWeight:     "700",
      color:          (word, weight, fontSize, distance, theta) => {
        const idx = Math.floor((theta / (2 * Math.PI)) * colors.length) % colors.length;
        return colors[Math.abs(idx)];
      },
      rotateRatio:    0,          // horizontal only — professional look
      backgroundColor:"transparent",
      clearCanvas:    maskCanvas ? false : true,  // keep mask when present
      drawOutOfBound: false,
      shrinkToFit:    true,
    });

    cleanupRef.current = true;
  }, [words, theme, forwardedRef]);

  useEffect(() => {
    drawCloud();
  }, [drawCloud]);

  return (
    <div
      ref={containerRef}
      className="wordcloud-wrapper"
      style={{ position: "relative", minHeight: 320 }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
