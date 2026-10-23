import React from 'react';
import type { StageConfig } from '../../types';

interface StageHeaderProps {
  stageConfig: StageConfig;
}

export const StageHeader: React.FC<StageHeaderProps> = ({ stageConfig }) => {
  const getCategoryBadge = () => {
    switch (stageConfig.active_category_view) {
      case 'mahasiswa_umum':
        return {
          icon: '🎓',
          label: 'KATEGORI MAHASISWA UMUM',
          badgeClass: 'from-blue-700 to-blue-600 border-blue-400/50'
        };
      case 'siswa_sma':
        return {
          icon: '🏫',
          label: 'KATEGORI SISWA SMA / SEDERAJAT',
          badgeClass: 'from-amber-600 to-amber-500 border-amber-300/50'
        };
      case 'dual':
        return {
          icon: '⚡',
          label: 'MODE DUAL ARENA (MAHASISWA & SMA)',
          badgeClass: 'from-purple-700 to-indigo-600 border-purple-400/50'
        };
      default:
        return {
          icon: '🏆',
          label: 'LOMBA CERDAS CERMAT',
          badgeClass: 'from-blue-700 to-blue-600 border-blue-400/50'
        };
    }
  };

  const badge = getCategoryBadge();

  return (
    <header className="relative w-full max-w-[100vw] overflow-x-hidden z-20 flex flex-col items-center justify-start pt-2 sm:pt-3 pb-1 select-none px-2">
      {/* 1. White Frosted Sponsor / Organizer Pill */}
      <div className="bg-white/95 backdrop-blur-md px-2.5 sm:px-6 py-1 sm:py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-white/80 flex items-center space-x-1.5 sm:space-x-4 max-w-[92vw] overflow-x-auto no-scrollbar shrink-0">
        {/* Logo 1: Pemkot Pontianak */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[7px] sm:text-[9px] font-black text-white shadow-sm ring-1 ring-emerald-700">
            PTK
          </div>
          <span className="text-[8px] sm:text-[11px] font-extrabold text-slate-800 tracking-wider">
            <span className="sm:hidden">PEMKOT</span>
            <span className="hidden sm:inline">PEMKOT PONTIANAK</span>
          </span>
        </div>

        <div className="w-0.5 h-2.5 sm:h-3 bg-slate-300 rounded-full shrink-0" />

        {/* Logo 2: Disporapar */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 flex items-center justify-center text-[7px] sm:text-[9px] font-black text-white shadow-sm ring-1 ring-blue-700">
            DSP
          </div>
          <span className="text-[8px] sm:text-[11px] font-extrabold text-slate-800 tracking-wider">
            DISPORAPAR
          </span>
        </div>

        <div className="w-0.5 h-2.5 sm:h-3 bg-slate-300 rounded-full shrink-0" />

        {/* Logo 3: HUT 255 Pontianak */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          <span className="text-[8px] sm:text-[11px] font-black text-amber-500 whitespace-nowrap">
            HUT 255
          </span>
          <span className="hidden sm:inline text-[9px] sm:text-[10px] font-semibold text-slate-600 whitespace-nowrap">
            Tangguh Bersahabat
          </span>
        </div>

        <div className="w-0.5 h-2.5 sm:h-3 bg-slate-300 rounded-full shrink-0" />

        {/* Logo 4: Raja CreArt */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-purple-700 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-yellow-300 shadow-sm">
            RCA
          </div>
          <span className="text-[8px] sm:text-[11px] font-extrabold text-purple-900 tracking-wider whitespace-nowrap">
            RAJA CREART
          </span>
        </div>
      </div>

      {/* 2. Main Title (Two lines, 3D Embossed White-Blue Typography) */}
      <div className="flex flex-col items-center leading-none mt-1 sm:mt-2.5 text-center px-1 max-w-[94vw]">
        <h1 className="text-base sm:text-2xl md:text-3xl lg:text-[40px] font-black tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-50 to-blue-200 drop-shadow-[0_4px_12px_rgba(30,64,175,0.7)] filter">
          LOMBA CERDAS CERMAT
        </h1>
        <h2 className="text-base sm:text-2xl md:text-3xl lg:text-[40px] font-black tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-50 to-blue-200 drop-shadow-[0_4px_12px_rgba(30,64,175,0.7)] filter mt-0.5 sm:mt-1">
          PEMUDA KOTA PONTIANAK 2026
        </h2>
      </div>

      {/* 3. Golden Laurel Wreath Ribbon (Babak Aktif) */}
      <div className="mt-1 sm:mt-2.5 flex items-center justify-center space-x-1 sm:space-x-2.5 max-w-[94vw]">
        {/* Left Golden Laurel Leaves SVG */}
        <svg
          className="w-4 h-4 sm:w-8 sm:h-10 text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.75)] shrink-0"
          viewBox="0 0 32 32"
          fill="currentColor"
        >
          <path d="M12.5 3.5C13.8 6 13.9 9 12.8 11.5c-.7 1.3-1.8 2.3-3.1 3-.7-1.3-1-2.8-1-4.2C8.7 7.2 10.1 4.8 12.5 3.5zm6.8 6.5c1.4 2.5 1.7 5.5 1 8.2-.4 1.3-1.2 2.5-2.2 3.3-1-1.1-1.6-2.5-1.7-4-.3-2.8.5-5.6 2.9-7.5zm-9.8 8.8c2.4 1.2 4.1 3.4 4.7 6 .3 1.3 0 2.6-.7 3.7-1.1-.8-2-1.9-2.7-3.2-1-2.1-1.2-4.4-1.3-6.5zm14.5 3.5c.8 2.5.5 5.3-.7 7.6-.5 1.1-1.5 2.1-2.5 2.7-.5-1.3-.7-2.8-.4-4.2.3-2.5 1.5-4.8 3.6-6.1z" />
        </svg>

        {/* Gold Ribbon Capsule */}
        <div className="px-3 sm:px-8 md:px-10 py-0.5 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 shadow-[0_4px_22px_rgba(245,158,11,0.6)] border border-amber-100 flex items-center justify-center text-center max-w-[85vw]">
          <span className="text-[9px] sm:text-xs md:text-base lg:text-lg font-black tracking-wider sm:tracking-widest uppercase text-slate-950 truncate">
            {stageConfig.current_round_title || 'GRAND FINAL - BABAK I: WAJIB TIM'}
          </span>
        </div>

        {/* Right Golden Laurel Leaves SVG (Mirrored) */}
        <svg
          className="w-4 h-4 sm:w-8 sm:h-10 text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.75)] transform -scale-x-100 shrink-0"
          viewBox="0 0 32 32"
          fill="currentColor"
        >
          <path d="M12.5 3.5C13.8 6 13.9 9 12.8 11.5c-.7 1.3-1.8 2.3-3.1 3-.7-1.3-1-2.8-1-4.2C8.7 7.2 10.1 4.8 12.5 3.5zm6.8 6.5c1.4 2.5 1.7 5.5 1 8.2-.4 1.3-1.2 2.5-2.2 3.3-1-1.1-1.6-2.5-1.7-4-.3-2.8.5-5.6 2.9-7.5zm-9.8 8.8c2.4 1.2 4.1 3.4 4.7 6 .3 1.3 0 2.6-.7 3.7-1.1-.8-2-1.9-2.7-3.2-1-2.1-1.2-4.4-1.3-6.5zm14.5 3.5c.8 2.5.5 5.3-.7 7.6-.5 1.1-1.5 2.1-2.5 2.7-.5-1.3-.7-2.8-.4-4.2.3-2.5 1.5-4.8 3.6-6.1z" />
        </svg>
      </div>

      {/* 4. Sub-Pills: Category & Venue */}
      <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 max-w-[94vw]">
        {/* Category Pill */}
        <div
          className={`px-2.5 sm:px-5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-black tracking-wider uppercase shadow-md flex items-center space-x-1 sm:space-x-1.5 border bg-gradient-to-r text-white ${badge.badgeClass}`}
        >
          <span>{badge.icon}</span>
          <span className="truncate max-w-[50vw] sm:max-w-none">{badge.label}</span>
        </div>

        {/* Venue Subtitle Pill */}
        <div className="px-2.5 sm:px-5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold text-slate-200 tracking-wide bg-slate-900/85 border border-white/20 shadow-md backdrop-blur-md flex items-center space-x-1 sm:space-x-1.5">
          <span>📍</span>
          <span className="truncate max-w-[40vw] sm:max-w-none">{stageConfig.event_subtitle || 'Ballroom Hotel Mercure Pontianak Lt. 9'}</span>
        </div>
      </div>
    </header>
  );
};
