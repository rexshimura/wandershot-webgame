import React from 'react';
import { CLASSES } from '../config/classes-config';

export default function SkillHUD({ selectedClass, cdRefs }) {
  const classConfig = CLASSES[selectedClass];
  if (!classConfig) return null;
  
  const skills = classConfig.skills;
  const keys = ['Q', 'E', 'F', 'C', 'X'];

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-none z-10">
      {keys.map(key => {
        const skill = skills[key];
        if (!skill) return null;
        
        return (
          <div key={key} className="relative w-14 h-14 bg-white/90 border-2 border-slate-300 rounded-lg flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm">
            <span className="text-slate-500 text-xs absolute top-1 left-1 font-black drop-shadow-sm z-20">{key}</span>
            <div className="text-slate-800 text-center z-20 mt-2 text-[10px] leading-tight px-1 font-bold">
              {skill.name}
            </div>
            
            {/* Cooldown Overlay */}
            <div 
              ref={cdRefs[key].overlay} 
              className="absolute bottom-0 left-0 w-full bg-slate-900/40 z-30 transition-all duration-100" 
              style={{ height: '0%' }} 
            />
            
            {/* Cooldown Number */}
            <div 
              ref={cdRefs[key].text} 
              className="absolute inset-0 flex items-center justify-center text-xl font-black text-white z-40 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
            >
            </div>
            {/* Custom Badge */}
            {cdRefs[key].badge && (
              <div
                ref={cdRefs[key].badge}
                className="absolute -top-1 -right-1 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow border-2 border-white z-50 hidden transition-colors"
              >
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
