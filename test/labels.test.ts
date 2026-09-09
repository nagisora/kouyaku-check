import { describe, expect, it } from "vitest";
import {
  actionKindLabel,
  actionSideHeading,
  affiliationLine,
  countCardClassName,
  countLabels,
  formatLabelCounts,
  isSittingMember,
  labelClassName,
  officeStatusLabel,
  profileLinkLabel,
  sourceTypeLabel,
  topicLabel,
} from "../src/lib/labels";
import { ACTION_KINDS, CLAIM_KINDS, LABELS, OFFICE_STATUSES, SOURCE_TYPES } from "../src/lib/types";
import type { Entry, Politician } from "../src/lib/types";

function sampleEntry(label: Entry["label"]): Entry {
  return {
    id: "T01",
    topic: "political-funds",
    claim: { summary: "claim-text", date: null, source_url: "", source_type: "none" },
    action: {
      summary: "action-text",
      date: null,
      source_url: "",
      source_type: "none",
      diet_session: null,
    },
    label,
    notes: "",
  };
}

describe("言行 labels", () => {
  it("exposes only 過程一致 / 結果到達 / ズレ / 不明", () => {
    expect(LABELS).toEqual(["過程一致", "結果到達", "ズレ", "不明"]);
  });

  it("counts each label independently without merging matches", () => {
    const counts = countLabels([sampleEntry("過程一致"), sampleEntry("結果到達"), sampleEntry("過程一致"), sampleEntry("不明")]);
    expect(counts).toEqual({ 過程一致: 2, 結果到達: 1, ズレ: 0, 不明: 1 });
    expect(formatLabelCounts(counts)).toBe("2 過程一致 / 1 結果到達 / 0 ズレ / 1 不明");
  });

  it("maps labels to CSS class names", () => {
    expect(labelClassName("過程一致")).toBe("label-process");
    expect(labelClassName("結果到達")).toBe("label-outcome");
    expect(labelClassName("ズレ")).toBe("label-gap");
    expect(labelClassName("不明")).toBe("label-unknown");
    expect(countCardClassName("過程一致")).toBe("process");
    expect(countCardClassName("結果到達")).toBe("outcome");
  });

  it("exposes hard and soft claim kinds", () => {
    expect(CLAIM_KINDS).toEqual(["hard", "soft"]);
  });

  it("maps every source type", () => {
    expect(SOURCE_TYPES).toEqual(["bulletin", "party", "minutes", "vote", "none", "statement", "bill"]);
    expect(sourceTypeLabel("bulletin")).toBe("選挙公報");
    expect(sourceTypeLabel("party")).toBe("党公式");
    expect(sourceTypeLabel("minutes")).toBe("会議録");
    expect(sourceTypeLabel("vote")).toBe("本会議表決");
    expect(sourceTypeLabel("none")).toBe("該当なし");
    expect(sourceTypeLabel("statement")).toBe("公式発言");
    expect(sourceTypeLabel("bill")).toBe("議案経過");
  });

  it("labels cabinet actions without calling them member bills", () => {
    expect(ACTION_KINDS).toEqual([
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
    ]);
    expect(actionKindLabel("cabinet_bill")).toBe("閣法（内閣提出）");
    expect(actionKindLabel("cabinet_decision")).toBe("閣議決定");
    expect(actionKindLabel("pm_speech")).toBe("総理発言");
    expect(actionKindLabel("cabinet_personnel")).toBe("内閣人事");
    expect(actionKindLabel("other_member_bill")).toBe("他議員の衆法");
    expect(actionKindLabel("member_bill")).toBe("本人提出の議員立法");
    expect(actionKindLabel("speech")).toBe("国会発言");
    expect(actionKindLabel("written_question")).toBe("質問主意書");
    expect(actionKindLabel("caucus_position")).toBe("会派の態度");
    expect(actionKindLabel("resignation")).toBe("退職・失職");
    expect(actionSideHeading(undefined)).toBe("国会での行動");
    expect(actionSideHeading("cabinet_bill")).toBe("行動");
  });

  it("marks not_in_office without presenting the person as sitting", () => {
    expect(OFFICE_STATUSES).toEqual(["in_office", "not_in_office"]);
    expect(officeStatusLabel("in_office")).toBe("現職");
    expect(officeStatusLabel("not_in_office")).toBe("非現職 ／ 議席なし");
    const former: Politician = {
      id: "hc-7019010",
      name: "音喜多駿",
      name_kana: "おときた しゅん",
      house: "参議院（東京都選挙区）",
      party: "日本維新の会・教育無償化を実現する会",
      profile_url: "https://example.invalid/profile",
      updated_at: "2026-09-09",
      window: { from: "2024-10-01", to: "2024-10-15" },
      office_status: "not_in_office",
      meta: { district: "東京都選挙区" },
      entries: [],
    };
    expect(isSittingMember(former)).toBe(false);
    expect(affiliationLine(former)).toContain("最終所属");
    expect(affiliationLine(former)).toContain("議席なし");
    expect(affiliationLine(former)).not.toMatch(/^参議院/);
  });

  it("picks the profile link label from the house", () => {
    expect(profileLinkLabel("衆議院")).toBe("衆議院プロフィール");
    expect(profileLinkLabel("参議院（比例）")).toBe("参議院プロフィール");
    expect(profileLinkLabel("不明")).toBe("公式プロフィール");
  });

  it("falls back to the raw topic when unmapped", () => {
    expect(topicLabel("political-funds")).toBe("政治資金");
    expect(topicLabel("unknown-topic")).toBe("unknown-topic");
  });
});
