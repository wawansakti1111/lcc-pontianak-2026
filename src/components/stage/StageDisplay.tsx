import React, { useState } from 'react';
import { useScoreboardData } from '../../hooks/useScoreboardData';
import { StageHeader } from './StageHeader';
import { NeonBar } from './NeonBar';
import { StageRoundRecap } from './StageRoundRecap';
import { StageHistoryLog } from './StageHistoryLog';
import type { Team } from '../../types';

export const StageDisplay: React.FC = () => {
  const { teams, stageConfig, history, deltas } = useScoreboardData();
  const [, setIsFullscreen] = useState(false);

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
    const sorted = [...list].sort((a, b) => b.score - a.score);
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

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="relative w-screen h-screen overflow-hidden flex flex-col justify-between select-none cursor-default bg-cover bg-center bg-no-repeat"
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
      <StageHeader stageConfig={{ ...stageConfig, active_category_view: currentCategoryView }} />

      {/* ========================================================
          ZONA TENGAH: MAIN 5 PODIUMS / RECAP TABLE / HISTORY LOG (~72%)
      ======================================================== */}
      <main className="relative flex-1 w-full max-w-[1560px] mx-auto px-2 sm:px-4 md:px-6 z-10 flex items-end justify-center pb-8 sm:pb-10 md:pb-12">
        {presentationMode === 'history' ? (
          /* TV Broadcast Score History & Audit Log Mode */
          <StageHistoryLog
            teams={teams}
            history={history}
            activeCategoryView={currentCategoryView}
            currentRoundTitle={stageConfig.current_round_title || 'GRAND FINAL'}
          />
        ) : presentationMode === 'recap' ? (
          /* TV Broadcast Score Recap Table Mode */
          <StageRoundRecap
            teams={teams}
            history={history}
            activeCategoryView={currentCategoryView}
            currentRoundTitle={stageConfig.current_round_title || 'GRAND FINAL'}
          />
        ) : currentCategoryView === 'dual' ? (
          /* Dual Arena Split Mode (Mahasiswa & SMA side by side) */
          <div className="w-full h-full flex items-end gap-6 md:gap-10">
            {/* Arena Mahasiswa */}
            <div className="flex-1 h-full flex flex-col justify-end bg-slate-950/40 rounded-2xl p-2 border border-white/20 backdrop-blur-sm relative">
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
            <div className="flex-1 h-full flex flex-col justify-end bg-slate-950/40 rounded-2xl p-2 border border-white/20 backdrop-blur-sm relative">
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
          /* Single Category 5 Columns View (Matching Reference Mockup 1:1) */
          <div className="w-full h-full flex items-end justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 max-w-[1540px] pb-3 sm:pb-5 md:pb-7">
            {sortTeams(
              currentCategoryView === 'mahasiswa_umum' ? mhsTeams : smaTeams
            ).map((team) => {
              const currentLeaderId =
                currentCategoryView === 'mahasiswa_umum' ? mhsLeaderId : smaLeaderId;
              const currentMax =
                currentCategoryView === 'mahasiswa_umum' ? mhsMaxScore : smaMaxScore;
              const currentRankMap =
                currentCategoryView === 'mahasiswa_umum' ? mhsRankMap : smaRankMap;

              return (
                <NeonBar
                  key={team.id}
                  team={team}
                  maxCategoryScore={currentMax}
                  isLeader={team.id === currentLeaderId}
                  rank={currentRankMap.get(team.id) || 1}
                  delta={deltas[team.id]}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Subtle floor lighting line at the bottom */}
      <div className="w-full h-2 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />
    </div>
  );
};
