import React, { useState } from 'react';
import { useScoreboardData } from '../../hooks/useScoreboardData';
import { StageHeader } from './StageHeader';
import { NeonBar } from './NeonBar';
import { GridFloor3D } from './GridFloor3D';
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

  // Determine stage presentation mode: URL param override (convenient for multi-screen/testing) or admin stageConfig
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlMode = (searchParams?.get('mode') as 'scoreboard' | 'recap' | 'history') || null;

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
      className="relative w-screen h-screen overflow-hidden main-stage-bg flex flex-col justify-between select-none cursor-default"
      title="Layar Panggung LCC Pemuda Pontianak 2026 (Double click untuk Fullscreen)"
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[650px] h-64 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================
          ZONA ATAS: HEADER & IDENTITAS PENYELENGGARA (~16%)
          (100% PURE SPECTATOR BROADCAST - NO ADMIN BUTTONS)
      ======================================================== */}
      <StageHeader stageConfig={stageConfig} />

      {/* ========================================================
          ZONA TENGAH: MAIN BAR-RACE, ROUND RECAP, OR HISTORY LOG (~68%)
      ======================================================== */}
      <main className="relative flex-1 w-full max-w-[1720px] mx-auto px-4 md:px-8 z-10 flex items-center justify-center pb-2">
        {presentationMode === 'history' ? (
          /* TV Broadcast Score History & Audit Log Mode (Controlled Remotely by Admin) */
          <StageHistoryLog
            teams={teams}
            history={history}
            activeCategoryView={stageConfig.active_category_view}
            currentRoundTitle={stageConfig.current_round_title || 'GRAND FINAL'}
          />
        ) : presentationMode === 'recap' ? (
          /* TV Broadcast Score Recap Table Mode (Controlled Remotely by Admin) */
          <StageRoundRecap
            teams={teams}
            history={history}
            activeCategoryView={stageConfig.active_category_view}
            currentRoundTitle={stageConfig.current_round_title || 'GRAND FINAL'}
          />
        ) : stageConfig.active_category_view === 'dual' ? (
          /* Dual Arena Split Mode (Mahasiswa & SMA side by side) */
          <div className="w-full h-full flex items-end gap-6 md:gap-10">
            {/* Arena Mahasiswa */}
            <div className="flex-1 h-full flex flex-col justify-end bg-slate-950/20 rounded-2xl p-2 border border-white/10 backdrop-blur-xs relative">
              <div className="absolute top-1 left-3 text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center space-x-1">
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
            <div className="flex-1 h-full flex flex-col justify-end bg-slate-950/20 rounded-2xl p-2 border border-white/10 backdrop-blur-xs relative">
              <div className="absolute top-1 left-3 text-xs font-black uppercase tracking-wider text-amber-300 flex items-center space-x-1">
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
          /* Single Category 5 Columns View (Standard Stage View) */
          <div className="w-full h-full flex items-end justify-center gap-3 md:gap-6 lg:gap-8 max-w-6xl">
            {sortTeams(
              stageConfig.active_category_view === 'mahasiswa_umum' ? mhsTeams : smaTeams
            ).map((team) => {
              const currentLeaderId =
                stageConfig.active_category_view === 'mahasiswa_umum' ? mhsLeaderId : smaLeaderId;
              const currentMax =
                stageConfig.active_category_view === 'mahasiswa_umum' ? mhsMaxScore : smaMaxScore;
              const currentRankMap =
                stageConfig.active_category_view === 'mahasiswa_umum' ? mhsRankMap : smaRankMap;

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

      {/* ========================================================
          ZONA BAWAH: 3D PERSPECTIVE GRID FLOOR & PODIUM (~16%)
      ======================================================== */}
      <GridFloor3D />
    </div>
  );
};