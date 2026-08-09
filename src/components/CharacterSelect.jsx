import React, { useState, useEffect, useRef } from 'react';
import { CLASSES } from '../config/classes-config';
import ShapeGrid from './ShapeGrid';
import { renderPlayer } from '../entities/Player';

export default function CharacterSelect({ setGameState, startGame }) {
  const classesList = Object.values(CLASSES);
  const [selectedCharId, setSelectedCharId] = useState(classesList[0]?.id);
  const canvasRef = useRef(null);

  const selectedChar = CLASSES[selectedCharId];

  // Render the player on the canvas
  useEffect(() => {
    if (selectedChar && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mockPlayer = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 20,
        aimAngle: -Math.PI / 4,
      };
      renderPlayer(ctx, mockPlayer);
    }
  }, [selectedChar]);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-50 overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <ShapeGrid 
          shape="circle" 
          squareSize={60} 
          borderColor="#e2e8f0" 
          hoverFillColor="#cbd5e1" 
          speed={0.3} 
          direction="up" 
          hoverTrailAmount={3}
        />
      </div>

      <button 
        onClick={() => setGameState('MENU')}
        className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors z-20 font-bold tracking-widest uppercase text-xs"
      >
        <span>←</span> Back to Menu
      </button>

      {/* Main Container Split View */}
      <div className="relative z-10 w-full max-w-5xl h-[75vh] flex flex-row gap-6 px-6">
        
        {/* Left Side: Character Selection Grid */}
        <div className="w-1/2 flex flex-col h-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-md">
          <h2 className="text-xl font-black text-slate-800 tracking-wider mb-4">SELECT HERO</h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              {classesList.map(cls => {
                const isSelected = cls.id === selectedCharId;
                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedCharId(cls.id)}
                    className={`aspect-[2/3] flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 border-2 p-3 ${
                      isSelected 
                        ? 'bg-slate-100 border-slate-400 shadow-sm scale-105' 
                        : 'bg-slate-50 border-transparent hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex-1 w-full flex items-center justify-center mb-3 bg-white/50 rounded-xl overflow-hidden relative">
                      {cls.id === 'APPRENTICE' ? (
                        <img src="/sfx/apprentice/apprentice-banner.png" alt="Apprentice" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{cls.weapon === 'Wand' ? '🪄' : '⚔️'}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-end h-10 w-full">
                      <span className={`text-sm font-black uppercase tracking-wider text-center ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                        {cls.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {cls.weapon}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Character Details */}
        <div className="w-1/2 h-full bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden">
          {selectedChar ? (
            <>
              <div className="flex items-center gap-4 mb-4 z-10">
                <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <canvas ref={canvasRef} width={80} height={80} className="w-full h-full object-contain pointer-events-none" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 mb-1">{selectedChar.name}</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Weapon: {selectedChar.weapon}
                  </p>
                </div>
              </div>

              <div className="flex-1 z-10 flex flex-col gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> Health
                    </span>
                    <span className="text-slate-800 font-black text-sm">{selectedChar.maxHp} HP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg> Mana
                    </span>
                    <span className="text-slate-800 font-black text-sm">{selectedChar.maxMana} <span className="text-[10px] text-slate-500">({selectedChar.manaRegen}/s)</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Energy
                    </span>
                    <span className="text-slate-800 font-black text-sm">{selectedChar.maxEnergy} <span className="text-[10px] text-slate-500">({selectedChar.energyRegen}/s)</span></span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h4 className="text-slate-400 font-bold mb-3 pb-2 border-b border-slate-200 text-xs uppercase tracking-widest">Abilities</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-xs font-semibold text-slate-700">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-800 font-black rounded border border-slate-300 mr-3 text-[10px]">Q</span> 
                      {selectedChar.id === 'APPRENTICE' ? 'Teleport' : selectedChar.skills.Q?.name || 'Dash'}
                    </div>
                    {['E', 'F', 'C', 'X'].map(key => {
                      if (!selectedChar.skills[key]) return null;
                      return (
                        <div key={key} className="flex items-center text-xs font-semibold text-slate-700">
                          <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-800 font-black rounded border border-slate-300 mr-3 text-[10px]">{key}</span> 
                          {selectedChar.skills[key].name}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <div className="mt-4 z-10 pt-2 pb-2">
                <button 
                  onClick={() => startGame(selectedChar.id)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-[0.2em] text-sm rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  Begin
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 font-bold tracking-widest uppercase">
              Select a Hero
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
