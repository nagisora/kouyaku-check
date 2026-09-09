export const LABELS = ["一致", "ズレ", "不明"] as const;
export type Label = (typeof LABELS)[number];

export const SOURCE_TYPES = ["bulletin", "party", "minutes", "vote", "none"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export interface Claim {
  summary: string;
  date: string | null;
  source_url: string;
  source_type: SourceType;
}

export interface Action {
  summary: string;
  date: string | null;
  source_url: string;
  source_type: SourceType;
  diet_session: string | number | null;
}

export interface Entry {
  id: string;
  topic: string;
  claim: Claim;
  action: Action;
  label: Label;
  notes: string;
}

export interface PoliticianWindow {
  from: string;
  to: string | null;
}

export interface PoliticianMeta {
  wikidata?: string;
  elected_on?: string;
  in_office_from?: string;
  window_note?: string;
}

export interface Politician {
  id: string;
  slug?: string;
  name: string;
  name_kana: string;
  house: string;
  party: string;
  profile_url: string;
  updated_at: string;
  window: PoliticianWindow;
  meta?: PoliticianMeta;
  entries: Entry[];
}

export type LabelCounts = Record<Label, number>;
