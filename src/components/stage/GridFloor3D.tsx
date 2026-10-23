import React from 'react';

export const GridFloor3D: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-44 overflow-hidden pointer-events-none z-0">
      {/* Horizon glow bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent opacity-80 blur-sm shadow-[0_0_20px_#38BDF8]" />
      
      {/* Cyan gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#38BDF8]/20 to-transparent blur-md" />

      {/* 3D Perspective Grid */}
      <div 
        className="w-[140%] -left-[20%] h-full relative"
        style={{
          perspective: '450px',
          perspectiveOrigin: '50% 0%'
        }}
      >
        <div 
          className="w-full h-[350px] absolute -top-10 left-0"
          style={{
            transform: 'rotateX(72deg)',
            transformOrigin: '50% 0%',
            backgroundImage: `
              linear-gradient(to right, rgba(72, 240, 232, 0.45) 1.5px, transparent 1.5px),
              linear-gradient(to bottom, rgba(72, 240, 232, 0.45) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '45px 35px'
          }}
        />
      </div>

      {/* Dark Vignette to ground the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
    </div>
  );
};
