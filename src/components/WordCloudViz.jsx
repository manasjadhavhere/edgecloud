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
  // "trophy" = existing golden-circle word cloud, "shape" = full wax-seal shape cloud
  const [cloudMode, setCloudMode] = useState("trophy");

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

    const circleCX = tX + tW * 0.492;
    const circleCY = tY + tH * 0.344;
    const circleR  = tW * 0.086;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#1a0000";
    ctx.fillRect(0, 0, w, h);
    if (trophyImg) ctx.drawImage(trophyImg, tX, tY, tW, tH);

    let processedWords = [...words];
    // Always seed with brand words in shape mode; only when fillShape for trophy mode
    if ((fillShape || cloudMode === "shape") && processedWords.length > 0) {
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

    // ── SHAPE CLOUD MODE ────────────────────────────────────────
    if (cloudMode === "shape") {
      const div = htmlCloudRef.current;
      if (!div) return;

      // The wax seal in the trophy image occupies approx:
      //   horizontal: 22%–78% of tW  (56% wide)
      //   vertical:   2%–68% of tH   (66% tall, includes ribbon)
      // Position the div exactly over this area so wordcloud2's
      // center matches the mask's center.
      const sealLeft   = tX + tW * 0.21;
      const sealTop    = tY + tH * 0.02;
      const sealWidth  = tW * 0.58;
      const sealHeight = tH * 0.68;

      div.style.left   = `${sealLeft}px`;
      div.style.top    = `${sealTop}px`;
      div.style.width  = `${sealWidth}px`;
      div.style.height = `${sealHeight}px`;
      div.style.overflow = "visible";
      // Mask clips the word cloud to the seal silhouette
      // maskSize "contain" fits the seal image exactly within the div
      div.style.webkitMaskImage    = "url('/events_shape/iconic_shape_mask.jpg')";
      div.style.maskImage          = "url('/events_shape/iconic_shape_mask.jpg')";
      div.style.webkitMaskSize     = "contain";
      div.style.maskSize           = "contain";
      div.style.webkitMaskRepeat   = "no-repeat";
      div.style.maskRepeat         = "no-repeat";
      div.style.webkitMaskPosition = "center center";
      div.style.maskPosition       = "center center";
      div.style.webkitMaskMode     = "luminance";
      div.style.maskMode           = "luminance";
      div.innerHTML = "";

      const maxVal  = processedWords[0]?.value || 1;
      // Font sizes relative to the seal div width — conservative so words fit
      const minFont = Math.max(5, Math.round(sealWidth / 50));
      const maxFont = Math.min(Math.round(sealWidth / 6), 55);
      const list    = processedWords.map(({ text, value }) => [
        text, Math.round(minFont + ((value / maxVal) ** 1.1) * (maxFont - minFont)),
      ]);

      div.style.opacity = "0";

      await new Promise(resolve => {
        let done = false;
        const onDone = () => { if (done) return; done = true; resolve(); };
        div.addEventListener("wordcloudstop", onDone, { once: true });
        WordCloud(div, {
          list,
          gridSize: Math.max(4, Math.round(sealWidth / 120)),
          weightFactor: 1,
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          fontWeight: "700",
          color: (_w, _wt, _fs, _d, theta) =>
            colors[Math.abs(Math.floor((theta / (2 * Math.PI)) * colors.length)) % colors.length],
          rotateRatio: 0,
          backgroundColor: "transparent",
          drawOutOfBound: false,
          shrinkToFit: true,
          minSize: minFont,
          shuffle: true,
          shape: "circle",
        });
        setTimeout(onDone, 3000);
      });

      await new Promise(r => requestAnimationFrame(r));

      const children = Array.from(div.children);
      console.log(`[ShapeCloud] ${children.length} words in ${sealWidth.toFixed(0)}×${sealHeight.toFixed(0)}px div`);
      children.forEach(s => { s.style.opacity = "0"; });
      div.style.opacity = "1";

      if (children.length === 0) {
        console.warn("[WordCloud Shape] 0 words rendered.");
        return;
      }

      // Fly-in animation — radial swarm from outer edges
      try {
        const divRect       = div.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const cW = containerRect.width;
        const cH = containerRect.height;
        const margin = Math.max(cW, cH) * 0.75;
        const totalStagger = Math.min(2400, children.length * 50);
        const staggerStep  = children.length > 1 ? totalStagger / children.length : 0;
        const flightDur    = 1500;

        container.style.overflow = "visible";
        setTimeout(() => { container.style.overflow = "hidden"; }, totalStagger + flightDur + 300);

        children.forEach((span, i) => {
          const spanCX  = span.offsetLeft + span.offsetWidth  / 2;
          const spanCY  = span.offsetTop  + span.offsetHeight / 2;
          const absX    = (divRect.left - containerRect.left) + spanCX;
          const absY    = (divRect.top  - containerRect.top ) + spanCY;
          const centerX = cW / 2;
          const centerY = cH / 2;
          let dx = absX - centerX;
          let dy = absY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          dx = (dx / dist) * (dist + margin);
          dy = (dy / dist) * (dist + margin);
          const bt = span.style.transform || "";
          span.animate([
            { opacity: 0, transform: `translate(${dx}px, ${dy}px) ${bt}` },
            { opacity: 1, transform: `translate(0px, 0px) ${bt}` },
          ], { duration: flightDur, easing: "cubic-bezier(0.16, 1, 0.3, 1)", delay: i * staggerStep, fill: "both" });
        });
      } catch (err) {
        children.forEach(s => { s.style.opacity = "1"; });
        console.error("[WordCloud Shape] Animation error:", err);
      }
      return;
    }

    // Clear shape-cloud mask when in trophy mode
    const div0 = htmlCloudRef.current;
    if (div0) {
      div0.style.webkitMaskImage = "";
      div0.style.maskImage = "";
    }

    const useDOM = isIconic && !fillShape;
    if (useDOM) {
      const div = htmlCloudRef.current;
      if (!div) return;

      // Use a 3× larger rendering area than the thin golden ring so that
      // wordcloud2 has enough room to actually place words. The div is still
      // centred on the circle centre; CSS overflow:visible lets fly-in work.
      const renderR = circleR * 3.2;  // e.g. 82px * 3.2 = ~263px radius
      const size    = Math.round(renderR * 2);  // div side length

      div.style.left     = `${circleCX - renderR}px`;
      div.style.top      = `${circleCY - renderR}px`;
      div.style.width    = `${size}px`;
      div.style.height   = `${size}px`;
      div.style.overflow = "visible";
      div.innerHTML      = "";

      const maxVal  = processedWords[0]?.value || 1;
      // Conservative font sizes so shrinkToFit doesn't need to work too hard
      const minFont = Math.max(5, Math.round(size / 40));
      const maxFont = Math.min(Math.round(size / 7), 28);
      const list    = processedWords.map(({ text, value }) => [
        text, Math.round(minFont + ((value / maxVal) ** 1.1) * (maxFont - minFont)),
      ]);

      console.log(`[TrophyCloud] size=${size}px minFont=${minFont} maxFont=${maxFont} words=${processedWords.length}`);

      div.style.opacity = "0";

      await new Promise((resolve) => {
        let finished = false;
        const onStopRender = () => { if (finished) return; finished = true; resolve(); };
        div.addEventListener("wordcloudstop", onStopRender, { once: true });
        WordCloud(div, {
          list,
          gridSize: Math.max(4, Math.round(size / 120)),
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
        setTimeout(onStopRender, 3000);
      });

      await new Promise(r => requestAnimationFrame(r));

      const children = Array.from(div.children);
      console.log(`[TrophyCloud] rendered ${children.length} word spans`);

      children.forEach(span => { span.style.opacity = "0"; });
      div.style.opacity = "1";

      if (children.length === 0) {
        console.warn("[TrophyCloud] 0 words rendered — check font sizes vs div size.");
        return;
      }

      try {
        const divRect       = div.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const cW = containerRect.width;
        const cH = containerRect.height;
        const margin = Math.max(cW, cH) * 0.7;
        const totalStagger = Math.min(2000, children.length * 50);
        const staggerStep  = children.length > 1 ? totalStagger / children.length : 0;
        const flightDur    = 1400;

        container.style.overflow = "visible";
        setTimeout(() => { container.style.overflow = "hidden"; }, totalStagger + flightDur + 200);

        children.forEach((span, i) => {
          const spanCX  = span.offsetLeft + span.offsetWidth  / 2;
          const spanCY  = span.offsetTop  + span.offsetHeight / 2;
          const absX    = (divRect.left - containerRect.left) + spanCX;
          const absY    = (divRect.top  - containerRect.top ) + spanCY;
          const centerX = cW / 2;
          const centerY = cH / 2;
          let dx = absX - centerX;
          let dy = absY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          dx = (dx / dist) * (dist + margin);
          dy = (dy / dist) * (dist + margin);
          const baseTransform = span.style.transform || "";
          span.animate([
            { opacity: 0, transform: `translate(${dx}px, ${dy}px) ${baseTransform}` },
            { opacity: 1, transform: `translate(0px, 0px) ${baseTransform}` },
          ], {
            duration: flightDur, easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            delay: i * staggerStep, fill: "both",
          });
        });
      } catch (err) {
        children.forEach(span => { span.style.opacity = "1"; });
        console.error("[TrophyCloud] Animation error:", err);
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
  }, [JSON.stringify(words), theme, forwardedRef, isFullscreen, fillShape, cloudMode]);

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

        {/* Mode toggle — only shown for iconic theme */}
        {isIconic && (
          <div style={{
            position: "absolute",
            top: "0.75rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            background: "rgba(0,0,0,0.55)",
            borderRadius: "20px",
            padding: "3px",
            gap: "2px",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,215,0,0.3)",
            zIndex: 10,
          }}>
            {[
              { key: "trophy", label: "🏆 Trophy View" },
              { key: "shape",  label: "✨ Shape Cloud" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCloudMode(key)}
                style={{
                  background: cloudMode === key ? "#FFD700" : "transparent",
                  color: cloudMode === key ? "#1a0000" : "rgba(255,215,0,0.7)",
                  border: "none",
                  borderRadius: "16px",
                  padding: "5px 14px",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: cloudMode === key ? 700 : 500,
                  transition: "all 0.25s ease",
                  whiteSpace: "nowrap",
                  pointerEvents: "all",
                }}
              >
                {label}
              </button>
            ))}
          </div>
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

