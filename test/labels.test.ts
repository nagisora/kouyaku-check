import { describe, expect, it } from "vitest";
import { actionKindLabel, actionSideHeading, countLabels, labelClassName, profileLinkLabel, sourceTypeLabel, topicLabel } from "../src/lib/labels";
import { ACTION_KINDS, LABELS, SOURCE_TYPES } from "../src/lib/types";
import type { Entry } from "../src/lib/types";

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
  it("exposes only 一致 / ズレ / 不明", () => {
    expect(LABELS).toEqual(["一致", "ズレ", "不明"]);
  });

  it("counts each label independently", () => {
    const counts = countLabels([sampleEntry("一致"), sampleEntry("一致"), sampleEntry("不明")]);
    expect(counts).toEqual({ 一致: 2, ズレ: 0, 不明: 1 });
  });

  it("maps labels to CSS class names", () => {
    expect(labelClassName("一致")).toBe("label-match");
    expect(labelClassName("ズレ")).toBe("label-gap");
    expect(labelClassName("不明")).toBe("label-unknown");
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
    expect(ACTION_KINDS).toEqual(["cabinet_bill", "cabinet_decision", "pm_speech", "cabinet_personnel", "other_member_bill"]);
    expect(actionKindLabel("cabinet_bill")).toBe("閣法（内閣提出）");
    expect(actionKindLabel("cabinet_decision")).toBe("閣議決定");
    expect(actionKindLabel("pm_speech")).toBe("総理発言");
    expect(actionKindLabel("cabinet_personnel")).toBe("内閣人事");
    expect(actionKindLabel("other_member_bill")).toBe("他議員の衆法");
    expect(actionSideHeading(undefined)).toBe("国会での行動");
    expect(actionSideHeading("cabinet_bill")).toBe("行動");
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
