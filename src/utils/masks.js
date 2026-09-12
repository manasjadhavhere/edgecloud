// src/utils/masks.js
/**
 * Generates precise SVG shape masks for word cloud silhouettes.
 * Crown → Iconic Brands | Cloud → Best Tech Brands
 */

// Crown SVG — a precise 5-point crown modeled after the reference image
const CROWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <!-- Precision drawn crown base with bezier curves for graceful stems -->
  <path d="
    M 130 470
    Q 400 490 670 470
    C 720 450, 750 350, 750 280
    C 730 320, 680 330, 630 330
    C 620 280, 610 200, 590 150
    C 560 250, 520 280, 460 280
    C 450 200, 420 120, 400 80
    C 380 120, 350 200, 340 280
    C 280 280, 240 250, 210 150
    C 190 200, 180 280, 170 330
    C 120 330, 70 320, 50 280
    C 50 350, 80 450, 130 470
    Z
  " fill="#000" />
  
  <!-- Distinct circular bulbs positioned perfectly at the tips -->
  <circle cx="400" cy="65" r="45" fill="#000" />    <!-- Center tip -->
  <circle cx="210" cy="140" r="35" fill="#000" />   <!-- Left-middle tip -->
  <circle cx="590" cy="140" r="35" fill="#000" />   <!-- Right-middle tip -->
  <circle cx="50" cy="270" r="25" fill="#000" />    <!-- Far-left tip -->
  <circle cx="750" cy="270" r="25" fill="#000" />   <!-- Far-right tip -->
</svg>
`;

// Cloud SVG — a wide, fluffy multi-lobe cloud shape
const CLOUD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <path d="
    M 150 350
    A 100 100 0 0 1 250 200
    A 120 120 0 0 1 450 150
    A 110 110 0 0 1 600 220
    A 90 90 0 0 1 700 350
    Z
  " fill="#000" />
  <rect x="150" y="250" width="550" height="150" rx="40" fill="#000" />
  <circle cx="150" cy="350" r="70" fill="#000" />
  <circle cx="700" cy="350" r="70" fill="#000" />
  <circle cx="400" cy="350" r="100" fill="#000" />
  <circle cx="550" cy="350" r="80" fill="#000" />
  <circle cx="250" cy="350" r="80" fill="#000" />
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
