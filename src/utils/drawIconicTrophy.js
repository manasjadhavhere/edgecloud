// src/utils/drawIconicTrophy.js
/**
 * Draws the "Best Iconic Brands" trophy entirely on a canvas using the 2D API.
 * No external image required.
 *
 * Layout (all values are fractions of canvas width W and height H):
 *   Canvas:        W × H  (16:9)
 *   Medallion CY:  0.38 × H   — keeps room for base below & padding above
 *   Medallion R:   0.175 × W  — slightly smaller to leave room for base
 *   Inner circle R: 0.110 × W  (the word-cloud area)
 *
 * Returns { cx, cy, r } — pixel coords of the inner circle.
 */
export function drawIconicTrophy(canvas) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // ─── 1. BACKGROUND ──────────────────────────────────────────────────────────
  // Deep dark-red radial gradient
  const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.40, 0, W * 0.5, H * 0.5, W * 0.75);
  bgGrad.addColorStop(0.00, "#4a0a0a");
  bgGrad.addColorStop(0.45, "#2d0505");
  bgGrad.addColorStop(1.00, "#0d0000");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle diagonal light sweep (top-left to bottom-right)
  _drawLightRays(ctx, W, H);

  // Ambient floor glow
  const floorGlow = ctx.createRadialGradient(W * 0.5, H * 0.93, 0, W * 0.5, H * 0.93, W * 0.35);
  floorGlow.addColorStop(0.0, "rgba(180,40,0,0.28)");
  floorGlow.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, 0, W, H);

  // ─── Shared layout constants ─────────────────────────────────────────────────
  const medCX = W * 0.50;
  const medCY = H * 0.36;        // medallion vertical center (upper portion)
  const medR  = W * 0.175;       // outer wax radius — smaller so base fits
  const innerR = W * 0.110;      // inner circle radius (word cloud goes here)
  const scallops = 14;

  // ─── 2. TROPHY BASE (black cylinder with gold rings) ────────────────────────
  // Base starts just below the bottom of the medallion + ribbon
  const ribbonCY   = medCY + medR * 0.55;
  const ribbonH    = medR * 0.18;
  const baseTopY   = ribbonCY + ribbonH * 0.85;
  const baseX      = W * 0.50;
  const baseW      = W * 0.11;
  const baseH      = H - baseTopY - H * 0.03;   // fills remaining space with a 3% bottom margin

  _drawBase(ctx, baseX, baseTopY, baseW, Math.max(baseH, H * 0.18));

  // ─── 3. MEDALLION (wax seal) ────────────────────────────────────────────────
  _drawMedallion(ctx, medCX, medCY, medR, scallops);

  // ─── 4. GOLD RING around inner circle ────────────────────────────────────────
  _drawGoldRing(ctx, medCX, medCY, innerR, medR);

  // ─── 5. RIBBON "Made In India" ───────────────────────────────────────────────
  _drawRibbon(ctx, medCX, ribbonCY, medR);

  // ─── 6. Inner circle background fill (deep red, ready for word cloud) ────────
  const innerGrad = ctx.createRadialGradient(medCX, medCY - innerR * 0.15, 0, medCX, medCY, innerR);
  innerGrad.addColorStop(0.0, "#5c0f0f");
  innerGrad.addColorStop(1.0, "#2a0303");
  ctx.save();
  ctx.beginPath();
  ctx.arc(medCX, medCY, innerR - 2, 0, Math.PI * 2);
  ctx.fillStyle = innerGrad;
  ctx.fill();
  ctx.restore();

  return { cx: medCX, cy: medCY, r: innerR - 2 };
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────────

function _drawLightRays(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.18;

  // Left ray
  const leftRay = ctx.createLinearGradient(0, H * 0.6, W * 0.45, H * 0.3);
  leftRay.addColorStop(0, "rgba(220,100,0,0)");
  leftRay.addColorStop(0.5, "rgba(220,100,0,0.5)");
  leftRay.addColorStop(1, "rgba(220,100,0,0)");
  ctx.fillStyle = leftRay;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.55);
  ctx.lineTo(W * 0.45, H * 0.25);
  ctx.lineTo(W * 0.5, H * 0.28);
  ctx.lineTo(0, H * 0.68);
  ctx.closePath();
  ctx.fill();

  // Right ray
  const rightRay = ctx.createLinearGradient(W, H * 0.6, W * 0.55, H * 0.3);
  rightRay.addColorStop(0, "rgba(220,100,0,0)");
  rightRay.addColorStop(0.5, "rgba(220,100,0,0.5)");
  rightRay.addColorStop(1, "rgba(220,100,0,0)");
  ctx.fillStyle = rightRay;
  ctx.beginPath();
  ctx.moveTo(W, H * 0.55);
  ctx.lineTo(W * 0.55, H * 0.25);
  ctx.lineTo(W * 0.5, H * 0.28);
  ctx.lineTo(W, H * 0.68);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.restore();
}

function _drawBase(ctx, cx, topY, halfW, totalH) {
  // Column
  const colGrad = ctx.createLinearGradient(cx - halfW, 0, cx + halfW, 0);
  colGrad.addColorStop(0.00, "#1a1a1a");
  colGrad.addColorStop(0.20, "#3a3a3a");
  colGrad.addColorStop(0.50, "#0d0d0d");
  colGrad.addColorStop(0.80, "#2a2a2a");
  colGrad.addColorStop(1.00, "#111111");

  const colH = totalH * 0.62;
  ctx.fillStyle = colGrad;
  ctx.beginPath();
  ctx.roundRect(cx - halfW * 0.72, topY, halfW * 1.44, colH, 4);
  ctx.fill();

  // Top gold accent ring (where medallion meets base)
  _goldRingRect(ctx, cx, topY, halfW * 1.5, totalH * 0.055);
  // Bottom tier (wider)
  const botTierY = topY + colH;
  const botTierH = totalH * 0.20;
  const botTierHW = halfW * 1.10;

  const botGrad = ctx.createLinearGradient(cx - botTierHW, 0, cx + botTierHW, 0);
  botGrad.addColorStop(0.00, "#151515");
  botGrad.addColorStop(0.25, "#303030");
  botGrad.addColorStop(0.50, "#0a0a0a");
  botGrad.addColorStop(0.75, "#252525");
  botGrad.addColorStop(1.00, "#101010");
  ctx.fillStyle = botGrad;
  ctx.beginPath();
  ctx.roundRect(cx - botTierHW, botTierY, botTierHW * 2, botTierH, 4);
  ctx.fill();
  _goldRingRect(ctx, cx, botTierY, botTierHW * 2.0, totalH * 0.048);

  // Wider base platform
  const platY = botTierY + botTierH;
  const platH = totalH * 0.18;
  const platHW = halfW * 1.5;
  ctx.fillStyle = botGrad;
  ctx.beginPath();
  ctx.roundRect(cx - platHW, platY, platHW * 2, platH, [0, 0, 6, 6]);
  ctx.fill();
  _goldRingRect(ctx, cx, platY, platHW * 2.05, totalH * 0.042);
}

function _goldRingRect(ctx, cx, y, totalW, h) {
  const grad = ctx.createLinearGradient(cx - totalW / 2, 0, cx + totalW / 2, 0);
  grad.addColorStop(0.00, "#7a5400");
  grad.addColorStop(0.20, "#C8A000");
  grad.addColorStop(0.50, "#FFD700");
  grad.addColorStop(0.80, "#C8A000");
  grad.addColorStop(1.00, "#7a5400");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cx - totalW / 2, y - h / 2, totalW, h, 3);
  ctx.fill();
}

function _drawMedallion(ctx, cx, cy, R, scallops) {
  // Outer scalloped wax seal
  const scallop = _scallopPath(cx, cy, R, R * 0.15, scallops);

  // Wax red gradient
  const waxGrad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.3, 0, cx, cy, R * 1.1);
  waxGrad.addColorStop(0.00, "#cc2222");
  waxGrad.addColorStop(0.35, "#991111");
  waxGrad.addColorStop(0.65, "#7a0a0a");
  waxGrad.addColorStop(1.00, "#400000");
  ctx.fillStyle = waxGrad;
  ctx.fill(scallop);

  // Bright highlight (top-left gloss)
  ctx.save();
  ctx.clip(scallop);
  const highlightGrad = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.38, 0, cx - R * 0.1, cy - R * 0.2, R * 0.65);
  highlightGrad.addColorStop(0.0, "rgba(255,120,100,0.55)");
  highlightGrad.addColorStop(0.5, "rgba(200,30,30,0.12)");
  highlightGrad.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = highlightGrad;
  ctx.fill(scallop);
  ctx.restore();

  // Thin dark outline
  ctx.save();
  ctx.strokeStyle = "rgba(30,0,0,0.6)";
  ctx.lineWidth = R * 0.012;
  ctx.stroke(scallop);
  ctx.restore();
}

function _scallopPath(cx, cy, R, amp, count) {
  const path = new Path2D();
  const steps = count * 12;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
    const r = R + amp * Math.cos(count * angle);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.closePath();
  return path;
}

function _drawGoldRing(ctx, cx, cy, innerR, medR) {
  // Outer ring edge
  const ringOuterR = innerR + (medR - innerR) * 0.18;

  // Gold ring gradient
  const goldGrad = ctx.createLinearGradient(cx - ringOuterR, cy, cx + ringOuterR, cy);
  goldGrad.addColorStop(0.00, "#7a5400");
  goldGrad.addColorStop(0.15, "#C8A000");
  goldGrad.addColorStop(0.35, "#FFE066");
  goldGrad.addColorStop(0.50, "#FFD700");
  goldGrad.addColorStop(0.65, "#FFE066");
  goldGrad.addColorStop(0.85, "#C8A000");
  goldGrad.addColorStop(1.00, "#7a5400");

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, ringOuterR, 0, Math.PI * 2);
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
  ctx.fillStyle = goldGrad;
  ctx.fill("evenodd");

  // Outer gold ring highlight (top arc)
  ctx.beginPath();
  ctx.arc(cx, cy, (ringOuterR + innerR) / 2, Math.PI * 1.2, Math.PI * 1.8);
  ctx.strokeStyle = "rgba(255,240,150,0.6)";
  ctx.lineWidth = (ringOuterR - innerR) * 0.4;
  ctx.stroke();
  ctx.restore();
}

function _drawRibbon(ctx, cx, ribbonCY, medR) {
  const ribbonW = medR * 1.5;
  const ribbonH = medR * 0.18;

  ctx.save();

  // Ribbon body with perspective curve
  const ribbonGrad = ctx.createLinearGradient(cx - ribbonW, ribbonCY, cx + ribbonW, ribbonCY);
  ribbonGrad.addColorStop(0.00, "#7a5400");
  ribbonGrad.addColorStop(0.12, "#B8860B");
  ribbonGrad.addColorStop(0.30, "#DAA520");
  ribbonGrad.addColorStop(0.50, "#FFD700");
  ribbonGrad.addColorStop(0.70, "#DAA520");
  ribbonGrad.addColorStop(0.88, "#B8860B");
  ribbonGrad.addColorStop(1.00, "#7a5400");

  // Ribbon path (slight arc curve for 3D feel)
  ctx.beginPath();
  ctx.moveTo(cx - ribbonW, ribbonCY - ribbonH * 0.3);
  ctx.quadraticCurveTo(cx, ribbonCY - ribbonH * 0.6, cx + ribbonW, ribbonCY - ribbonH * 0.3);
  ctx.lineTo(cx + ribbonW, ribbonCY + ribbonH * 0.7);
  ctx.quadraticCurveTo(cx, ribbonCY + ribbonH * 1.0, cx - ribbonW, ribbonCY + ribbonH * 0.7);
  ctx.closePath();
  ctx.fillStyle = ribbonGrad;
  ctx.fill();

  // Shadow under ribbon
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = ribbonH * 1.2;
  ctx.shadowOffsetY = ribbonH * 0.5;
  ctx.fill();

  // Ribbon text "Made In India"
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  const fontSize = Math.round(ribbonH * 0.95);
  ctx.font = `italic bold ${fontSize}px Georgia, serif`;
  ctx.fillStyle = "#3a2200";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Made In India", cx + ribbonW * 0.18, ribbonCY + ribbonH * 0.15);

  ctx.restore();
}
