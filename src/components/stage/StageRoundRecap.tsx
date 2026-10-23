import React from 'react';
import type { Category, ScoreHistoryItem, Team } from '../../types';
import { Trophy, Award, CheckCircle2 } from 'lucide-react';

interface StageRoundRecapProps {
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
    glowClass: string;
  }
> = {
  'Regu A': {
    badgeBg: 'bg-sky-500',
    badgeText: 'text-slate-950',
    borderClass: 'border-sky-400 ring-sky-400',
    glowClass: 'shadow-sky-500/40',
  },
  'Regu B': {
    badgeBg: 'bg-amber-400',
    badgeText: 'text-slate-950',
    borderClass: 'border-amber-400 ring-amber-400',
    glowClass: 'shadow-amber-400/50',
  },
  'Regu C': {
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
    borderClass: 'border-rose-400 ring-rose-400',
    glowClass: 'shadow-rose-500/40',
  },
  'Regu D': {
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-slate-950',
    borderClass: 'border-emerald-400 ring-emerald-400',
    glowClass: 'shadow-emerald-500/40',
  },
  'Regu E': {
    badgeBg: 'bg-purple-500',
    badgeText: 'text-white',
    borderClass: 'border-purple-400 ring-purple-400',
    glowClass: 'shadow-purple-500/40',
  },
};

export const StageRoundRecap: React.FC<StageRoundRecapProps> = ({
  teams,
  history,
  activeCategoryView,
  currentRoundTitle
}) => {
  // Determine effective category to display
  const targetCategory: Category =
    activeCategoryView === 'siswa_sma' ? 'siswa_sma' : 'mahasiswa_umum';

  // Filter and sort teams by desk order (Regu A -> Regu E)
  const categoryTeams = teams
    .filter((t) => t.category === targetCategory)
    .sort((a, b) => a.regu.localeCompare(b.regu));

  // Compute rank map based on score
  const sortedByScore = [...categoryTeams].sort((a, b) => b.score - a.score);
  const rankMap = new Map<string, number>();
  sortedByScore.forEach((t, idx) => rankMap.set(t.id, idx + 1));

  // Filter history by category
  const categoryHistory = history.filter((item) => item.category === targetCategory);

  // Compute breakdown points per round with guaranteed mathematical integrity:
  // For EVERY team, (wajib + amplop + rebutan1 + rebutan2 + tie) === team.score ALWAYS!
  const roundBreakdown = new Map<
    string,
    {
      wajib: number;
      amplop: number;
      rebutan1: number;
      rebutan2: number;
      tie: number;
    }
  >();

  categoryTeams.forEach((team) => {
    let wajib = 0;
    let amplop = 0;
    let rebutan1 = 0;
    let rebutan2 = 0;
    let tie = 0;

    // 1. Accumulate logged history items
    categoryHistory
      .filter((h) => h.teamId === team.id)
      .forEach((item) => {
        const r = (item.roundTitle || '').toUpperCase();
        if (r.includes('WAJIB')) {
          wajib += item.delta;
        } else if (r.includes('AMPLOP')) {
          amplop += item.delta;
        } else if (r.includes('REBUTAN I') || r === 'BABAK REBUTAN') {
          rebutan1 += item.delta;
        } else if (r.includes('REBUTAN II')) {
          rebutan2 += item.delta;
        } else if (r.includes('PENENTU') || r.includes('TIE')) {
          tie += item.delta;
        } else {
          rebutan1 += item.delta;
        }
      });

    // 2. Mathematically reconcile any residual/unallocated points (e.g. from manual edits or baseline)
    const loggedTotal = wajib + amplop + rebutan1 + rebutan2 + tie;
    const residual = team.score - loggedTotal;

    if (residual !== 0) {
      const active = (currentRoundTitle || '').toUpperCase();
      if (active.includes('AMPLOP')) {
        amplop += residual;
      } else if (active.includes('REBUTAN I') || active === 'BABAK REBUTAN') {
        rebutan1 += residual;
      } else if (active.includes('REBUTAN II')) {
        rebutan2 += residual;
      } else if (active.includes('PENENTU') || active.includes('TIE')) {
        tie += residual;
      } else {
        // Default residual into Babak I (Wajib)
        wajib += residual;
      }
    }

    roundBreakdown.set(team.id, { wajib, amplop, rebutan1, rebutan2, tie });
  });

  const hasTieBreaker = Array.from(roundBreakdown.values()).some((r) => r.tie !== 0);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/40 border border-yellow-200 inline-flex items-center space-x-1">
            <span>👑 JUARA 1</span>
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 shadow border border-white inline-block">
            JUARA 2
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100 shadow border border-amber-500/40 inline-block">
            JUARA 3
          </span>
        );
      case 4:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700 inline-block">
            HARAPAN 1
          </span>
        );
      case 5:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700 inline-block">
            HARAPAN 2
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700 inline-block">
            #{rank}
          </span>
        );
    }
  };

  const categoryLabel =
    targetCategory === 'mahasiswa_umum'
      ? 'KATEGORI MAHASISWA / KOMUNITAS (MALAM)'
      : 'KATEGORI SISWA SMA / SEDERAJAT (SORE)';

  return (
    <div className="w-full max-w-6xl mx-auto my-auto z-20 px-2 sm:px-4 py-1">
      {/* Outer Grand Final Stage Board: Cohesive Frosted Glass on Vibrant Stage */}
      <div className="bg-slate-950/75 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-4 md:p-5 shadow-[0_25px_80px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col justify-between max-h-[85vh]">
        {/* Luminous Top Gradient Accent Line matching stage vibe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400" />

        {/* Top Header Strip (Clean, Compact, Broadcast-Grade) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-3 mb-2 border-b border-white/15 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 shrink-0">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-wide drop-shadow-sm">
                  REKAPITULASI RESMI DEWAN JURI
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  GRAND FINAL
                </span>
              </div>
              <p className="text-[11px] font-semibold text-cyan-200/90 tracking-wide">
                {categoryLabel} • Ballroom Hotel Mercure Pontianak Lt. 9
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 rounded-xl bg-slate-900/80 border border-white/20 flex items-center space-x-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">BABAK TERKINI:</span>
              <span className="font-extrabold text-amber-300 uppercase tracking-wide">
                {currentRoundTitle}
              </span>
            </div>
          </div>
        </div>

        {/* The Matrix Table (Compact & Perfectly Contained) */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[780px]">
            {/* Table Header: Meja Columns with Elegant Circular Avatar & Visible Name */}
            <thead>
              <tr className="border-b-2 border-white/15">
                <th className="py-2.5 px-3 text-xs font-mono font-black text-cyan-300 uppercase tracking-wider w-52 align-middle">
                  BABAK PERTANDINGAN
                </th>
                {categoryTeams.map((team) => {
                  const theme = DESK_THEMES[team.regu] || DESK_THEMES['Regu A'];
                  const rank = rankMap.get(team.id) || 1;
                  const isLeader = rank === 1 && team.score > 0;

                  return (
                    <th key={team.id} className="py-2 px-2 text-center w-44 align-top">
                      <div className="flex flex-col items-center">
                        {/* Desk Pill */}
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase shadow-sm mb-1.5 ${theme.badgeBg} ${theme.badgeText}`}
                        >
                          {team.regu}
                        </span>

                        {/* Elegant Circular Avatar with Glowing Desk Ring */}
                        <div className="relative">
                          {isLeader && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm z-10 select-none filter drop-shadow">
                              👑
                            </span>
                          )}
                          <div
                            className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 bg-slate-900 shadow-lg ${
                              theme.borderClass
                            } ${
                              isLeader
                                ? 'ring-4 ring-amber-400 shadow-amber-400/50 scale-105'
                                : 'ring-2 ring-white/20'
                            } transition-transform`}
                          >
                            <img
                              src={team.photo_url || '/placeholder-team.png'}
                              alt={team.team_name}
                              className="w-full h-full object-cover rounded-full bg-slate-900"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-team.png';
                              }}
                            />
                          </div>
                        </div>

                        {/* Team Name & Campus */}
                        <div className="w-full mt-1.5 text-center">
                          <h4
                            className="text-xs md:text-sm font-black text-white leading-tight drop-shadow truncate px-1"
                            title={team.team_name}
                          >
                            {team.team_name}
                          </h4>
                          <p
                            className="text-[10px] md:text-[11px] font-semibold text-cyan-200/90 leading-tight mt-0.5 truncate px-1"
                            title={team.institution}
                          >
                            {team.institution}
                          </p>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body: The Rounds */}
            <tbody className="divide-y divide-white/10 text-xs">
              {/* Row 1: Babak I (Wajib Tim) */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-2 px-3">
                  <div className="font-extrabold text-white text-xs">
                    BABAK I: WAJIB TIM
                  </div>
                  <div className="text-[10px] text-cyan-300/80 font-medium">
                    10 Soal per Tim • Benar +100
                  </div>
                </td>
                {categoryTeams.map((team) => {
                  const pts = roundBreakdown.get(team.id)?.wajib || 0;
                  return (
                    <td key={team.id} className="py-2 px-2 text-center">
                      <span
                        className={`font-mono font-bold text-sm md:text-base ${
                          pts > 0 ? 'text-white font-black' : pts < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {pts}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Babak II (Amplop Lemparan) */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-2 px-3">
                  <div className="font-extrabold text-white text-xs">
                    BABAK II: AMPLOP LEMPARAN
                  </div>
                  <div className="text-[10px] text-cyan-300/80 font-medium">
                    Soal Lemparan • +100 / -50
                  </div>
                </td>
                {categoryTeams.map((team) => {
                  const pts = roundBreakdown.get(team.id)?.amplop || 0;
                  return (
                    <td key={team.id} className="py-2 px-2 text-center">
                      <span
                        className={`font-mono font-bold text-sm md:text-base ${
                          pts > 0 ? 'text-white font-black' : pts < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {pts}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Babak III (Rebutan I) */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-2 px-3">
                  <div className="font-extrabold text-white text-xs">
                    BABAK III: REBUTAN I
                  </div>
                  <div className="text-[10px] text-cyan-300/80 font-medium">
                    10 Soal Rebutan • +100 / -100
                  </div>
                </td>
                {categoryTeams.map((team) => {
                  const pts = roundBreakdown.get(team.id)?.rebutan1 || 0;
                  return (
                    <td key={team.id} className="py-2 px-2 text-center">
                      <span
                        className={`font-mono font-bold text-sm md:text-base ${
                          pts > 0 ? 'text-white font-black' : pts < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {pts}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Babak IV (Rebutan II) */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-2 px-3">
                  <div className="font-extrabold text-white text-xs">
                    BABAK IV: REBUTAN II
                  </div>
                  <div className="text-[10px] text-cyan-300/80 font-medium">
                    10 Soal Penutup • +100 / -100
                  </div>
                </td>
                {categoryTeams.map((team) => {
                  const pts = roundBreakdown.get(team.id)?.rebutan2 || 0;
                  return (
                    <td key={team.id} className="py-2 px-2 text-center">
                      <span
                        className={`font-mono font-bold text-sm md:text-base ${
                          pts > 0 ? 'text-white font-black' : pts < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {pts}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Optional Row 5: Soal Penentu (Tie-Breaker) */}
              {hasTieBreaker && (
                <tr className="hover:bg-white/5 transition-colors bg-purple-950/20">
                  <td className="py-2 px-3">
                    <div className="font-extrabold text-purple-300 text-xs">
                      SOAL PENENTU (TIE-BREAKER)
                    </div>
                    <div className="text-[10px] text-purple-200/80 font-medium">
                      Penentuan Nilai Seri
                    </div>
                  </td>
                  {categoryTeams.map((team) => {
                    const pts = roundBreakdown.get(team.id)?.tie || 0;
                    return (
                      <td key={team.id} className="py-2 px-2 text-center">
                        <span className="font-mono font-bold text-sm md:text-base text-purple-200">
                          {pts}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              )}

              {/* Row 6: TOTAL SKOR AKHIR (Heroic Royal Indigo & Cyan Accent Bar) */}
              <tr className="bg-gradient-to-r from-indigo-950/80 via-slate-900/95 to-indigo-950/80 border-y-2 border-cyan-400/50">
                <td className="py-2 px-3">
                  <div className="font-black text-amber-300 text-xs md:text-sm tracking-wide uppercase">
                    TOTAL SKOR AKHIR
                  </div>
                  <div className="text-[10px] text-cyan-200/90 font-mono font-bold">
                    Akumulasi Resmi Dewan Juri
                  </div>
                </td>
                {categoryTeams.map((team) => {
                  const rank = rankMap.get(team.id) || 1;
                  const isLeader = rank === 1 && team.score > 0;

                  return (
                    <td key={team.id} className="py-2 px-2 text-center">
                      <div
                        className={`inline-block px-3.5 py-1 rounded-xl font-black font-mono text-xl md:text-2xl tabular-nums shadow-lg ${
                          isLeader
                            ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-2 border-yellow-200 shadow-amber-400/50 scale-105'
                            : 'bg-slate-900/90 text-white border border-white/20'
                        }`}
                      >
                        {team.score}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 7: Peringkat / Klasifikasi Juara */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-2 px-3">
                  <div className="font-black text-white text-xs uppercase flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>KLASIFIKASI JUARA</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Hasil Akhir Grand Final
                  </div>
                </td>
                {categoryTeams.map((team) => {
                  const rank = rankMap.get(team.id) || 1;
                  return (
                    <td key={team.id} className="py-2 px-2 text-center">
                      {getRankBadge(rank)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Verification Footer (Clean, Compact) */}
        <div className="mt-2 pt-2 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-cyan-200/80 gap-1 shrink-0">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">
              Disahkan oleh Dewan Juri & Panitia Pelaksana LCC Pemuda Kota Pontianak 2026
            </span>
          </div>
          <div className="font-mono text-slate-400 text-[10px]">
            HUT KE-255 KOTA PONTIANAK • BALLROOM HOTEL MERCURE LT. 9
          </div>
        </div>
      </div>
    </div>
  );
};
