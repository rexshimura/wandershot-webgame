import React from 'react';

export default function FramerateCounter({ fpsRef }) {
  return (
    <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
      <div className="bg-slate-900/80 text-emerald-400 font-mono text-xs font-bold px-2.5 py-1 rounded border border-slate-700 shadow-md">
        <span ref={fpsRef}>60 FPS</span>
      </div>
    </div>
  );
}