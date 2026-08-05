export default function App() {
  return (
    <div className="relative w-screen h-screen bg-slate-950 text-white select-none overflow-hidden">
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-2xl font-extrabold tracking-wider text-cyan-400 drop-shadow">
          WANDERSHOT
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          WASD / Arrows to move • Auto-targeting air bullets enabled
        </p>
      </div>

      {/* Fullscreen Game Viewport */}
      <div className="w-full h-full bg-slate-900 border-0 relative overflow-hidden">
        <span className="absolute inset-0 flex items-center justify-center text-slate-600 font-mono text-sm tracking-widest uppercase pointer-events-none">
          [ Wandershot Fullscreen Canvas Engine ]
        </span>
      </div>
    </div>
  );
}