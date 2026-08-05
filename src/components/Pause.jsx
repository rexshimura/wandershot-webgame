import React from 'react';

export default function Pause({ isPaused, isGameOver }) {
  if (!isPaused || isGameOver) return null;

  return (
    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs flex flex-col items-center justify-center text-slate-800 z-20 pointer-events-none">
      <h2 className="text-4xl font-extrabold tracking-widest text-slate-900 mb-2">PAUSED</h2>
      <p className="text-slate-700 text-sm font-medium">Press [TAB] to resume Wandershot</p>
    </div>
  );
}