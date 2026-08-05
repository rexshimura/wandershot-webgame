import React from 'react';

// Helper function handling magnet drift and pickup logic
export function updateCoinMagnet({ coin, player, dt, stats, coinsRef, droppedCoins, index }) {
  const dx = player.x - coin.x;
  const dy = player.y - coin.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= player.magnetRange) {
    coin.speed = Math.min(500, coin.speed + 800 * dt);
    coin.x += (dx / dist) * coin.speed * dt;
    coin.y += (dy / dist) * coin.speed * dt;
  }

  if (dist < player.radius + coin.radius) {
    stats.coins += 1;
    if (coinsRef.current) coinsRef.current.textContent = stats.coins;
    droppedCoins.splice(index, 1);
  }
}

export default function CountCoins({ coinsRef }) {
  return (
    <div className="flex items-center gap-2 bg-white/90 border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm text-sm font-bold text-slate-700">
      <span className="text-amber-500">Coins:</span>
      <span ref={coinsRef} className="font-mono text-slate-900">0</span>
    </div>
  );
}