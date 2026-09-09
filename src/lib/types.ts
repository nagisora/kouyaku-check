export const LABELS = ["一致", "ズレ", "不明"] as const;
export type Label = (typeof LABELS)[number];

export const SOURCE_TYPES = ["bulletin", "party", "minutes", "vote", "none", "statement", "bill"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const ACTION_KINDS = [
  "cabinet_bill",
  "cabinet_decision",
  "pm_speech",
  "cabinet_personnel",
  "other_member_bill",
  "member_bill",
  "speech",
  "written_question",
  "caucus_position",
  "resignation",
] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

export const OFFICE_STATUSES = ["in_office", "not_in_office"] as const;
export type OfficeStatus = (typeof OFFICE_STATUSES)[number];

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
  action_kind?: ActionKind;
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
  left_office_on?: string;
  district?: string;
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
  office_status: OfficeStatus;
  meta?: PoliticianMeta;
  entries: Entry[];
}

export type LabelCounts = Record<Label, number>;
