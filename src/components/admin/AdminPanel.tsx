import React, { useState, useRef, useEffect } from 'react';
import { useScoreboardData } from '../../hooks/useScoreboardData';
import { TeamCard } from './TeamCard';
import { SupabaseModal } from './SupabaseModal';
import { ScoreHistoryModal } from './ScoreHistoryModal';
import type { Category } from '../../types';
import {
  Cloud,
  Sparkles,
  Undo2,
  ExternalLink,
  GraduationCap,
  School,
  Columns2,
  LayoutGrid,
  Trophy,
  RotateCcw,
  Wifi,
  Radio,
  Award,
  ChevronDown,
  Check,
  History,
  Table2
} from 'lucide-react';

interface AdminPanelProps {
  onOpenStage?: () => void;
}

interface RoundPresetInfo {
  title: string;
  shortLabel: string;
  scoringRule: string;
  iconType: 'wajib' | 'amplop' | 'rebutan' | 'tie' | 'pengesahan';
}

const GRAND_FINAL_ROUNDS: RoundPresetInfo[] = [
  {
    title: 'GRAND FINAL - BABAK I: WAJIB TIM',
    shortLabel: 'Babak I: Wajib Tim',
    scoringRule: '10 Soal • Benar +100 • Salah 0',
    iconType: 'wajib',
  },
  {
    title: 'GRAND FINAL - BABAK II: AMPLOP',
    shortLabel: 'Babak II: Amplop Lemparan',
    scoringRule: 'Soal Lemparan • Benar +100 • Salah -50',
    iconType: 'amplop',
  },
  {
    title: 'GRAND FINAL - BABAK III: REBUTAN I',
    shortLabel: 'Babak III: Rebutan I',
    scoringRule: '10 Soal Cepat • Benar +100 • Salah -100',
    iconType: 'rebutan',
  },
  {
    title: 'GRAND FINAL - BABAK IV: REBUTAN II',
    shortLabel: 'Babak IV: Rebutan II',
    scoringRule: '10 Soal Akhir • Benar +100 • Salah -100',
    iconType: 'rebutan',
  },
  {
    title: 'SOAL PENENTU (TIE-BREAKER)',
    shortLabel: 'Soal Penentu',
    scoringRule: 'Jika Nilai Sama • Benar +100 • Salah -100',
    iconType: 'tie',
  },
  {
    title: 'PENGESAHAN HASIL GRAND FINAL',
    shortLabel: 'Pengesahan Hasil',
    scoringRule: 'Sidang Pleno Dewan Juri & Juara',
    iconType: 'pengesahan',
  },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onOpenStage }) => {
  const {
    teams,
    stageConfig,
    history,
    connectionStatus,
    updateScore,
    setCustomScore,
    undoLastAction,
    updateTeamIdentity,
    updateStageConfig,
    triggerConfetti,
    resetAllScores
  } = useScoreboardData();

  const [activeAdminTab, setActiveAdminTab] = useState<Category>('mahasiswa_umum');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRoundDropdownOpen, setIsRoundDropdownOpen] = useState(false);
  const [customRoundInput, setCustomRoundInput] = useState('');
  const roundDropdownRef = useRef<HTMLDivElement>(null);

  // Close round dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roundDropdownRef.current && !roundDropdownRef.current.contains(event.target as Node)) {
        setIsRoundDropdownOpen(false);
      }
    };
    if (isRoundDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoundDropdownOpen]);

  // Filter current tab teams
  const currentTeams = teams.filter((t) => t.category === activeAdminTab);

  // Compute rank and leader for current category
  const sortedCurrentTeams = [...currentTeams].sort((a, b) => b.score - a.score);
  const rankMap = new Map<string, number>();
  sortedCurrentTeams.forEach((t, idx) => rankMap.set(t.id, idx + 1));
  const currentLeader = sortedCurrentTeams[0];
  const maxCategoryScore = currentLeader?.score || 0;

  const currentRoundTitle = stageConfig.current_round_title || 'GRAND FINAL - BABAK I: WAJIB TIM';
  const currentRoundPreset = GRAND_FINAL_ROUNDS.find((r) => r.title === currentRoundTitle);
  const displayRoundLabel = currentRoundPreset ? currentRoundPreset.shortLabel : currentRoundTitle;
  const lastAction = history[0];

  const currentPresentationMode =
    stageConfig.presentation_mode ||
    (stageConfig.show_round_recap ? 'recap' : 'scoreboard');

  const handleSetPresentationMode = (mode: 'scoreboard' | 'recap' | 'history') => {
    updateStageConfig({
      presentation_mode: mode,
      show_round_recap: mode === 'recap'
    });
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100 flex flex-col justify-between font-sans select-none antialiased">
      {/* ========================================================
          1. TOP NAVIGATION BAR (Matte Studio Console Header h-13)
      ======================================================== */}
      <header className="h-13 bg-[#111216] border-b border-zinc-800/90 px-3 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40 overflow-x-auto no-scrollbar">
        {/* Brand & Connection State */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-extrabold tracking-tight text-white uppercase whitespace-nowrap">
              LCC Pemuda Pontianak 2026
            </span>
            <span className="hidden sm:inline text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 whitespace-nowrap">
              CONSOLE
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block" />

          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-1.5 text-xs whitespace-nowrap">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                  : connectionStatus === 'connecting'
                  ? 'bg-cyan-400 animate-ping'
                  : connectionStatus === 'error'
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                  : 'bg-amber-500'
              }`}
            />
            <span className="text-[11px] font-medium">
              {connectionStatus === 'connected' ? (
                <span className="text-emerald-400 flex items-center">
                  <Wifi className="w-3 h-3 mr-1 inline" /> Realtime Cloud (Supabase Aktif)
                </span>
              ) : connectionStatus === 'connecting' ? (
                <span className="text-cyan-400 flex items-center">
                  <Wifi className="w-3 h-3 mr-1 inline animate-pulse" /> Menghubungkan Cloud...
                </span>
              ) : connectionStatus === 'error' ? (
                <span className="text-rose-400 flex items-center">
                  <Radio className="w-3 h-3 mr-1 inline" /> Kendala Cloud (Fallback Lokal)
                </span>
              ) : (
                <span className="text-amber-400 flex items-center">
                  <Radio className="w-3 h-3 mr-1 inline" /> Standby Lokal
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* History & Round Recap Button */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="h-8.5 px-2.5 md:px-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs border border-zinc-750 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Buka Riwayat Input Skor & Rekap Per Babak"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Riwayat & Rekap</span>
            <span className="md:hidden">Rekap</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              {history.length}
            </span>
          </button>

          {/* Confetti Trigger */}
          <button
            onClick={triggerConfetti}
            className="h-8.5 px-2.5 md:px-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-xs border border-zinc-750 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Tembakkan Efek Konfeti ke Layar Panggung"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Konfeti</span>
          </button>

          {/* Undo Button */}
          <button
            onClick={undoLastAction}
            disabled={history.length === 0}
            className="h-8.5 px-2 md:px-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 disabled:opacity-30 text-zinc-200 font-medium text-xs border border-zinc-750 flex items-center space-x-1 transition-colors cursor-pointer"
            title="Batalkan perubahan skor terakhir"
          >
            <Undo2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          {/* Supabase Settings */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="h-8.5 w-8.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-750 flex items-center justify-center transition-colors cursor-pointer"
            title="Konfigurasi Supabase Cloud"
          >
            <Cloud className="w-3.5 h-3.5" />
          </button>

          {/* Open Stage Window */}
          {onOpenStage ? (
            <button
              onClick={onOpenStage}
              className="h-8.5 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>Layar Panggung</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8.5 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>Layar Panggung</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </header>

      {/* ========================================================
          2. UNIFIED TOOLBAR: Category, Screen, Sort & Round Selector
      ======================================================== */}
      <div className="bg-[#111216] border-b border-zinc-800/80 px-3 md:px-6 py-2 shrink-0 flex items-center justify-between gap-2.5 sticky top-13 z-30 overflow-x-auto no-scrollbar">
        {/* Left: Category Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex h-9 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveAdminTab('mahasiswa_umum')}
              className={`h-full px-3 text-xs font-bold rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeAdminTab === 'mahasiswa_umum'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mahasiswa</span>
              <span className="text-[10px] font-mono text-zinc-400 hidden lg:inline">(Malam)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('siswa_sma')}
              className={`h-full px-3 text-xs font-bold rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeAdminTab === 'siswa_sma'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <School className="w-3.5 h-3.5 text-amber-400" />
              <span>Siswa SMA</span>
              <span className="text-[10px] font-mono text-zinc-400 hidden lg:inline">(Sore)</span>
            </button>
          </div>

          {/* Current Leader Badge */}
          {currentLeader && (
            <div className="hidden 2xl:flex h-9 items-center space-x-2 text-xs text-zinc-400 bg-zinc-950 px-3 rounded-lg border border-zinc-800 shrink-0">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Peringkat 1:</span>
              <span className="font-bold text-zinc-100">{currentLeader.regu}</span>
              <span className="font-mono text-amber-300 font-bold">({maxCategoryScore} pt)</span>
            </div>
          )}
        </div>

        {/* Center: Stage Target View & Sort Modes */}
        <div className="flex items-center space-x-2.5 text-xs shrink-0">
          {/* Stage Target View */}
          <div className="flex h-9 items-center space-x-0.5 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase px-2 font-mono">LAYAR:</span>
            <button
              onClick={() => updateStageConfig({ active_category_view: 'mahasiswa_umum' })}
              className={`h-full px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                stageConfig.active_category_view === 'mahasiswa_umum'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mhs
            </button>
            <button
              onClick={() => updateStageConfig({ active_category_view: 'siswa_sma' })}
              className={`h-full px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                stageConfig.active_category_view === 'siswa_sma'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              SMA
            </button>
            <button
              onClick={() => updateStageConfig({ active_category_view: 'dual' })}
              className={`h-full px-2.5 rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                stageConfig.active_category_view === 'dual'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Columns2 className="w-3 h-3" />
              <span>Split</span>
            </button>
          </div>

          {/* Sort Mode */}
          <div className="flex h-9 items-center space-x-0.5 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase px-2 font-mono">URUTAN:</span>
            <button
              onClick={() => updateStageConfig({ sort_mode: 'desk_order' })}
              className={`h-full px-2.5 rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                stageConfig.sort_mode === 'desk_order'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Meja</span>
            </button>
            <button
              onClick={() => updateStageConfig({ sort_mode: 'ranking' })}
              className={`h-full px-2.5 rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                stageConfig.sort_mode === 'ranking'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Trophy className="w-3 h-3" />
              <span>Klasemen</span>
            </button>
          </div>

          {/* Display Mode on Stage: Skor Live vs Rekap Babak vs Log Riwayat */}
          <div className="flex h-9 items-center space-x-0.5 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase px-2 font-mono">PANGGUNG:</span>
            
            {/* 1. Skor Live */}
            <button
              type="button"
              onClick={() => handleSetPresentationMode('scoreboard')}
              className={`h-full px-2.5 rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                currentPresentationMode === 'scoreboard'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Tampilkan Podium & Bar Race Skor Live di Layar Panggung"
            >
              <Columns2 className="w-3 h-3" />
              <span>Skor Live</span>
            </button>

            {/* 2. Rekap Babak */}
            <button
              type="button"
              onClick={() => handleSetPresentationMode('recap')}
              className={`h-full px-2.5 rounded-md text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                currentPresentationMode === 'recap'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
              title="Tayangkan Tabel Matriks Rekapitulasi Skor Per Babak ke Layar Panggung Penonton"
            >
              <Table2 className="w-3 h-3" />
              <span>Rekap Babak</span>
              {currentPresentationMode === 'recap' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping ml-0.5" />
              )}
            </button>

            {/* 3. Log Riwayat */}
            <button
              type="button"
              onClick={() => handleSetPresentationMode('history')}
              className={`h-full px-2.5 rounded-md text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                currentPresentationMode === 'history'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-zinc-400 hover:text-cyan-300'
              }`}
              title="Tayangkan Log Audit & Riwayat Poin Transparan ke Layar Panggung Penonton"
            >
              <History className="w-3 h-3" />
              <span>Log Riwayat</span>
              {currentPresentationMode === 'history' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Right: Solid & Luxurious Round Selector */}
        <div className="relative shrink-0" ref={roundDropdownRef}>
          <button
            type="button"
            onClick={() => setIsRoundDropdownOpen(!isRoundDropdownOpen)}
            className={`h-9 px-3.5 rounded-lg border flex items-center space-x-2.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer select-none ${
              isRoundDropdownOpen
                ? 'bg-zinc-800 border-amber-400/80 text-white ring-2 ring-amber-400/20'
                : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-100 hover:border-zinc-600'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="text-left leading-none max-w-[210px]">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-0.5">
                BABAK AKTIF
              </span>
              <span className="text-xs font-black text-amber-300 uppercase tracking-wide truncate block">
                {displayRoundLabel}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-zinc-400 ml-1 transition-transform duration-200 shrink-0 ${
                isRoundDropdownOpen ? 'rotate-180 text-amber-400' : ''
              }`}
            />
          </button>

          {isRoundDropdownOpen && (
            <div className="absolute right-0 top-11 z-50 bg-[#16171d] border border-zinc-700/90 rounded-xl shadow-2xl p-2.5 w-84 space-y-1.5 animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[10px] font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-800 flex items-center justify-between">
                <span>Pilih Babak Resmi (Rundown LCC 2026)</span>
                <span className="text-amber-400 font-mono text-[9px] font-bold">HOTEL MERCURE</span>
              </div>

              <div className="space-y-1 pt-1 max-h-72 overflow-y-auto">
                {GRAND_FINAL_ROUNDS.map((round) => {
                  const isSelected = currentRoundTitle === round.title;
                  return (
                    <button
                      key={round.title}
                      type="button"
                      onClick={() => {
                        updateStageConfig({ current_round_title: round.title });
                        setIsRoundDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-all flex items-start justify-between group cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/35 shadow-sm'
                          : 'text-zinc-300 hover:bg-zinc-800/90 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-start space-x-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                            isSelected
                              ? 'bg-amber-400 ring-2 ring-amber-400/30'
                              : 'bg-zinc-600 group-hover:bg-zinc-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="tracking-wide uppercase font-bold text-xs truncate">
                            {round.shortLabel}
                          </div>
                          <div className="text-[10px] font-normal text-zinc-400 mt-0.5 truncate">
                            {round.scoringRule}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Round Input */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    placeholder="Judul babak kustom..."
                    value={customRoundInput}
                    onChange={(e) => setCustomRoundInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customRoundInput.trim()) {
                        e.preventDefault();
                        updateStageConfig({ current_round_title: customRoundInput.trim().toUpperCase() });
                        setCustomRoundInput('');
                        setIsRoundDropdownOpen(false);
                      }
                    }}
                    className="flex-1 min-w-0 h-8 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg px-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!customRoundInput.trim()}
                    onClick={() => {
                      if (customRoundInput.trim()) {
                        updateStageConfig({ current_round_title: customRoundInput.trim().toUpperCase() });
                        setCustomRoundInput('');
                        setIsRoundDropdownOpen(false);
                      }
                    }}
                    className="h-8 px-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-zinc-950 font-bold text-xs rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    Setel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          3. MAIN CONTENT: THE 5 PODIUM CARDS (Pixel-Aligned Grid)
      ======================================================== */}
      <main className="flex-1 w-full max-w-[1540px] mx-auto px-4 md:px-6 py-4 overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[1080px] xl:min-w-0">
          {currentTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              rank={rankMap.get(team.id) || 1}
              isLeader={team.id === currentLeader?.id}
              onUpdateScore={updateScore}
              onSetCustomScore={setCustomScore}
              onUpdateIdentity={updateTeamIdentity}
            />
          ))}
        </div>
      </main>

      {/* ========================================================
          4. BOTTOM STATUS STRIP (Compact & Useful h-9.5)
      ======================================================== */}
      <footer className="h-9.5 bg-[#111216] border-t border-zinc-800/90 px-4 md:px-6 flex items-center justify-between text-xs text-zinc-400 shrink-0">
        <div
          onClick={() => setIsHistoryModalOpen(true)}
          className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
          title="Klik untuk melihat riwayat input lengkap & rekap per babak"
        >
          <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center space-x-1 font-mono">
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>AKTIVITAS TERAKHIR:</span>
          </span>
          {lastAction ? (
            <div className="flex items-center space-x-1.5 text-[11px]">
              <span className="font-bold text-zinc-200">{lastAction.regu}</span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  lastAction.delta > 0
                    ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/30'
                    : 'text-rose-300 bg-rose-950/80 border border-rose-500/30'
                }`}
              >
                {lastAction.delta > 0 ? `+${lastAction.delta}` : lastAction.delta}
              </span>
              <span className="font-mono text-zinc-400">
                ({lastAction.previousScore} → {lastAction.newScore})
              </span>
              <span className="text-[10px] text-amber-400/90 font-semibold uppercase">
                • {lastAction.roundTitle || 'Grand Final'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                ({new Date(lastAction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
              </span>
              <span className="text-[10px] text-cyan-400 underline ml-1 font-medium hidden sm:inline">
                Buka Log ({history.length}) ↗
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-500 hover:text-zinc-300 underline">
              Belum ada perubahan poin. Klik untuk buka log riwayat & rekap juri.
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden md:inline text-[11px] text-zinc-500">
            Pintasan: <kbd className="px-1 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-zinc-400 font-mono">A</kbd> Admin • <kbd className="px-1 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-zinc-400 font-mono">D</kbd> Layar
          </span>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-md border border-rose-900/40 hover:bg-rose-950/40 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Skor</span>
          </button>
        </div>
      </footer>

      {/* MODAL RIWAYAT SKOR & REKAP PER BABAK */}
      <ScoreHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        teams={teams}
        activeCategory={activeAdminTab}
        currentRoundTitle={stageConfig.current_round_title || 'GRAND FINAL'}
        onUndoLastAction={undoLastAction}
        presentationMode={currentPresentationMode}
        onSetStagePresentationMode={handleSetPresentationMode}
        isShowingRecapOnStage={currentPresentationMode === 'recap'}
        onToggleStageRecap={() =>
          handleSetPresentationMode(currentPresentationMode === 'recap' ? 'scoreboard' : 'recap')
        }
      />

      {/* MODAL SUPABASE CONFIG */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        connectionStatus={connectionStatus}
      />

      {/* MODAL CONFIRM RESET */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-[#16171d] border border-rose-500/40 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-base font-black text-rose-400 uppercase tracking-wide mb-2 flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reset Semua Skor Pertandingan?</span>
            </h3>
            <p className="text-xs text-zinc-300 mb-6 leading-relaxed">
              Tindakan ini akan mengembalikan seluruh skor Regu A sampai Regu E ke angka <strong className="text-white">0</strong> untuk seluruh tim. Riwayat skor dan audit log akan dibersihkan untuk sesi baru.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllScores();
                  setIsResetConfirmOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Ya, Reset Skor ke 0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};