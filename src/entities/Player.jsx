import { drawPlayerWeapon } from '../components/PlayerWeapon';

export function renderPlayer(ctx, player) {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Outer Robe
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#6366f1';
  ctx.fill();

  // Inner Tunic
  ctx.beginPath();
  ctx.arc(0, 0, player.radius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#e0e7ff';
  ctx.fill();

  // Render Aimed Wand
  drawPlayerWeapon(ctx, player.aimAngle);

  ctx.restore();
}