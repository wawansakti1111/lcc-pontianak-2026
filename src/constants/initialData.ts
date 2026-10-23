import type { StageConfig, Team, ScoreHistoryItem } from '../types';

export const REGU_THEMES: Record<string, {
  name: string;
  gradient: string;
  borderHex: string;
  glowHex: string;
  ringClass: string;
}> = {
  'Regu A': {
    name: 'Blue-Cyan',
    gradient: 'linear-gradient(180deg, #00F0FF 0%, #0051FF 100%)',
    borderHex: '#00F0FF',
    glowHex: 'rgba(0, 240, 255, 0.6)',
    ringClass: 'ring-[#00F0FF]'
  },
  'Regu B': {
    name: 'Gold-Amber',
    gradient: 'linear-gradient(180deg, #FFE600 0%, #FF7A00 100%)',
    borderHex: '#FFE600',
    glowHex: 'rgba(255, 230, 0, 0.6)',
    ringClass: 'ring-[#FFE600]'
  },
  'Regu C': {
    name: 'Magenta-Pink',
    gradient: 'linear-gradient(180deg, #FF4D94 0%, #C80064 100%)',
    borderHex: '#FF4D94',
    glowHex: 'rgba(255, 77, 148, 0.6)',
    ringClass: 'ring-[#FF4D94]'
  },
  'Regu D': {
    name: 'Emerald-Teal',
    gradient: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
    borderHex: '#34D399',
    glowHex: 'rgba(52, 211, 153, 0.6)',
    ringClass: 'ring-[#34D399]'
  },
  'Regu E': {
    name: 'Violet-Indigo',
    gradient: 'linear-gradient(180deg, #C084FC 0%, #6D28D9 100%)',
    borderHex: '#C084FC',
    glowHex: 'rgba(192, 132, 252, 0.6)',
    ringClass: 'ring-[#C084FC]'
  }
};

// Generates a high quality SVG avatar placeholder with matching colors
export function getPlaceholderAvatar(letter: string, colorHex1: string, colorHex2: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="grad-${letter}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorHex1}" />
        <stop offset="100%" stop-color="${colorHex2}" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#grad-${letter})" />
    <circle cx="60" cy="46" r="22" fill="rgba(255,255,255,0.9)" />
    <path d="M26 102 C26 76 40 68 60 68 C80 68 94 76 94 102 Z" fill="rgba(255,255,255,0.9)" />
    <text x="60" y="53" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#1e1b4b" text-anchor="middle">${letter}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_STAGE_CONFIG: StageConfig = {
  id: 1,
  active_category_view: 'mahasiswa_umum',
  sort_mode: 'desk_order',
  current_round_title: 'GRAND FINAL - BABAK I: WAJIB TIM',
  event_subtitle: 'Ballroom Hotel Mercure Pontianak Lantai 9',
  confetti_ts: 0,
  show_round_recap: false,
  presentation_mode: 'scoreboard'
};

export const INITIAL_HISTORY: ScoreHistoryItem[] = [];

export const INITIAL_TEAMS: Team[] = [
  // Kategori 1: Mahasiswa Umum (5 Tim Finalis Resmi - Hasil Audisi/Penyisihan)
  {
    id: 'mhs_a',
    category: 'mahasiswa_umum',
    regu: 'Regu A',
    team_name: 'ENGLISH CLUB',
    institution: 'Universitas Tanjungpura',
    photo_url: '/teams/mhs_a.jpg',
    score: 0
  },
  {
    id: 'mhs_b',
    category: 'mahasiswa_umum',
    regu: 'Regu B',
    team_name: 'AMERTA PUSTAKA',
    institution: 'Universitas Tanjungpura',
    photo_url: '/teams/mhs_b.jpg',
    score: 0
  },
  {
    id: 'mhs_c',
    category: 'mahasiswa_umum',
    regu: 'Regu C',
    team_name: 'FORUM GENRE PTK',
    institution: 'Forum GenRe Pontianak',
    photo_url: '/teams/mhs_c.jpg',
    score: 0
  },
  {
    id: 'mhs_d',
    category: 'mahasiswa_umum',
    regu: 'Regu D',
    team_name: 'LEX FORTIS',
    institution: 'Fakultas Hukum Untan',
    photo_url: '/teams/mhs_d.jpg',
    score: 0
  },
  {
    id: 'mhs_e',
    category: 'mahasiswa_umum',
    regu: 'Regu E',
    team_name: 'THE ORIGINS',
    institution: 'Mahasiswa / Komunitas',
    photo_url: '/teams/mhs_e.jpg',
    score: 0
  },

  // Kategori 2: Siswa SMA (5 Tim Finalis Resmi - Hasil Audisi/Penyisihan)
  {
    id: 'sma_a',
    category: 'siswa_sma',
    regu: 'Regu A',
    team_name: 'SMA SANTO PAULUS',
    institution: 'SMA Santo Paulus Pontianak',
    photo_url: '/teams/sma_a.jpg',
    score: 0
  },
  {
    id: 'sma_b',
    category: 'siswa_sma',
    regu: 'Regu B',
    team_name: 'SMAN 3 (TIM B)',
    institution: 'SMA Negeri 3 Pontianak',
    photo_url: '/teams/sma_b.jpg',
    score: 0
  },
  {
    id: 'sma_c',
    category: 'siswa_sma',
    regu: 'Regu C',
    team_name: 'SMAS BINA MULIA',
    institution: 'SMAS Bina Mulia Pontianak',
    photo_url: '/teams/sma_c.jpg',
    score: 0
  },
  {
    id: 'sma_d',
    category: 'siswa_sma',
    regu: 'Regu D',
    team_name: 'SMAN 3 (TIM A)',
    institution: 'SMA Negeri 3 Pontianak',
    photo_url: '/teams/sma_d.jpg',
    score: 0
  },
  {
    id: 'sma_e',
    category: 'siswa_sma',
    regu: 'Regu E',
    team_name: 'SMAN 1 PONTIANAK',
    institution: 'SMA Negeri 1 Pontianak',
    photo_url: '/teams/sma_e.jpg',
    score: 0
  }
];
