import type { ActionKind, Entry, Label, LabelCounts, SourceType } from "./types";

export function countLabels(entries: Entry[]): LabelCounts {
  const counts: LabelCounts = { 一致: 0, ズレ: 0, 不明: 0 };
  for (const entry of entries) {
    counts[entry.label] += 1;
  }
  return counts;
}

export function labelClassName(label: Label): string {
  switch (label) {
    case "一致":
      return "label-match";
    case "ズレ":
      return "label-gap";
    case "不明":
      return "label-unknown";
    default: {
      const _exhaustive: never = label;
      return _exhaustive;
    }
  }
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
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function actionSideHeading(kind: ActionKind | undefined): string {
  return kind === undefined ? "国会での行動" : "行動";
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
};

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic;
}
