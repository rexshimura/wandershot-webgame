import React from 'react';

export default function CountScore({ scoreRef }) {
  return (
    <div className="flex items-center gap-2 bg-white/90 border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm text-sm font-bold text-slate-700">
      <span className="text-sky-600">Score:</span>
      <span ref={scoreRef} className="font-mono text-slate-900">0</span>
    </div>
  );
}