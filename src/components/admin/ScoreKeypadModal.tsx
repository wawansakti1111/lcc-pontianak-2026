import React, { useState, useEffect } from 'react';
import type { Team } from '../../types';
import { X, Check, RotateCcw, ArrowRight } from 'lucide-react';

interface ScoreKeypadModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateScore: (teamId: string, delta: number) => void;
  onSetCustomScore: (teamId: string, score: number) => void;
}

export const ScoreKeypadModal: React.FC<ScoreKeypadModalProps> = ({
  team,
  isOpen,
  onClose,
  onUpdateScore,
  onSetCustomScore
}) => {
  const [mode, setMode] = useState<'delta' | 'exact'>('delta');
  const [deltaValue, setDeltaValue] = useState<number>(100);
  const [exactValue, setExactValue] = useState<string>('');

  useEffect(() => {
    if (team) {
      setExactValue(String(team.score));
      setDeltaValue(100);
      setMode('delta');
    }
  }, [team]);

  if (!isOpen || !team) return null;

  const previewScore = mode === 'delta' ? team.score + deltaValue : parseInt(exactValue || '0', 10);

  const handleApply = () => {
    if (mode === 'delta') {
      if (deltaValue !== 0) {
        onUpdateScore(team.id, deltaValue);
      }
    } else {
      const parsed = parseInt(exactValue, 10);
      if (!isNaN(parsed)) {
        onSetCustomScore(team.id, parsed);
      }
    }
    onClose();
  };

  const deltaPresets = [
    { label: '+100', val: 100, color: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
    { label: '+50', val: 50, color: 'bg-sky-600 hover:bg-sky-500 text-white' },
    { label: '+25', val: 25, color: 'bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-zinc-700' },
    { label: '+10', val: 10, color: 'bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-zinc-700' },
    { label: '-25', val: -25, color: 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700' },
    { label: '-50', val: -50, color: 'bg-zinc-800 hover:bg-zinc-700 text-rose-300 border border-zinc-700' },
    { label: '-100', val: -100, color: 'bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-zinc-700' },
    { label: '-10', val: -10, color: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141518] border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-zinc-100">{team.regu}</span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs font-semibold text-zinc-300">{team.team_name}</span>
            </div>
            <p className="text-[11px] text-zinc-500">{team.institution}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="bg-zinc-950/80 p-4 border-b border-zinc-800 flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Skor Saat Ini</div>
            <div className="text-2xl font-bold text-zinc-300 tabular-nums">{team.score}</div>
          </div>

          <ArrowRight className="w-4 h-4 text-zinc-600" />

          <div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Perubahan</div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                mode === 'delta'
                  ? deltaValue >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                  : 'text-zinc-200'
              }`}
            >
              {mode === 'delta' ? (deltaValue >= 0 ? `+${deltaValue}` : deltaValue) : `Set`}
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-zinc-600" />

          <div>
            <div className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">Skor Baru</div>
            <div className="text-3xl font-extrabold text-white tabular-nums">{previewScore}</div>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="p-4 space-y-3.5">
          <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setMode('delta')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'delta'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ubah Poin (+ / -)
            </button>
            <button
              type="button"
              onClick={() => setMode('exact')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'exact'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Set Total Skor Langsung
            </button>
          </div>

          {mode === 'delta' ? (
            <div className="space-y-3">
              <div className="text-xs font-medium text-zinc-400">Pilih Nilai Cepat:</div>
              <div className="grid grid-cols-4 gap-2">
                {deltaPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setDeltaValue(preset.val)}
                    className={`h-11 rounded-lg font-bold text-sm tracking-wide transition-colors ${
                      preset.color
                    } ${
                      deltaValue === preset.val
                        ? 'ring-2 ring-white'
                        : ''
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="pt-1.5">
                <label className="block text-xs text-zinc-400 mb-1">
                  Atau ketik angka perubahan:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={deltaValue}
                    onChange={(e) => setDeltaValue(parseInt(e.target.value || '0', 10))}
                    className="flex-1 h-9 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-white font-mono text-sm focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => setDeltaValue(-deltaValue)}
                    className="h-9 px-3 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 rounded-lg border border-zinc-700"
                  >
                    +/- Balik Tanda
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-zinc-400">
                Ketik Total Skor Baru:
              </label>
              <input
                type="number"
                value={exactValue}
                onChange={(e) => setExactValue(e.target.value)}
                placeholder="Misal: 750"
                className="w-full h-12 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-2xl text-center font-bold text-white font-mono focus:outline-none focus:border-zinc-500"
              />
              <div className="flex justify-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setExactValue(String(team.score))}
                  className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded hover:text-white flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Skor Awal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExactValue('0')}
                  className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded hover:text-rose-400"
                >
                  Set ke 0
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Skor ({previewScore} Poin)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
