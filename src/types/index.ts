export type Category = 'mahasiswa_umum' | 'siswa_sma';
export type StageCategoryView = 'mahasiswa_umum' | 'siswa_sma' | 'dual';
export type SortMode = 'desk_order' | 'ranking';
export type StagePresentationMode = 'scoreboard' | 'recap' | 'history';

export interface Team {
  id: string;
  category: Category;
  regu: 'Regu A' | 'Regu B' | 'Regu C' | 'Regu D' | 'Regu E';
  team_name: string;
  institution: string;
  photo_url: string;
  score: number;
}

export interface StageConfig {
  id: number;
  active_category_view: StageCategoryView;
  sort_mode: SortMode;
  current_round_title: string;
  event_subtitle: string;
  confetti_ts: number;
  show_round_recap?: boolean;
  presentation_mode?: StagePresentationMode;
}

export interface ScoreDelta {
  teamId: string;
  value: number;
  timestamp: number;
}

export interface ScoreHistoryItem {
  id: string;
  teamId: string;
  regu: string;
  category: Category;
  teamName: string;
  roundTitle: string;
  previousScore: number;
  delta: number;
  newScore: number;
  timestamp: number;
}
