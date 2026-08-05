import React from 'react';

export default function PlayerHpbar({ hpTextRef, hpBarRef }) {
  return (
    <div className="w-56 bg-white/90 border border-slate-300 p-2 rounded-lg shadow-sm backdrop-blur-sm">
      <div className="flex justify-between text-xs text-slate-700 font-bold mb-1">
        <span>HP</span>
        <span ref={hpTextRef}>100 / 100</span>
      </div>
      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
        <div
          ref={hpBarRef}
          className="bg-emerald-500 h-full transition-all duration-75"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}