// src/utils/masks.js
/**
 * Generates precise SVG shape masks for word cloud silhouettes.
 * Crown → Iconic Brands | Cloud → Best Tech Brands
 */

// Crown SVG — a precise 5-point crown modeled after the reference image
const CROWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -50 1000 600" width="1000" height="600" preserveAspectRatio="none">
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
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -50 1000 600" width="1000" height="600" preserveAspectRatio="none">
  <!-- Core filler to prevent empty holes in the middle -->
  <rect x="160" y="240" width="480" height="110" rx="20" fill="#000" />
  
  <!-- Main top lobes (distinct and separated to create deep classic crevices) -->
  <circle cx="400" cy="170" r="135" fill="#000" />  <!-- Center Top -->
  <circle cx="240" cy="220" r="95" fill="#000" />   <!-- Mid-Left -->
  <circle cx="560" cy="220" r="95" fill="#000" />   <!-- Mid-Right -->
  
  <!-- Side lobes -->
  <circle cx="140" cy="290" r="75" fill="#000" />   <!-- Far-Left -->
  <circle cx="660" cy="290" r="75" fill="#000" />   <!-- Far-Right -->
  
  <!-- Bottom fluffy lobes (almost flat but slightly bubbly) -->
  <circle cx="210" cy="330" r="55" fill="#000" />
  <circle cx="300" cy="340" r="55" fill="#000" />
  <circle cx="400" cy="345" r="55" fill="#000" />
  <circle cx="500" cy="340" r="55" fill="#000" />
  <circle cx="590" cy="330" r="55" fill="#000" />
</svg>
`;

// Consumer Brands SVG — Badge seal with zig-zag edge
const CONSUMER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -50 1000 600" width="1000" height="600" preserveAspectRatio="none">
  <polygon points="400,10 416,41 438,13 449,46 474,22 480,56 509,36 510,71 541,56 536,90 570,80 560,114 594,109 579,140 614,141 594,170 628,176 604,201 637,212 609,234 640,250 609,266 637,288 604,299 628,324 594,330 614,359 579,360 594,391 560,386 570,420 536,410 541,444 510,429 509,464 480,444 474,478 449,454 438,487 416,459 400,490 384,459 362,487 351,454 326,478 320,444 291,464 290,429 259,444 264,410 230,420 240,386 206,391 221,360 186,359 206,330 172,324 196,299 163,288 191,266 160,250 191,234 163,212 196,201 172,176 206,170 186,141 221,140 206,109 240,114 230,80 264,90 259,56 290,71 291,36 320,56 326,22 351,46 362,13 384,41" fill="#000" />
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
  if (theme === "consumer") return svgToMaskCanvas(CONSUMER_SVG, width, height);
  return null;
}
