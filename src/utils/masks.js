// src/utils/masks.js
/**
 * Generates precise SVG shape masks for word cloud silhouettes.
 * Crown → Iconic Brands | Cloud → Best Tech Brands
 */

// Crown SVG: classic 3-point crown with detailed silhouette
const CROWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
  <path d="
    M 60,460
    L 30,200
    L 200,330
    L 400,60
    L 600,330
    L 770,200
    L 740,460
    Z
    M 60,460
    Q 100,480 160,475
    Q 200,480 240,465
    Q 280,478 320,468
    Q 360,480 400,472
    Q 440,480 480,468
    Q 520,478 560,465
    Q 600,480 640,475
    Q 700,480 740,460
    L 60,460
  " fill="#000"/>
  <ellipse cx="200" cy="340" rx="30" ry="30" fill="#000"/>
  <ellipse cx="400" cy="70" rx="35" ry="35" fill="#000"/>
  <ellipse cx="600" cy="340" rx="30" ry="30" fill="#000"/>
</svg>
`;

// Cloud SVG: wide, fluffy word-cloud shape from reference image
const CLOUD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
  <ellipse cx="190" cy="320" rx="155" ry="130" fill="#000"/>
  <ellipse cx="340" cy="240" rx="170" ry="150" fill="#000"/>
  <ellipse cx="510" cy="220" rx="185" ry="165" fill="#000"/>
  <ellipse cx="650" cy="310" rx="145" ry="125" fill="#000"/>
  <rect x="60"  y="320" width="680" height="140" rx="0" fill="#000"/>
</svg>
`;

function svgToMaskCanvas(svgString, width, height) {
  return new Promise((resolve) => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
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
