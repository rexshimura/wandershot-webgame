import React from 'react';
import { CLASSES } from '../config/classes-config';

export default function CharacterSelect({ setGameState, startGame }) {
  const classes = Object.values(CLASSES);

  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <button 
        onClick={() => setGameState('MENU')}
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <span>←</span> Back to Menu
      </button>

      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400 tracking-wider">
          CHOOSE YOUR CLASS
        </h2>
        <p className="text-slate-400 mt-4 text-lg">Select a hero to brave the darkness</p>
      </div>

      <div className="flex gap-8 items-stretch justify-center max-w-5xl w-full px-8">
        {classes.map((cls) => (
          <div 
            key={cls.id}
            onClick={() => startGame(cls.id)}
            className="flex-1 bg-slate-900 border-2 border-slate-700 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800 cursor-pointer group shadow-2xl relative overflow-hidden"
          >
            {/* Background glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-indigo-400 flex items-center justify-center mb-6 shadow-inner z-10">
              <span className="text-4xl">{cls.weapon === 'Wand' ? '🪄' : '⚔️'}</span>
            </div>
            
            <h3 className="text-3xl font-bold text-slate-200 group-hover:text-indigo-300 mb-2 z-10">{cls.name}</h3>
            <p className="text-indigo-400/80 font-semibold mb-6 uppercase tracking-widest text-sm z-10">Weapon: {cls.weapon}</p>
            
            <div className="w-full bg-slate-950/50 rounded-xl p-4 flex flex-col gap-2 z-10 border border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Health</span>
                <span className="text-rose-400 font-bold">{cls.maxHp}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Mana</span>
                <span className="text-blue-400 font-bold">{cls.maxMana} ({cls.manaRegen}/s)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Energy</span>
                <span className="text-amber-400 font-bold">{cls.maxEnergy} ({cls.energyRegen}/s)</span>
              </div>
            </div>

            <div className="w-full mt-6 z-10">
              <h4 className="text-slate-300 font-semibold mb-3 border-b border-slate-700 pb-2 text-sm uppercase tracking-wider">Skills</h4>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400"><span className="text-white font-mono bg-slate-700 px-1 rounded text-xs mr-2">E</span> {cls.skills.E.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400"><span className="text-white font-mono bg-slate-700 px-1 rounded text-xs mr-2">C</span> {cls.skills.C.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400"><span className="text-white font-mono bg-slate-700 px-1 rounded text-xs mr-2">X</span> {cls.skills.X.name}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
