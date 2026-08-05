import React from 'react';
import { getExpForNextLevel } from '../config/exp-config';

export function updateExpMagnet({ orb, player, dt, playerState, hpBarRef, hpTextRef, expRef, expBarRef, levelRef, levelUpEffects, expOrbs, index, onLevelUp }) {
  const dx = player.x - orb.x;
  const dy = player.y - orb.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= player.magnetRange) {
    orb.speed = Math.min(550, orb.speed + 900 * dt);
    orb.x += (dx / dist) * orb.speed * dt;
    orb.y += (dy / dist) * orb.speed * dt;
  }

  if (dist < player.radius + orb.radius) {
    playerState.exp += orb.value;

    let neededExp = getExpForNextLevel(playerState.level);
    while (playerState.exp >= neededExp) {
      playerState.exp -= neededExp;
      playerState.level += 1;

      // Notify App.jsx so it can pause and show cards
      if (typeof onLevelUp === 'function') {
        onLevelUp();
      }

      // Trigger Level-Up Particle Burst around player
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24;
        const speed = 120 + Math.random() * 180;
        levelUpEffects.push({
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 3 + Math.random() * 3,
          alpha: 1.0,
          lifetime: 0.8,
        });
      }

      neededExp = getExpForNextLevel(playerState.level);
    }

    if (levelRef.current) levelRef.current.textContent = `LVL ${playerState.level}`;
    if (expRef.current) expRef.current.textContent = `${playerState.exp} / ${neededExp} EXP`;
    if (expBarRef.current) {
      const pct = Math.min(100, (playerState.exp / neededExp) * 100);
      expBarRef.current.style.width = `${pct}%`;
    }

    expOrbs.splice(index, 1);
  }
}

export default function CountExp({ levelRef, expRef, expBarRef }) {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-96 max-w-[90vw] pointer-events-none">
      <div className="bg-white/90 border border-slate-200 p-2.5 rounded-xl shadow-lg backdrop-blur-md flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs font-bold px-1">
          <span ref={levelRef} className="text-sky-600 tracking-wider">LVL 1</span>
          <span ref={expRef} className="font-mono text-slate-600">0 / 10 EXP</span>
        </div>
        
        {/* White Track with Pure Blue Progress Gradient */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
          <div
            ref={expBarRef}
            className="bg-gradient-to-r from-sky-400 to-blue-600 h-full transition-all duration-100 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            style={{ width: '0%' }}
          />
        </div>
      </div>
    </div>
  );
}