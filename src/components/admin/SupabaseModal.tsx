import React, { useState } from 'react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  SQL_SETUP_SCRIPT
} from '../../services/supabaseService';
import { X, Check, Copy, Database, Cloud, RefreshCw } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionStatus: string;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  connectionStatus
}) => {
  const [config, setConfig] = useState(getStoredSupabaseConfig);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(config.url, config.key);
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Konfigurasi Cloud Supabase Realtime</h3>
              <p className="text-xs text-slate-400">
                Hubungkan database Supabase untuk sinkronisasi live beda laptop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Status Indicator */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500 animate-ping'
                    : 'bg-amber-500'
                }`}
              />
              <div>
                <div className="font-semibold text-white">
                  Status Saat Ini:{' '}
                  {connectionStatus === 'connected'
                    ? '🟢 Supabase Realtime Aktif'
                    : '🟡 Mode Simulasi Lokal (Offline)'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {connectionStatus === 'connected'
                    ? 'Data tersinkronisasi instan via WebSocket cloud lintas perangkat.'
                    : 'Aplikasi berjalan menggunakan cache lokal & BroadcastChannel (dalam 1 perangkat).'}
                </div>
              </div>
            </div>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={config.key}
                onChange={(e) => setConfig({ ...config, key: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  saveSupabaseConfig('', '');
                  window.location.reload();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 underline"
              >
                Reset ke Mode Simulasi Lokal
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Tersimpan! Memuat ulang...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Simpan & Hubungkan Cloud</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* SQL Setup Helper Section */}
          <div className="border-t border-slate-800 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-white">Panduan Setup Database Supabase</h4>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SQL Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Skrip SQL</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Jika tabel belum dibuat di Supabase Anda, buka <strong>SQL Editor</strong> di dashboard Supabase Anda,
              lalu salin skrip di bawah ini dan tekan <strong>Run</strong>. Skrip ini otomatis membuat tabel <code>stage_config</code>, <code>teams</code>, menyetel izin RLS, dan mengaktifkan WebSockets Realtime.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-400 max-h-48 overflow-y-auto select-all">
              <pre className="whitespace-pre-wrap">{SQL_SETUP_SCRIPT}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>Kredensial disimpan aman di browser (localStorage)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
