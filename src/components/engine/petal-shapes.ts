export type PetalShape = 'sakura' | 'rose' | 'dust';

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
      drawDust(ctx, size, color);
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
