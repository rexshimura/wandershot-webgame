import React from 'react';

export default function LevelUpOverlay({ cards, onSelectCard, onSkip }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center z-40">
      <div className="text-center mb-8 animate-bounce">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-500 tracking-wider">
          LEVEL UP!
        </h2>
        <p className="text-slate-300 mt-2 text-lg">Choose your upgrade</p>
      </div>

      <div className="flex flex-row gap-6 items-stretch">
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => onSelectCard(card)}
            className="w-64 bg-slate-800 border-2 border-slate-600 hover:border-sky-400 hover:bg-slate-700 rounded-2xl p-6 flex flex-col items-center text-center transition-all transform hover:scale-105 shadow-xl group cursor-pointer"
          >
            <div className="w-16 h-16 bg-slate-700 group-hover:bg-sky-900 rounded-full flex items-center justify-center mb-4 transition-colors">
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-sky-300 transition-colors">
              {card.name}
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              {card.description}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={onSkip}
        className="mt-12 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-full transition-colors border border-slate-600 cursor-pointer shadow-lg"
      >
        Skip for now
      </button>
    </div>
  );
}
