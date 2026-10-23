import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../../types';
import { REGU_THEMES } from '../../constants/initialData';

interface NeonBarProps {
  team: Team;
  maxCategoryScore: number;
  isLeader: boolean;
  rank: number;
  delta?: { value: number; timestamp: number };
}

export const NeonBar: React.FC<NeonBarProps> = ({
  team,
  maxCategoryScore,
  isLeader,
  rank,
  delta
}) => {
  const theme = REGU_THEMES[team.regu] || REGU_THEMES['Regu A'];

  // Proportional bar height calculation with guaranteed headroom for floating photo & crown:
  // - Minimum base height (score <= 0): 12% so the column never collapses
  // - Maximum bar height at leader score: 55% so photo + crown have ~45% clean headroom below header
  const safeMax = Math.max(maxCategoryScore, 500);
  const scoreRatio = Math.max(0, Math.min(team.score / safeMax, 1));
  const barHeightPercent = 12 + Math.round(scoreRatio * 43);

  // Animated counting for score
  const [displayedScore, setDisplayedScore] = useState(team.score);

  useEffect(() => {
    let start = displayedScore;
    const end = team.score;
    if (start === end) return;

    const duration = 600; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * ease);
      setDisplayedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [team.score]);

  return (
    <motion.div
      layout
      transition={{
        layout: { duration: 0.6, type: 'spring', stiffness: 90, damping: 15 }
      }}
      className="flex-1 flex flex-col items-center justify-end h-full relative px-1 max-w-[210px] min-w-[130px]"
    >
      {/* ========================================================
          BAR & FLOATING PHOTO TRACK (Shared coordinate container)
      ======================================================== */}
      <div className="w-full flex-1 relative flex items-end justify-center">
        {/* 1. FLOATING TEAM PHOTO & SCORE PILL (MELAYANG DI PUNCAK) */}
        <motion.div
          animate={{
            bottom: `calc(${barHeightPercent}% + 6px)`
          }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 18
          }}
          className="absolute z-20 flex flex-col items-center pointer-events-none"
        >
          {/* Floating Delta Badge (+100 / -50) */}
          <AnimatePresence>
            {delta && (
              <motion.div
                key={delta.timestamp}
                initial={{ opacity: 0, y: 15, scale: 0.6 }}
                animate={{ opacity: 1, y: -10, scale: 1.15 }}
                exit={{ opacity: 0, y: -35, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className={`absolute -right-7 -top-2 z-30 font-black text-xs md:text-sm px-2.5 py-0.5 rounded-full shadow-2xl border-2 ${
                  delta.value > 0
                    ? 'bg-emerald-500 text-white border-emerald-200 shadow-emerald-500/50'
                    : 'bg-rose-600 text-white border-rose-200 shadow-rose-600/50'
                }`}
              >
                {delta.value > 0 ? `+${delta.value}` : delta.value}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Crown #1 & Glowing Halo */}
          <div className="relative flex flex-col items-center">
            {isLeader && team.score > 0 && (
              <motion.div
                initial={{ scale: 0, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="absolute -top-8 z-30 flex flex-col items-center filter drop-shadow-[0_0_12px_rgba(255,208,0,0.9)] animate-bounce"
              >
                <span className="text-2xl md:text-3xl select-none">👑</span>
                <span className="text-[9px] font-black tracking-wider uppercase bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full -mt-1 shadow-md">
                  NO. 1
                </span>
              </motion.div>
            )}

            {/* Photo Frame with Double Ring Border */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full overflow-hidden p-1 shadow-2xl relative transition-all duration-300 ${
                isLeader && team.score > 0
                  ? 'glow-gold ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-900 scale-105'
                  : 'ring-4 ring-white/90 ring-offset-2 ring-offset-slate-900/80 shadow-cyan-900/40'
              }`}
              style={{
                background: theme.gradient
              }}
            >
              <img
                src={team.photo_url || '/placeholder-team.png'}
                alt={team.team_name}
                className="w-full h-full object-cover rounded-full bg-slate-900"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-team.png';
                }}
              />
            </div>
          </div>

          {/* Score Pill Capsule */}
          <div
            className={`-mt-3 px-3.5 py-0.5 md:py-1 rounded-full shadow-2xl flex items-center justify-center border-2 z-20 backdrop-blur-md ${
              isLeader && team.score > 0
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-white shadow-amber-500/60'
                : 'bg-slate-950/95 text-white border-white/60 shadow-black/80'
            }`}
          >
            <span className="text-xl md:text-2xl lg:text-3xl font-black tabular-nums tracking-tight">
              {displayedScore}
            </span>
          </div>
        </motion.div>

        {/* 2. ANIMATED 3D NEON BAR (BATANG VERTIKAL) */}
        <motion.div
          animate={{
            height: `${barHeightPercent}%`
          }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 18
          }}
          className="w-full relative rounded-t-2xl overflow-hidden shadow-2xl border-t border-x border-white/40"
          style={{
            background: theme.gradient,
            boxShadow: `0 0 25px ${theme.glowHex}, inset 0 0 15px rgba(255,255,255,0.3)`
          }}
        >
          {/* Glass Gloss highlight reflection on the left side */}
          <div className="absolute top-0 bottom-0 left-2 w-2.5 bg-gradient-to-r from-white/40 to-transparent rounded-full pointer-events-none" />

          {/* Shimmer Light Reflection Moving Upwards */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="w-full h-32 bg-gradient-to-t from-transparent via-white/30 to-transparent animate-shimmer-wave" />
          </div>

          {/* Bottom internal shadow to create 3D depth */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/50 to-transparent" />
        </motion.div>
      </div>

      {/* ========================================================
          3. FIXED PODIUM PEDESTAL (KOTAK IDENTITAS DASAR)
      ======================================================== */}
      <div className="w-full z-10 px-0.5 pt-1">
        <div
          className={`rounded-xl py-2 px-2 text-center backdrop-blur-md shadow-2xl border transition-all duration-300 ${
            isLeader && team.score > 0
              ? 'bg-slate-950/95 border-amber-400/80 shadow-amber-400/20'
              : 'bg-slate-950/90 border-white/25 shadow-black/60'
          }`}
        >
          {/* Regu Badge & Rank */}
          <div className="flex items-center justify-center space-x-1 mb-0.5">
            <span
              className="text-[11px] md:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white shadow-sm"
              style={{ background: theme.gradient }}
            >
              {team.regu}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              #{rank}
            </span>
          </div>

          {/* Team Name */}
          <div className="text-xs sm:text-sm md:text-base font-black text-white leading-tight line-clamp-2 max-w-full drop-shadow mt-0.5">
            {team.team_name}
          </div>

          {/* Institution / School */}
          <div className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-cyan-200/90 truncate max-w-full mt-0.5">
            {team.institution}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
