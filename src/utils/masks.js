// src/utils/masks.js
/**
 * Generates precise SVG shape masks for word cloud silhouettes.
 * Crown → Iconic Brands | Cloud → Best Tech Brands
 * 
 * The mask canvas must have:
 *   - BLACK pixels (#000) where words ARE ALLOWED to be placed
 *   - Transparent pixels where words are NOT allowed
 * wordcloud2 reads pixel data: non-transparent = occupied, transparent = free.
 * We FLIP this by painting the mask black and using it as a "drawn" background.
 */

// Crown SVG — a proper 5-point crown with base band
const CROWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <!-- Crown body: 5 peaks -->
  <polygon points="
    50,420
    50,200
    200,320
    400,60
    600,320
    750,200
    750,420
  " fill="#000"/>
  <!-- Crown base band -->
  <rect x="50" y="380" width="700" height="60" rx="8" fill="#000"/>
  <!-- Decorative gem circles at tips -->
  <circle cx="50" cy="200" r="22" fill="#000"/>
  <circle cx="750" cy="200" r="22" fill="#000"/>
  <circle cx="200" cy="320" r="20" fill="#000"/>
  <circle cx="600" cy="320" r="20" fill="#000"/>
  <circle cx="400" cy="60" r="28" fill="#000"/>
  <!-- Fill gaps between peak bottoms and base (left) -->
  <polygon points="50,200 200,320 50,420" fill="#000"/>
  <!-- Fill gaps between peak bottoms and base (right) -->
  <polygon points="750,200 600,320 750,420" fill="#000"/>
  <!-- Fill gaps between middle peaks and base (left inner) -->
  <polygon points="200,320 400,60 400,420" fill="#000"/>
  <!-- Fill gaps between middle peaks and base (right inner) -->
  <polygon points="400,60 600,320 400,420" fill="#000"/>
</svg>
`;

// Cloud SVG — a wide, fluffy multi-lobe cloud shape
const CLOUD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <ellipse cx="170" cy="330" rx="145" ry="115" fill="#000"/>
  <ellipse cx="300" cy="250" rx="160" ry="140" fill="#000"/>
  <ellipse cx="460" cy="220" rx="185" ry="160" fill="#000"/>
  <ellipse cx="630" cy="270" rx="155" ry="130" fill="#000"/>
  <ellipse cx="730" cy="360" rx="100" ry="90"  fill="#000"/>
  <rect x="50"  y="330" width="720" height="120" fill="#000"/>
</svg>
`;

function svgToMaskCanvas(svgString, width, height) {
  return new Promise((resolve) => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

export async function getMaskCanvas(theme, width, height) {
  if (theme === "iconic") return svgToMaskCanvas(CROWN_SVG, width, height);
  if (theme === "tech")   return svgToMaskCanvas(CLOUD_SVG,  width, height);
  return null;
}
