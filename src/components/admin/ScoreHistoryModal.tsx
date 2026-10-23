import React, { useState } from 'react';
import type { Category, ScoreHistoryItem, Team } from '../../types';
import { X, History, Table, Filter, Copy, Check, ArrowRight, RotateCcw, Tv } from 'lucide-react';

interface ScoreHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScoreHistoryItem[];
  teams: Team[];
  activeCategory: Category;
  currentRoundTitle: string;
  onUndoLastAction?: () => void;
  presentationMode?: 'scoreboard' | 'recap' | 'history';
  onSetStagePresentationMode?: (mode: 'scoreboard' | 'recap' | 'history') => void;
  isShowingRecapOnStage?: boolean;
  onToggleStageRecap?: () => void;
}

const REGU_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  'Regu A': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/40' },
  'Regu B': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40' },
  'Regu C': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/40' },
  'Regu D': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  'Regu E': { bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/40' },
};

export const ScoreHistoryModal: React.FC<ScoreHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  teams,
  activeCategory,
  currentRoundTitle,
  onUndoLastAction,
  presentationMode,
  onSetStagePresentationMode,
  isShowingRecapOnStage,
  onToggleStageRecap
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'recap'>('log');
  const [filterRegu, setFilterRegu] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const currentMode =
    presentationMode || (isShowingRecapOnStage ? 'recap' : 'scoreboard');

  const handleToggleCurrentTabOnStage = () => {
    if (!onSetStagePresentationMode) {
      onToggleStageRecap?.();
      return;
    }
    if (activeTab === 'log') {
      if (currentMode === 'history') {
        onSetStagePresentationMode('scoreboard');
      } else {
        onSetStagePresentationMode('history');
      }
    } else {
      if (currentMode === 'recap') {
        onSetStagePresentationMode('scoreboard');
      } else {
        onSetStagePresentationMode('recap');
      }
    }
  };

  if (!isOpen) return null;

  // Filter history by current active category
  const categoryHistory = history.filter((item) => item.category === activeCategory);

  // Apply Regu filter
  const filteredHistory = filterRegu === 'all'
    ? categoryHistory
    : categoryHistory.filter((item) => item.regu === filterRegu);

  // Current category teams sorted by score descending
  const categoryTeams = teams
    .filter((t) => t.category === activeCategory)
    .sort((a, b) => b.score - a.score);

  // Calculate points per round for each team from history
  const roundBreakdownMap = new Map<string, Record<string, number>>();
  categoryTeams.forEach((team) => {
    roundBreakdownMap.set(team.id, {
      'Babak I: Wajib Tim': 0,
      'Babak II: Amplop': 0,
      'Babak III: Rebutan I': 0,
      'Babak IV: Rebutan II': 0,
      'Lainnya': 0
    });
  });

  categoryHistory.forEach((item) => {
    const teamRecord = roundBreakdownMap.get(item.teamId);
    if (teamRecord) {
      const r = item.roundTitle || '';
      if (r.includes('WAJIB')) {
        teamRecord['Babak I: Wajib Tim'] += item.delta;
      } else if (r.includes('AMPLOP')) {
        teamRecord['Babak II: Amplop'] += item.delta;
      } else if (r.includes('REBUTAN I') || r === 'BABAK REBUTAN') {
        teamRecord['Babak III: Rebutan I'] += item.delta;
      } else if (r.includes('REBUTAN II')) {
        teamRecord['Babak IV: Rebutan II'] += item.delta;
      } else {
        teamRecord['Lainnya'] += item.delta;
      }
    }
  });

  const handleCopyRecap = () => {
    const categoryName = activeCategory === 'mahasiswa_umum' ? 'Mahasiswa / Komunitas' : 'Siswa SMA';
    const lines = [
      `🏆 REKAPITULASI RESMI GRAND FINAL LCC PEMUDA PONTIANAK 2026`,
      `Kategori: ${categoryName}`,
      `Babak Terkini: ${currentRoundTitle || 'GRAND FINAL'}`,
      `Waktu: ${new Date().toLocaleTimeString()} WIB`,
      `--------------------------------------------------`
    ];

    categoryTeams.forEach((t, idx) => {
      lines.push(`${idx + 1}. [${t.regu}] ${t.team_name} (${t.institution}): ${t.score} Poin`);
    });

    lines.push(`--------------------------------------------------`);
    lines.push(`Disahkan oleh Dewan Juri & Operator Skor.`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#131418] border-2 border-zinc-700/80 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 bg-[#16171b] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center space-x-2">
                <span>RIWAYAT SKOR & REKAP PER BABAK</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">
                  {activeCategory === 'mahasiswa_umum' ? 'Mahasiswa/Komunitas' : 'Siswa SMA'}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Log audit pencatatan nilai per tim dan per babak pertandingan
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Stage Broadcast Button for Current Tab */}
            {(onSetStagePresentationMode || onToggleStageRecap) && (
              <button
                type="button"
                onClick={handleToggleCurrentTabOnStage}
                className={`h-8 px-3 rounded-lg font-bold text-xs border flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm cursor-pointer ${
                  (activeTab === 'log' && currentMode === 'history') ||
                  (activeTab === 'recap' && currentMode === 'recap')
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border-zinc-700'
                }`}
                title={
                  (activeTab === 'log' && currentMode === 'history') ||
                  (activeTab === 'recap' && currentMode === 'recap')
                    ? 'Layar panggung sedang menayangkan tampilan ini. Klik untuk kembali ke skor live'
                    : `Tayangkan ${activeTab === 'log' ? 'Log Audit' : 'Rekapitulasi'} ini ke Layar Panggung Penonton`
                }
              >
                <Tv className="w-3.5 h-3.5" />
                <span>
                  {activeTab === 'log'
                    ? currentMode === 'history'
                      ? '● On Air Log di Panggung'
                      : 'Tayang Log ke Panggung'
                    : currentMode === 'recap'
                    ? '● On Air Rekap di Panggung'
                    : 'Tayang Rekap ke Panggung'}
                </span>
              </button>
            )}

            {/* Revert to Scoreboard if any overlay is active on stage */}
            {currentMode !== 'scoreboard' && onSetStagePresentationMode && (
              <button
                type="button"
                onClick={() => onSetStagePresentationMode('scoreboard')}
                className="h-8 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs border border-zinc-700 transition-colors cursor-pointer"
                title="Kembalikan Layar Panggung ke Tampilan Skor Live Bar"
              >
                Ke Skor Live
              </button>
            )}

            <button
              onClick={handleCopyRecap}
              className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs border border-zinc-700 flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm"
              title="Salin rekap skor terkini ke clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Salin Rekap</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors border border-transparent hover:border-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-5 py-2 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('log')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'log'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Log Riwayat Input ({categoryHistory.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'recap'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-amber-400" />
              <span>Rekap Klasemen Per Babak</span>
            </button>
          </div>

          {activeTab === 'log' && (
            <div className="flex items-center space-x-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
              <button
                onClick={() => setFilterRegu('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  filterRegu === 'all'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Semua Meja
              </button>
              {['Regu A', 'Regu B', 'Regu C', 'Regu D', 'Regu E'].map((regu) => (
                <button
                  key={regu}
                  onClick={() => setFilterRegu(regu)}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    filterRegu === regu
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {regu}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'log' ? (
            /* TAB 1: CHRONOLOGICAL LOG WITH TEAM & ROUND */
            filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 space-y-2">
                <History className="w-8 h-8 mx-auto text-zinc-600 opacity-60" />
                <p className="text-sm font-semibold">Belum ada riwayat perubahan poin untuk kategori ini.</p>
                <p className="text-xs text-zinc-500">Setiap penambahan atau pengurangan skor akan tercatat otomatis di sini.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((item, idx) => {
                  const reguStyle = REGU_BADGES[item.regu] || REGU_BADGES['Regu A'];
                  const isPositive = item.delta > 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/90 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 shadow-sm"
                    >
                      {/* Left: Regu & Team */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="text-zinc-600 font-mono text-xs w-5 text-right font-bold shrink-0">
                          #{filteredHistory.length - idx}
                        </span>

                        <div className={`px-2.5 py-1 rounded-lg border font-black text-xs font-mono shrink-0 ${reguStyle.bg} ${reguStyle.text} ${reguStyle.border}`}>
                          {item.regu}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.teamName}
                          </h4>
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block truncate">
                            {item.roundTitle || 'GRAND FINAL'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Delta Badge & Score Progression */}
                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-right">
                          <div className="font-mono text-xs text-zinc-400">
                            <span>{item.previousScore}</span>
                            <ArrowRight className="w-3 h-3 inline mx-1 text-zinc-600" />
                            <span className="font-bold text-white">{item.newScore}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <span
                          className={`font-mono font-black text-xs px-2.5 py-1 rounded-lg border shadow-sm ${
                            isPositive
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                              : 'bg-rose-950/80 text-rose-400 border-rose-700/60'
                          }`}
                        >
                          {isPositive ? `+${item.delta}` : item.delta}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* TAB 2: REKAPITULASI KLASEMEN PER BABAK */
            <div className="space-y-3">
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#16171b] border-b border-zinc-800 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Peringkat & Meja</th>
                      <th className="py-2.5 px-3">Nama Tim</th>
                      <th className="py-2.5 px-3 text-right">Babak I (Wajib)</th>
                      <th className="py-2.5 px-3 text-right">Babak II (Amplop)</th>
                      <th className="py-2.5 px-3 text-right">Babak III (Rebutan)</th>
                      <th className="py-2.5 px-3 text-right">Babak IV (Final)</th>
                      <th className="py-2.5 px-3 text-right text-amber-400">TOTAL SKOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-mono">
                    {categoryTeams.map((team, rankIdx) => {
                      const breakdown = roundBreakdownMap.get(team.id) || {
                        'Babak I: Wajib Tim': 0,
                        'Babak II: Amplop': 0,
                        'Babak III: Rebutan I': 0,
                        'Babak IV: Rebutan II': 0,
                        'Lainnya': 0
                      };
                      const reguStyle = REGU_BADGES[team.regu] || REGU_BADGES['Regu A'];

                      return (
                        <tr key={team.id} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-2.5 px-3 font-sans">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-zinc-400 text-xs w-4">#{rankIdx + 1}</span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${reguStyle.bg} ${reguStyle.text} ${reguStyle.border}`}>
                                {team.regu}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-sans">
                            <div className="font-bold text-white text-xs truncate max-w-[150px]" title={team.team_name}>
                              {team.team_name}
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate max-w-[150px]" title={team.institution}>
                              {team.institution}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right text-zinc-300 font-bold">
                            {breakdown['Babak I: Wajib Tim'] > 0 ? `+${breakdown['Babak I: Wajib Tim']}` : breakdown['Babak I: Wajib Tim']}
                          </td>
                          <td className="py-2.5 px-3 text-right text-zinc-300 font-bold">
                            {breakdown['Babak II: Amplop'] > 0 ? `+${breakdown['Babak II: Amplop']}` : breakdown['Babak II: Amplop']}
                          </td>
                          <td className="py-2.5 px-3 text-right text-zinc-300 font-bold">
                            {breakdown['Babak III: Rebutan I'] > 0 ? `+${breakdown['Babak III: Rebutan I']}` : breakdown['Babak III: Rebutan I']}
                          </td>
                          <td className="py-2.5 px-3 text-right text-zinc-300 font-bold">
                            {breakdown['Babak IV: Rebutan II'] > 0 ? `+${breakdown['Babak IV: Rebutan II']}` : breakdown['Babak IV: Rebutan II']}
                          </td>
                          <td className="py-2.5 px-3 text-right text-sm font-black text-amber-400 bg-amber-500/5">
                            {team.score}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>Catatan: Angka babak dihitung secara otomatis berdasarkan penambahan poin saat babak tersebut aktif.</span>
                <span className="font-bold text-zinc-300">Format Grand Final 4 Babak</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#16171b] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center space-x-2">
            {onUndoLastAction && categoryHistory.length > 0 && (
              <button
                type="button"
                onClick={onUndoLastAction}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs border border-zinc-700 flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Batalkan Aksi Terakhir (Undo)</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
