import React, { useState, useEffect } from 'react';
import { ENEMY_TYPES } from '../config/enemies-config';

export default function DevModePanel({ devActionsRef, isVisible }) {
  const [playerState, setPlayerState] = useState({ level: 1, exp: 0 });

  useEffect(() => {
    if (!isVisible) return;
    const refresh = () => {
      if (devActionsRef.current?.getPlayerState) {
        setPlayerState(devActionsRef.current.getPlayerState());
      }
    };
    refresh();
    const interval = setInterval(refresh, 300);
    return () => clearInterval(interval);
  }, [isVisible, devActionsRef]);

  if (!isVisible) return null;

  const actions = devActionsRef.current;

  const enemyTypes = Object.entries(ENEMY_TYPES);

  return (
    <div className="absolute left-4 top-24 w-72 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl z-[100] pointer-events-auto">
      <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
        <h3 className="text-amber-400 font-black tracking-wide">DEV MODE</h3>
        <span className="text-[10px] text-slate-500 font-mono">ALT+P</span>
      </div>

      <div className="mb-4 bg-slate-800/50 rounded-lg p-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-semibold">Level</span>
          <span className="text-sky-400 font-black font-mono">LVL {playerState.level}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-slate-400 font-semibold">EXP</span>
          <span className="text-slate-300 font-mono text-xs">{playerState.exp} / {playerState.neededExp}</span>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Player</p>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => actions.levelUp?.()}
          className="flex-1 py-2 bg-sky-900/60 hover:bg-sky-800 text-sky-200 font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer transition-colors border border-sky-700/50"
        >
          Level Up
        </button>
        <button
          onClick={() => actions.reset?.()}
          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer transition-colors border border-slate-600/50"
        >
          Reset
        </button>
      </div>

      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Spawn Enemy</p>
      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
        {enemyTypes.map(([key, type]) => (
          <button
            key={key}
            onClick={() => actions.spawnEnemy?.(key)}
            className="flex justify-between items-center py-2 px-3 bg-slate-800/60 hover:bg-rose-900/40 text-slate-200 rounded-lg text-sm font-semibold cursor-pointer transition-colors border border-slate-700/50 hover:border-rose-700/50"
          >
            <span>{type.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">{type.maxHp} HP</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => actions.clearEnemies?.()}
        className="w-full mt-3 py-2 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer transition-colors border border-rose-800/40"
      >
        Clear All Enemies
      </button>
    </div>
  );
}
