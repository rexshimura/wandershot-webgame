import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENEMY_TYPES } from '../config/enemies-config';

export default function Almanac() {
  const navigate = useNavigate();
  const enemiesList = Object.values(ENEMY_TYPES);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [showSizeDiff, setShowSizeDiff] = useState(false);

  // When closing the modal, reset the size diff state
  const handleClose = () => {
    setSelectedEnemy(null);
    setShowSizeDiff(false);
  };

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center pt-20 pb-10 px-8 z-50">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors z-10 font-bold tracking-widest uppercase text-xs"
      >
        <span>←</span> Back to Menu
      </button>

      {/* Header */}
      <div className="text-center mb-10 shrink-0">
        <h2 className="text-5xl font-black text-slate-800 tracking-wider">
          ALMANAC
        </h2>
        <p className="text-slate-500 mt-2 text-sm font-bold tracking-widest uppercase">Creatures of the Abyss</p>
      </div>

      {/* Grid of Enemy Cards */}
      <div className="w-full max-w-5xl z-10 overflow-y-auto custom-scrollbar flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
          {enemiesList.map(enemy => (
            <div 
              key={enemy.name} 
              onClick={() => setSelectedEnemy(enemy)}
              className="group relative bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer aspect-square overflow-hidden flex items-center justify-center"
            >
              <img 
                src={enemy.spriteSrc} 
                alt={enemy.name} 
                className="rendering-pixelated object-contain w-32 h-32 scale-150 group-hover:scale-125 transition-transform duration-300"
              />
              
              {/* Hover Name Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <span className="text-white font-black text-lg tracking-wider text-center drop-shadow-md">{enemy.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup Modal */}
      {selectedEnemy && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 max-w-3xl w-full relative flex flex-row animate-in fade-in zoom-in duration-200 gap-8">
            
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 z-10"
            >
              ✕
            </button>

            {/* Left Side: Image / Size Comparison */}
            <div 
              className="w-1/2 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-200 relative overflow-hidden shadow-inner min-h-[300px]"
              style={{
                backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: 'center center'
              }}
            >
               {!showSizeDiff ? (
                 <img 
                    src={selectedEnemy.spriteSrc} 
                    alt={selectedEnemy.name} 
                    className="rendering-pixelated object-contain max-w-[60%] max-h-[60%] drop-shadow-xl"
                  />
               ) : (
                 <div className="flex flex-row items-end justify-center gap-12">
                    {/* Apprentice Representation (20 radius = 40px diameter) */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-[40px] h-[40px] rounded-full bg-indigo-500 border-4 border-indigo-200 flex items-center justify-center shadow-md relative">
                        {/* Inner Tunic Mock */}
                        <div className="w-[20px] h-[20px] rounded-full bg-indigo-100 absolute"></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 bg-white/80 px-2 py-1 rounded-md">Apprentice</span>
                    </div>

                    {/* Enemy Representation */}
                    <div className="flex flex-col items-center gap-2">
                      <img 
                        src={selectedEnemy.spriteSrc} 
                        alt={selectedEnemy.name} 
                        className="rendering-pixelated object-contain drop-shadow-md"
                        style={{
                          width: `${selectedEnemy.radius * selectedEnemy.spriteScale * 2}px`,
                          height: `${selectedEnemy.radius * selectedEnemy.spriteScale * 2}px`
                        }}
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 bg-white/80 px-2 py-1 rounded-md">{selectedEnemy.name}</span>
                    </div>
                 </div>
               )}
            </div>
            
            {/* Right Side: Details */}
            <div className="w-1/2 flex flex-col justify-center">
              <h3 className="text-4xl font-black text-slate-800 tracking-wide mb-6">{selectedEnemy.name}</h3>
              
              <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Health
                  </span>
                  <span className="text-slate-800 font-black text-lg">{selectedEnemy.maxHp} HP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> Speed
                  </span>
                  <span className="text-slate-800 font-black text-lg">{selectedEnemy.speed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Damage
                  </span>
                  <span className="text-slate-800 font-black text-lg">{selectedEnemy.contactDamage}</span>
                </div>
              </div>

              {/* Toggle Size Difference Button */}
              <button 
                onClick={() => setShowSizeDiff(!showSizeDiff)}
                className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors border-2 ${
                  showSizeDiff 
                  ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {showSizeDiff ? 'Hide Size Comparison' : 'Compare Size to Hero'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
