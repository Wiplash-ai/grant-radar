export type Grant = {
  key: string;
  title: string;
  opportunityNumber?: string;
  agency: string;
  status: "open" | "forecasted";
  officialUrl: string;
  closeDateLabel: string;
  closeAt?: string;
  postedDateLabel?: string;
  awardFloorUsd?: number;
  awardCeilingUsd?: number;
  awardCeilingLabel?: string;
  themes: string[];
  fitScore: number;
  fitReasons: string[];
  summary: string;
};
export type GrantResponse = {
  data: Grant[];
  pagination: { total: number; page: number; limit: number; pages: number };
  meta: { generated_at: string; last_refresh_at?: string };
};
