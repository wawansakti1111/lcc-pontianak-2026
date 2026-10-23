import React, { useState } from 'react';
import { useScoreboardData } from '../../hooks/useScoreboardData';
import { StageHeader } from './StageHeader';
import { NeonBar } from './NeonBar';
import { MobileLeaderboard } from './MobileLeaderboard';
import { StageRoundRecap } from './StageRoundRecap';
import { StageHistoryLog } from './StageHistoryLog';
import type { Team } from '../../types';

export const StageDisplay: React.FC = () => {
  const { teams, stageConfig, history, deltas } = useScoreboardData();
  const [, setIsFullscreen] = useState(false);
  const [mobileMode, setMobileMode] = useState<'cards' | 'podium'>('cards');
  const [mobileCategoryOverride, setMobileCategoryOverride] = useState<'mahasiswa_umum' | 'siswa_sma' | null>(null);

  // Hidden double-click fullscreen handler for technician/operator convenience
  const handleDoubleClick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Determine stage presentation mode: URL param override or admin stageConfig
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlMode = (searchParams?.get('mode') as 'scoreboard' | 'recap' | 'history') || null;

  const rawCat = searchParams?.get('category') || searchParams?.get('cat');
  const urlCategory: 'mahasiswa_umum' | 'siswa_sma' | 'dual' | null =
    rawCat === 'sma' || rawCat === 'siswa_sma'
      ? 'siswa_sma'
      : rawCat === 'mhs' || rawCat === 'mahasiswa' || rawCat === 'mahasiswa_umum'
      ? 'mahasiswa_umum'
      : rawCat === 'dual'
      ? 'dual'
      : null;

  const currentCategoryView = urlCategory || stageConfig.active_category_view || 'mahasiswa_umum';
  const effectiveCategoryView = mobileCategoryOverride || currentCategoryView;

  const presentationMode =
    urlMode ||
    stageConfig.presentation_mode ||
    (stageConfig.show_round_recap ? 'recap' : 'scoreboard');

  // Helper to sort teams according to current sort_mode
  const sortTeams = (teamList: Team[]): Team[] => {
    if (stageConfig.sort_mode === 'ranking') {
      return [...teamList].sort((a, b) => b.score - a.score);
    }
    // Default: desk_order (Regu A -> Regu E)
    return [...teamList].sort((a, b) => a.regu.localeCompare(b.regu));
  };

  // Filter teams according to category view
  const mhsTeams = teams.filter((t) => t.category === 'mahasiswa_umum');
  const smaTeams = teams.filter((t) => t.category === 'siswa_sma');

  const getRankMap = (list: Team[]) => {
    // Sort by score descending; if score tied, fallback to Regu desk order (A -> E)
    const sorted = [...list].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.regu.localeCompare(b.regu);
    });
    const map = new Map<string, number>();
    sorted.forEach((t, idx) => map.set(t.id, idx + 1));
    return map;
  };

  const mhsRankMap = getRankMap(mhsTeams);
  const smaRankMap = getRankMap(smaTeams);

  const mhsMaxScore = Math.max(...mhsTeams.map((t) => t.score), 0);
  const smaMaxScore = Math.max(...smaTeams.map((t) => t.score), 0);

  const mhsLeaderId = mhsTeams.reduce(
    (max, t) => (t.score > max.score ? t : max),
    mhsTeams[0] || { id: '', score: -Infinity }
  )?.id;

  const smaLeaderId = smaTeams.reduce(
    (max, t) => (t.score > max.score ? t : max),
    smaTeams[0] || { id: '', score: -Infinity }
  )?.id;

  const activeCategoryTeams =
    effectiveCategoryView === 'siswa_sma' ? smaTeams : mhsTeams;
  const activeLeaderId =
    effectiveCategoryView === 'siswa_sma' ? smaLeaderId : mhsLeaderId;
  const activeMaxScore =
    effectiveCategoryView === 'siswa_sma' ? smaMaxScore : mhsMaxScore;
  const activeRankMap =
    effectiveCategoryView === 'siswa_sma' ? smaRankMap : mhsRankMap;

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="relative w-full min-h-screen md:h-screen md:overflow-hidden overflow-x-hidden max-w-[100vw] flex flex-col justify-between select-none cursor-default bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/stage-backdrop.jpg')"
      }}
      title="Layar Panggung LCC Pemuda Pontianak 2026 (Double click untuk Fullscreen)"
    >
      {/* Soft Ambient Atmospheric Fill */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25 pointer-events-none" />

      {/* ========================================================
          ZONA ATAS: HEADER & IDENTITAS PENYELENGGARA (~18%)
      ======================================================== */}
      <StageHeader stageConfig={{ ...stageConfig, active_category_view: effectiveCategoryView }} />

      {/* ========================================================
          MOBILE CONTROL STRIP (Visible only on mobile < md)
      ======================================================== */}
      <div className="md:hidden w-full px-3 py-1.5 z-20 flex flex-col items-center space-y-1.5">
        {/* Category Switcher Pill for Phone Viewers */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-full border border-white/20 shadow-lg text-xs font-bold">
          <button
            onClick={() => setMobileCategoryOverride('mahasiswa_umum')}
            className={`px-3 py-1 rounded-full transition-all flex items-center space-x-1.5 cursor-pointer ${
              effectiveCategoryView === 'mahasiswa_umum'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎓</span>
            <span>Mahasiswa</span>
          </button>
          <button
            onClick={() => setMobileCategoryOverride('siswa_sma')}
            className={`px-3 py-1 rounded-full transition-all flex items-center space-x-1.5 cursor-pointer ${
              effectiveCategoryView === 'siswa_sma'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏫</span>
            <span>Siswa SMA</span>
          </button>
        </div>

        {/* View Mode Toggle: Kartu Klasemen vs Panggung 3D Bar */}
        <div className="flex items-center space-x-1.5 text-[11px] font-semibold">
          <button
            onClick={() => setMobileMode('cards')}
            className={`px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer ${
              mobileMode === 'cards'
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 font-bold shadow-sm'
                : 'bg-black/40 border-white/10 text-slate-400'
            }`}
          >
            📊 Klasemen
          </button>
          <button
            onClick={() => setMobileMode('podium')}
            className={`px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer ${
              mobileMode === 'podium'
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 font-bold shadow-sm'
                : 'bg-black/40 border-white/10 text-slate-400'
            }`}
          >
            🏛️ Podium 3D
          </button>
        </div>
      </div>

      {/* ========================================================
          ZONA TENGAH: MAIN 5 PODIUMS / RECAP TABLE / HISTORY LOG (~72%)
      ======================================================== */}
      <main className="relative flex-1 w-full max-w-full overflow-hidden mx-auto px-2 sm:px-4 md:px-6 z-10 flex flex-col md:flex-row items-center md:items-end justify-start md:justify-center pb-4 sm:pb-8 md:pb-12">
        {presentationMode === 'history' ? (
          /* TV Broadcast Score History & Audit Log Mode */
          <StageHistoryLog
            teams={teams}
            history={history}
            activeCategoryView={effectiveCategoryView}
            currentRoundTitle={stageConfig.current_round_title || 'GRAND FINAL'}
          />
        ) : presentationMode === 'recap' ? (
          /* TV Broadcast Score Recap Table Mode */
          <StageRoundRecap
            teams={teams}
            history={history}
            activeCategoryView={effectiveCategoryView}
            currentRoundTitle={stageConfig.current_round_title || 'GRAND FINAL'}
          />
        ) : effectiveCategoryView === 'dual' ? (
          /* Dual Arena Split Mode (Mahasiswa & SMA side by side) */
          <div className="w-full h-full flex flex-col md:flex-row items-end gap-6 md:gap-10">
            {/* Arena Mahasiswa */}
            <div className="flex-1 w-full h-full flex flex-col justify-end bg-slate-950/40 rounded-2xl p-2 border border-white/20 backdrop-blur-sm relative">
              <div className="absolute top-2 left-4 text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center space-x-1">
                <span>🎓 KATEGORI MAHASISWA</span>
              </div>
              <div className="w-full h-[90%] flex items-end justify-around">
                {sortTeams(mhsTeams).map((team) => (
                  <NeonBar
                    key={team.id}
                    team={team}
                    maxCategoryScore={mhsMaxScore}
                    isLeader={team.id === mhsLeaderId}
                    rank={mhsRankMap.get(team.id) || 1}
                    delta={deltas[team.id]}
                  />
                ))}
              </div>
            </div>

            {/* Arena Siswa SMA */}
            <div className="flex-1 w-full h-full flex flex-col justify-end bg-slate-950/40 rounded-2xl p-2 border border-white/20 backdrop-blur-sm relative">
              <div className="absolute top-2 left-4 text-xs font-black uppercase tracking-wider text-amber-300 flex items-center space-x-1">
                <span>🏫 KATEGORI SISWA SMA</span>
              </div>
              <div className="w-full h-[90%] flex items-end justify-around">
                {sortTeams(smaTeams).map((team) => (
                  <NeonBar
                    key={team.id}
                    team={team}
                    maxCategoryScore={smaMaxScore}
                    isLeader={team.id === smaLeaderId}
                    rank={smaRankMap.get(team.id) || 1}
                    delta={deltas[team.id]}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex-1 md:h-full flex flex-col items-center justify-start md:justify-end">
            {/* 1. MOBILE ONLY VIEW (< md) */}
            <div className="md:hidden w-full max-w-full overflow-hidden">
              {mobileMode === 'cards' ? (
                /* Mobile Leaderboard Cards */
                <MobileLeaderboard
                  teams={sortTeams(activeCategoryTeams)}
                  deltas={deltas}
                  rankMap={activeRankMap}
                  leaderId={activeLeaderId}
                  maxScore={activeMaxScore}
                />
              ) : (
                /* Mobile Horizontal Swipeable 3D Podium Bars */
                <div className="w-full flex flex-col items-center">
                  <div className="w-full flex items-end justify-start gap-2.5 overflow-x-auto snap-x snap-mandatory px-3 pb-4 no-scrollbar">
                    {sortTeams(activeCategoryTeams).map((team) => (
                      <NeonBar
                        key={team.id}
                        team={team}
                        maxCategoryScore={activeMaxScore}
                        isLeader={team.id === activeLeaderId}
                        rank={activeRankMap.get(team.id) || 1}
                        delta={deltas[team.id]}
                      />
                    ))}
                  </div>
                  <div className="text-center text-[10px] text-cyan-300/80 font-medium pb-2 animate-pulse">
                    👈 Geser ke samping untuk melihat seluruh 5 meja regu 👉
                  </div>
                </div>
              )}
            </div>

            {/* 2. DESKTOP / TABLET WIDESCREEN ARENA (>= md) */}
            <div className="hidden md:flex w-full h-full items-end justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 max-w-[1540px] pb-3 sm:pb-5 md:pb-7">
              {sortTeams(activeCategoryTeams).map((team) => (
                <NeonBar
                  key={team.id}
                  team={team}
                  maxCategoryScore={activeMaxScore}
                  isLeader={team.id === activeLeaderId}
                  rank={activeRankMap.get(team.id) || 1}
                  delta={deltas[team.id]}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Subtle floor lighting line at the bottom */}
      <div className="w-full h-2 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />
    </div>
  );
};
