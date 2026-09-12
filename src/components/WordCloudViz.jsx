// src/components/WordCloudViz.jsx
import { useEffect, useRef } from "react";
import { getMaskImage } from "../utils/masks";

const THEME_COLORS = {
  iconic: ["#C5A059", "#8B1818", "#E8C179", "#5A0F0F", "#D4AF37", "#990000", "#FFD700", "#A52A2A"],
  tech: ["#00529B", "#00AEEF", "#40C4FF", "#003D73", "#00BFFF", "#1E90FF", "#87CEFA", "#4682B4"],
  default: ["#E8213C", "#8B5CF6", "#F97316", "#10B981", "#EC4899", "#F59E0B", "#06B6D4", "#6366F1"],
};

export default function WordCloudViz({ words, forwardedRef, theme = "default" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    const colors = THEME_COLORS[theme] || THEME_COLORS.default;

    import("wordcloud").then((module) => {
      const WordCloud = module.default;

      const w = container.offsetWidth;
      const h = container.offsetHeight;

      const canvas = canvasRef.current;
      canvas.width = w;
      canvas.height = h;

      if (forwardedRef) forwardedRef.current = canvas;

      const maxVal = words[0]?.value || 1;
      const minFont = 18;
      const maxFont = Math.min(w / 5, 96);

      const list = words.map(({ text, value }) => [
        text,
        Math.round(minFont + ((value / maxVal) * (maxFont - minFont))),
      ]);

      const renderCloud = (maskCanvas = null) => {
        let options = {
          list,
          gridSize: Math.round(8 * w / 900),
          weightFactor: 1,
          fontFamily: "'Montserrat', sans-serif",
          color: (_word, _weight, _fontSize, _distance, theta) => {
            return colors[Math.floor((theta / (2 * Math.PI)) * colors.length) % colors.length];
          },
          rotateRatio: 0, // Keep text horizontal for B2B readability
          backgroundColor: "transparent",
          drawOutOfBound: false,
          shrinkToFit: true,
        };

        if (maskCanvas) {
          // If a mask canvas is provided, wordcloud2 can use it via the 'clearCanvas: false' trick
          // but we will draw the mask on our main canvas using near-transparent pixels.
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, w, h);
          // Draw inverted mask: filled with 1% opacity, except for the shape which is 0% opacity.
          ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
          ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = "destination-out";
          ctx.drawImage(maskCanvas, 0, 0, w, h);
          ctx.globalCompositeOperation = "source-over";
          
          options.clearCanvas = false;
        }

        WordCloud(canvas, options);
      };

      getMaskImage(theme).then((img) => {
        if (img) {
          // Create an offscreen canvas to scale the image
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = w;
          maskCanvas.height = h;
          const mctx = maskCanvas.getContext("2d");
          
          // Draw image centered and scaled to fit 80% of canvas
          const padding = 20;
          const scale = Math.min((w - padding*2) / img.width, (h - padding*2) / img.height) * 0.9;
          const iw = img.width * scale;
          const ih = img.height * scale;
          const ix = (w - iw) / 2;
          const iy = (h - ih) / 2;
          
          mctx.drawImage(img, ix, iy, iw, ih);
          renderCloud(maskCanvas);
        } else {
          renderCloud(null);
        }
      });
    });
  }, [words, theme]);

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
