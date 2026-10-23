import React, { useState, useRef } from 'react';
import type { Team } from '../../types';
import { REGU_THEMES } from '../../constants/initialData';
import { compressTeamPhoto } from '../../utils/imageCompressor';
import { Camera, Edit3, Check, Plus, Minus, Crown, Loader2, Calculator } from 'lucide-react';

interface BroadcastTableProps {
  teams: Team[];
  rankMap: Map<string, number>;
  currentLeaderId?: string;
  onUpdateScore: (teamId: string, delta: number) => void;
  onSetCustomScore: (teamId: string, score: number) => void;
  onUpdateIdentity: (teamId: string, updates: Partial<Team>) => void;
  onOpenScoreModal: (team: Team) => void;
}

export const BroadcastTable: React.FC<BroadcastTableProps> = ({
  teams,
  rankMap,
  currentLeaderId,
  onUpdateScore,
  onSetCustomScore,
  onUpdateIdentity,
  onOpenScoreModal
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Table Header Bar */}
      <div className="hidden lg:grid grid-cols-[300px_130px_190px_200px_1fr] items-center gap-3 px-5 py-3 bg-slate-950/90 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 select-none">
        <div>REGU & IDENTITAS TIM</div>
        <div className="text-center">SKOR AKTIF</div>
        <div className="text-center">TAMBAH POIN (+)</div>
        <div className="text-center">PENGURANGAN (-)</div>
        <div className="text-center">INPUT SKOR BEBAS</div>
      </div>

      {/* Team Rows */}
      <div className="divide-y divide-slate-800/80">
        {teams.map((team) => (
          <BroadcastTableRow
            key={team.id}
            team={team}
            rank={rankMap.get(team.id) || 1}
            isLeader={team.id === currentLeaderId}
            onUpdateScore={onUpdateScore}
            onSetCustomScore={onSetCustomScore}
            onUpdateIdentity={onUpdateIdentity}
            onOpenScoreModal={onOpenScoreModal}
          />
        ))}
      </div>
    </div>
  );
};

interface BroadcastTableRowProps {
  team: Team;
  rank: number;
  isLeader: boolean;
  onUpdateScore: (teamId: string, delta: number) => void;
  onSetCustomScore: (teamId: string, score: number) => void;
  onUpdateIdentity: (teamId: string, updates: Partial<Team>) => void;
  onOpenScoreModal: (team: Team) => void;
}

const BroadcastTableRow: React.FC<BroadcastTableRowProps> = ({
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
      className={`grid grid-cols-1 lg:grid-cols-[300px_130px_190px_200px_1fr] items-center gap-3 px-4 md:px-5 py-3 transition-colors ${
        isLeader && team.score > 0
          ? 'bg-amber-500/5 hover:bg-amber-500/10'
          : 'hover:bg-slate-800/40'
      }`}
    >
      {/* 1. REGU & TIM IDENTITY */}
      <div className="flex items-center space-x-3 min-w-0">
        {/* Regu Pill & Rank */}
        <div className="flex flex-col items-center space-y-1 shrink-0">
          <span
            className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md text-white shadow-sm text-center min-w-[62px]"
            style={{ background: theme.gradient }}
          >
            {team.regu}
          </span>
          <span
            className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5 ${
              isLeader && team.score > 0
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isLeader && team.score > 0 && <Crown className="w-2.5 h-2.5 fill-current inline" />}
            <span>#{rank}</span>
          </span>
        </div>

        {/* Photo with hover camera */}
        <div
          className="relative group cursor-pointer w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-white/20 shadow-sm hover:border-cyan-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          title="Klik ganti foto tim (Auto-WebP)"
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

        {/* Text Identity / Inline Edit */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-1">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Nama Tim"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
              />
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Kampus / Sekolah"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex space-x-1 pt-0.5">
                <button
                  type="button"
                  onClick={handleSaveIdentity}
                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center space-x-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-1">
                <h4 className="text-xs md:text-sm font-black text-white truncate leading-tight" title={team.team_name}>
                  {team.team_name}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-0.5 text-slate-400 hover:text-white transition-colors"
                  title="Ubah Nama Tim"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5" title={team.institution}>
                {team.institution}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. SKOR AKTIF */}
      <div
        onClick={() => onOpenScoreModal(team)}
        className={`cursor-pointer group flex items-center justify-center py-2 px-3 rounded-xl border transition-all text-center ${
          isLeader && team.score > 0
            ? 'bg-slate-950 border-amber-400/80 shadow-md shadow-amber-500/10 hover:border-amber-300'
            : 'bg-slate-950 border-slate-800 hover:border-cyan-500/50'
        }`}
        title="Klik untuk membuka kalkulator skor tim ini"
      >
        <div>
          <div className="text-2xl md:text-3xl font-black tabular-nums text-white tracking-tight group-hover:text-cyan-300 transition-colors">
            {team.score}
          </div>
          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-cyan-400">
            POIN AKTIF
          </div>
        </div>
      </div>

      {/* 3. TAMBAH POIN (+) */}
      <div className="flex items-center justify-center space-x-2">
        <button
          type="button"
          onClick={() => onUpdateScore(team.id, 100)}
          className="flex-1 h-11 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-lg tracking-wide shadow-md shadow-emerald-950/60 flex items-center justify-center space-x-1 transition-all active:scale-95 border-2 border-emerald-300/40"
          title="Tambah 100 Poin"
        >
          <Plus className="w-4 h-4 stroke-[3.5]" />
          <span>100</span>
        </button>

        <button
          type="button"
          onClick={() => onUpdateScore(team.id, 50)}
          className="flex-1 h-11 rounded-xl bg-gradient-to-b from-cyan-500 to-blue-700 hover:from-cyan-400 hover:to-blue-600 text-white font-black text-lg tracking-wide shadow-md shadow-cyan-950/60 flex items-center justify-center space-x-1 transition-all active:scale-95 border-2 border-cyan-300/40"
          title="Tambah 50 Poin"
        >
          <Plus className="w-4 h-4 stroke-[3.5]" />
          <span>50</span>
        </button>
      </div>

      {/* 4. PENGURANGAN (-) */}
      <div className="flex items-center justify-center space-x-1.5">
        <button
          type="button"
          onClick={() => onUpdateScore(team.id, -25)}
          className="flex-1 h-11 rounded-xl bg-slate-950 hover:bg-amber-950 text-amber-400 hover:text-amber-200 font-black text-xs md:text-sm flex items-center justify-center space-x-0.5 border-2 border-amber-500/40 transition-all active:scale-95"
          title="Kurangi 25 Poin"
        >
          <Minus className="w-3 h-3 stroke-[3]" />
          <span>25</span>
        </button>

        <button
          type="button"
          onClick={() => onUpdateScore(team.id, -50)}
          className="flex-1 h-11 rounded-xl bg-slate-950 hover:bg-rose-950 text-rose-400 hover:text-rose-200 font-black text-xs md:text-sm flex items-center justify-center space-x-0.5 border-2 border-rose-500/40 transition-all active:scale-95"
          title="Kurangi 50 Poin"
        >
          <Minus className="w-3 h-3 stroke-[3]" />
          <span>50</span>
        </button>

        <button
          type="button"
          onClick={() => onUpdateScore(team.id, -100)}
          className="flex-1 h-11 rounded-xl bg-slate-950 hover:bg-red-950 text-red-400 hover:text-red-200 font-black text-xs md:text-sm flex items-center justify-center space-x-0.5 border-2 border-red-500/40 transition-all active:scale-95"
          title="Kurangi 100 Poin"
        >
          <Minus className="w-3 h-3 stroke-[3]" />
          <span>100</span>
        </button>
      </div>

      {/* 5. INPUT SKOR BEBAS */}
      <div className="flex items-center space-x-1.5">
        <form onSubmit={handleApplyDelta} className="flex-1 flex items-center space-x-1">
          <input
            type="number"
            placeholder="Nilai..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className="w-20 md:w-24 h-11 bg-slate-950 border-2 border-slate-700 rounded-xl px-2 text-center text-sm font-black text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
          />

          <button
            type="submit"
            disabled={!quickInput}
            className="h-11 px-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-30 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-0.5 border border-emerald-400/30"
            title="Tambah nilai ini ke skor aktif (+)"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>Tambah</span>
          </button>

          <button
            type="button"
            disabled={!quickInput}
            onClick={handleApplyExact}
            className="h-11 px-2.5 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-30 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95 border border-indigo-400/30"
            title="Ganti total skor langsung (=)"
          >
            =Set
          </button>
        </form>

        {/* Numpad Keypad button */}
        <button
          type="button"
          onClick={() => onOpenScoreModal(team)}
          className="h-11 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border-2 border-slate-700 transition-colors flex items-center justify-center shrink-0"
          title="Buka Keypad Lengkap / Kalkulator Skor"
        >
          <Calculator className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
