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
    img.onerror = (e) => reject(e);
    img.src = src;
    if (img.complete) {
      resolve(img);
    }
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

    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width) || 800;
    const h = Math.floor(rect.height) || 600;

    canvas.width  = w;
    canvas.height = h;
    if (forwardedRef) forwardedRef.current = canvas;
    const ctx = canvas.getContext("2d");
    const isIconic = theme === "iconic";

    // ── NON-ICONIC THEMES ────────────────────────────────────────
    if (theme !== "iconic") {
      ctx.clearRect(0, 0, w, h);

      if (fillShape) {
        const maskCanvas = await getMaskCanvas(theme, w, h);
        if (maskCanvas) {
          ctx.drawImage(maskCanvas, 0, 0, w, h);
          return;
        }
      }

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      
      const maskCanvas = await getMaskCanvas(theme, w, h);
      if (maskCanvas) {
        ctx.drawImage(maskCanvas, 0, 0);
      }

      const maxVal  = words[0]?.value || 1;
      const minFont = Math.max(4, Math.round(w / 60));
      const maxFont = Math.min(Math.round(w / 3.5), 160);
      const list    = words.map(({ text, value }) => [
        text, Math.round(minFont + ((value / maxVal) ** 1.1) * (maxFont - minFont)),
      ]);

      await new Promise((resolve) => {
        let finished = false;
        const onStopRender = () => { if (finished) return; finished = true; resolve(); };
        canvas.addEventListener("wordcloudstop", onStopRender, { once: true });
        
        WordCloud(canvas, {
          list,
          gridSize:        Math.max(4, Math.round(w / 200)),
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
          minSize:         minFont,
          shuffle:         true,
        });
        setTimeout(onStopRender, 500);
      });
      return;
    }

    // ── ICONIC THEME ───────────────────────────────────────────
    let trophyImg = null;
    try { trophyImg = await loadImage("/events_shape/best_iconic_brands.png"); } 
    catch (e) { console.warn("Trophy image failed to load", e); }

    const trophyAspect = 1456 / 816;
    const canvasAspect = w / h;
    let tW, tH, tX, tY;
    if (canvasAspect > trophyAspect) {
      tH = h; tW = h * trophyAspect; tX = (w - tW) / 2; tY = 0;
    } else {
      tW = w; tH = w / trophyAspect; tX = 0; tY = (h - tH) / 2;
    }

    const useDOM = isIconic && !fillShape;
    const circleCX = tX + tW * 0.492;
    const circleCY = tY + tH * 0.344;
    const circleR  = tW * 0.086;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#1a0000";
    ctx.fillRect(0, 0, w, h);
    if (trophyImg) ctx.drawImage(trophyImg, tX, tY, tW, tH);

    let processedWords = [...words];
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

    if (processedWords.length === 0) return;

    if (useDOM) {
      const div = htmlCloudRef.current;
      if (!div) return;
      const padding = 1;
      const size = (circleR - padding) * 2;
      div.style.left = `${circleCX - circleR + padding}px`;
      div.style.top = `${circleCY - circleR + padding}px`;
      div.style.width = `${size}px`;
      div.style.height = `${size}px`;
      div.innerHTML = "";

      const maxVal  = processedWords[0]?.value || 1;
      const minFont = Math.max(4, Math.round(size / 60));
      const maxFont = Math.min(Math.round(size / 3.5), 160);
      const list    = processedWords.map(({ text, value }) => [
        text, Math.round(minFont + ((value / maxVal) ** 1.1) * (maxFont - minFont)),
      ]);

      // Render wordcloud hidden first so we can read final positions
      div.style.visibility = "hidden";
      div.style.opacity = "1";

      await new Promise((resolve) => {
        let finished = false;
        const onStopRender = () => { if (finished) return; finished = true; resolve(); };
        div.addEventListener("wordcloudstop", onStopRender, { once: true });
        WordCloud(div, {
          list,
          gridSize: Math.max(2, Math.round(size / 300)),
          weightFactor: 1,
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          fontWeight: "700",
          color: (_w, _wt, _fs, _d, theta) => colors[Math.abs(Math.floor((theta / (2 * Math.PI)) * colors.length)) % colors.length],
          rotateRatio: 0,
          backgroundColor: "transparent",
          drawOutOfBound: false,
          shrinkToFit: true,
          minSize: minFont,
          shuffle: true,
          shape: "circle",
        });
        setTimeout(onStopRender, 700);
      });

      // Make visible — animation starts from here
      div.style.visibility = "visible";

      try {
        const children = Array.from(div.children);
        if (children.length === 0) return;

        // The div is positioned at the circle location inside the container.
        // We need the offset of the div relative to the container so we can
        // compute how far each word must travel from an off-screen start.
        const divRect = div.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Half-dimensions of the outer container — used to pick launch points
        // well outside the visible area
        const cW = containerRect.width;
        const cH = containerRect.height;
        // Extra padding so words start truly outside the edges
        const margin = Math.max(cW, cH) * 0.65;

        // Stagger timing: spread words over ~2.4 s total
        const totalStagger = Math.min(2400, children.length * 60);
        const staggerStep  = children.length > 1 ? totalStagger / children.length : 0;
        const flightDur    = 1600; // ms each word takes to fly to destination

        // Temporarily allow words to be visible outside the container during flight
        const containerEl = container;
        containerEl.style.overflow = "visible";
        // Restore overflow after the last word finishes its animation
        const totalAnimTime = totalStagger + flightDur + 100;
        setTimeout(() => { containerEl.style.overflow = "hidden"; }, totalAnimTime);

        children.forEach((span, i) => {
          // Span's center relative to the div
          const spanCX = span.offsetLeft + span.offsetWidth  / 2;
          const spanCY = span.offsetTop  + span.offsetHeight / 2;

          // Span's center relative to the outer container
          const absX = (divRect.left - containerRect.left) + spanCX;
          const absY = (divRect.top  - containerRect.top ) + spanCY;

          // Direction vector from container center to span
          const containerCX = cW / 2;
          const containerCY = cH / 2;
          let dx = absX - containerCX;
          let dy = absY - containerCY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          // Normalise and scale to margin so the start point is outside
          dx = (dx / dist) * (dist + margin);
          dy = (dy / dist) * (dist + margin);

          // translateX/Y that moves the span from its final position back to
          // the launch point (we animate from launch → final = translate(0,0))
          const baseTransform = span.style.transform || "";
          const startTranslate = `translate(${dx}px, ${dy}px)`;

          span.animate([
            { opacity: 0, transform: `${startTranslate} ${baseTransform}` },
            { opacity: 1, transform: `translate(0px, 0px) ${baseTransform}` }
          ], {
            duration: flightDur,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            delay: i * staggerStep,
            fill: 'both'
          });
        });
      } catch (err) {
        console.error("Animation error", err);
      }
    } else {
      if (htmlCloudRef.current) htmlCloudRef.current.innerHTML = "";

      const offDim = Math.round(circleR * 2) * 2;
      const off    = document.createElement("canvas");
      off.width    = offDim;
      off.height   = offDim;
      const offCtx = off.getContext("2d");

      offCtx.fillStyle = "#fff";
      offCtx.fillRect(0, 0, offDim, offDim);
      offCtx.globalCompositeOperation = "destination-out";
      offCtx.beginPath();
      offCtx.arc(offDim / 2, offDim / 2, (offDim / 2) - 1, 0, Math.PI * 2);
      offCtx.fill();
      offCtx.globalCompositeOperation = "source-over";

      const maxVal  = processedWords[0]?.value || 1;
      const minFont = Math.max(4, Math.round(offDim / 60));
      const maxFont = Math.min(Math.round(offDim / 3.5), 160);
      const list    = processedWords.map(({ text, value }) => [
        text, Math.round(minFont + ((value / maxVal) ** 1.1) * (maxFont - minFont)),
      ]);

      await new Promise((resolve) => {
        let finished = false;
        const onStopRender = () => { if (finished) return; finished = true; resolve(); };
        off.addEventListener("wordcloudstop", onStopRender, { once: true });
        WordCloud(off, {
          list,
          gridSize: Math.max(2, Math.round(offDim / 300)),
          weightFactor: 1,
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          fontWeight: "700",
          color: (_w, _wt, _fs, _d, theta) => colors[Math.abs(Math.floor((theta / (2 * Math.PI)) * colors.length)) % colors.length],
          rotateRatio: 0,
          backgroundColor: "transparent",
          clearCanvas: false,
          drawOutOfBound: false,
          shrinkToFit: true,
          minSize: minFont,
          shuffle: true,
          shape: "circle",
        });
        setTimeout(onStopRender, 1200); 
      });

      const imgData = offCtx.getImageData(0, 0, offDim, offDim);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 255 && data[i+1] === 255 && data[i+2] === 255) data[i+3] = 0; 
      }
      offCtx.putImageData(imgData, 0, 0);

      ctx.drawImage(off, circleCX - circleR, circleCY - circleR, circleR * 2, circleR * 2);
    }
  }, [JSON.stringify(words), theme, forwardedRef, isFullscreen, fillShape]);

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
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        <div ref={htmlCloudRef} style={{ position: "absolute", pointerEvents: "none" }} />
        
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

