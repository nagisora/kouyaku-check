import type { Entry, Label, LabelCounts, SourceType } from "./types";

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
    default: {
      const _exhaustive: never = sourceType;
      return _exhaustive;
    }
  }
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
};

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic;
}
