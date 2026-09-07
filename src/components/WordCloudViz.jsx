// src/components/WordCloudViz.jsx
import { useEffect, useRef } from "react";

const COLORS = [
  "#E8213C", "#8B5CF6", "#F97316", "#10B981",
  "#EC4899", "#F59E0B", "#06B6D4", "#6366F1",
  "#EF4444", "#84CC16",
];

export default function WordCloudViz({ words, forwardedRef }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    // Dynamically import wordcloud so it doesn't break SSR
    import("wordcloud").then((module) => {
      const WordCloud = module.default;

      const w = container.offsetWidth;
      const h = container.offsetHeight;

      const canvas = canvasRef.current;
      canvas.width = w;
      canvas.height = h;

      // Expose canvas via forwardedRef for html2canvas download
      if (forwardedRef) forwardedRef.current = canvas;

      const maxVal = words[0]?.value || 1;
      const minFont = 18;
      const maxFont = Math.min(w / 5, 96);

      const list = words.map(({ text, value }) => [
        text,
        Math.round(minFont + ((value / maxVal) * (maxFont - minFont))),
      ]);

      WordCloud(canvas, {
        list,
        gridSize: Math.round(8 * w / 900),
        weightFactor: 1,
        fontFamily: "'Fredoka One', sans-serif",
        color: (_word, _weight, _fontSize, _distance, theta) => {
          return COLORS[Math.floor((theta / (2 * Math.PI)) * COLORS.length) % COLORS.length];
        },
        rotateRatio: 0.3,
        rotationSteps: 2,
        backgroundColor: "transparent",
        drawOutOfBound: false,
        shrinkToFit: true,
      });
    });
  }, [words]);

  return (
    <div
      ref={containerRef}
      className="wordcloud-wrapper"
      style={{ position: "relative" }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
