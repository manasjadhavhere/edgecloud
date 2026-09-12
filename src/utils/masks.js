// src/utils/masks.js
/**
 * Generates precise SVG shape masks for word cloud silhouettes.
 * Crown → Iconic Brands | Cloud → Best Tech Brands
 */

// Crown SVG — a precise 5-point crown modeled after the reference image
const CROWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <path d="
    M 100 460
    Q 400 490 700 460
    L 780 230
    Q 710 330 650 340
    L 580 130
    Q 510 280 450 290
    L 400 30
    L 350 290
    Q 290 280 220 130
    L 150 340
    Q 90 330 20 230
    Z
  " fill="#000" stroke="#000" stroke-width="40" stroke-linejoin="round" />
  
  <!-- Massive circles at the tips to ensure words can fit inside them and create the rounded crown look -->
  <circle cx="20" cy="230" r="45" fill="#000"/>
  <circle cx="150" cy="340" r="25" fill="#000"/>
  <circle cx="220" cy="130" r="45" fill="#000"/>
  <circle cx="400" cy="30" r="55" fill="#000"/>
  <circle cx="580" cy="130" r="45" fill="#000"/>
  <circle cx="650" cy="340" r="25" fill="#000"/>
  <circle cx="780" cy="230" r="45" fill="#000"/>
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
