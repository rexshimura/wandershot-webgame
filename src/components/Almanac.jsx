import React from 'react';

const ENEMIES = [
  { id: 'pitchling', name: 'Pitchling', hp: 20, desc: 'A small, fast creature born from the darkness.' },
  { id: 'pitchwalker', name: 'Pitchwalker', hp: 60, desc: 'A slow, lumbering beast that hits hard.' }
];

export default function Almanac({ setGameState }) {
  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <button 
        onClick={() => setGameState('MENU')}
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <span>←</span> Back to Menu
      </button>

      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-wider">
          ALMANAC
        </h2>
        <p className="text-slate-400 mt-4 text-lg">Creatures of the Abyss</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-2xl px-8">
        {ENEMIES.map(enemy => (
          <div key={enemy.id} className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-600">
              <span className="text-2xl">👾</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-200">{enemy.name}</h3>
              <p className="text-slate-400 mt-1">{enemy.desc}</p>
              <div className="mt-2 text-rose-400 text-sm font-bold">HP: {enemy.hp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
