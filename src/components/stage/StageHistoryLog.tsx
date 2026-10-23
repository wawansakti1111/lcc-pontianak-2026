import React from 'react';
import type { Category, ScoreHistoryItem, Team } from '../../types';
import { History, ShieldCheck, Clock, ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StageHistoryLogProps {
  teams: Team[];
  history: ScoreHistoryItem[];
  activeCategoryView: Category | 'dual';
  currentRoundTitle: string;
}

const DESK_THEMES: Record<
  string,
  {
    badgeBg: string;
    badgeText: string;
    borderClass: string;
    ringClass: string;
    glowClass: string;
  }
> = {
  'Regu A': {
    badgeBg: 'bg-sky-500',
    badgeText: 'text-slate-950',
    borderClass: 'border-sky-400',
    ringClass: 'ring-sky-400',
    glowClass: 'shadow-sky-500/40',
  },
  'Regu B': {
    badgeBg: 'bg-amber-400',
    badgeText: 'text-slate-950',
    borderClass: 'border-amber-400',
    ringClass: 'ring-amber-400',
    glowClass: 'shadow-amber-400/50',
  },
  'Regu C': {
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
    borderClass: 'border-rose-400',
    ringClass: 'ring-rose-400',
    glowClass: 'shadow-rose-500/40',
  },
  'Regu D': {
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-slate-950',
    borderClass: 'border-emerald-400',
    ringClass: 'ring-emerald-400',
    glowClass: 'shadow-emerald-500/40',
  },
  'Regu E': {
    badgeBg: 'bg-purple-500',
    badgeText: 'text-white',
    borderClass: 'border-purple-400',
    ringClass: 'ring-purple-400',
    glowClass: 'shadow-purple-500/40',
  },
};

export const StageHistoryLog: React.FC<StageHistoryLogProps> = ({
  teams,
  history,
  activeCategoryView,
  currentRoundTitle
}) => {
  // Determine effective category to display
  const targetCategory: Category =
    activeCategoryView === 'siswa_sma' ? 'siswa_sma' : 'mahasiswa_umum';

  // Filter history by category (newest first)
  const categoryHistory = history
    .filter((item) => item.category === targetCategory)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Quick lookup for team details
  const teamMap = new Map<string, Team>();
  teams.forEach((t) => teamMap.set(t.id, t));

  const categoryLabel =
    targetCategory === 'mahasiswa_umum'
      ? 'KATEGORI MAHASISWA / KOMUNITAS (MALAM)'
      : 'KATEGORI SISWA SMA / SEDERAJAT (SORE)';

  const getActionRemark = (item: ScoreHistoryItem) => {
    if (item.delta === 100) return 'Jawaban Benar (+100)';
    if (item.delta === 50) return 'Bonus Lemparan (+50)';
    if (item.delta === -50) return 'Salah Lemparan (-50)';
    if (item.delta === -100) return 'Salah Rebutan (-100)';
    if (item.delta === -25) return 'Salah Cepat (-25)';
    if (item.delta > 0) return `Penambahan Poin (+${item.delta})`;
    return `Pengurangan Poin (${item.delta})`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-auto z-20 px-2 sm:px-4 py-1">
      {/* Outer Grand Final Stage Board: Glassmorphism on Vibrant Stage */}
      <div className="bg-slate-950/75 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-4 md:p-5 shadow-[0_25px_80px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col justify-between max-h-[85vh]">
        {/* Luminous Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400" />

        {/* Top Header Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-3 mb-2 border-b border-white/15 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30 shrink-0">
              <History className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-wide drop-shadow-sm">
                  LOG AUDIT POIN REALTIME
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  TRANSPARANSI JURI
                </span>
              </div>
              <p className="text-[11px] font-semibold text-cyan-200/90 tracking-wide">
                {categoryLabel} • Ballroom Hotel Mercure Pontianak Lt. 9
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center space-x-2 text-xs text-emerald-300 font-extrabold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="tracking-wide text-[11px]">ON AIR AUDIT FEED</span>
            </div>

            <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-white/20 text-xs text-slate-200 font-mono shadow-sm">
              Total Log: <strong className="text-amber-300 font-black">{categoryHistory.length}</strong>
            </div>
          </div>
        </div>

        {/* The Live Audit Table */}
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto pr-1 flex-1">
          {categoryHistory.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <ShieldCheck className="w-14 h-14 text-cyan-400/60 mx-auto" />
              <p className="text-base font-bold text-white">
                Belum ada aktivitas skor yang tercatat untuk sesi ini.
              </p>
              <p className="text-xs text-cyan-200/70 max-w-md mx-auto">
                Setiap kali juri atau admin memasukkan perubahan poin per babak, audit log transparansi akan tampil di layar panggung secara instan.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b-2 border-white/15 text-xs font-mono font-black text-cyan-300 uppercase tracking-wider">
                  <th className="py-3 px-3 w-32">WAKTU</th>
                  <th className="py-3 px-3 w-48">BABAK</th>
                  <th className="py-3 px-3 w-80">TIM / REGU</th>
                  <th className="py-3 px-3 text-center w-36">PERUBAHAN</th>
                  <th className="py-3 px-3 text-center w-44">PROGRESI SKOR</th>
                  <th className="py-3 px-3">KETERANGAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs">
                {categoryHistory.slice(0, 20).map((item, idx) => {
                  const deskTheme = DESK_THEMES[item.regu] || DESK_THEMES['Regu A'];
                  const matchedTeam = teamMap.get(item.teamId);
                  const photoUrl =
                    matchedTeam?.photo_url ||
                    (item as unknown as { photo_url?: string }).photo_url ||
                    '/placeholder-team.png';
                  const teamName = matchedTeam?.team_name || item.teamName;
                  const institution = matchedTeam?.institution;
                  const isPositive = item.delta > 0;

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-white/5 transition-colors"
                    >
                      {/* Waktu */}
                      <td className="py-3 px-3 font-mono text-xs text-slate-300 whitespace-nowrap align-middle">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-bold">
                            {new Date(item.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}{' '}
                            <span className="text-[10px] text-cyan-200/70 font-mono">WIB</span>
                          </span>
                        </div>
                      </td>

                      {/* Babak */}
                      <td className="py-3 px-3 align-middle">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-900/90 border border-white/20 text-amber-300 inline-block truncate max-w-[170px] shadow-sm">
                          {item.roundTitle || currentRoundTitle || 'GRAND FINAL'}
                        </span>
                      </td>

                      {/* Tim & Regu with LARGE Photo and BOLD Name */}
                      <td className="py-3 px-3 align-middle">
                        <div className="flex items-center space-x-3">
                          {/* Large Prominent Team Photo */}
                          <div
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 bg-slate-900 shadow-md shrink-0 ${deskTheme.borderClass} ring-2 ring-white/20`}
                          >
                            <img
                              src={photoUrl}
                              alt={teamName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-team.png';
                              }}
                            />
                          </div>

                          {/* Bold, Visible Team Info */}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm ${deskTheme.badgeBg} ${deskTheme.badgeText}`}
                              >
                                {item.regu}
                              </span>
                              {institution && (
                                <span className="text-[11px] font-semibold text-cyan-200/90 truncate max-w-[170px]">
                                  {institution}
                                </span>
                              )}
                            </div>
                            <span className="font-black text-white text-sm md:text-base leading-tight truncate max-w-[220px] drop-shadow-sm">
                              {teamName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Perubahan Poin (Bold Pill) */}
                      <td className="py-3 px-3 text-center align-middle">
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-xl font-black font-mono text-sm md:text-base tracking-wide shadow-md ${
                            isPositive
                              ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50 shadow-emerald-500/20'
                              : 'bg-rose-500/20 text-rose-300 border-2 border-rose-400/50 shadow-rose-500/20'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-4 h-4 stroke-[3] text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 stroke-[3] text-rose-400" />
                          )}
                          <span>{isPositive ? `+${item.delta}` : item.delta}</span>
                        </span>
                      </td>

                      {/* Progresi Skor (Before -> After) */}
                      <td className="py-3 px-3 text-center align-middle">
                        <div className="inline-flex items-center space-x-2 font-mono text-xs md:text-sm bg-slate-900/90 px-3 py-1 rounded-xl border border-white/20 shadow-sm">
                          <span className="text-slate-400 font-bold">{item.previousScore}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                          <span className="text-white font-black text-base">{item.newScore}</span>
                        </div>
                      </td>

                      {/* Keterangan */}
                      <td className="py-3 px-3 text-xs font-semibold text-cyan-100/90 align-middle">
                        <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 inline-block">
                          {getActionRemark(item)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Verification Footer */}
        <div className="mt-2 pt-2 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-cyan-200/80 gap-1 shrink-0">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">
              Transparansi Nilai Terverifikasi Resmi • Panitia & Dewan Juri LCC 2026
            </span>
          </div>
          <div className="font-mono font-bold text-amber-300/90 text-[10px]">
            HUT KE-255 KOTA PONTIANAK • BALLROOM HOTEL MERCURE LT. 9
          </div>
        </div>
      </div>
    </div>
  );
};