import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Credits() {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <span>←</span> Back to Menu
      </button>

      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 tracking-wider">
          CREDITS
        </h2>
      </div>

      <div className="flex flex-col gap-8 w-full max-w-2xl px-8 items-center text-center">
        <div>
          <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">Created By</h3>
          <p className="text-3xl font-black text-white">Rexshimura</p>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">Game Engine</h3>
          <p className="text-2xl font-bold text-slate-200">React & HTML5 Canvas</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">Art & Assets</h3>
          <p className="text-2xl font-bold text-slate-200">Placeholder / Pending</p>
        </div>
      </div>
    </div>
  );
}
