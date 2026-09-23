import { useEffect, useRef, useCallback, useState } from "react";
import { getMaskCanvas } from "../utils/masks";
import { Maximize, Minimize, StopCircle } from "lucide-react";
import React from "react";

// ── ImageSideSparkles for Iconic Mode ───────────────────────────────────────
const ImageSideSparkles = () => {
  // Left Zone: 0 to 1000 out of 4200 (approx 23.8%)
  const leftSparkles = React.useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    id: `l-${i}`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${Math.random() * 4 + 2}s`,
    size: `${Math.random() * 20 + 10}px`,
    rotation: `${Math.random() * 90}deg`
  })), []);

  // Right Zone: 3100 to 4200 out of 4200 (approx 26.2%)
  const rightSparkles = React.useMemo(() => Array.from({ length: 90 }).map((_, i) => ({
    id: `r-${i}`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${Math.random() * 4 + 2}s`,
    size: `${Math.random() * 20 + 10}px`,
    rotation: `${Math.random() * 90}deg`
  })), []);

  const rays = [
    { id: 1, left: "-20%", delay: "0s", duration: "7s", rotation: "-15deg" },
    { id: 2, left: "20%", delay: "2s", duration: "9s", rotation: "5deg" },
    { id: 3, left: "50%", delay: "4s", duration: "8s", rotation: "20deg" }
  ];

  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "23.8%", pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
        {rays.map(r => (
          <div key={`l-ray-${r.id}`} style={{
            position: "absolute", top: "-10%", left: r.left, width: "60%", height: "120%",
            background: "linear-gradient(180deg, rgba(255,215,0,0.35) 0%, rgba(255,215,0,0) 100%)",
            clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
            transformOrigin: "top center",
            animation: `wc-ray-sweep ${r.duration} ease-in-out infinite alternate`,
            animationDelay: r.delay,
            transform: `rotate(${r.rotation})`
          }} />
        ))}
        {leftSparkles.map(s => (
          <div key={s.id} style={{
            position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size,
            background: "#FFD700", clipPath: "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)",
            animation: `wc-sparkle-shine ${s.duration} ease-in-out infinite alternate`,
            animationDelay: s.delay, opacity: 0, transform: `rotate(${s.rotation})`
          }} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "26.2%", pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
        {rays.map(r => (
          <div key={`r-ray-${r.id}`} style={{
            position: "absolute", top: "-10%", left: r.left, width: "60%", height: "120%",
            background: "linear-gradient(180deg, rgba(255,215,0,0.35) 0%, rgba(255,215,0,0) 100%)",
            clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
            transformOrigin: "top center",
            animation: `wc-ray-sweep ${r.duration} ease-in-out infinite alternate`,
            animationDelay: r.delay,
            transform: `rotate(${r.rotation})`
          }} />
        ))}
        {rightSparkles.map(s => (
          <div key={s.id} style={{
            position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size,
            background: "#FFD700", clipPath: "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)",
            animation: `wc-sparkle-shine ${s.duration} ease-in-out infinite alternate`,
            animationDelay: s.delay, opacity: 0, transform: `rotate(${s.rotation})`
          }} />
        ))}
      </div>
      <style>{`
        @keyframes wc-sparkle-shine {
          0% { transform: translateY(0) scale(0) rotate(0deg); opacity: 0; filter: drop-shadow(0 0 5px #FFD700) drop-shadow(0 0 10px #FFD700); }
          50% { opacity: 1; transform: translateY(-10px) scale(1.3) rotate(45deg); filter: drop-shadow(0 0 15px #FFD700) drop-shadow(0 0 25px rgba(255,215,0,0.8)); }
          100% { transform: translateY(-20px) scale(0) rotate(90deg); opacity: 0; filter: drop-shadow(0 0 5px #FFD700); }
        }
        @keyframes wc-ray-sweep {
          0% { opacity: 0.1; transform: rotate(-5deg) scaleX(0.8); }
          50% { opacity: 0.6; transform: rotate(10deg) scaleX(1.3); filter: brightness(1.2); }
          100% { opacity: 0.1; transform: rotate(0deg) scaleX(0.9); }
        }
      `}</style>
    </>
  );
};

/**
 * Build a wordcloud2 collision mask from an image.
 * White pixels (R > 128) → transparent (words go here)
 * Dark  pixels            → opaque red  (words blocked)
 */
function buildMaskCanvas(img, w, h) {
  const off = document.createElement("canvas");
  off.width = w; off.height = h;
  const ctx = off.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < id.data.length; i += 4) {
    if (id.data[i] > 128) {
      id.data[i + 3] = 0;
    } else {
      id.data[i] = 255; id.data[i + 1] = 0; id.data[i + 2] = 0; id.data[i + 3] = 255;
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

function toTitleCase(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const THEME_COLORS = {
  iconic: ["#FFD700", "#F5C518", "#DAA520", "#FFC200", "#FFE566", "#B8860B", "#FFF3B0", "#C5A000", "#FFDF00", "#E8B800"],
  tech: ["#003D73", "#00529B", "#0277BD", "#0288D1", "#006064", "#00838F", "#1565C0", "#01579B"],
  consumer: ["#0B132C", "#D4AF37", "#131A2D", "#C5A059", "#1A2639", "#B8860B", "#8B1818", "#0A192F"],
  default: ["#8B1818", "#00529B", "#16A34A", "#B45309", "#4338CA", "#BE123C", "#0F766E", "#0369A1"],
};

function loadImg(src) {
  return new Promise(resolve => {
    const img = new Image();
    // img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
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
export default function WordCloudViz({ words, forwardedRef, theme = "default", viewMode = "normal", fillShape = false, onStop = null }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const htmlCloudRef = useRef(null);
  const activeTempDivRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cloudMode, setCloudMode] = useState("trophy"); // "trophy" | "shape" | "full_trophy"

  // Generation counter — increment aborts any stale async draw
  const genRef = useRef(0);
  const wordsRef = useRef(words);
  const isDrawingRef = useRef(false);
  const pendingDrawRef = useRef(false);
  // Stable ref so useEffects don't re-fire when drawCloud identity changes
  const drawCloudRef = useRef(null);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  /**
   * Pre-loaded images — loaded once at mount so drawCloud never awaits images
   * (eliminates the race where gen changes while awaiting loadImg).
   */
  const imgRefs = useRef({ trophy: null, trophyEvent: null, crown: null, fullTrophy: null });

  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    // Pre-load all iconic-theme images at mount
    const load = (src, key) => {
      const img = new Image();
      // img.crossOrigin = "anonymous";
      img.onload = () => {
        imgRefs.current[key] = img;
        setImagesLoaded(prev => prev + 1);
      };
      img.onerror = () => console.warn("[WordCloud] preload failed:", src);
      img.src = src;
    };
    load("/events_shape/best_iconic_brands.png", "trophy");
    load("/events_shape/best_iconic_brands_event.png", "trophyEvent");
    load("/events_shape/crown_mask.jpg", "crown");
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
    const div = htmlCloudRef.current;
    if (!canvas || !div) return;

    // Restore canvas pixels from the saved offscreen canvas
    canvas.width = entry.offscreenCanvas.width;
    canvas.height = entry.offscreenCanvas.height;
    if (forwardedRef) forwardedRef.current = canvas;
    canvas.getContext("2d").drawImage(entry.offscreenCanvas, 0, 0);

    // Restore div spans
    div.style.position = "absolute";
    div.style.left = `${entry.divLeft}px`;
    div.style.top = `${entry.divTop}px`;
    div.style.width = `${entry.divW}px`;
    div.style.height = `${entry.divH}px`;
    div.style.overflow = entry.divOverflow || "visible";
    div.style.borderRadius = entry.divBorderRadius || "0";
    div.style.opacity = "0";
    div.innerHTML = entry.innerHTML;

    // Smooth fade-in instead of fly-in animation (it's a cached restore)
    requestAnimationFrame(() => { div.style.opacity = "1"; });
  }, [forwardedRef]);

  // ─── Save current render to cache ─────────────────────────────────────────
  const saveToCache = useCallback((mode, cacheKey, divLeft, divTop, divW, divH) => {
    const canvas = canvasRef.current;
    const div = htmlCloudRef.current;
    if (!canvas || !div) return;

    // Copy canvas pixels to an offscreen canvas so we can restore later
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;
    off.getContext("2d").drawImage(canvas, 0, 0);

    cache.current[mode] = {
      cacheKey,
      offscreenCanvas: off,
      innerHTML: div.innerHTML,
      divLeft, divTop, divW, divH,
      divOverflow: div.style.overflow || "visible",
      divBorderRadius: div.style.borderRadius || "0",
    };
  }, []);

  // ─── Core draw function ────────────────────────────────────────────────────
  const drawCloud = useCallback(async () => {
    const currentWords = wordsRef.current || [];

    if (isDrawingRef.current) {
      pendingDrawRef.current = true;
      return;
    }
    isDrawingRef.current = true;
    pendingDrawRef.current = false;

    try {
      const cacheKey = JSON.stringify(currentWords) + "|" + isFullscreen + "|" + viewMode;

      // ── Cache hit: same words, same fullscreen, switching mode back → restore ──
      const hit = cache.current[cloudMode];
      if (hit && hit.cacheKey === cacheKey && currentWords.length > 0) {
        restoreFromCache(hit);
        return;
      }

      // ── Cache miss: full re-render ────────────────────────────────────────────
      const gen = ++genRef.current;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const div = htmlCloudRef.current;
      if (!container || !canvas || !div) return;

      // Abort any currently running wordcloud2 layout loops to free CPU
      canvas.dispatchEvent(new Event("wordcloudabort"));
      if (activeTempDivRef.current) {
        activeTempDivRef.current.dispatchEvent(new Event("wordcloudabort"));
        if (activeTempDivRef.current.parentNode) {
          activeTempDivRef.current.parentNode.removeChild(activeTempDivRef.current);
        }
        activeTempDivRef.current = null;
      }

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
      const colors = THEME_COLORS[theme] || THEME_COLORS.default;

      // ── NON-ICONIC THEMES ─────────────────────────────────────────────────────
      if (!isIconic) {
        canvas.width = w;
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
            if (id.data[i] === 255 && id.data[i + 1] === 255 && id.data[i + 2] === 255) id.data[i + 3] = 0;
          }
          ctx.putImageData(id, 0, 0);
        }

        const maxVal = Math.max(...currentWords.map(w => w.value), 1);

        const minFont = Math.max(10, Math.round(w / 40));
        const maxFont = Math.min(Math.round(w / 6), 140);


        if (currentWords.length > 0) {
          await new Promise(resolve => {
            let done = false;
            const ok = () => { if (!done) { done = true; resolve(); } };
            canvas.addEventListener("wordcloudstop", ok, { once: true });
            WordCloud(canvas, {
              list: currentWords.map(({ text, value }) => [toTitleCase(text), Math.round(minFont + ((value / maxVal) ** 1.1) * (maxFont - minFont))]),
              gridSize: Math.max(8, Math.round(w / 80)),
              weightFactor: 1,
              fontFamily: "'Segoe UI', Arial, sans-serif",
              fontWeight: "700",
              color: (_w, _wt, _fs, _d, theta) => colors[Math.abs(Math.floor((theta / (2 * Math.PI)) * colors.length)) % colors.length],
              rotateRatio: 0,
              backgroundColor: "transparent",
              clearCanvas: false,
              drawOutOfBound: false,
              shrinkToFit: true,
              shuffle: true,
              wait: 2,
              abortThreshold: 20,
            });
            setTimeout(ok, 10000);
          });
        }
        return;
      }

      // ── ICONIC THEME — paint dark background ──────────────────────────────────
      canvas.width = w;
      canvas.height = h;
      if (forwardedRef) forwardedRef.current = canvas;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#1a0000";
      ctx.fillRect(0, 0, w, h);

      const sortedWords = [...currentWords].sort((a, b) => b.value - a.value);
      const displayWords = sortedWords.slice(0, 200); // 200 is optimal for density vs speed
      const maxVal = Math.max(...displayWords.map(w => w.value), 1);
      let divLeft = 0, divTop = 0, divW = 0, divH = 0;

      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.visibility = "hidden";
      tempDiv.style.pointerEvents = "none";
      tempDiv.style.zIndex = "5";
      container.appendChild(tempDiv);
      activeTempDivRef.current = tempDiv;

      // ── TROPHY VIEW ───────────────────────────────────────────────────────────
      if (cloudMode === "trophy") {
        const isEvent = viewMode === "event";
        const trophy = isEvent ? imgRefs.current.trophyEvent : imgRefs.current.trophy;

        if (!trophy) return; // Prevent caching stale pixels if image hasn't loaded yet

        let tW, tH, tX, tY;
        if (isEvent && isFullscreen) {
          // Stretch to fill exactly end to end on LED screens
          tW = w;
          tH = h;
          tX = 0;
          tY = 0;
        } else {
          // Normal aspect-ratio preserving logic
          const tAspect = trophy.naturalWidth / trophy.naturalHeight;
          if (w / h > tAspect) { tH = h; tW = h * tAspect; tX = (w - tW) / 2; tY = 0; }
          else { tW = w; tH = w / tAspect; tX = 0; tY = (h - tH) / 2; }
        }
        ctx.drawImage(trophy, tX, tY, tW, tH);

        // PIXEL-PERFECT oval center and radii
        // Measured from the actual 4200x1008 source image:
        //   inner golden ring: cx=2052.5px(48.87%w), cy=504px(50%h), rx=792px(78.57%h), ry=504px(50%h)
        //   7% safety inset applied so words never touch the golden lines


        // GEMINI RESPONSE - FINAL

        let cX, cY, rx, ry;
        if (isEvent) {
          // Changed from 0.97 to 0.85. This creates a generous 15% inner padding
          // so the words form a clean shape without touching the border.
          // const inset = 0.85;
          const inset = 0.96;
          cX = tX + tW * (2052.5 / 4200);
          cY = tY + tH * (504 / 1008);
          rx = tW * ((792 * inset) / 4200);
          ry = tH * ((504 * inset) / 1008);
        } else {
          cX = tX + tW * 0.50;
          cY = tY + tH * 0.50;
          rx = tH * 0.25;
          ry = tH * 0.25;
        }

        // let cX, cY, rx, ry;
        // if (isEvent) {
        //   const inset = 0.97; // 3% safety margin to push words closer to the edge
        //   cX = tX + tW * (2052.5 / 4200);
        //   cY = tY + tH * (504 / 1008);
        //   rx = tW * ((792 * inset) / 4200);
        //   ry = tH * ((504 * inset) / 1008);
        // } else {
        //   cX = tX + tW * 0.50;
        //   cY = tY + tH * 0.50;
        //   rx = tH * 0.25;
        //   ry = tH * 0.25;
        // }

        //GEMINI RESPONSE - 1
        // let cX, cY, rx, ry;
        // if (isEvent) {
        //   const inset = 0.93; // 7% safety margin to stay off the golden lines
        //   cX = tX + tW * (2052.5 / 4200);
        //   cY = tY + tH * (504 / 1008);
        //   rx = tW * ((792 * inset) / 4200);
        //   ry = tH * ((504 * inset) / 1008);
        // } else {
        //   cX = tX + tW * 0.50;
        //   cY = tY + tH * 0.50;
        //   rx = tH * 0.25;
        //   ry = tH * 0.25;
        // }

        //GPT RESPONSE
        // let cX, cY, rx, ry;
        // if (isEvent) {
        //   cX = tX + tW * (2052 / 4200);
        //   cY = tY + tH * (548 / 1008);

        //   rx = tW * (793 / 4200) * 0.97;
        //   ry = tH * (803 / 1008) * 0.97;
        // } else {
        //   cX = tX + tW * 0.50;
        //   cY = tY + tH * 0.50;
        //   rx = tH * 0.25;
        //   ry = tH * 0.25;
        // }

        //Claude Response
        // let cX, cY, rx, ry;
        // if (isEvent) {
        //   cX = tX + tW * 0.4887;
        //   cY = tY + tH * 0.5000;
        //   rx = tH * 0.7307; // 78.57% * 0.93 inset
        //   ry = tH * 0.4650; // 50.00% * 0.93 inset
        // } else {
        //   cX = tX + tW * 0.50;
        //   cY = tY + tH * 0.50;
        //   rx = tH * 0.25;
        //   ry = tH * 0.25;
        // }

        const sizeW = Math.round(rx * 2);
        const sizeH = Math.round(ry * 2);
        divLeft = Math.round(cX - rx);
        divTop = Math.round(cY - ry);
        divW = sizeW;
        divH = sizeH;

        // Build an elliptical mask canvas
        const maskOff = document.createElement("canvas");
        maskOff.width = sizeW;
        maskOff.height = sizeH;
        const maskOffCtx = maskOff.getContext("2d");
        const maskId = maskOffCtx.getImageData(0, 0, sizeW, sizeH);
        const cx = sizeW / 2, cy = sizeH / 2;

        for (let py = 0; py < sizeH; py++) {
          for (let px = 0; px < sizeW; px++) {
            const dx = px - cx, dy = py - cy;
            // Ellipse equation
            if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0) {
              // Inside: transparent
              const idx = (py * sizeW + px) * 4;
              maskId.data[idx + 3] = 0;
            } else {
              // Outside: opaque red to block words
              const idx = (py * sizeW + px) * 4;
              maskId.data[idx] = 255; maskId.data[idx + 1] = 0;
              maskId.data[idx + 2] = 0; maskId.data[idx + 3] = 255;
            }
          }
        }
        maskOffCtx.putImageData(maskId, 0, 0);

        tempDiv.style.left = `${divLeft}px`;
        tempDiv.style.top = `${divTop}px`;
        tempDiv.style.width = `${divW}px`;
        tempDiv.style.height = `${divH}px`;
        // Changed to 'visible' and removed the hard clipPath so bottom words are never sliced
        tempDiv.style.overflow = "visible";
        tempDiv.style.borderRadius = "0";
        tempDiv.style.clipPath = "none";
        // tempDiv.style.overflow = "hidden";
        // tempDiv.style.borderRadius = "50% / 50%";
        // // Hard visual backstop — no word span can ever render outside this clip
        // tempDiv.style.clipPath = "ellipse(50% 50% at 50% 50%)";

        /**
         * AREA-BASED FONT SIZING — guarantees ALL words fit, zero dropped.
         *
         * Model: total_text_area = wordCount * avgWordLen * font² * charAspect
         * Constraint: total_text_area <= ovalArea * packFactor
         * Solve for maxFont.
         */

        //GEMINI RESPONSE
        // const ovalArea = Math.PI * rx * ry;
        // Increase pack factor heavily. Since most words are smaller than maxFont due to the power curve, 
        // they take up less area. A higher factor forces the text to grow and spread to the edges.
        // const packFactor = 4.0;
        // const availArea = ovalArea * packFactor;
        // const avgWordLen = displayWords.reduce((s, wd) => s + wd.text.length, 0) / (displayWords.length || 1);
        // const charAspect = 0.58;
        // const rawMax = Math.sqrt(availArea / (displayWords.length * avgWordLen * charAspect));

        // Remove the arbitrary 80/180px caps that cause tiny words on large canvases.
        // Cap dynamically based on the seal's physical height (sizeH) to allow natural scaling.
        // const maxFont = Math.max(16, Math.min(rawMax, sizeH / 2.5));
        // const minFont = Math.max(10, Math.round(maxFont * 0.25)); // Slightly bump minimum font to fill gaps
        // const gridSize = Math.max(4, Math.round(Math.min(sizeW, sizeH) / 90)); // Tighter grid for dense packing

        //CLAUDE RESPONSE
        // const ovalArea = Math.PI * rx * ry;
        // const packFactor = 0.52;        // wordcloud2 packs to ~52% of area
        // const availArea = ovalArea * packFactor;
        // const avgWordLen = displayWords.reduce((s, wd) => s + wd.text.length, 0) / (displayWords.length || 1);
        // const charAspect = 0.58;
        // const rawMax = Math.sqrt(availArea / (displayWords.length * avgWordLen * charAspect));
        // const maxFont = Math.max(10, Math.min(rawMax, isFullscreen ? 180 : 80));
        // const minFont = Math.max(8, Math.round(maxFont * 0.22));
        // const gridSize = Math.max(4, Math.round(Math.min(sizeW, sizeH) / 80));

        //   if (currentWords.length > 0) {
        //     await new Promise(resolve => {
        //       let done = false;
        //       const ok = () => { if (!done) { done = true; resolve(); } };
        //       tempDiv.addEventListener("wordcloudstop", ok, { once: true });
        //       WordCloud([maskOff, tempDiv], {
        //         list: displayWords.map(({ text, value }) => [text, value]),
        //         gridSize,
        //         weightFactor: (s) => {
        //           // Power curve: most-frequent word → maxFont, tail → minFont
        //           return minFont + Math.pow(Math.max(0, s / maxVal), 0.7) * (maxFont - minFont);
        //         },
        //         fontFamily: "'Montserrat', 'Inter', 'Segoe UI', sans-serif",
        //         fontWeight: 800,
        //         color: (_w, _wt, _fs, _d, theta) => THEME_COLORS.iconic[Math.abs(Math.floor((theta / (2 * Math.PI)) * THEME_COLORS.iconic.length)) % THEME_COLORS.iconic.length],
        //         rotateRatio: 0,
        //         backgroundColor: "transparent",
        //         drawOutOfBound: false,
        //         shrinkToFit: true,
        //         clearCanvas: false,
        //         wait: 8,
        //         abortThreshold: 5000, // never abandon a word due to timeout
        //       });
        //       setTimeout(ok, 15000); // absolute safety timeout
        //     });
        //   }

        //   if (gen !== genRef.current) return;
        // } // REMOVED CLOSING BRACE FROM HERE

        // const ovalArea = Math.PI * rx * ry;
        // // Lowered pack factor mathematically reduces overall font mass, stopping clutter
        // const packFactor = 1.2;
        // const availArea = ovalArea * packFactor;
        // const avgWordLen = displayWords.reduce((s, wd) => s + wd.text.length, 0) / (displayWords.length || 1);
        // const charAspect = 0.55;
        // const rawMax = Math.sqrt(availArea / (displayWords.length * avgWordLen * charAspect));

        // // Slightly stricter max font cap to maintain balance
        // const maxFont = Math.max(16, Math.min(rawMax, sizeH / 4.5));
        // const minFont = Math.max(10, Math.round(maxFont * 0.25));

        // // Increased grid size makes the invisible collision boxes around words larger, stopping overlaps
        // const gridSize = Math.max(12, Math.round(Math.min(sizeW, sizeH) / 35));

        // if (currentWords.length > 0) {
        //   await new Promise(resolve => {
        //     let done = false;
        //     const ok = () => { if (!done) { done = true; resolve(); } };
        //     tempDiv.addEventListener("wordcloudstop", ok, { once: true });
        //     WordCloud([maskOff, tempDiv], {
        //       list: displayWords.map(({ text, value }) => [text, value]),
        //       gridSize,
        //       weightFactor: (s) => {
        //         return minFont + Math.pow(Math.max(0, s / maxVal), 0.8) * (maxFont - minFont);
        //       },
        //       fontFamily: "'Inter', system-ui, sans-serif",
        //       fontWeight: 700,
        //       color: (_w, _wt, _fs, _d, theta) => THEME_COLORS.iconic[Math.abs(Math.floor((theta / (2 * Math.PI)) * THEME_COLORS.iconic.length)) % THEME_COLORS.iconic.length],
        //       rotateRatio: 0,
        //       backgroundColor: "transparent",
        //       drawOutOfBound: false,
        //       shrinkToFit: true,
        //       clearCanvas: false,
        //       wait: 8,
        //       abortThreshold: 5000,
        //     });
        //     setTimeout(ok, 15000);
        //   });
        // }


        // CRITICAL SPAN FIX: Force line-height to exactly 1 so the HTML span 
        // height perfectly matches the Canvas font metric, eliminating vertical bleeding.
        tempDiv.style.lineHeight = "1";
        tempDiv.className = "wordcloud-wrapper";

        // Inject global CSS to scale down the spans, creating a guaranteed perfect gap (padding) between words
        // By scaling the HTML spans down, we perfectly compensate for the artificially inflated collision boxes (see below).
        const scaleFactor = 1 / 1.15;
        const styleId = "wordcloud-css-fix";
        if (!document.getElementById(styleId)) {
          const style = document.createElement("style");
          style.id = styleId;
          style.textContent = `
            .wordcloud-wrapper span {
              transform: scale(${scaleFactor}) !important;
              transform-origin: center center !important;
              line-height: 1 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          `;
          document.head.appendChild(style);
        }

        // --- SCALING ---
        // We inflate the WordCloud's internal font size by 15% to force it to allocate 
        // a larger collision box. This provides clean, professional padding without being too spaced out.
        // The CSS scale then shrinks the visual text back to the intended size.
        const targetMaxFont = Math.round(sizeH / 5.2);
        const targetMinFont = Math.max(12, Math.round(sizeH / 40));

        const paddingMultiplier = 1.15;
        const maxFont = targetMaxFont * paddingMultiplier;
        const minFont = targetMinFont * paddingMultiplier;

        // BALANCED GRID SIZE: 
        // 12px provides a solid balance between tight nesting and preventing cluttered overlap.
        const gridSize = Math.max(12, Math.round(Math.min(sizeW, sizeH) / 75));

        if (currentWords.length > 0) {
          await new Promise(resolve => {
            let done = false;
            const ok = () => { if (!done) { done = true; resolve(); } };
            tempDiv.addEventListener("wordcloudstop", ok, { once: true });
            WordCloud([maskOff, tempDiv], {
              list: displayWords.map(({ text, value }) => [toTitleCase(text), value]),
              gridSize,
              classes: "wordcloud-span",
              weightFactor: (s) => {
                return minFont + Math.pow(Math.max(0, s / maxVal), 1.1) * (maxFont - minFont);
              },
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 500,
              color: (_w, _wt, _fs, _d, theta) => THEME_COLORS.iconic[Math.abs(Math.floor((theta / (2 * Math.PI)) * THEME_COLORS.iconic.length)) % THEME_COLORS.iconic.length],
              rotateRatio: 0,
              backgroundColor: "transparent",
              drawOutOfBound: false,
              shrinkToFit: true,
              clearCanvas: false,
              wait: 8,
              abortThreshold: 5000,
            });
            setTimeout(ok, 15000);
          });
        }

        if (gen !== genRef.current) return;
      }

      // ── SHAPE CLOUD (crown) ───────────────────────────────────────────────────
      if (cloudMode === "shape") {
        // Use pre-loaded image (synchronous — no race condition)
        const maskImg = imgRefs.current.crown;
        if (!maskImg) return;

        const PAD = 20;
        const availW = w - PAD * 2, availH = h - PAD * 2;
        const aspect = maskImg.naturalWidth / maskImg.naturalHeight;
        let sw = availW, sh = availW / aspect;
        if (sh > availH) { sh = availH; sw = sh * aspect; }
        sw = Math.round(sw); sh = Math.round(sh);
        const sl = Math.round(PAD + (availW - sw) / 2);
        const st = Math.round(PAD + (availH - sh) / 2);
        divLeft = sl; divTop = st; divW = sw; divH = sh;

        const off = buildMaskCanvas(maskImg, sw, sh);

        tempDiv.style.left = `${sl}px`;
        tempDiv.style.top = `${st}px`;
        tempDiv.style.width = `${sw}px`;
        tempDiv.style.height = `${sh}px`;
        tempDiv.style.overflow = "visible";
        tempDiv.style.borderRadius = "0";

        const minFont = Math.max(4, isFullscreen ? 6 : 4);
        const maxFont = Math.min(isFullscreen ? 90 : 60, Math.round(sw / 6));

        if (currentWords.length > 0) {
          await new Promise(resolve => {
            let done = false;
            const ok = () => { if (!done) { done = true; resolve(); } };
            tempDiv.addEventListener("wordcloudstop", ok, { once: true });
            WordCloud([off, tempDiv], {
              list: currentWords.map(({ text, value }) => [toTitleCase(text), value]),
              gridSize: Math.max(8, Math.round(sw / 75)),
              weightFactor: (size) => {
                return minFont + Math.pow(Math.max(0.1, size / maxVal), 1.2) * (maxFont - minFont);
              },
              fontFamily: "Impact, 'Arial Black', sans-serif",
              color: (_w, _wt, _fs, _d, theta) => THEME_COLORS.iconic[Math.abs(Math.floor((theta / (2 * Math.PI)) * THEME_COLORS.iconic.length)) % THEME_COLORS.iconic.length],
              rotateRatio: 0.4,      // allow some vertical words to fill the tall crown spikes
              rotationSteps: 2,
              backgroundColor: "transparent",
              drawOutOfBound: false,
              shrinkToFit: true,
              clearCanvas: false,
              wait: 2,
              abortThreshold: 30,
            });
            setTimeout(ok, 10000); // Increased timeout to 10s
          });
        }

        if (gen !== genRef.current) return;
      }

      // ── FULL TROPHY (entire trophy silhouette filled with words) ──────────────
      if (cloudMode === "full_trophy") {
        // Use pre-loaded image (synchronous — no race condition)
        const maskImg = imgRefs.current.fullTrophy;
        if (!maskImg) return;

        const PAD = 10;
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
        const silhouetteOff = document.createElement("canvas");
        silhouetteOff.width = sw;
        silhouetteOff.height = sh;
        const sCtx = silhouetteOff.getContext("2d");
        sCtx.drawImage(maskImg, 0, 0, sw, sh);
        const sId = sCtx.getImageData(0, 0, sw, sh);
        for (let i = 0; i < sId.data.length; i += 4) {
          if (sId.data[i] > 128) {
            // Inside trophy → golden glow outline
            sId.data[i] = 180; // R
            sId.data[i + 1] = 120; // G
            sId.data[i + 2] = 0;   // B
            sId.data[i + 3] = 55;  // alpha: very dim ghost
          } else {
            sId.data[i + 3] = 0; // outside → fully transparent
          }
        }
        sCtx.putImageData(sId, 0, 0);
        // Draw the silhouette ghost onto the main canvas
        ctx.drawImage(silhouetteOff, sl, st, sw, sh);

        const off = buildMaskCanvas(maskImg, sw, sh);

        tempDiv.style.left = `${sl}px`;
        tempDiv.style.top = `${st}px`;
        tempDiv.style.width = `${sw}px`;
        tempDiv.style.height = `${sh}px`;
        tempDiv.style.overflow = "visible";
        tempDiv.style.borderRadius = "0";

        const minFont = Math.max(7, isFullscreen ? 10 : 7);
        const maxFont = Math.min(isFullscreen ? 110 : 70, Math.round(sw / 5));

        if (currentWords.length > 0) {
          await new Promise(resolve => {
            let done = false;
            const ok = () => { if (!done) { done = true; resolve(); } };
            tempDiv.addEventListener("wordcloudstop", ok, { once: true });
            WordCloud([off, tempDiv], {
              list: currentWords.map(({ text, value }) => [toTitleCase(text), value]),
              gridSize: Math.max(10, Math.round(sw / 65)),
              weightFactor: (s) => {
                const mn = minFont, mx = maxFont;
                return mn + Math.pow(Math.max(0.1, s / maxVal), 1.15) * (mx - mn);
              },
              fontFamily: "Impact, 'Arial Black', sans-serif",
              color: (_w, _wt, _fs, _d, theta) => THEME_COLORS.iconic[Math.abs(Math.floor((theta / (2 * Math.PI)) * THEME_COLORS.iconic.length)) % THEME_COLORS.iconic.length],
              rotateRatio: 0,
              rotationSteps: 1,
              backgroundColor: "transparent",
              drawOutOfBound: false,
              shrinkToFit: true,
              clearCanvas: false,
              wait: 2,
              abortThreshold: 30,
            });
            setTimeout(ok, 12000); // Increased timeout to 12s
          });
        }

        if (gen !== genRef.current) return;
      }

      if (gen !== genRef.current) return;

      // ── Perform the double-buffer swap! ───────────────────────────────────────
      div.style.position = "absolute";
      div.style.left = tempDiv.style.left;
      div.style.top = tempDiv.style.top;
      div.style.width = tempDiv.style.width;
      div.style.height = tempDiv.style.height;
      div.style.overflow = tempDiv.style.overflow;
      div.style.borderRadius = tempDiv.style.borderRadius;
      div.style.clipPath = tempDiv.style.clipPath;
      div.innerHTML = tempDiv.innerHTML;
      div.style.opacity = "1";

      if (tempDiv.parentNode) tempDiv.parentNode.removeChild(tempDiv);
      activeTempDivRef.current = null;

      // ── Save this render to cache ─────────────────────────────────────────────
      saveToCache(cloudMode, cacheKey, divLeft, divTop, divW, divH);

      // ── Animation ─────────────────────────────────────────────────────────────
      await new Promise(r => requestAnimationFrame(r));
      if (gen !== genRef.current) return;

      const children = Array.from(div.children);
      if (children.length === 0) return;

      // Enable CSS perspective on the container for true 3D depth perception
      // Tighter perspective = more exaggerated depth distortion (cinematic feel)
      container.style.perspective = "900px";
      container.style.perspectiveOrigin = "50% 50%";

      if (cloudMode === "full_trophy") {
        // full_trophy: Cinematic orbital burst — each word fires in from deep Z-space
        // with a glowing chromatic overshoot at the screen-plane, then snaps to rest.
        const shuffled = shuffle(children);
        shuffled.forEach(s => { s.style.opacity = "0"; s.style.transition = "none"; });
        shuffled.forEach((span, i) => {
          const baseTransform = (span.style.transform || "").replace(/scale\([^)]*\)/g, "").trim();
          // Random tilt starting in 3D space — heavier tilt for deeper words
          const tilt = (Math.random() - 0.5) * 45;
          // Start deeply behind screen with random XY drift to create an orbital burst feel
          const startZ = -(1200 + Math.random() * 600);
          const startX = (Math.random() - 0.5) * 180;
          const startY = (Math.random() - 0.5) * 90;
          // Stagger in 4 waves for a cascading depth effect
          const wave = i % 4;
          const waveDelay = wave * 60;
          const wordDelay = Math.floor(i / 4) * 35 + waveDelay;

          span.animate(
            [
              {
                opacity: 0,
                filter: `blur(12px) brightness(0.5)`,
                transform: `${baseTransform} translate(${startX}px, ${startY}px) translateZ(${startZ}px) scale(0.05) rotate(${tilt}deg)`,
              },
              {
                opacity: 0.9,
                // Chromatic glow burst as word crosses the screen plane
                filter: `blur(0px) brightness(1.6) drop-shadow(0 0 12px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 4px rgba(255,255,255,0.6))`,
                transform: `${baseTransform} translate(${startX * 0.03}px, ${startY * 0.03}px) translateZ(60px) scale(1.12) rotate(${tilt * 0.04}deg)`,
                offset: 0.72,
              },
              {
                opacity: 1,
                filter: `blur(0px) brightness(1) drop-shadow(0 0 0px rgba(255,215,0,0))`,
                transform: `${baseTransform} translate(0,0) translateZ(0px) scale(1) rotate(0deg)`,
              },
            ],
            {
              duration: 1100,
              easing: "cubic-bezier(0.12, 0.8, 0.25, 1)",
              delay: wordDelay,
              fill: "backwards",
            }
          );
          setTimeout(() => {
            span.style.opacity = "1";
            span.style.filter = "";
            span.style.transform = baseTransform;
          }, wordDelay + 1160);
        });

      } else {
        // ── Trophy seal: Full cinematic 3D depth-burst with chromatic overshoot ─
        // Words start in deep Z-negative space (far behind screen), fly towards viewer,
        // burst through with a golden glow halo, then settle precisely into position.
        const shuffled = shuffle(children);
        shuffled.forEach(s => { s.style.opacity = "0"; });
        try {
          shuffled.forEach((span, i) => {
            const bt = (span.style.transform || "");
            // Compute screen-center distance to add lens-distortion-like XY parallax
            const rect = div.getBoundingClientRect();
            const spanRect = span.getBoundingClientRect();
            const relX = spanRect.left - rect.left - rect.width / 2;
            const relY = spanRect.top - rect.top - rect.height / 2;
            const distFactor = Math.sqrt(relX * relX + relY * relY) / Math.max(rect.width, 1);

            // Words on the edges start from further out XY, creating a real parallax burst
            const scatterX = relX * (1.5 + Math.random() * 0.5);
            const scatterY = relY * (1.5 + Math.random() * 0.5);
            // Deeper Z for words further from center — cinematic lens effect
            const startZ = -(900 + distFactor * 600 + Math.random() * 300);
            const startScale = 0.04 + Math.random() * 0.08;
            const startBlur = 14 + Math.random() * 8;
            const tilt = (Math.random() - 0.5) * 70;

            // Stagger in 3 depth layers — near words animate first for a depth-sorting feel
            const layer = i % 3;
            const wordDelay = layer * 80 + Math.floor(i / 3) * 25;

            span.style.opacity = "1";
            span.animate(
              [
                {
                  opacity: 0,
                  filter: `blur(${startBlur}px) brightness(0.3)`,
                  transform: `translate(${scatterX}px, ${scatterY}px) translateZ(${startZ}px) scale(${startScale}) rotate(${tilt}deg) ${bt}`,
                },
                {
                  opacity: 0.85,
                  // Peak chromatic gold glow as word punches through screen plane
                  filter: `blur(0.5px) brightness(1.8) drop-shadow(0 0 16px rgba(255,215,0,0.95)) drop-shadow(0 0 6px rgba(255,255,255,0.7))`,
                  transform: `translate(${scatterX * 0.04}px, ${scatterY * 0.04}px) translateZ(80px) scale(1.18) rotate(${tilt * 0.04}deg) ${bt}`,
                  offset: 0.74,
                },
                {
                  opacity: 1,
                  filter: `blur(0px) brightness(1) drop-shadow(0 0 0px rgba(255,215,0,0))`,
                  transform: `translate(0,0) translateZ(0px) scale(1) rotate(0deg) ${bt}`,
                },
              ],
              {
                duration: 1500,
                easing: "cubic-bezier(0.10, 0.9, 0.22, 1)",
                delay: wordDelay,
                fill: "backwards",
              }
            );
          });
        } catch (e) {
          children.forEach(s => { s.style.opacity = "1"; });
        }
      }
    } finally {
      isDrawingRef.current = false;
      if (pendingDrawRef.current) {
        setTimeout(drawCloud, 50);
      }
    }
  }, [theme, cloudMode, isFullscreen, fillShape, restoreFromCache, saveToCache, viewMode]);

  // Keep the stable ref in sync with the latest drawCloud
  useEffect(() => {
    drawCloudRef.current = drawCloud;
  }, [drawCloud]);

  // ── When words change, invalidate caches and debounce the redraw ─────────
  // Debouncing by 2s means rapid incoming responses (e.g., many players answering
  // at once) are batched into a SINGLE smooth animation, not a janky double-fire.
  useEffect(() => {
    if (!words || words.length === 0) return;

    // Invalidate caches so the next draw is always a fresh render
    cache.current.trophy = null;
    cache.current.shape = null;
    cache.current.full_trophy = null;

    const timer = setTimeout(() => {
      drawCloudRef.current?.();
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(words)]);

  // ── Trigger draw when images load or layout props change ────────────
  useEffect(() => {
    if (imagesLoaded === 0) return;
    drawCloudRef.current?.();
  }, [imagesLoaded, viewMode, cloudMode, isFullscreen, theme]);

  const isIconic = theme === "iconic";

  return (
    <div
      ref={containerRef}
      className="wordcloud-wrapper"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: isIconic && !isFullscreen ? "16 / 9" : (isFullscreen ? undefined : "1000 / 600"),
        height: isFullscreen ? "100vh" : undefined,
        background: isIconic ? "#1a0000" : "#fff",
        margin: "0 auto",
        borderRadius: isIconic && !isFullscreen ? "8px" : undefined,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      {isIconic && <ImageSideSparkles />}

      {/* wordcloud2 places span elements here for iconic modes */}
      <div
        ref={htmlCloudRef}
        style={{ position: "absolute", pointerEvents: "none", zIndex: 5, transition: "opacity 0.35s ease-in-out" }}
      />

      {/* Trophy / Shape toggle — removed per user request */}

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
