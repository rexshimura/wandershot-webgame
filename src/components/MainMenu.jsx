import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Waves from './Waves';
import OptionWheel from './OptionWheel';
import DepthText from './DepthText';

const MENU_ITEMS = ['Play', 'Almanac', 'Credits'];
const MENU_ROUTES = ['/play/select', '/almanac', '/credits'];

export default function MainMenu() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelectionChange = (index, value) => {
    setSelectedIndex(index);
  };

  const handleItemSelect = (index, value) => {
    navigate(MENU_ROUTES[index]);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-white overflow-hidden">
      {/* Background Component */}
      <div className="absolute inset-0 z-0">
        <Waves 
          lineColor="rgba(148, 163, 184, 0.2)" 
          backgroundColor="transparent" 
          waveSpeedX={0.02} 
          waveSpeedY={0.01} 
          waveAmpX={40} 
          waveAmpY={20} 
          friction={0.9} 
          tension={0.01} 
          maxCursorMove={120} 
          xGap={12} 
          yGap={36} 
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full flex flex-row items-center">
        
        {/* Left Side: Interactive Option Wheel */}
        <div className="w-1/2 h-full relative flex items-center justify-center">
          {/* Wheel Container */}
          <div className="w-full h-[600px] relative pl-32">
            <OptionWheel 
              items={MENU_ITEMS} 
              defaultSelected={0} 
              onChange={handleSelectionChange}
              onItemSelect={handleItemSelect}
              textColor="#94a3b8" 
              activeColor="#0f172a" 
              side="left" 
              fontSize={4.5} 
              spacing={1.8} 
              tilt={0} 
              curve={0.5}
              blur={1}
            />
          </div>
        </div>

        {/* Right Side: Title & Branding */}
        <div className="w-1/2 h-full flex flex-col justify-center pr-32 text-right items-end">
          <div className="mb-4">
            <DepthText 
              text="WANDERSHOT" 
              layers={34} 
              depth={2.4} 
              faceColor="#0f172a" 
              depthColor="#64748b" 
              tilt={7.5} 
              pointerTracking={true} 
              fontSize="clamp(3rem, 8vw, 6rem)"
            />
            <p className="text-slate-400 mt-2 text-2xl tracking-[0.3em] uppercase font-bold pr-2">
              Survival RPG
            </p>
          </div>
          <p className="text-slate-500 max-w-md mt-6 text-lg pr-2 leading-relaxed">
            Survive the darkness. Master the arcane arts. Become the ultimate Wandershot.
          </p>
          <div className="mt-8 pr-2">
            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase animate-bounce">Click selected to enter</p>
          </div>
        </div>

      </div>
    </div>
  );
}
