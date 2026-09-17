// src/utils/masks.js
/**
 * Generates precise SVG shape masks for word cloud silhouettes.
 * Circle → Iconic Brands | Cloud → Best Tech Brands
 */

// Circle SVG — matches the inner golden circle of the trophy
// The word cloud fills this circle, then gets composited onto the trophy image
const CIRCLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600" preserveAspectRatio="none">
  <!-- Perfect circle centered in the canvas — matches trophy inner circle -->
  <circle cx="500" cy="285" r="265" fill="#000" />
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
  <polygon points="400,0 425,62 465,9 473,74 525,33 516,99 577,73 551,134 617,125 576,177 641,185 588,225 650,250 588,275 641,315 576,323 617,375 551,366 577,427 516,401 525,467 473,426 465,491 425,438 400,500 375,438 335,491 327,426 275,467 284,401 223,427 249,366 183,375 224,323 159,315 212,275 150,250 212,225 159,185 224,177 183,125 249,134 223,73 284,99 275,33 327,74 335,9 375,62" fill="#000" />
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
  if (theme === "iconic")   return svgToMaskCanvas(CIRCLE_SVG,   width, height);
  if (theme === "tech")     return svgToMaskCanvas(CLOUD_SVG,    width, height);
  if (theme === "consumer") return svgToMaskCanvas(CONSUMER_SVG, width, height);
  return null;
}

/**
 * For iconic theme: returns a circle mask canvas for the inner trophy circle.
 * Used by WordCloudViz to cut the word cloud into the circular shape.
 */
export async function getCircleMaskCanvas(width, height) {
  return svgToMaskCanvas(CIRCLE_SVG, width, height);
}
