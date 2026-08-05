import React from 'react';

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function SurvivalTimer({ timerRef }) {
  return (
    <div className="flex items-center gap-2 bg-white/90 border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm text-sm font-bold text-slate-700">
      <span className="text-emerald-600">Time:</span>
      <span ref={timerRef} className="font-mono text-slate-900">00:00</span>
    </div>
  );
}