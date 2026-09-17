// src/components/WordCloudViz.jsx
import { useEffect, useRef, useCallback } from "react";
import { getMaskCanvas } from "../utils/masks";

const THEME_COLORS = {
  // Golden & black — perfect contrast for the red trophy
  iconic:   ["#FFD700", "#F5C518", "#DAA520", "#FFC200", "#FFE566", "#B8860B", "#FFF3B0", "#C5A000", "#FFDF00", "#E8B800"],
  tech:     ["#003D73", "#00529B", "#0277BD", "#0288D1", "#006064", "#00838F", "#1565C0", "#01579B", "#0097A7", "#004D87"],
  consumer: ["#0B132C", "#D4AF37", "#131A2D", "#C5A059", "#1A2639", "#B8860B", "#8B1818", "#0A192F", "#F9E596", "#040B18"],
  default:  ["#8B1818", "#00529B", "#16A34A", "#B45309", "#4338CA", "#BE123C", "#0F766E", "#0369A1"],
};

/** Load an image and return HTMLImageElement */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * For the iconic theme, the word cloud is rendered into the inner circle of
 * the trophy image. The trophy PNG is composited on a dark background, and
 * the word cloud (golden palette) is drawn clipped to the inner golden circle.
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

    const w = container.offsetWidth  || 1000;
    const h = container.offsetHeight || 600;
    canvas.width  = w;
    canvas.height = h;
    if (forwardedRef) forwardedRef.current = canvas;

    const ctx = canvas.getContext("2d");

    // ── ICONIC THEME: Trophy image + circular word cloud ──────────────────────
    if (theme === "iconic") {
      // Load trophy image
      let trophyImg = null;
      try {
        trophyImg = await loadImage("/events_shape/best_iconic_brands.png");
      } catch (e) {
        console.warn("Trophy image failed to load", e);
      }

      // The trophy PNG is 1456x816 (16:9 approx). Compute object-fit:contain layout.
      const trophyAspect = 1456 / 816;
      const canvasAspect = w / h;
      let tW, tH, tX, tY;
      if (canvasAspect > trophyAspect) {
        tH = h; tW = h * trophyAspect; tX = (w - tW) / 2; tY = 0;
      } else {
        tW = w; tH = w / trophyAspect; tX = 0; tY = (h - tH) / 2;
      }

      // Inner circle centre & radius — measured from the actual PNG proportions.
      // Centre is at ~50% x, ~34.5% y; radius ~21% of width.
      const circleCX = tX + tW * 0.500;
      const circleCY = tY + tH * 0.345;
      const circleR  = tW * 0.208;

      // --- Offscreen canvas: render word cloud clipped to circle ---
      const offDim = Math.round(circleR * 2) * 2; // 2× for sharpness
      const off    = document.createElement("canvas");
      off.width    = offDim;
      off.height   = offDim;
      const offCtx = off.getContext("2d");

      // Occupied mask: paint white then punch out circle
      offCtx.fillStyle = "#fff";
      offCtx.fillRect(0, 0, offDim, offDim);
      offCtx.globalCompositeOperation = "destination-out";
      offCtx.beginPath();
      offCtx.arc(offDim / 2, offDim / 2, offDim / 2, 0, Math.PI * 2);
      offCtx.fill();
      offCtx.globalCompositeOperation = "source-over";

      // Build word list with density fill
      let processedWords = [...words];
      if (fillShape && processedWords.length < 350 && processedWords.length > 0) {
        const fillerNeeded = 350 - processedWords.length;
        for (let i = 0; i < fillerNeeded; i++) {
          const si = Math.floor(Math.random() * processedWords.length);
          processedWords.push({ text: processedWords[si].text, value: processedWords[si].value * 0.1 });
        }
      }

      const maxVal  = processedWords[0]?.value || 1;
      const minFont = 4;
      const maxFont = Math.min(Math.round(offDim / 4), 120);
      const list    = processedWords.map(({ text, value }) => [
        text,
        Math.round(minFont + ((value / maxVal) ** 1.2) * (maxFont - minFont)),
      ]);

      await new Promise((resolve) => {
        WordCloud(off, {
          list,
          gridSize:        Math.max(2, Math.round(2 * offDim / 800)),
          weightFactor:    1,
          fontFamily:      "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          fontWeight:      "700",
          color:           (_w, _wt, _fs, _d, theta) => {
            const idx = Math.abs(Math.floor((theta / (2 * Math.PI)) * colors.length)) % colors.length;
            return colors[idx];
          },
          rotateRatio:     0,
          backgroundColor: "transparent",
          clearCanvas:     false,
          drawOutOfBound:  false,
          shrinkToFit:     true,
          minSize:         3,
          shuffle:         true,
          shape:           "circle",
        });
        setTimeout(resolve, 500);
      });

      // --- Composite onto main canvas ---
      ctx.clearRect(0, 0, w, h);

      // Dark red background matching the event mood
      ctx.fillStyle = "#1a0000";
      ctx.fillRect(0, 0, w, h);

      // Trophy image (object-fit:contain)
      if (trophyImg) ctx.drawImage(trophyImg, tX, tY, tW, tH);

      // Clip to inner circle and paint the word cloud
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleCX, circleCY, circleR - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(off, circleCX - circleR, circleCY - circleR, circleR * 2, circleR * 2);
      ctx.restore();

      // Thin golden ring for polish
      ctx.save();
      ctx.strokeStyle = "#C5A059";
      ctx.lineWidth   = Math.max(2, circleR * 0.022);
      ctx.beginPath();
      ctx.arc(circleCX, circleCY, circleR - 1, 0, Math.PI * 2);
      ctx.stroke();
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
        const idx = Math.abs(Math.floor((theta / (2 * Math.PI)) * colors.length)) % colors.length;
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
        background:   isIconic ? "#1a0000" : "#fff",
        margin:       "0 auto",
        borderRadius: isIconic ? "8px" : undefined,
        overflow:     "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

