import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_STAGE_CONFIG, INITIAL_TEAMS, INITIAL_HISTORY } from '../constants/initialData';
import type { StageConfig, Team, ScoreHistoryItem } from '../types';

const STORAGE_KEYS = {
  VERSION: 'lcc_2026_data_version',
  SUPABASE_URL: 'lcc_2026_supabase_url',
  SUPABASE_KEY: 'lcc_2026_supabase_key',
  TEAMS: 'lcc_2026_teams',
  CONFIG: 'lcc_2026_config',
  HISTORY: 'lcc_2026_history'
};

const CURRENT_DATA_VERSION = 'lcc_2026_grand_final_top5_v1';

// Cross-tab broadcast channel for instant local testing without Supabase
const localChannel = typeof window !== 'undefined' ? new BroadcastChannel('lcc_local_sync') : null;

export const SQL_SETUP_SCRIPT = `-- ==============================================================
-- SQL SETUP UNTUK SUPABASE REALTIME SCOREBOARD LCC PONTIANAK 2026
-- Buka Dashboard Supabase -> SQL Editor -> Tempel & Jalankan (Run)
-- ==============================================================

-- 1. Buat Tabel stage_config (Kendali Tampilan Layar Panggung)
CREATE TABLE IF NOT EXISTS stage_config (
  id INT PRIMARY KEY DEFAULT 1,
  active_category_view TEXT NOT NULL DEFAULT 'mahasiswa_umum',
  sort_mode TEXT NOT NULL DEFAULT 'desk_order',
  current_round_title TEXT NOT NULL DEFAULT 'GRAND FINAL - BABAK I: WAJIB TIM',
  event_subtitle TEXT NOT NULL DEFAULT 'Ballroom Hotel Mercure Pontianak Lt. 9',
  confetti_ts BIGINT NOT NULL DEFAULT 0,
  show_round_recap BOOLEAN NOT NULL DEFAULT false,
  presentation_mode TEXT NOT NULL DEFAULT 'scoreboard'
);

-- 2. Buat Tabel teams (Data 5 Meja Tim dan Skor Terkini)
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  regu TEXT NOT NULL,
  team_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  photo_url TEXT,
  score INT NOT NULL DEFAULT 0
);

-- 3. Buat Tabel score_history (Log Audit Poin Realtime Transparansi Juri)
CREATE TABLE IF NOT EXISTS score_history (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  regu TEXT NOT NULL,
  category TEXT NOT NULL,
  team_name TEXT NOT NULL,
  round_title TEXT NOT NULL,
  previous_score INT NOT NULL,
  delta INT NOT NULL,
  new_score INT NOT NULL,
  timestamp BIGINT NOT NULL
);

-- 4. Izinkan Akses Publik (Anon Read & Write)
ALTER TABLE stage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon Public stage_config" ON stage_config;
CREATE POLICY "Anon Public stage_config" ON stage_config FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon Public teams" ON teams;
CREATE POLICY "Anon Public teams" ON teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon Public score_history" ON score_history;
CREATE POLICY "Anon Public score_history" ON score_history FOR ALL USING (true) WITH CHECK (true);

-- 5. Aktifkan Replikasi Realtime WebSockets (< 50ms)
ALTER PUBLICATION supabase_realtime ADD TABLE stage_config;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE score_history;

-- 6. Masukkan Konfigurasi Awal (Semua Skor 0)
INSERT INTO stage_config (id, active_category_view, sort_mode, current_round_title, event_subtitle, confetti_ts, presentation_mode)
VALUES (1, 'mahasiswa_umum', 'desk_order', 'GRAND FINAL - BABAK I: WAJIB TIM', 'Ballroom Hotel Mercure Pontianak Lt. 9', 0, 'scoreboard')
ON CONFLICT (id) DO UPDATE SET
  current_round_title = EXCLUDED.current_round_title,
  presentation_mode = EXCLUDED.presentation_mode;

-- Tim Mahasiswa Umum (5 Besar Finalis Resmi - Skor Default: 0)
INSERT INTO teams (id, category, regu, team_name, institution, photo_url, score) VALUES
('mhs_a', 'mahasiswa_umum', 'Regu A', 'ENGLISH CLUB', 'Universitas Tanjungpura', '/teams/mhs_a.jpg', 0),
('mhs_b', 'mahasiswa_umum', 'Regu B', 'AMERTA PUSTAKA', 'Universitas Tanjungpura', '/teams/mhs_b.jpg', 0),
('mhs_c', 'mahasiswa_umum', 'Regu C', 'FORUM GENRE PTK', 'Forum GenRe Pontianak', '/teams/mhs_c.jpg', 0),
('mhs_d', 'mahasiswa_umum', 'Regu D', 'LEX FORTIS', 'Fakultas Hukum Untan', '/teams/mhs_d.jpg', 0),
('mhs_e', 'mahasiswa_umum', 'Regu E', 'THE ORIGINS', 'Mahasiswa / Komunitas', '/teams/mhs_e.jpg', 0)
ON CONFLICT (id) DO UPDATE SET 
  team_name = EXCLUDED.team_name,
  institution = EXCLUDED.institution,
  score = 0;

-- Tim Siswa SMA (5 Besar Finalis Resmi - Skor Default: 0)
INSERT INTO teams (id, category, regu, team_name, institution, photo_url, score) VALUES
('sma_a', 'siswa_sma', 'Regu A', 'SMA SANTO PAULUS', 'SMA Santo Paulus Pontianak', '/teams/sma_a.jpg', 0),
('sma_b', 'siswa_sma', 'Regu B', 'SMAN 3 (TIM B)', 'SMA Negeri 3 Pontianak', '/teams/sma_b.jpg', 0),
('sma_c', 'siswa_sma', 'Regu C', 'SMAS BINA MULIA', 'SMAS Bina Mulia Pontianak', '/teams/sma_c.jpg', 0),
('sma_d', 'siswa_sma', 'Regu D', 'SMAN 3 (TIM A)', 'SMA Negeri 3 Pontianak', '/teams/sma_d.jpg', 0),
('sma_e', 'siswa_sma', 'Regu E', 'SMAN 1 PONTIANAK', 'SMA Negeri 1 Pontianak', '/teams/sma_e.jpg', 0)
ON CONFLICT (id) DO UPDATE SET 
  team_name = EXCLUDED.team_name,
  institution = EXCLUDED.institution,
  score = 0;
`;

let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

// Default cloud credentials for LCC Pemuda Pontianak 2026
const DEFAULT_SUPABASE_URL = 'https://kdipssewqkwvxqkiqubz.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_ICZ4LrEFyENXIVaxpGlfBw_6Kl7h3At';

let activeRealtimeChannel: any = null;

// Unique identifier for this browser tab instance to prevent self-echo loops
export const TAB_CLIENT_ID =
  typeof window !== 'undefined'
    ? Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36)
    : 'server';

export function setActiveRealtimeChannel(channel: any) {
  activeRealtimeChannel = channel;
}

export function broadcastScoreboardEvent(type: string, data: any) {
  const payload = {
    type,
    data,
    senderId: TAB_CLIENT_ID,
    ts: Date.now()
  };

  // 1. Post to local BroadcastChannel (instant 0ms cross-tab sync on same computer)
  try {
    localChannel?.postMessage(payload);
  } catch (e) {
    console.warn('Local broadcast error:', e);
  }

  // 2. Broadcast via Supabase Realtime WebSocket (sub-second peer-to-peer across phones & laptops)
  if (activeRealtimeChannel) {
    try {
      activeRealtimeChannel.send({
        type: 'broadcast',
        event: 'LCC_SYNC',
        payload
      });
    } catch (err) {
      console.warn('Supabase realtime broadcast error:', err);
    }
  }
}

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || DEFAULT_SUPABASE_KEY;
  return { url, key };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
  cachedClient = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key) return null;

  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      realtime: {
        params: {
          eventsPerSecond: 20
        }
      }
    });
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to init Supabase client:', err);
    return null;
  }
}

// Version migration: cleans out old dummy test data automatically
export function checkAndMigrateDataVersion() {
  if (typeof window === 'undefined') return;
  const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (storedVersion !== CURRENT_DATA_VERSION) {
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(INITIAL_HISTORY));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_STAGE_CONFIG));
    localChannel?.postMessage({ type: 'TEAMS_UPDATED', teams: INITIAL_TEAMS });
    localChannel?.postMessage({ type: 'CONFIG_UPDATED', config: INITIAL_STAGE_CONFIG });
  }
}

// Local cache helpers
export function getLocalTeams(): Team[] {
  checkAndMigrateDataVersion();
  const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
  if (data) {
    try {
      const parsed: Team[] = JSON.parse(data);
      // Auto-upgrade legacy SVG placeholder letter avatars or empty photos to realistic team photos
      const updated = parsed.map((t) => {
        const isLegacyPlaceholder =
          !t.photo_url ||
          t.photo_url.startsWith('data:image/svg+xml') ||
          t.photo_url === '/placeholder-team.png';
        if (isLegacyPlaceholder) {
          const matchInitial = INITIAL_TEAMS.find((it) => it.id === t.id);
          if (matchInitial) {
            return { ...t, photo_url: matchInitial.photo_url };
          }
        }
        return t;
      });
      return updated;
    } catch {
      // fallback
    }
  }
  return INITIAL_TEAMS;
}

export function saveLocalTeams(teams: Team[]) {
  try {
    const serialized = JSON.stringify(teams);
    if (localStorage.getItem(STORAGE_KEYS.TEAMS) !== serialized) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, serialized);
    }
  } catch (e) {
    console.warn('saveLocalTeams storage error:', e);
  }
}

export function getLocalStageConfig(): StageConfig {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.current_round_title === 'BABAK REBUTAN') {
        parsed.current_round_title = 'GRAND FINAL';
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      // fallback
    }
  }
  return INITIAL_STAGE_CONFIG;
}

export function saveLocalStageConfig(config: StageConfig) {
  try {
    const serialized = JSON.stringify(config);
    if (localStorage.getItem(STORAGE_KEYS.CONFIG) !== serialized) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, serialized);
    }
  } catch (e) {
    console.warn('saveLocalStageConfig storage error:', e);
  }
}

export function getLocalHistory(): ScoreHistoryItem[] {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  return INITIAL_HISTORY;
}

export function saveLocalHistory(history: ScoreHistoryItem[]) {
  try {
    const serialized = JSON.stringify(history.slice(0, 50));
    if (localStorage.getItem(STORAGE_KEYS.HISTORY) !== serialized) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, serialized);
    }
  } catch (e) {
    console.warn('saveLocalHistory storage error:', e);
  }
}

export { localChannel };
