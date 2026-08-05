export function renderMinimap(ctx, canvas, WORLD_WIDTH, WORLD_HEIGHT, enemies, player) {
  const mmSize = 140;
  const mmPadding = 16;
  const mmX = canvas.width - mmSize - mmPadding;
  const mmY = canvas.height - mmSize - mmPadding;
  const scaleX = mmSize / WORLD_WIDTH;
  const scaleY = mmSize / WORLD_HEIGHT;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(mmX, mmY, mmSize, mmSize);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.strokeRect(mmX, mmY, mmSize, mmSize);

  // Enemies
  ctx.fillStyle = '#ef4444';
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    ctx.beginPath();
    ctx.arc(mmX + enemy.x * scaleX, mmY + enemy.y * scaleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(mmX + player.x * scaleX, mmY + player.y * scaleY, 3.5, 0, Math.PI * 2);
  ctx.fill();
}