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

  // Screen width detection for responsive maximum height calibration
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic elevating height:
  // - As tall as possible to maximize tournament drama and podium hierarchy
  // - Base block is proud and tall: 105px on desktop (never looks sunken)
  // - Max score elevates up to 185px (total 290px tall on desktop)
  // - Guarantees safe clearance below the header text with zero touching
  const safeMax = Math.max(maxCategoryScore, 500);
  const scoreRatio = Math.max(0, Math.min(team.score / safeMax, 1));
  const baseBlockHeight = isDesktop ? 105 : 68;
  const maxRaise = isDesktop ? 185 : 100;
  const dynamicRaise = Math.round(scoreRatio * maxRaise);
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
      className="flex-1 flex flex-col items-center justify-end relative px-1 sm:px-1.5 md:px-2 max-w-[295px] min-w-[175px] shrink-0 md:shrink snap-center"
    >
      {/* ========================================================
          1. ELEVATING STACK (AVATAR + 3D NEON BLOCK)
      ======================================================== */}
      <div className="w-full relative flex flex-col items-center">
        {/* Avatar Photo & Grand Stadium Scoreboard (Solidly docked on pedestal top cap, moves with pedestal) */}
        <div className="relative z-30 flex flex-col items-center -mb-4 pointer-events-none">
          {/* Floating Delta Badge (+100 / -50) */}
          <AnimatePresence>
            {delta && (
              <motion.div
                key={delta.timestamp}
                initial={{ opacity: 0, y: 15, scale: 0.6 }}
                animate={{ opacity: 1, y: -16, scale: 1.25 }}
                exit={{ opacity: 0, y: -45, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className={`absolute -right-4 -top-3 z-50 font-black text-sm md:text-base px-3 py-1 rounded-full shadow-2xl border-2 ${
                  delta.value > 0
                    ? 'bg-emerald-500 text-white border-emerald-200 shadow-emerald-500/80 ring-2 ring-emerald-300/40'
                    : 'bg-rose-600 text-white border-rose-200 shadow-rose-600/80 ring-2 ring-rose-300/40'
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
              className="absolute -top-9 z-50 flex flex-col items-center filter drop-shadow-[0_0_16px_rgba(255,208,0,0.95)] animate-bounce"
            >
              <span className="text-2xl md:text-3xl select-none">👑</span>
            </motion.div>
          )}

          {/* 1. Large High-Resolution Team Photo Frame (Wide Squircle to showcase all 3 members clearly) */}
          <div
            className={`w-32 h-24 sm:w-36 sm:h-26 md:w-38 md:h-28 lg:w-42 lg:h-30 xl:w-44 xl:h-32 rounded-[20px] sm:rounded-[24px] overflow-hidden p-1 relative transition-all duration-300 ring-4 ${theme.ring} shadow-[0_0_25px_${theme.glow}] bg-slate-950`}
            style={{
              background: theme.gradient
            }}
          >
            <img
              src={team.photo_url || '/placeholder-team.png'}
              alt={team.team_name}
              className="w-full h-full object-cover object-center rounded-[16px] sm:rounded-[20px] bg-slate-900 border-2 border-white/90"
              loading="eager"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder-team.png';
              }}
            />
          </div>

          {/* 2. GRAND STADIUM DIGITAL LED SCORE DISPLAY (Visible from 30+ meters) */}
          <div
            className="relative -mt-3.5 px-3 sm:px-4 py-1 rounded-2xl bg-slate-950/95 border-2 shadow-[0_8px_30px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center min-w-[125px] sm:min-w-[140px] md:min-w-[155px] z-30 pointer-events-auto"
            style={{
              borderColor: isLeader && team.score > 0 ? '#F59E0B' : theme.primary,
              boxShadow: `0 0 25px ${isLeader && team.score > 0 ? 'rgba(245,158,11,0.7)' : theme.glow}, inset 0 0 12px rgba(0,0,0,0.9)`
            }}
          >
            <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-widest text-slate-300 leading-none">
              TOTAL SKOR
            </span>
            <span className="text-3xl sm:text-4xl md:text-[42px] lg:text-[48px] font-black font-mono tracking-tight tabular-nums text-white drop-shadow-[0_2px_14px_rgba(0,0,0,1)] leading-none my-0.5">
              {displayedScore}
            </span>
          </div>
        </div>

        {/* 2. GLOSSY 3D NEON PEDESTAL / BAR */}
        <motion.div
          animate={{
            height: `${totalBarHeight}px`
          }}
          transition={{
            type: 'spring',
            stiffness: 110,
            damping: 18
          }}
          className="w-full relative rounded-2xl overflow-hidden shadow-2xl border-t-2 border-x border-white/70"
          style={{
            height: `${totalBarHeight}px`,
            minHeight: `${baseBlockHeight}px`,
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
          className={`rounded-2xl py-2.5 px-2 sm:px-3 text-center shadow-2xl border-2 transition-all duration-300 bg-slate-950/95 backdrop-blur-md ${theme.cardBorder}`}
          style={{
            boxShadow: `0 12px 35px rgba(0,0,0,0.85), 0 0 15px ${theme.glow}`
          }}
        >
          {/* Regu Badge & Rank */}
          <div className="flex items-center justify-center space-x-1.5 mb-1">
            <span
              className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-md"
              style={{ background: theme.gradient }}
            >
              {team.regu}
            </span>
            <span className="text-[11px] font-extrabold text-slate-300">
              #{rank}
            </span>
          </div>

          {/* Team Name (Extra Bold & High Visibility) */}
          <div className="text-sm sm:text-base md:text-[17px] lg:text-[18px] font-black text-white leading-tight text-center max-w-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)] px-0.5 min-h-[2.6rem] flex items-center justify-center">
            {team.team_name}
          </div>

          {/* Institution / School (High-Contrast Luminous Badge) */}
          <div className="mt-1 px-2 py-0.5 rounded-xl bg-slate-900/90 border border-white/20 min-h-[1.9rem] flex items-center justify-center shadow-inner">
            <span className="text-xs sm:text-[12px] md:text-sm font-extrabold text-amber-300 text-center leading-tight tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {team.institution}
            </span>
          </div>

          {/* Secondary Live Score Strip in Base Card */}
          <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between px-2 bg-white/[0.04] rounded-lg">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              SKOR MEJA
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
              {displayedScore} <span className="text-[10px] text-slate-400 font-medium">PTS</span>
            </span>
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
