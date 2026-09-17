import { useEffect, useRef, useCallback, useState } from "react";
import { getMaskCanvas } from "../utils/masks";
import iconicBrandWords from "../data/iconicBrandWords.json";
import { Maximize, Minimize, StopCircle } from "lucide-react";

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
export default function WordCloudViz({ words, forwardedRef, theme = "default", fillShape = false, onStop = null }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const htmlCloudRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  const drawCloud = useCallback(async () => {
    if (!words || words.length === 0) return;
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const colors = THEME_COLORS[theme] || THEME_COLORS.default;
    const { default: WordCloud } = await import("wordcloud");

    const w = container.offsetWidth  || 1000;
    const h = container.offsetHeight || 600;
    // Only set width/height if they changed to prevent instant canvas clearing (blinking)
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    
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

      // The trophy PNG is 1456x816. Compute object-fit:contain layout.
      const trophyAspect = 1456 / 816;
      const canvasAspect = w / h;
      let tW, tH, tX, tY;
      if (canvasAspect > trophyAspect) {
        tH = h; tW = h * trophyAspect; tX = (w - tW) / 2; tY = 0;
      } else {
        tW = w; tH = w / trophyAspect; tX = 0; tY = (h - tH) / 2;
      }

      // Inner circle centre & radius — carefully measured from the actual PNG.
      // The visual circle is slightly left of perfect center, so we use 49.2%.
      // Vertically it's slightly above center (~34.4%).
      // The radius of the inner red circle inside the gold ring is ~8.6% of the image width.
      const circleCX = tX + tW * 0.492;
      const circleCY = tY + tH * 0.344;
      const circleR  = tW * 0.086;

      const div = htmlCloudRef.current;
      let size = 100;
      if (div) {
        const padding = 1;
        size = (circleR - padding) * 2;
        div.style.left = `${circleCX - circleR + padding}px`;
        div.style.top = `${circleCY - circleR + padding}px`;
        div.style.width = `${size}px`;
        div.style.height = `${size}px`;
        div.innerHTML = ""; // Clear old spans
      }

      // --- Composite onto main canvas ---
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#1a0000";
      ctx.fillRect(0, 0, w, h);
      if (trophyImg) {
        ctx.drawImage(trophyImg, tX, tY, tW, tH);
      }

      // Build word list with density fill so it reaches borders
      let processedWords = [...words];
      
      // Only fill if game is stopped (fillShape is true)
      if (fillShape && processedWords.length > 0) {
        if (processedWords.length < 30) {
          const baseValue = processedWords[0].value;
          iconicBrandWords.forEach(word => {
            processedWords.push({ text: word, value: baseValue * 0.4 });
          });
        }
        const fillerNeeded = 400 - processedWords.length;
        if (fillerNeeded > 0) {
          for (let i = 0; i < fillerNeeded; i++) {
            const si = Math.floor(Math.random() * processedWords.length);
            processedWords.push({ text: processedWords[si].text, value: processedWords[si].value * 0.08 });
          }
        }
      }

      if (div && processedWords.length > 0) {
        const maxVal  = processedWords[0]?.value || 1;
        const minFont = Math.max(4, Math.round(size / 60));
        const maxFont = Math.min(Math.round(size / 3.5), 160);
        const list    = processedWords.map(({ text, value }) => [
          text,
          Math.round(minFont + ((value / maxVal) ** 1.1) * (maxFont - minFont)),
        ]);

        await new Promise((resolve) => {
          let finished = false;
          const onStopRender = () => {
            if (finished) return;
            finished = true;
            resolve();
          };
          div.addEventListener("wordcloudstop", onStopRender, { once: true });
          
          WordCloud(div, {
            list,
            gridSize:        Math.max(2, Math.round(size / 300)),
            weightFactor:    1,
            fontFamily:      "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
            fontWeight:      "700",
            color:           (_w, _wt, _fs, _d, theta) => {
              const idx = Math.abs(Math.floor((theta / (2 * Math.PI)) * colors.length)) % colors.length;
              return colors[idx];
            },
            rotateRatio:     0,
            backgroundColor: "transparent",
            drawOutOfBound:  false,
            shrinkToFit:     true,
            minSize:         minFont,
            shuffle:         true,
            shape:           "circle",
          });
          
          setTimeout(onStopRender, 2000); // Safety fallback
        });

        // Apply slide animations based on position
        const children = Array.from(div.children);
        const centerX = size / 2;
        children.forEach((span, i) => {
          const spanCenter = span.offsetLeft + span.offsetWidth / 2;
          span.classList.add(spanCenter < centerX ? "word-slide-left" : "word-slide-right");
          span.style.animationDelay = `${i * 30}ms`; // staggered effect
        });
      }

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
    
    // Only fill if game is stopped (fillShape is true)
    if (fillShape && processedWords.length > 0) {
      // If responses are sparse, seed the cloud with predefined iconic words
      if (processedWords.length < 30) {
        const baseValue = processedWords[0].value;
        iconicBrandWords.forEach(word => {
          processedWords.push({ text: word, value: baseValue * 0.4 });
        });
      }

      const fillerNeeded = 350 - processedWords.length;
      if (fillerNeeded > 0) {
        for (let i = 0; i < fillerNeeded; i++) {
          const si = Math.floor(Math.random() * processedWords.length);
          processedWords.push({ text: processedWords[si].text, value: processedWords[si].value * 0.1 });
        }
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
  }, [JSON.stringify(words), theme, forwardedRef, isFullscreen]);

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
        aspectRatio:  isIconic && !isFullscreen ? "16 / 9" : (isFullscreen ? undefined : "1000 / 600"),
        height:       isFullscreen ? "100vh" : undefined,
        background:   isIconic ? "#1a0000" : "#fff",
        margin:       "0 auto",
        borderRadius: isIconic && !isFullscreen ? "8px" : undefined,
        overflow:     "hidden",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes slideInLeftIconic {
          from { opacity: 0; margin-left: -40px; }
          to { opacity: 1; margin-left: 0; }
        }
        @keyframes slideInRightIconic {
          from { opacity: 0; margin-left: 40px; }
          to { opacity: 1; margin-left: 0; }
        }
        .word-slide-left {
          animation: slideInLeftIconic 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .word-slide-right {
          animation: slideInRightIconic 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>

      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      
      {isIconic && (
        <div 
          ref={htmlCloudRef}
          style={{
            position: "absolute",
            pointerEvents: "none"
          }}
        />
      )}
      
      <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", gap: "0.5rem" }}>
        {isFullscreen && onStop && (
          <button 
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.error(err));
              }
              onStop();
            }}
            style={{
              background: "#DC2626",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
              fontSize: "0.85rem",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#B91C1C"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#DC2626"}
          >
            <StopCircle size={16} /> Stop Game
          </button>
        )}

        <button 
          onClick={toggleFullscreen}
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.8)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.5)"}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </div>
  );
}

