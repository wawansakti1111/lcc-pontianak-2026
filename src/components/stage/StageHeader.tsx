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
          badgeClass: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-cyan-500/30'
        };
      case 'siswa_sma':
        return {
          icon: '🏫',
          label: 'KATEGORI SISWA SMA / SEDERAJAT',
          badgeClass: 'bg-gradient-to-r from-amber-500 via-orange-600 to-rose-500 text-white shadow-amber-500/30'
        };
      case 'dual':
        return {
          icon: '⚡',
          label: 'MODE DUAL ARENA (MAHASISWA & SMA)',
          badgeClass: 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white shadow-purple-500/30'
        };
      default:
        return {
          icon: '🏆',
          label: 'LOMBA CERDAS CERMAT',
          badgeClass: 'bg-indigo-600 text-white shadow-indigo-500/30'
        };
    }
  };

  const badge = getCategoryBadge();

  return (
    <header className="relative w-full z-20 flex flex-col items-center justify-start pt-3 pb-2 select-none">
      {/* 1. White Pill Badge: Logos of Organizers (Clean & Official) */}
      <div className="bg-white/95 backdrop-blur-md px-6 py-1.5 rounded-full shadow-lg border border-white/60 flex items-center space-x-5 transition-transform hover:scale-105">
        {/* Logo 1: Lambang Pemkot Pontianak */}
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-1 ring-emerald-700">
            PTK
          </div>
          <span className="text-[11px] font-extrabold text-slate-800 tracking-wider">PEMKOT PONTIANAK</span>
        </div>

        <div className="w-1 h-3.5 bg-slate-300 rounded-full" />

        {/* Logo 2: Disporapar */}
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-1 ring-blue-700">
            DSP
          </div>
          <span className="text-[11px] font-extrabold text-slate-800 tracking-wider">DISPORAPAR</span>
        </div>

        <div className="w-1 h-3.5 bg-slate-300 rounded-full" />

        {/* Logo 3: HUT 255 Pontianak */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-black bg-gradient-to-r from-amber-500 to-rose-600 bg-clip-text text-transparent">
            HUT KE-255
          </span>
          <span className="text-[10px] font-bold text-slate-600">Tangguh Bersahabat</span>
        </div>

        <div className="w-1 h-3.5 bg-slate-300 rounded-full" />

        {/* Logo 4: Raja CreArt */}
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 rounded bg-purple-700 flex items-center justify-center text-[9px] font-black text-yellow-300 shadow-sm">
            RCA
          </div>
          <span className="text-[11px] font-extrabold text-purple-900 tracking-wider">RAJA CREART</span>
        </div>
      </div>

      {/* 2. Main Title */}
      <h1 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-black tracking-wider text-white uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] text-center">
        LOMBA CERDAS CERMAT PEMUDA KOTA PONTIANAK 2026
      </h1>

      {/* 3. Round Title (Gold with Dark Outline) & Category Pill */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
        {/* Gold Highlighted Round Title */}
        <div className="relative">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase text-gold-gradient text-stroke-dark tracking-wide drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] px-2">
            {stageConfig.current_round_title || 'GRAND FINAL'}
          </h2>
        </div>

        {/* Category Pill */}
        <div className={`px-4 py-1 rounded-full text-xs md:text-sm font-black tracking-widest uppercase shadow-lg flex items-center space-x-2 border border-white/40 ${badge.badgeClass}`}>
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </div>

        {/* Subtitle / Venue */}
        <span className="text-xs md:text-sm font-semibold text-cyan-100/90 tracking-wide bg-slate-950/40 px-3 py-1 rounded-full border border-white/10">
          📍 {stageConfig.event_subtitle || 'Hotel Mercure Pontianak'}
        </span>
      </div>
    </header>
  );
};