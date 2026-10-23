import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../../types';

interface NeonBarProps {
  team: Team;
  maxCategoryScore: number;
  isLeader: boolean;
  rank: number;
  delta?: { value: number; timestamp: number };
}

interface PodiumTheme {
  primary: string;
  gradient: string;
  topCapGradient: string;
  glow: string;
  ring: string;
  cardBorder: string;
}

const PODIUM_THEMES: Record<string, PodiumTheme> = {
  'Regu A': {
    primary: '#0084FF',
    gradient: 'linear-gradient(180deg, #00B4FF 0%, #0066FF 50%, #003399 100%)',
    topCapGradient: 'linear-gradient(180deg, #99E0FF 0%, #0099FF 100%)',
    glow: 'rgba(0, 132, 255, 0.9)',
    ring: 'ring-[#0084FF]',
    cardBorder: 'border-blue-500/50'
  },
  'Regu B': {
    primary: '#FFB800',
    gradient: 'linear-gradient(180deg, #FFE040 0%, #FF9900 50%, #B85500 100%)',
    topCapGradient: 'linear-gradient(180deg, #FFF3B3 0%, #FFB800 100%)',
    glow: 'rgba(255, 184, 0, 0.9)',
    ring: 'ring-[#FFB800]',
    cardBorder: 'border-amber-500/50'
  },
  'Regu C': {
    primary: '#FF1493',
    gradient: 'linear-gradient(180deg, #FF4DA6 0%, #E60067 50%, #8A0039 100%)',
    topCapGradient: 'linear-gradient(180deg, #FFA6D4 0%, #FF1493 100%)',
    glow: 'rgba(255, 20, 147, 0.9)',
    ring: 'ring-[#FF1493]',
    cardBorder: 'border-pink-500/50'
  },
  'Regu D': {
    primary: '#00E599',
    gradient: 'linear-gradient(180deg, #26FFBA 0%, #00CC88 50%, #006644 100%)',
    topCapGradient: 'linear-gradient(180deg, #B3FFE6 0%, #00E599 100%)',
    glow: 'rgba(0, 229, 153, 0.9)',
    ring: 'ring-[#00E599]',
    cardBorder: 'border-emerald-500/50'
  },
  'Regu E': {
    primary: '#9D4EDD',
    gradient: 'linear-gradient(180deg, #C77DFF 0%, #8A2BE2 50%, #4D0080 100%)',
    topCapGradient: 'linear-gradient(180deg, #E6B8FF 0%, #9D4EDD 100%)',
    glow: 'rgba(157, 78, 221, 0.9)',
    ring: 'ring-[#9D4EDD]',
    cardBorder: 'border-purple-500/50'
  }
};

export const NeonBar: React.FC<NeonBarProps> = ({
  team,
  maxCategoryScore,
  isLeader,
  rank,
  delta
}) => {
  const theme = PODIUM_THEMES[team.regu] || PODIUM_THEMES['Regu A'];

  // Calculate dynamic elevating height:
  // - At score 0: dynamicRaise = 0px (base block height = 50px, matching reference)
  // - At max score: elevates smoothly up to 200px
  const safeMax = Math.max(maxCategoryScore, 500);
  const scoreRatio = Math.max(0, Math.min(team.score / safeMax, 1));
  const dynamicRaise = Math.round(scoreRatio * 180);
  const baseBlockHeight = 52; // Height of 3D block at score 0
  const totalBarHeight = baseBlockHeight + dynamicRaise;

  // Animated counting for score
  const [displayedScore, setDisplayedScore] = useState(team.score);

  useEffect(() => {
    let start = displayedScore;
    const end = team.score;
    if (start === end) return;

    const duration = 600;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
        layout: { duration: 0.6, type: 'spring', stiffness: 95, damping: 16 }
      }}
      className="flex-1 flex flex-col items-center justify-end relative px-1 sm:px-1.5 md:px-2 max-w-[260px] min-w-[165px]"
    >
      {/* ========================================================
          1. ELEVATING STACK (AVATAR + 3D NEON BLOCK)
      ======================================================== */}
      <div className="w-full relative flex flex-col items-center">
        {/* Floating Avatar Photo & Circular Score Badge */}
        <motion.div
          animate={{
            y: -dynamicRaise
          }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 18
          }}
          className="relative z-30 flex flex-col items-center -mb-5 pointer-events-none"
        >
          {/* Floating Delta Badge (+100 / -50) */}
          <AnimatePresence>
            {delta && (
              <motion.div
                key={delta.timestamp}
                initial={{ opacity: 0, y: 15, scale: 0.6 }}
                animate={{ opacity: 1, y: -12, scale: 1.15 }}
                exit={{ opacity: 0, y: -35, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className={`absolute -right-6 -top-3 z-40 font-black text-xs md:text-sm px-2.5 py-0.5 rounded-full shadow-2xl border-2 ${
                  delta.value > 0
                    ? 'bg-emerald-500 text-white border-emerald-200 shadow-emerald-500/60'
                    : 'bg-rose-600 text-white border-rose-200 shadow-rose-600/60'
                }`}
              >
                {delta.value > 0 ? `+${delta.value}` : delta.value}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Leader Crown Badge */}
          {isLeader && team.score > 0 && (
            <motion.div
              initial={{ scale: 0, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="absolute -top-7 z-40 flex flex-col items-center filter drop-shadow-[0_0_12px_rgba(255,208,0,0.9)] animate-bounce"
            >
              <span className="text-xl md:text-2xl select-none">👑</span>
            </motion.div>
          )}

          {/* Photo Frame with Double Glowing Halo */}
          <div className="relative">
            <div
              className={`w-18 h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full overflow-hidden p-0.5 relative transition-all duration-300 ring-4 ${theme.ring} shadow-[0_0_22px_${theme.glow}]`}
              style={{
                background: theme.gradient
              }}
            >
              <img
                src={team.photo_url || '/placeholder-team.png'}
                alt={team.team_name}
                className="w-full h-full object-cover rounded-full bg-slate-900 border-2 border-white/90"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-team.png';
                }}
              />
            </div>

            {/* Circular Black Score Badge (Centrally Overlapping Bottom Edge) */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-9.5 md:h-9.5 rounded-full bg-slate-950 text-white flex items-center justify-center border-2 border-white shadow-xl z-30">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-tight tabular-nums">
                {displayedScore}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2. GLOSSY 3D NEON PEDESTAL / BAR */}
        <motion.div
          animate={{
            height: `${totalBarHeight}px`
          }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 18
          }}
          className="w-full relative rounded-2xl overflow-hidden shadow-2xl border-t-2 border-x border-white/70"
          style={{
            height: `${totalBarHeight}px`,
            minHeight: '52px',
            background: theme.gradient,
            boxShadow: `0 0 30px ${theme.glow}, inset 0 0 20px rgba(255,255,255,0.4)`
          }}
        >
          {/* Luminous Glowing Top Cap with Bevel */}
          <div
            className="absolute top-0 left-0 right-0 h-4.5 rounded-t-2xl border-b border-white/60 shadow-inner"
            style={{
              background: theme.topCapGradient,
              boxShadow: `0 0 18px #ffffff, inset 0 2px 4px rgba(255,255,255,0.9)`
            }}
          />

          {/* Specular Light Reflection Streak */}
          <div className="absolute top-5 bottom-0 left-2 w-2.5 bg-gradient-to-r from-white/45 to-transparent rounded-full pointer-events-none" />

          {/* Internal Shimmer Wave */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="w-full h-28 bg-gradient-to-t from-transparent via-white/25 to-transparent animate-shimmer-wave" />
          </div>

          {/* Bottom Depth Shadow */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/50 to-transparent" />
        </motion.div>
      </div>

      {/* ========================================================
          3. DARK SAPPHIRE TEAM IDENTITY CARD
      ======================================================== */}
      <div className="w-full z-20 px-0.5 pt-1.5">
        <div
          className={`rounded-2xl py-2.5 px-2.5 text-center shadow-2xl border transition-all duration-300 bg-slate-950/95 ${theme.cardBorder}`}
        >
          {/* Regu Badge & Rank */}
          <div className="flex items-center justify-center space-x-1.5 mb-1">
            <span
              className="text-[10px] md:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-sm"
              style={{ background: theme.gradient }}
            >
              {team.regu}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              #{rank}
            </span>
          </div>

          {/* Team Name (No Truncation - Equal Height Alignment) */}
          <div className="text-xs sm:text-sm md:text-[15px] lg:text-base font-black text-white leading-tight text-center max-w-full drop-shadow px-1 min-h-[2.4rem] flex items-center justify-center">
            {team.team_name}
          </div>

          {/* Institution / School (No Truncation - Clean Full Name) */}
          <div className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-slate-300 text-center leading-snug max-w-full mt-0.5 px-0.5 min-h-[1.85rem] flex items-center justify-center">
            {team.institution}
          </div>
        </div>

        {/* 4. Glossy Floor Mirror Reflection Effect */}
        <div
          aria-hidden="true"
          className="w-full mt-1 opacity-25 filter blur-[0.6px] pointer-events-none select-none overflow-hidden h-7"
          style={{
            transform: 'scaleY(-1)',
            maskImage: 'linear-gradient(to top, transparent 15%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 15%, black 100%)'
          }}
        >
          <div
            className={`rounded-2xl py-1 px-2 text-center bg-slate-950 border ${theme.cardBorder}`}
          >
            <div className="text-[10px] font-black text-white truncate">
              {team.team_name}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
