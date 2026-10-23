import React, { useState, useRef } from 'react';
import type { Team } from '../../types';
import { compressTeamPhoto } from '../../utils/imageCompressor';
import { Camera, Edit3, Check, Plus, Minus, Crown, Loader2, X } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  rank: number;
  isLeader: boolean;
  onUpdateScore: (teamId: string, delta: number) => void;
  onSetCustomScore: (teamId: string, score: number) => void;
  onUpdateIdentity: (teamId: string, updates: Partial<Team>) => void;
}

// Sophisticated broadcast theme accents per desk (clean studio matte)
const REGU_THEMES: Record<
  string,
  {
    deskLetter: string;
    deskLabel: string;
    accentColor: string;
    badgeBg: string;
    topBarClass: string;
    avatarBorder: string;
  }
> = {
  'Regu A': {
    deskLetter: 'A',
    deskLabel: 'MEJA A',
    accentColor: '#38bdf8',
    badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    topBarClass: 'bg-sky-500',
    avatarBorder: 'border-sky-500/50',
  },
  'Regu B': {
    deskLetter: 'B',
    deskLabel: 'MEJA B',
    accentColor: '#fbbf24',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    topBarClass: 'bg-amber-500',
    avatarBorder: 'border-amber-500/50',
  },
  'Regu C': {
    deskLetter: 'C',
    deskLabel: 'MEJA C',
    accentColor: '#fb7185',
    badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    topBarClass: 'bg-rose-500',
    avatarBorder: 'border-rose-500/50',
  },
  'Regu D': {
    deskLetter: 'D',
    deskLabel: 'MEJA D',
    accentColor: '#34d399',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    topBarClass: 'bg-emerald-500',
    avatarBorder: 'border-emerald-500/50',
  },
  'Regu E': {
    deskLetter: 'E',
    deskLabel: 'MEJA E',
    accentColor: '#a78bfa',
    badgeBg: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
    topBarClass: 'bg-violet-500',
    avatarBorder: 'border-violet-500/50',
  },
};

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  rank,
  isLeader,
  onUpdateScore,
  onSetCustomScore,
  onUpdateIdentity
}) => {
  const theme = REGU_THEMES[team.regu] || REGU_THEMES['Regu A'];
  const [isEditing, setIsEditing] = useState(false);
  const [teamName, setTeamName] = useState(team.team_name);
  const [institution, setInstitution] = useState(team.institution);
  const [quickInput, setQuickInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveIdentity = () => {
    onUpdateIdentity(team.id, {
      team_name: teamName.trim() || team.team_name,
      institution: institution.trim() || team.institution
    });
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const compressedWebp = await compressTeamPhoto(file);
      onUpdateIdentity(team.id, { photo_url: compressedWebp });
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('Gagal mengompres gambar.');
    } finally {
      setUploading(false);
    }
  };

  const handleApplyDelta = (direction: 1 | -1 = 1) => {
    const val = parseInt(quickInput, 10);
    if (!isNaN(val) && val !== 0) {
      onUpdateScore(team.id, Math.abs(val) * direction);
      setQuickInput('');
    }
  };

  const handleApplyExact = () => {
    const val = parseInt(quickInput, 10);
    if (!isNaN(val)) {
      onSetCustomScore(team.id, val);
      setQuickInput('');
    }
  };

  const isLeadingScore = isLeader && team.score > 0;

  return (
    <div
      className={`bg-[#131418] rounded-2xl border flex flex-col justify-between transition-all min-w-[215px] shadow-xl shadow-black/50 relative overflow-hidden group select-none min-h-[580px] ${
        isLeadingScore
          ? 'border-amber-500/50 ring-1 ring-amber-400/40'
          : 'border-zinc-800/90 hover:border-zinc-700'
      }`}
    >
      {/* 1. Colored Top Header Bar */}
      <div className={`h-[4px] w-full ${theme.topBarClass}`} />

      {/* 2. Top Header: Desk Identity, Rank, and Edit Button */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-800/70 bg-[#17181f]/80">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase border ${theme.badgeBg}`}>
            {theme.deskLabel}
          </span>

          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
              isLeadingScore
                ? 'bg-amber-400/15 text-amber-300 border-amber-400/40 flex items-center space-x-1'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            {isLeadingScore ? (
              <>
                <Crown className="w-3 h-3 text-amber-400 fill-current inline" />
                <span>#1</span>
              </>
            ) : (
              `#${rank}`
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
          title="Edit Identitas Tim"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Card Body: Identity & LED Scoreboard Readout */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Team Photo & Info */}
          <div className="flex items-center space-x-3 mb-3.5">
            <div
              className={`relative group/photo cursor-pointer w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 bg-zinc-950 ${theme.avatarBorder}`}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              title="Klik untuk ganti foto tim"
            >
              <img
                src={team.photo_url || '/placeholder-team.png'}
                alt={team.team_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center text-white transition-opacity">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                ) : (
                  <Camera className="w-4 h-4 text-zinc-200" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Nama Tim"
                    className="w-full h-6.5 bg-zinc-950 border border-zinc-700 rounded px-2 text-xs text-white focus:outline-none focus:border-zinc-400 font-semibold"
                  />
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Asal Sekolah / Kampus"
                      className="flex-1 min-w-0 h-6 bg-zinc-950 border border-zinc-700 rounded px-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveIdentity}
                      className="h-6 px-2 bg-zinc-200 text-zinc-900 hover:bg-white text-[10px] font-bold rounded shrink-0 flex items-center cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-[15px] font-extrabold text-white truncate leading-snug" title={team.team_name}>
                    {team.team_name}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate mt-0.5 leading-none font-medium" title={team.institution}>
                    {team.institution}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Precision LED Scoreboard Readout Display */}
          <div className="bg-[#0b0c0f] border border-zinc-800/90 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">
              TOTAL SKOR
            </span>
            <div className={`text-5xl font-black tabular-nums tracking-tight font-mono text-white ${
              isLeadingScore ? 'drop-shadow-[0_2px_12px_rgba(251,191,36,0.25)]' : ''
            }`}>
              {team.score}
            </div>
          </div>
        </div>

        {/* 4. Tactile Scoring Controls (Ergonomic, Spacious & Solid) */}
        <div className="space-y-2.5 pt-1">
          {/* Quick Positive Scores: +100 & +50 (Solid Matte Broadcast Buttons) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdateScore(team.id, 100)}
              className="h-13 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-200 hover:text-white font-mono font-black text-lg flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
              title="Tambah 100 poin (Jawaban Benar)"
            >
              <Plus className="w-5 h-5 stroke-[3] text-emerald-400" />
              <span>100</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateScore(team.id, 50)}
              className="h-13 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 hover:border-sky-400 text-sky-200 hover:text-white font-mono font-black text-lg flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
              title="Tambah 50 poin (Bonus / Lemparan)"
            >
              <Plus className="w-5 h-5 stroke-[3] text-sky-400" />
              <span>50</span>
            </button>
          </div>

          {/* Quick Deductions: -25, -50, -100 (Clean Hardware Buttons) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onUpdateScore(team.id, -25)}
              className="h-9.5 rounded-lg bg-zinc-900/90 hover:bg-rose-950/70 text-zinc-300 hover:text-rose-200 border border-zinc-800 hover:border-rose-500/40 font-mono font-black text-xs flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
              title="Kurang 25 poin"
            >
              -25
            </button>

            <button
              type="button"
              onClick={() => onUpdateScore(team.id, -50)}
              className="h-9.5 rounded-lg bg-zinc-900/90 hover:bg-rose-950/70 text-zinc-300 hover:text-rose-200 border border-zinc-800 hover:border-rose-500/40 font-mono font-black text-xs flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
              title="Kurang 50 poin (Salah Lemparan)"
            >
              -50
            </button>

            <button
              type="button"
              onClick={() => onUpdateScore(team.id, -100)}
              className="h-9.5 rounded-lg bg-zinc-900/90 hover:bg-rose-950/70 text-zinc-300 hover:text-rose-200 border border-zinc-800 hover:border-rose-500/40 font-mono font-black text-xs flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
              title="Kurang 100 poin (Salah Rebutan)"
            >
              -100
            </button>
          </div>

          {/* Manual / Custom Score Input Section */}
          <div className="pt-2.5 border-t border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-zinc-400 uppercase tracking-wider font-mono">
                INPUT MANUAL
              </span>
              <span className="text-zinc-400 text-[10px] font-mono">
                Enter = Tambah
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyDelta(1);
                  }
                }}
                className="w-full h-11 bg-[#0b0c0f] border-2 border-zinc-800 focus:border-zinc-500 rounded-xl px-3 text-xl font-black font-mono text-center text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
              {quickInput && (
                <button
                  type="button"
                  onClick={() => setQuickInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded text-xs transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyDelta(1)}
                disabled={!quickInput}
                className={`h-9.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition-all active:scale-[0.98] cursor-pointer ${
                  quickInput
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800/80 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Tambah</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyDelta(-1)}
                disabled={!quickInput}
                className={`h-9.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition-all active:scale-[0.98] cursor-pointer ${
                  quickInput
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800/80 cursor-not-allowed'
                }`}
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Kurang</span>
              </button>

              <button
                type="button"
                onClick={handleApplyExact}
                disabled={!quickInput}
                className={`h-9.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-0.5 transition-all active:scale-[0.98] cursor-pointer ${
                  quickInput
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800/80 cursor-not-allowed'
                }`}
              >
                <span>= Set</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};