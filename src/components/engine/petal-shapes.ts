export type PetalShape =
  | 'sakura'
  | 'rose'
  | 'dust'
  | 'snow'
  | 'snowflake'
  | 'heart'
  | 'star';

/**
 * Bentuk kelopak digambar sebagai path canvas, bukan emoji.
 * Alasannya: emoji dirender berbeda di tiap OS dan tidak bisa diwarnai —
 * path bisa mengambil warna dari token tema, jadi konsisten di semua device.
 */
export function drawPetal(
  ctx: CanvasRenderingContext2D,
  shape: PetalShape,
  size: number,
  color: string,
): void {
  ctx.fillStyle = color;

  switch (shape) {
    case 'sakura':
      drawSakura(ctx, size);
      break;
    case 'rose':
      drawRose(ctx, size);
      break;
    case 'dust':
    case 'snow':
      drawDust(ctx, size, color);
      break;
    case 'snowflake':
      drawSnowflake(ctx, size, color);
      break;
    case 'heart':
      drawHeart(ctx, size);
      break;
    case 'star':
      drawStar(ctx, size, color);
      break;
  }
}

/** Kelopak sakura: ujung berlekuk, pangkal meruncing. */
function drawSakura(ctx: CanvasRenderingContext2D, s: number): void {
  const w = s * 0.62;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.5);
  ctx.bezierCurveTo(-w, s * 0.16, -w * 0.92, -s * 0.42, 0, -s * 0.5);
  ctx.bezierCurveTo(w * 0.92, -s * 0.42, w, s * 0.16, 0, s * 0.5);
  ctx.closePath();
  ctx.fill();

  // Belahan kecil di ujung — ciri khas kelopak sakura
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.quadraticCurveTo(0, -s * 0.3, 0, -s * 0.14);
  ctx.lineWidth = s * 0.1;
  ctx.strokeStyle = 'rgba(0,0,0,1)';
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
}

/** Kelopak mawar: lebih bulat dan menggulung di satu sisi. */
function drawRose(ctx: CanvasRenderingContext2D, s: number): void {
  const w = s * 0.72;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.46);
  ctx.bezierCurveTo(-w, s * 0.3, -w * 1.05, -s * 0.36, -s * 0.08, -s * 0.48);
  ctx.bezierCurveTo(w * 0.85, -s * 0.4, w * 0.78, s * 0.24, 0, s * 0.46);
  ctx.closePath();
  ctx.fill();
}

/** Debu cahaya: titik lembut dengan halo. */
function drawDust(ctx: CanvasRenderingContext2D, s: number, color: string): void {
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, s, 0, Math.PI * 2);
  ctx.fill();
}

/** Kristal salju enam lengan dengan cabang kecil. */
function drawSnowflake(ctx: CanvasRenderingContext2D, s: number, color: string): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(0.8, s * 0.09);
  ctx.lineCap = 'round';
  const arm = s * 0.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((Math.PI / 3) * i);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -arm);
    ctx.moveTo(0, -arm * 0.55);
    ctx.lineTo(arm * 0.28, -arm * 0.8);
    ctx.moveTo(0, -arm * 0.55);
    ctx.lineTo(-arm * 0.28, -arm * 0.8);
    ctx.restore();
  }
  ctx.stroke();
}

/** Hati: dua lengkung bertemu di satu titik. */
function drawHeart(ctx: CanvasRenderingContext2D, s: number): void {
  const h = s * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.9);
  ctx.bezierCurveTo(-h * 1.5, h * 0.1, -h * 1.1, -h, 0, -h * 0.35);
  ctx.bezierCurveTo(h * 1.1, -h, h * 1.5, h * 0.1, 0, h * 0.9);
  ctx.closePath();
  ctx.fill();
}

/** Kilau empat sudut dengan halo lembut. */
function drawStar(ctx: CanvasRenderingContext2D, s: number, color: string): void {
  drawDust(ctx, s * 1.6, color);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.6);
  ctx.quadraticCurveTo(0, 0, s * 1.6, 0);
  ctx.quadraticCurveTo(0, 0, 0, s * 1.6);
  ctx.quadraticCurveTo(0, 0, -s * 1.6, 0);
  ctx.quadraticCurveTo(0, 0, 0, -s * 1.6);
  ctx.fill();
}
