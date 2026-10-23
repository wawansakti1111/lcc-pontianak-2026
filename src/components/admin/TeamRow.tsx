import React, { useState, useRef } from 'react';
import type { Team } from '../../types';
import { REGU_THEMES } from '../../constants/initialData';
import { compressTeamPhoto } from '../../utils/imageCompressor';
import { Camera, Edit3, Check, Plus, Minus, Crown, Loader2, Calculator } from 'lucide-react';

interface TeamRowProps {
  team: Team;
  rank: number;
  isLeader: boolean;
  onUpdateScore: (teamId: string, delta: number) => void;
  onSetCustomScore: (teamId: string, score: number) => void;
  onUpdateIdentity: (teamId: string, updates: Partial<Team>) => void;
  onOpenScoreModal?: (team: Team) => void;
}

export const TeamRow: React.FC<TeamRowProps> = ({
  team,
  rank,
  isLeader,
  onUpdateScore,
  onSetCustomScore,
  onUpdateIdentity,
  onOpenScoreModal
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

  const handleApplyDelta = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(quickInput, 10);
    if (!isNaN(val)) {
      onUpdateScore(team.id, val);
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

  return (
    <div
      className={`relative bg-slate-900/95 rounded-2xl p-3 md:p-3.5 shadow-xl border-2 flex flex-wrap md:flex-nowrap items-center justify-between gap-3.5 transition-all duration-200 ${
        isLeader && team.score > 0
          ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* 1. LEFT COLUMN: Regu Badge, Photo & Identity (Wide, spacious) */}
      <div className="flex items-center space-x-3.5 min-w-[260px] md:w-[320px] shrink-0">
        {/* Regu & Rank Badge */}
        <div className="flex flex-col items-center space-y-1 shrink-0">
          <span
            className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg text-white shadow-md text-center min-w-[64px]"
            style={{ background: theme.gradient }}
          >
            {team.regu}
          </span>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded flex items-center space-x-1 ${
              isLeader && team.score > 0
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isLeader && team.score > 0 && <Crown className="w-3 h-3 fill-current inline" />}
            <span>#{rank}</span>
          </span>
        </div>

        {/* Team Photo with upload trigger */}
        <div
          className="relative group cursor-pointer w-13 h-13 rounded-full overflow-hidden shrink-0 border-2 border-white/20 shadow-md hover:border-cyan-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          title="Klik untuk ganti foto tim (Auto-WebP)"
        >
          <img
            src={team.photo_url || '/placeholder-team.png'}
            alt={team.team_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Camera className="w-4 h-4 text-cyan-300" />
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

        {/* Team Name & School / Inline Edit */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-1">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Nama Tim"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
              />
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Asal Kampus / Sekolah"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex space-x-1 pt-0.5">
                <button
                  type="button"
                  onClick={handleSaveIdentity}
                  className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center space-x-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-0.5 bg-slate-800 text-slate-400 hover:text-white text-[10px] rounded"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="text-sm md:text-base font-black text-white truncate leading-tight" title={team.team_name}>
                  {team.team_name}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Edit Nama Tim"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5" title={team.institution}>
                {team.institution}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER COLUMN: Giant Live Score Centerpiece */}
      <div
        onClick={() => onOpenScoreModal && onOpenScoreModal(team)}
        className={`group cursor-pointer flex items-center justify-center px-6 py-2.5 rounded-2xl border-2 transition-all shrink-0 min-w-[140px] ${
          isLeader && team.score > 0
            ? 'bg-gradient-to-r from-amber-500/20 via-slate-950 to-amber-500/10 border-amber-400/80 hover:border-amber-300'
            : 'bg-slate-950 border-slate-800 hover:border-cyan-500/60'
        }`}
        title="Klik untuk buka Keypad Skor Lengkap"
      >
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-black tabular-nums text-white tracking-tight group-hover:text-cyan-300 transition-colors">
            {team.score}
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 group-hover:text-cyan-400">
            POIN AKTIF
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: Spacious, Tactile, Linear Score Controls (Zero Cramping!) */}
      <div className="flex flex-wrap md:flex-nowrap items-center space-x-2 md:space-x-3 shrink-0">
        {/* Fast Additions: BIG Chunky Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onUpdateScore(team.id, 100)}
            className="h-12 px-4 md:px-5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-lg md:text-xl tracking-wide shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-1.5 transition-all active:scale-95 border-2 border-emerald-300/40"
            title="Tambah 100 Poin"
          >
            <Plus className="w-5 h-5 stroke-[3.5]" />
            <span>100</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateScore(team.id, 50)}
            className="h-12 px-4 md:px-5 rounded-xl bg-gradient-to-b from-cyan-500 to-blue-700 hover:from-cyan-400 hover:to-blue-600 text-white font-black text-lg md:text-xl tracking-wide shadow-lg shadow-cyan-950/60 flex items-center justify-center space-x-1.5 transition-all active:scale-95 border-2 border-cyan-300/40"
            title="Tambah 50 Poin"
          >
            <Plus className="w-5 h-5 stroke-[3.5]" />
            <span>50</span>
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block h-10 w-px bg-slate-800" />

        {/* Deductions: Clear, Spacious Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => onUpdateScore(team.id, -25)}
            className="h-12 px-3 md:px-3.5 rounded-xl bg-slate-950 hover:bg-amber-950 text-amber-400 hover:text-amber-200 font-black text-sm md:text-base flex items-center justify-center space-x-0.5 border-2 border-amber-500/40 transition-all active:scale-95 shadow-md"
            title="Kurangi 25 Poin"
          >
            <Minus className="w-3.5 h-3.5 stroke-[3.5]" />
            <span>25</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateScore(team.id, -50)}
            className="h-12 px-3 md:px-3.5 rounded-xl bg-slate-950 hover:bg-rose-950 text-rose-400 hover:text-rose-200 font-black text-sm md:text-base flex items-center justify-center space-x-0.5 border-2 border-rose-500/40 transition-all active:scale-95 shadow-md"
            title="Kurangi 50 Poin"
          >
            <Minus className="w-3.5 h-3.5 stroke-[3.5]" />
            <span>50</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateScore(team.id, -100)}
            className="h-12 px-3 md:px-3.5 rounded-xl bg-slate-950 hover:bg-red-950 text-red-400 hover:text-red-200 font-black text-sm md:text-base flex items-center justify-center space-x-0.5 border-2 border-red-500/40 transition-all active:scale-95 shadow-md"
            title="Kurangi 100 Poin"
          >
            <Minus className="w-3.5 h-3.5 stroke-[3.5]" />
            <span>100</span>
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="hidden xl:block h-10 w-px bg-slate-800" />

        {/* Custom Input Bar: Wide & Tactical */}
        <form onSubmit={handleApplyDelta} className="flex items-center space-x-1.5">
          <input
            type="number"
            placeholder="Ketik nilai..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className="w-24 md:w-28 h-12 bg-slate-950 border-2 border-slate-700 rounded-xl px-2.5 text-center text-sm md:text-base font-black text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
          />

          <button
            type="submit"
            disabled={!quickInput}
            className="h-12 px-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-30 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1 border border-emerald-400/30"
            title="Tambahkan nilai ini ke skor aktif (+)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Tambah</span>
          </button>

          <button
            type="button"
            disabled={!quickInput}
            onClick={handleApplyExact}
            className="h-12 px-3 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-30 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95 border border-indigo-400/30"
            title="Ganti total skor langsung (=)"
          >
            =Set
          </button>
        </form>

        {/* Full Keypad Launcher Button */}
        {onOpenScoreModal && (
          <button
            type="button"
            onClick={() => onOpenScoreModal(team)}
            className="h-12 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border-2 border-slate-700 transition-colors flex items-center justify-center"
            title="Buka Keypad Lengkap / Pop-up"
          >
            <Calculator className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
