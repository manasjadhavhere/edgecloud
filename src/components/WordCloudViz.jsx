import { useEffect, useRef, useCallback, useState } from "react";
import { getMaskCanvas } from "../utils/masks";
import { Maximize, Minimize, StopCircle } from "lucide-react";

/**
 * Build a wordcloud2 collision mask from an image.
 * White pixels (R > 128) → transparent (words go here)
 * Dark  pixels            → opaque red  (words blocked)
 */
function buildMaskCanvas(img, w, h) {
  const off    = document.createElement("canvas");
  off.width    = w; off.height = h;
  const ctx    = off.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < id.data.length; i += 4) {
    if (id.data[i] > 128) {
      id.data[i + 3] = 0;
    } else {
      id.data[i]=255; id.data[i+1]=0; id.data[i+2]=0; id.data[i+3]=255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return off;
}

/** Fisher-Yates shuffle (returns new shuffled array) */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const THEME_COLORS = {
  iconic:   ["#FFD700", "#F5C518", "#DAA520", "#FFC200", "#FFE566", "#B8860B", "#FFF3B0", "#C5A000", "#FFDF00", "#E8B800"],
  tech:     ["#003D73", "#00529B", "#0277BD", "#0288D1", "#006064", "#00838F", "#1565C0", "#01579B"],
  consumer: ["#0B132C", "#D4AF37", "#131A2D", "#C5A059", "#1A2639", "#B8860B", "#8B1818", "#0A192F"],
  default:  ["#8B1818", "#00529B", "#16A34A", "#B45309", "#4338CA", "#BE123C", "#0F766E", "#0369A1"],
};

function loadImg(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = () => { console.warn("[WordCloud] failed to load:", src); resolve(null); };
    img.src = src;
  });
}

/**
 * WordCloudViz — real-time word cloud for EdgeCloud.
 *
 * For the "iconic" theme, a toggle lets the host switch between:
 *   • Trophy View  — words appear in the golden seal of the iconic brands trophy
 *   • Shape Cloud  — words fill the crown silhouette
 *
 * Words update in real-time. Switching modes restores a cached render
 * so the layout never changes just from toggling.
 */
export default function WordCloudViz({ words, forwardedRef, theme = "default", fillShape = false, onStop = null }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const htmlCloudRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cloudMode, setCloudMode]       = useState("trophy"); // "trophy" | "shape" | "full_trophy"

  // Generation counter — increment aborts any stale async draw
  const genRef = useRef(0);

  /**
   * Pre-loaded images — loaded once at mount so drawCloud never awaits images
   * (eliminates the race where gen changes while awaiting loadImg).
   */
  const imgRefs = useRef({ trophy: null, crown: null, fullTrophy: null });

  useEffect(() => {
    // Pre-load all iconic-theme images at mount
    const load = (src, key) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload  = () => { imgRefs.current[key] = img; };
      img.onerror = () => console.warn("[WordCloud] preload failed:", src);
      img.src = src;
    };
    load("/events_shape/best_iconic_brands.png", "trophy");
    load("/events_shape/crown_mask.jpg",          "crown");
    load("/events_shape/iconic_full_trophy_mask.jpg", "fullTrophy");
  }, []);

  /**
   * Per-mode render cache.
   * cacheKey = JSON.stringify(words) + "|" + isFullscreen
   */
  const cache = useRef({ trophy: null, shape: null, full_trophy: null });

  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(console.error);
    else document.exitFullscreen().catch(console.error);
  };

  // ─── Restore from cache ────────────────────────────────────────────────────
  const restoreFromCache = useCallback((entry) => {
    const canvas = canvasRef.current;
    const div    = htmlCloudRef.current;
    if (!canvas || !div) return;

    // Restore canvas pixels from the saved offscreen canvas
    canvas.width  = entry.offscreenCanvas.width;
    canvas.height = entry.offscreenCanvas.height;
    if (forwardedRef) forwardedRef.current = canvas;
    canvas.getContext("2d").drawImage(entry.offscreenCanvas, 0, 0);

    // Restore div spans
    div.style.position     = "absolute";
    div.style.left         = `${entry.divLeft}px`;
    div.style.top          = `${entry.divTop}px`;
    div.style.width        = `${entry.divW}px`;
    div.style.height       = `${entry.divH}px`;
    div.style.overflow     = entry.divOverflow     || "visible";
    div.style.borderRadius = entry.divBorderRadius || "0";
    div.style.opacity      = "0";
    div.innerHTML          = entry.innerHTML;

    // Smooth fade-in instead of fly-in animation (it's a cached restore)
    requestAnimationFrame(() => { div.style.opacity = "1"; });
  }, [forwardedRef]);

  // ─── Save current render to cache ─────────────────────────────────────────
  const saveToCache = useCallback((mode, cacheKey, divLeft, divTop, divW, divH) => {
    const canvas = canvasRef.current;
    const div    = htmlCloudRef.current;
    if (!canvas || !div) return;

    // Copy canvas pixels to an offscreen canvas so we can restore later
    const off    = document.createElement("canvas");
    off.width    = canvas.width;
    off.height   = canvas.height;
    off.getContext("2d").drawImage(canvas, 0, 0);

    cache.current[mode] = {
      cacheKey,
      offscreenCanvas: off,
      innerHTML:       div.innerHTML,
      divLeft, divTop, divW, divH,
      divOverflow:     div.style.overflow     || "visible",
      divBorderRadius: div.style.borderRadius || "0",
    };
  }, []);

  // ─── Core draw function ────────────────────────────────────────────────────
  const drawCloud = useCallback(async () => {
    if (!words || words.length === 0) return;

    const cacheKey = JSON.stringify(words) + "|" + isFullscreen;

    // ── Cache hit: same words, same fullscreen, switching mode back → restore ──
    const hit = cache.current[cloudMode];
    if (hit && hit.cacheKey === cacheKey) {
      restoreFromCache(hit);
      return;
    }

    // ── Cache miss: full re-render ────────────────────────────────────────────
    const gen       = ++genRef.current;
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    const div       = htmlCloudRef.current;
    if (!container || !canvas || !div) return;

    // Wait for layout to give real dimensions
    let w = container.clientWidth, h = container.clientHeight;
    for (let i = 0; (w === 0 || h === 0) && i < 20; i++) {
      await new Promise(r => requestAnimationFrame(r));
      if (gen !== genRef.current) return;
      w = container.clientWidth;
      h = container.clientHeight;
    }
    if (w === 0 || h === 0) return;

    const { default: WordCloud } = await import("wordcloud");
    if (gen !== genRef.current) return;

    const isIconic = theme === "iconic";
    const colors   = THEME_COLORS[theme] || THEME_COLORS.default;

    // ── NON-ICONIC THEMES ─────────────────────────────────────────────────────
    if (!isIconic) {
      canvas.width  = w;
      canvas.height = h;
      if (forwardedRef) forwardedRef.current = canvas;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);

      const mask = await getMaskCanvas(theme, w, h);
      if (gen !== genRef.current) return;
      if (mask) {
        ctx.drawImage(mask, 0, 0, w, h);
        const id = ctx.getImageData(0, 0, w, h);
        for (let i = 0; i < id.data.length; i += 4) {
          if (id.data[i] === 255 && id.data[i+1] === 255 && id.data[i+2] === 255) id.data[i+3] = 0;
        }
        ctx.putImageData(id, 0, 0);
      }

      const maxVal  = Math.max(...words.map(w => w.value), 1);
      const minFont = Math.max(10, Math.round(w / 40));
      const maxFont = Math.min(Math.round(w / 6), 140);

      await new Promise(resolve => {
        let done = false;
        const ok = () => { if (!done) { done = true; resolve(); } };
        canvas.addEventListener("wordcloudstop", ok, { once: true });
        WordCloud(canvas, {
          list:            words.map(({ text, value }) => [text, Math.round(minFont + ((value/maxVal) ** 1.1) * (maxFont - minFont))]),
          gridSize:        Math.max(6, Math.round(w / 120)),
          weightFactor:    1,
          fontFamily:      "'Segoe UI', Arial, sans-serif",
          fontWeight:      "700",
          color:           (_w, _wt, _fs, _d, theta) => colors[Math.abs(Math.floor((theta/(2*Math.PI))*colors.length)) % colors.length],
          rotateRatio:     0,
          backgroundColor: "transparent",
          clearCanvas:     false,
          drawOutOfBound:  false,
          shrinkToFit:     true,
          shuffle:         true,
        });
        setTimeout(ok, 5000);
      });
      return;
    }

    // ── ICONIC THEME — paint dark background ──────────────────────────────────
    canvas.width  = w;
    canvas.height = h;
    if (forwardedRef) forwardedRef.current = canvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#1a0000";
    ctx.fillRect(0, 0, w, h);

    div.innerHTML = "";
    div.style.opacity = "0";

    const maxVal = Math.max(...words.map(w => w.value), 1);
    let divLeft = 0, divTop = 0, divW = 0, divH = 0;

    // ── TROPHY VIEW ───────────────────────────────────────────────────────────
    if (cloudMode === "trophy") {
      // Use pre-loaded image (synchronous — no race condition)
      const trophy = imgRefs.current.trophy;

      if (trophy) {
        const tAspect = trophy.naturalWidth / trophy.naturalHeight;
        let tW, tH, tX, tY;
        if (w / h > tAspect) { tH = h; tW = h * tAspect; tX = (w - tW) / 2; tY = 0; }
        else                  { tW = w; tH = w / tAspect; tX = 0; tY = (h - tH) / 2; }
        ctx.drawImage(trophy, tX, tY, tW, tH);

        // Golden seal position
        const cX = tX + tW * 0.492;
        const cY = tY + tH * 0.344;
        const cR = tW * 0.086;

        // Render area = exactly the seal circle (diameter = 2*cR)
        const size = Math.round(cR * 2);
        divLeft = Math.round(cX - cR);
        divTop  = Math.round(cY - cR);
        divW    = size;
        divH    = size;

        // Build a circular mask canvas: transparent inside circle, red outside
        // wordcloud2 uses this to restrict word placement strictly to the circle
        const maskOff    = document.createElement("canvas");
        maskOff.width    = size;
        maskOff.height   = size;
        const maskOffCtx = maskOff.getContext("2d");
        const maskId     = maskOffCtx.getImageData(0, 0, size, size);
        const cx = size / 2, cy = size / 2;
        for (let py = 0; py < size; py++) {
          for (let px = 0; px < size; px++) {
            const dx = px - cx, dy = py - cy;
            const idx = (py * size + px) * 4;
            if (dx * dx + dy * dy <= cx * cx) {
              // Inside circle → transparent (wordcloud2 places words here)
              maskId.data[idx] = 0; maskId.data[idx+1] = 0;
              maskId.data[idx+2] = 0; maskId.data[idx+3] = 0;
            } else {
              // Outside circle → opaque red (wordcloud2 avoids this)
              maskId.data[idx] = 255; maskId.data[idx+1] = 0;
              maskId.data[idx+2] = 0; maskId.data[idx+3] = 255;
            }
          }
        }
        maskOffCtx.putImageData(maskId, 0, 0);

        div.style.position = "absolute";
        div.style.left   = `${divLeft}px`;
        div.style.top    = `${divTop}px`;
        div.style.width  = `${divW}px`;
        div.style.height = `${divH}px`;
        div.style.overflow = "hidden";
        div.style.borderRadius = "50%";

        const minFont = Math.max(5, isFullscreen ? 8 : 5);
        const maxFont = Math.min(isFullscreen ? 80 : 45, Math.round(size / 4));

        await new Promise(resolve => {
          let done = false;
          const ok = () => { if (!done) { done = true; resolve(); } };
          div.addEventListener("wordcloudstop", ok, { once: true });
          WordCloud([maskOff, div], {
            list:            words.map(({ text, value }) => [text, value]),
            gridSize:        Math.max(4, Math.round(size / 60)),
            weightFactor:    (s) => {
              return minFont + Math.pow(Math.max(0.1, s / maxVal), 1.1) * (maxFont - minFont);
            },
            fontFamily:      "Impact, 'Arial Black', sans-serif",
            color:           (_w, _wt, _fs, _d, theta) => THEME_COLORS.iconic[Math.abs(Math.floor((theta/(2*Math.PI))*THEME_COLORS.iconic.length)) % THEME_COLORS.iconic.length],
            rotateRatio:     0,
            backgroundColor: "transparent",
            drawOutOfBound:  false,
            shrinkToFit:     true,
            clearCanvas:     false,
          });
          setTimeout(ok, 4000);
        });

        if (gen !== genRef.current) return;

        // ⚠️ wordcloud2 forces position:relative — reset back to absolute
        div.style.position   = "absolute";
        div.style.left       = `${divLeft}px`;
        div.style.top        = `${divTop}px`;
        div.style.width      = `${divW}px`;
        div.style.height     = `${divH}px`;
        div.style.overflow   = "hidden";
        div.style.borderRadius = "50%";
        div.style.opacity    = "1";
      }
    }

    // ── SHAPE CLOUD (crown) ───────────────────────────────────────────────────
    if (cloudMode === "shape") {
      // Use pre-loaded image (synchronous — no race condition)
      const maskImg = imgRefs.current.crown;
      if (!maskImg) return;

      const PAD    = 20;
      const availW = w - PAD * 2, availH = h - PAD * 2;
      const aspect = maskImg.naturalWidth / maskImg.naturalHeight;
      let sw = availW, sh = availW / aspect;
      if (sh > availH) { sh = availH; sw = sh * aspect; }
      sw = Math.round(sw); sh = Math.round(sh);
      const sl = Math.round(PAD + (availW - sw) / 2);
      const st = Math.round(PAD + (availH - sh) / 2);
      divLeft = sl; divTop = st; divW = sw; divH = sh;

      const off = buildMaskCanvas(maskImg, sw, sh);

      div.style.position     = "absolute";
      div.style.left         = `${sl}px`;
      div.style.top          = `${st}px`;
      div.style.width        = `${sw}px`;
      div.style.height       = `${sh}px`;
      div.style.overflow     = "visible";
      div.style.borderRadius = "0";

      const minFont = Math.max(4, isFullscreen ? 6 : 4);
      const maxFont = Math.min(isFullscreen ? 90 : 60, Math.round(sw / 6));

      await new Promise(resolve => {
        let done = false;
        const ok = () => { if (!done) { done = true; resolve(); } };
        div.addEventListener("wordcloudstop", ok, { once: true });
        WordCloud([off, div], {
          list:            words.map(({ text, value }) => [text, value]),
          gridSize:        Math.max(3, Math.round(sw / 100)),
          weightFactor:    (size) => {
            return minFont + Math.pow(Math.max(0.1, size / maxVal), 1.2) * (maxFont - minFont);
          },
          fontFamily:      "Impact, 'Arial Black', sans-serif",
          color:           (_w, _wt, _fs, _d, theta) => THEME_COLORS.iconic[Math.abs(Math.floor((theta/(2*Math.PI))*THEME_COLORS.iconic.length)) % THEME_COLORS.iconic.length],
          rotateRatio:     0.4,      // allow some vertical words to fill the tall crown spikes
          rotationSteps:   2,
          backgroundColor: "transparent",
          drawOutOfBound:  false,
          shrinkToFit:     true,
          clearCanvas:     false,
        });
        setTimeout(ok, 4000);
      });

      if (gen !== genRef.current) return;

      div.style.position     = "absolute";
      div.style.left         = `${sl}px`;
      div.style.top          = `${st}px`;
      div.style.width        = `${sw}px`;
      div.style.height       = `${sh}px`;
      div.style.overflow     = "visible";
      div.style.borderRadius = "0";
      div.style.opacity      = "1";
    }

    // ── FULL TROPHY (entire trophy silhouette filled with words) ──────────────
    if (cloudMode === "full_trophy") {
      // Use pre-loaded image (synchronous — no race condition)
      const maskImg = imgRefs.current.fullTrophy;
      if (!maskImg) return;

      const PAD    = 10;
      const availW = w - PAD * 2, availH = h - PAD * 2;
      const aspect = maskImg.naturalWidth / maskImg.naturalHeight;
      let sw = availW, sh = availW / aspect;
      if (sh > availH) { sh = availH; sw = sh * aspect; }
      sw = Math.round(sw); sh = Math.round(sh);
      const sl = Math.round(PAD + (availW - sw) / 2);
      const st = Math.round(PAD + (availH - sh) / 2);
      divLeft = sl; divTop = st; divW = sw; divH = sh;

      // ── Draw the trophy SILHOUETTE OUTLINE as a ghost on the canvas ──────────
      // White areas of the mask = inside trophy → tint them golden and dim
      // This shows the trophy outline immediately; words will fill it in
      const silhouetteOff    = document.createElement("canvas");
      silhouetteOff.width    = sw;
      silhouetteOff.height   = sh;
      const sCtx             = silhouetteOff.getContext("2d");
      sCtx.drawImage(maskImg, 0, 0, sw, sh);
      const sId = sCtx.getImageData(0, 0, sw, sh);
      for (let i = 0; i < sId.data.length; i += 4) {
        if (sId.data[i] > 128) {
          // Inside trophy → golden glow outline
          sId.data[i]   = 180; // R
          sId.data[i+1] = 120; // G
          sId.data[i+2] = 0;   // B
          sId.data[i+3] = 55;  // alpha: very dim ghost
        } else {
          sId.data[i+3] = 0; // outside → fully transparent
        }
      }
      sCtx.putImageData(sId, 0, 0);
      // Draw the silhouette ghost onto the main canvas
      ctx.drawImage(silhouetteOff, sl, st, sw, sh);

      const off = buildMaskCanvas(maskImg, sw, sh);

      div.style.position     = "absolute";
      div.style.left         = `${sl}px`;
      div.style.top          = `${st}px`;
      div.style.width        = `${sw}px`;
      div.style.height       = `${sh}px`;
      div.style.overflow     = "visible";
      div.style.borderRadius = "0";

      const minFont = Math.max(7,  isFullscreen ? 10 : 7);
      const maxFont = Math.min(isFullscreen ? 110 : 70, Math.round(sw / 5));

      await new Promise(resolve => {
        let done = false;
        const ok = () => { if (!done) { done = true; resolve(); } };
        div.addEventListener("wordcloudstop", ok, { once: true });
        WordCloud([off, div], {
          list:            words.map(({ text, value }) => [text, value]),
          gridSize:        Math.max(4, Math.round(sw / 80)),
          weightFactor:    (s) => {
            const mn = minFont, mx = maxFont;
            return mn + Math.pow(Math.max(0.1, s / maxVal), 1.15) * (mx - mn);
          },
          fontFamily:      "Impact, 'Arial Black', sans-serif",
          color:           (_w, _wt, _fs, _d, theta) => THEME_COLORS.iconic[Math.abs(Math.floor((theta/(2*Math.PI))*THEME_COLORS.iconic.length)) % THEME_COLORS.iconic.length],
          rotateRatio:     0,
          rotationSteps:   1,
          backgroundColor: "transparent",
          drawOutOfBound:  false,
          shrinkToFit:     true,
          clearCanvas:     false,
        });
        setTimeout(ok, 6000);
      });

      if (gen !== genRef.current) return;

      div.style.position     = "absolute";
      div.style.left         = `${sl}px`;
      div.style.top          = `${st}px`;
      div.style.width        = `${sw}px`;
      div.style.height       = `${sh}px`;
      div.style.overflow     = "visible";
      div.style.borderRadius = "0";
      div.style.opacity      = "1";
    }

    if (gen !== genRef.current) return;

    // ── Save this render to cache ─────────────────────────────────────────────
    saveToCache(cloudMode, cacheKey, divLeft, divTop, divW, divH);

    // ── Animation ─────────────────────────────────────────────────────────────
    await new Promise(r => requestAnimationFrame(r));
    if (gen !== genRef.current) return;

    const children = Array.from(div.children);
    if (children.length === 0) return;

    if (cloudMode === "full_trophy") {
      // ── Piece-by-piece random pop-in: shuffle → staggered scale+fade ────────
      const shuffled = shuffle(children);
      // Start all invisible
      shuffled.forEach(s => { s.style.opacity = "0"; s.style.transition = "none"; });
      shuffled.forEach((span, i) => {
        const baseTransform = (span.style.transform || "").replace(/scale\([^)]*\)/g, "").trim();
        const tilt = Math.random() > 0.5 ? 12 : -12;
        span.animate(
          [
            { opacity: 0, transform: `${baseTransform} scale(0) rotate(${tilt}deg)` },
            { opacity: 1, transform: `${baseTransform} scale(1.12) rotate(0deg)`, offset: 0.65 },
            { opacity: 1, transform: `${baseTransform} scale(1)    rotate(0deg)` },
          ],
          {
            duration: 420,
            easing:   "cubic-bezier(0.34,1.56,0.64,1)",
            delay:    i * 75,
            fill:     "both",
          }
        );
        // Guarantee final resting state after animation
        setTimeout(() => {
          span.style.opacity   = "1";
          span.style.transform = baseTransform;
        }, i * 75 + 480);
      });
    } else {
      // ── Trophy seal / Shape cloud: fly-in from edges ────────────────────────
      const cRect = container.getBoundingClientRect();
      const dRect = div.getBoundingClientRect();
      try {
        children.forEach(s => { s.style.opacity = "0"; });
        children.forEach((span, i) => {
          const cx = span.offsetLeft + span.offsetWidth  / 2;
          const cy = span.offsetTop  + span.offsetHeight / 2;
          const ax = (dRect.left - cRect.left) + cx;
          const ay = (dRect.top  - cRect.top)  + cy;
          let dx = ax - w / 2, dy = ay - h / 2;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          dx = (dx / dist) * (dist + 400);
          dy = (dy / dist) * (dist + 400);
          const bt = span.style.transform || "";
          span.style.opacity = "1";
          span.animate(
            [{ opacity:0, transform:`translate(${dx}px,${dy}px) ${bt}` }, { opacity:1, transform:`translate(0,0) ${bt}` }],
            { duration:1400, easing:"cubic-bezier(0.16,1,0.3,1)", delay: i * 20, fill:"backwards" }
          );
        });
      } catch (e) {
        children.forEach(s => { s.style.opacity = "1"; });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(words), theme, cloudMode, isFullscreen, fillShape, restoreFromCache, saveToCache]);

  // ── Effect: fire on words change or mode switch ───────────────────────────
  useEffect(() => {
    if (!words || words.length === 0) return;
    const t = setTimeout(() => drawCloud(), 400);
    return () => clearTimeout(t);
  }, [drawCloud]);

  // ── When words change, invalidate all mode caches ────────────────────────
  useEffect(() => {
    cache.current.trophy      = null;
    cache.current.shape       = null;
    cache.current.full_trophy = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(words)]);

  const isIconic = theme === "iconic";

  return (
    <div
      ref={containerRef}
      className="wordcloud-wrapper"
      style={{
        position:       "relative",
        width:          "100%",
        aspectRatio:    isIconic && !isFullscreen ? "16 / 9" : (isFullscreen ? undefined : "1000 / 600"),
        height:         isFullscreen ? "100vh" : undefined,
        background:     isIconic ? "#1a0000" : "#fff",
        margin:         "0 auto",
        borderRadius:   isIconic && !isFullscreen ? "8px" : undefined,
        overflow:       "hidden",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* wordcloud2 places span elements here for iconic modes */}
      <div
        ref={htmlCloudRef}
        style={{ position: "absolute", pointerEvents: "none", zIndex: 5, transition: "opacity 0.35s ease-in-out" }}
      />

      {/* Trophy / Shape toggle — iconic theme only */}
      {isIconic && (
        <div style={{
          position:       "absolute",
          top:            "0.75rem",
          left:           "50%",
          transform:      "translateX(-50%)",
          display:        "flex",
          background:     "rgba(0,0,0,0.6)",
          borderRadius:   "24px",
          padding:        "4px",
          gap:            "2px",
          backdropFilter: "blur(6px)",
          border:         "1px solid rgba(255,215,0,0.3)",
          zIndex:         20,
        }}>
          {[
            { key: "trophy",      label: "🏆 Trophy View" },
            { key: "shape",       label: "👑 Shape Cloud" },
            { key: "full_trophy", label: "🌟 Full Trophy" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCloudMode(key)}
              style={{
                background:   cloudMode === key ? "#FFD700" : "transparent",
                color:        cloudMode === key ? "#1a0000" : "rgba(255,215,0,0.75)",
                border:       "none",
                borderRadius: "18px",
                padding:      "5px 16px",
                cursor:       "pointer",
                fontSize:     "0.78rem",
                fontWeight:   cloudMode === key ? 700 : 500,
                transition:   "all 0.22s ease",
                whiteSpace:   "nowrap",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen / Stop controls */}
      <div style={{ position: "absolute", bottom: "1rem", right: "1rem", zIndex: 20, display: "flex", gap: "0.5rem" }}>
        {isFullscreen && onStop && (
          <button
            onClick={e => { e.stopPropagation(); onStop(); }}
            style={{
              background: "rgba(220,38,38,0.85)", color: "#fff", border: "none",
              borderRadius: "4px", padding: "8px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              fontWeight: 600, fontSize: "0.85rem", transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(220,38,38,0.85)"}
          >
            <StopCircle size={16} /> Stop Game
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          style={{
            background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
            borderRadius: "4px", padding: "8px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.85)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.5)"}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </div>
  );
}
