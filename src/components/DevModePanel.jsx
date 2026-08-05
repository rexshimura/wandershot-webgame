import React, { useState, useEffect } from 'react';

export default function DevModePanel({ playerRef, isVisible, hpTextRef, hpBarRef }) {
  const [stats, setStats] = useState(null);

  // Poll player stats for the dev UI every 500ms since playerRef doesn't trigger React renders
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      if (playerRef.current) {
        setStats({
          spreadshot: playerRef.current.spreadshot || 0,
          multishot: playerRef.current.multishot || 0,
          pierce: playerRef.current.pierce || 0,
          bounce: playerRef.current.bounce || 0,
          trace: playerRef.current.trace || 0,
          bulletRadius: playerRef.current.bulletRadius || 6,
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isVisible, playerRef]);

  if (!isVisible || !stats) return null;

  const updateStat = (key, delta) => {
    if (playerRef.current) {
      playerRef.current[key] = Math.max(0, (playerRef.current[key] || 0) + delta);
      // Force UI update immediately for snappiness
      setStats(prev => ({
        ...prev,
        [key]: playerRef.current[key]
      }));
    }
  };

  const healPlayer = () => {
    if (playerRef.current) {
      playerRef.current.hp = playerRef.current.maxHp;
      if (hpTextRef.current) hpTextRef.current.textContent = `${playerRef.current.hp} / ${playerRef.current.maxHp}`;
      if (hpBarRef.current) hpBarRef.current.style.width = '100%';
    }
  };

  const renderRow = (label, statKey, step = 1) => (
    <div key={statKey} className="flex justify-between items-center mb-2 bg-slate-800/50 p-2 rounded-lg">
      <span className="text-slate-300 text-sm font-semibold w-24">{label}</span>
      <div className="flex items-center gap-2">
        <button 
          onPointerDown={() => updateStat(statKey, -step)}
          className="w-6 h-6 bg-red-900/50 hover:bg-red-800 text-red-200 rounded flex items-center justify-center font-bold pointer-events-auto cursor-pointer"
        >-</button>
        <span className="text-white font-mono w-6 text-center">{stats[statKey]}</span>
        <button 
          onPointerDown={() => updateStat(statKey, step)}
          className="w-6 h-6 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 rounded flex items-center justify-center font-bold pointer-events-auto cursor-pointer"
        >+</button>
      </div>
    </div>
  );

  return (
    <div className="absolute right-4 top-24 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl z-[100] pointer-events-auto">
      <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
        <h3 className="text-sky-400 font-black tracking-wide">DEV MODE</h3>
        <span className="text-[10px] text-slate-500 font-mono">PRESS ~ TO HIDE</span>
      </div>

      <div className="flex flex-col gap-1">
        {renderRow("Spreadshot", "spreadshot")}
        {renderRow("Multishot", "multishot")}
        {renderRow("Trace", "trace")}
        {renderRow("Pierce", "pierce")}
        {renderRow("Bounce", "bounce")}
        {renderRow("Bullet Size", "bulletRadius", 3)}
      </div>

      <button 
        onClick={healPlayer}
        className="w-full mt-4 py-2 bg-rose-900/50 hover:bg-rose-800 text-rose-200 font-bold rounded-lg pointer-events-auto cursor-pointer transition-colors border border-rose-700/50"
      >
        FULL HEAL
      </button>
    </div>
  );
}
