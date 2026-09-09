import type { ActionKind, AgencyCapacity, Entry, HorizonStatus, Label, LabelCounts, OfficeStatus, Politician, SourceType, VotingMethod } from "./types";
import { toMessage } from "./yaml-values";

function emptyLabelCounts(): LabelCounts {
  return { 行動一致: 0, 公約実現: 0, ズレ: 0, 不明: 0 };
}

function incrementLabelCount(counts: LabelCounts, label: Label): void {
  switch (label) {
    case "行動一致":
      counts.行動一致 += 1;
      return;
    case "公約実現":
      counts.公約実現 += 1;
      return;
    case "ズレ":
      counts.ズレ += 1;
      return;
    case "不明":
      counts.不明 += 1;
      return;
    default: {
      const _exhaustive: never = label;
      return _exhaustive;
    }
  }
}

export function countLabels(entries: Entry[]): LabelCounts {
  const counts = emptyLabelCounts();
  for (const entry of entries) {
    incrementLabelCount(counts, entry.label);
  }
  return counts;
}

export function formatLabelCounts(counts: LabelCounts): string {
  return `${toMessage(counts.行動一致)} 行動一致 / ${toMessage(counts.公約実現)} 公約実現 / ${toMessage(counts.ズレ)} ズレ / ${toMessage(counts.不明)} 不明`;
}

function labelTone(label: Label): "action" | "realized" | "gap" | "unknown" {
  switch (label) {
    case "行動一致":
      return "action";
    case "公約実現":
      return "realized";
    case "ズレ":
      return "gap";
    case "不明":
      return "unknown";
    default: {
      const _exhaustive: never = label;
      return _exhaustive;
    }
  }
}

export function labelClassName(label: Label): string {
  return `label-${labelTone(label)}`;
}

export function countCardClassName(label: Label): string {
  return labelTone(label);
}

export function sourceTypeLabel(sourceType: SourceType): string {
  switch (sourceType) {
    case "bulletin":
      return "選挙公報";
    case "party":
      return "党公式";
    case "minutes":
      return "会議録";
    case "vote":
      return "本会議表決";
    case "none":
      return "該当なし";
    case "statement":
      return "公式発言";
    case "bill":
      return "議案経過";
    default: {
      const _exhaustive: never = sourceType;
      return _exhaustive;
    }
  }
}

export function actionKindLabel(kind: ActionKind): string {
  switch (kind) {
    case "cabinet_bill":
      return "閣法（内閣提出）";
    case "cabinet_decision":
      return "閣議決定";
    case "pm_speech":
      return "総理発言";
    case "cabinet_personnel":
      return "内閣人事";
    case "other_member_bill":
      return "他議員の衆法";
    case "member_bill":
      return "本人提出の議員立法";
    case "speech":
      return "国会発言";
    case "written_question":
      return "質問主意書";
    case "caucus_position":
      return "会派の態度";
    case "resignation":
      return "退職・失職";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function actionSideHeading(kind: ActionKind | undefined): string {
  return kind === undefined ? "国会での行動" : "行動";
}

export function agencyCapacityLabel(capacity: AgencyCapacity): string {
  switch (capacity) {
    case "individual":
      return "本人";
    case "caucus_or_party":
      return "会派・党";
    case "cabinet_or_executive":
      return "内閣・行政";
    case "unknown":
      return "主体不明";
    default: {
      const _exhaustive: never = capacity;
      return _exhaustive;
    }
  }
}

export function votingMethodLabel(method: VotingMethod): string {
  switch (method) {
    case "named_rollcall":
      return "記名投票";
    case "pushbutton":
      return "押しボタン式";
    case "standing_or_voice":
      return "起立・声認";
    case "no_objection":
      return "異議なし";
    case "unknown":
      return "表決方法不明";
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function horizonStatusLabel(status: HorizonStatus): string {
  switch (status) {
    case "achieved":
      return "期限到達";
    case "in_flight":
      return "進行中";
    case "truncated_dissolution":
      return "解散で途切れ";
    case "horizon_not_reached":
      return "期限未到達";
    case "not_applicable":
      return "期限の対象外";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function profileLinkLabel(house: string): string {
  if (house.startsWith("衆議院")) {
    return "衆議院プロフィール";
  }
  if (house.startsWith("参議院")) {
    return "参議院プロフィール";
  }
  return "公式プロフィール";
}

export const TOPIC_LABELS: Record<string, string> = {
  "political-funds": "政治資金",
  "internet-voting": "インターネット投票",
  "push-notifications": "プッシュ型支援",
  "digital-admin": "行政デジタル",
  "tax-vs-social-insurance": "税と社会保険",
  "public-oss": "公共OSS",
  "ai-privacy": "AI・個人情報",
  "science-tech": "科学技術",
  "digital-subcapital": "デジタル副首都",
  "catastrophic-coverage": "高額療養費",
  "child-tax-cut": "子育て減税",
  "corporate-donations-ban": "企業団体献金",
  "gasoline-tax": "ガソリン暫定税率",
  "defense-gdp": "防衛費GDP比",
  "proactive-fiscal": "責任ある積極財政",
  "high-school-tuition": "高校無償化",
  "minister-pay": "閣僚給与",
  "disaster-agency": "防災庁",
  foip: "インド太平洋",
  "foreign-residents": "外国人政策",
  "refundable-tax-credit": "給付付き税額控除",
  "imperial-succession": "皇室典範",
  "constitutional-amendment": "憲法改正",
  "income-tax-wall": "年収の壁",
  "taiwan-contingency": "台湾・存立危機",
  "take-home-pay": "対決より解決・手取り",
  "income-tax-178": "所得税178万円",
  "consumption-tax-5": "消費税一律5%",
  "food-zero-alternative": "食料品ゼロへの対案",
  "resident-tax-178": "住民税178万円",
  "constitution-priority": "憲法の優先順位",
  "selective-surnames": "選択的夫婦別姓",
  "nuclear-surcharge": "原発・賦課金",
  "youth-income-tax": "若者所得税",
  invoice: "インボイス",
  "consumption-tax-cut": "消費税減税",
  "consumption-tax-bill": "消費税減税衆法",
  "political-heir-ban": "ウラ金・世襲禁止",
  "political-heir": "世襲",
  "child-education": "子ども・教育投資",
  "my-number": "マイナンバー",
  "animal-welfare": "犬猫殺処分",
  "high-school-exam": "高校入試",
  "local-volunteer": "地方議員ボランティア",
  "dark-jobs": "闇バイト",
  "poster-dignity": "ポスター品位",
  "rice-price": "米価",
  "pm-nomination": "首班指名",
  "session-length": "会期",
  "special-committee": "特別委員会",
  "social-insurance": "社会保険料",
  "seat-change": "くら替え退職",
  "tuition-free": "教育無償化",
};

export function officeStatusLabel(status: OfficeStatus): string {
  switch (status) {
    case "in_office":
      return "現職";
    case "not_in_office":
      return "非現職 ／ 議席なし";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function isSittingMember(politician: Politician): boolean {
  return politician.office_status === "in_office";
}

export function affiliationLine(politician: Politician): string {
  const district = politician.meta?.district;
  const sitting = isSittingMember(politician);
  const house = sitting ? politician.house : `最終所属：${politician.house}`;
  const party = politician.party;
  if (sitting) {
    return district ? `${house} ／ ${party} ／ ${district}` : `${house} ／ ${party}`;
  }
  return district ? `${house} ／ ${party} ／ ${district} ／ 議席なし` : `${house} ／ ${party} ／ 議席なし`;
}

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic;
}
