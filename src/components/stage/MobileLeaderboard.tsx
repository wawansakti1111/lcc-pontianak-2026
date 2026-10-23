import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../../types';
import { Crown } from 'lucide-react';

interface MobileLeaderboardProps {
  teams: Team[];
  deltas: Record<string, { value: number; timestamp: number }>;
  rankMap: Map<string, number>;
  leaderId?: string;
  maxScore: number;
}

const DESK_CONFIG: Record<
  string,
  {
    color: string;
    gradient: string;
    borderClass: string;
    badgeBg: string;
    glow: string;
  }
> = {
  'Regu A': {
    color: '#0084FF',
    gradient: 'linear-gradient(90deg, #0066FF 0%, #00F0FF 100%)',
    borderClass: 'border-blue-500/40',
    badgeBg: 'bg-blue-600',
    glow: 'rgba(0, 132, 255, 0.4)'
  },
  'Regu B': {
    color: '#FFB800',
    gradient: 'linear-gradient(90deg, #FF9900 0%, #FFE040 100%)',
    borderClass: 'border-amber-500/40',
    badgeBg: 'bg-amber-600',
    glow: 'rgba(255, 184, 0, 0.4)'
  },
  'Regu C': {
    color: '#FF1493',
    gradient: 'linear-gradient(90deg, #E60067 0%, #FF4DA6 100%)',
    borderClass: 'border-pink-500/40',
    badgeBg: 'bg-pink-600',
    glow: 'rgba(255, 20, 147, 0.4)'
  },
  'Regu D': {
    color: '#00E599',
    gradient: 'linear-gradient(90deg, #00CC88 0%, #26FFBA 100%)',
    borderClass: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-600',
    glow: 'rgba(0, 229, 153, 0.4)'
  },
  'Regu E': {
    color: '#9D4EDD',
    gradient: 'linear-gradient(90deg, #8A2BE2 0%, #C77DFF 100%)',
    borderClass: 'border-purple-500/40',
    badgeBg: 'bg-purple-600',
    glow: 'rgba(157, 78, 221, 0.4)'
  }
};

const MobileCardItem: React.FC<{
  team: Team;
  rank: number;
  isLeader: boolean;
  delta?: { value: number; timestamp: number };
  maxScore: number;
}> = ({ team, rank, isLeader, delta, maxScore }) => {
  const config = DESK_CONFIG[team.regu] || DESK_CONFIG['Regu A'];
  const safeMax = Math.max(maxScore, 500);
  const scorePercent = Math.max(10, Math.min(100, Math.round((Math.max(team.score, 0) / safeMax) * 100)));

  // Counting animation for score
  const [displayedScore, setDisplayedScore] = useState(team.score);

  useEffect(() => {
    let start = displayedScore;
    const end = team.score;
    if (start === end) return;

    const duration = 500;
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

  const isLeadingScore = isLeader && team.score > 0;

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, type: 'spring', stiffness: 100, damping: 15 } }}
      className={`relative w-full rounded-2xl p-2.5 sm:p-3 bg-slate-950/90 backdrop-blur-md border-2 transition-all shadow-xl ${
        isLeadingScore
          ? 'border-amber-400/80 ring-2 ring-amber-400/30'
          : config.borderClass
      }`}
      style={{
        boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 16px ${config.glow}`
      }}
    >
      {/* Floating Delta Badge */}
      <AnimatePresence>
        {delta && (
          <motion.div
            key={delta.timestamp}
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1.1, y: -8 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.35 }}
            className={`absolute right-4 -top-3 z-30 font-black text-xs px-2.5 py-0.5 rounded-full shadow-2xl border-2 ${
              delta.value > 0
                ? 'bg-emerald-500 text-white border-emerald-200 shadow-emerald-500/70'
                : 'bg-rose-600 text-white border-rose-200 shadow-rose-600/70'
            }`}
          >
            {delta.value > 0 ? `+${delta.value}` : delta.value}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-2 sm:space-x-3 w-full min-w-0">
        {/* 1. Rank & Avatar Stack */}
        <div className="relative shrink-0 flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13">
          <div
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 bg-slate-900 shadow-lg p-0.5"
            style={{ borderColor: config.color }}
          >
            <img
              src={team.photo_url || '/placeholder-team.png'}
              alt={team.team_name}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-team.png';
              }}
            />
          </div>

          {/* Floating Crown for #1 */}
          {isLeadingScore && (
            <div className="absolute -top-2.5 -right-1 z-20">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-bounce" />
            </div>
          )}

          {/* Rank Badge overlapping bottom */}
          <div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[9px] font-black border shadow-md flex items-center justify-center ${
              rank === 1
                ? 'bg-amber-400 text-slate-950 border-amber-200'
                : rank === 2
                ? 'bg-slate-300 text-slate-950 border-white'
                : rank === 3
                ? 'bg-amber-700 text-white border-amber-500'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}
          >
            #{rank}
          </div>
        </div>

        {/* 2. Team Name & Institution */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center space-x-1.5 mb-0.5">
            <span
              className="px-2 py-0.2 rounded text-[9px] font-black text-white uppercase tracking-wider shadow-sm"
              style={{ background: config.gradient }}
            >
              {team.regu}
            </span>
          </div>

          <h4
            className="text-xs sm:text-base font-black text-white uppercase tracking-wide truncate drop-shadow-md leading-tight"
            title={team.team_name}
          >
            {team.team_name}
          </h4>

          <div className="mt-0.5 inline-block px-1.5 py-0.2 rounded bg-slate-900/90 border border-slate-700/80 shadow-sm max-w-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-amber-300 truncate tracking-wide leading-tight">
              {team.institution}
            </p>
          </div>

          {/* Horizontal Neon Progress Bar */}
          <div className="mt-1.5 w-full bg-slate-900/90 rounded-full h-2 border border-white/15 overflow-hidden p-0.5 shadow-inner">
            <motion.div
              initial={false}
              animate={{ width: `${scorePercent}%` }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 90, damping: 14 }}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: config.gradient,
                boxShadow: `0 0 10px ${config.color}`
              }}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-wave" />
            </motion.div>
          </div>
        </div>

        {/* 3. Big Score Readout */}
        <div className="shrink-0 text-right pl-1 min-w-[50px]">
          <span className="text-xl sm:text-3xl font-black font-mono tabular-nums text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {displayedScore}
          </span>
          <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            POIN
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const MobileLeaderboard: React.FC<MobileLeaderboardProps> = ({
  teams,
  deltas,
  rankMap,
  leaderId,
  maxScore
}) => {
  return (
    <div className="w-full max-w-full overflow-hidden space-y-2 pb-6 px-0.5">
      {teams.map((team) => (
        <MobileCardItem
          key={team.id}
          team={team}
          rank={rankMap.get(team.id) || 1}
          isLeader={team.id === leaderId}
          delta={deltas[team.id]}
          maxScore={maxScore}
        />
      ))}
    </div>
  );
};
