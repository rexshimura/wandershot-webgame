export function drawPlayerWeapon(ctx, aimAngle) {
  ctx.save();
  ctx.rotate(aimAngle);

  // Wand Shaft
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(22, 0);
  ctx.stroke();

  // Wand Gem
  ctx.beginPath();
  ctx.arc(22, 0, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0284c7';
  ctx.fill();

  ctx.restore();
}