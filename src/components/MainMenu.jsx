import React from 'react';

export default function MainMenu({ setGameState }) {
  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
      <div className="text-center mb-16 animate-pulse">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tighter drop-shadow-2xl">
          WANDERSHOT
        </h1>
        <p className="text-slate-400 mt-2 text-xl tracking-widest uppercase font-semibold">
          Survival RPG
        </p>
      </div>

      <div className="flex flex-col gap-6 w-64">
        <button 
          onClick={() => setGameState('CHARACTER_SELECT')}
          className="group relative px-8 py-4 bg-slate-800 hover:bg-slate-700 overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 border border-slate-600 hover:border-indigo-400 shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative text-xl font-bold text-slate-200 group-hover:text-white uppercase tracking-wider">
            Play
          </span>
        </button>

        <button 
          onClick={() => setGameState('ALMANAC')}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-300 hover:scale-105 border border-slate-600 hover:border-slate-400 shadow-lg cursor-pointer"
        >
          <span className="text-lg font-bold text-slate-300 uppercase tracking-wider">
            Almanac
          </span>
        </button>

        <button 
          onClick={() => setGameState('CREDITS')}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-300 hover:scale-105 border border-slate-600 hover:border-slate-400 shadow-lg cursor-pointer"
        >
          <span className="text-lg font-bold text-slate-300 uppercase tracking-wider">
            Credits
          </span>
        </button>
      </div>
    </div>
  );
}
