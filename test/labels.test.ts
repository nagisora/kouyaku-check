import { describe, expect, it } from "vitest";
import { countLabels, labelClassName, sourceTypeLabel, topicLabel } from "../src/lib/labels";
import { LABELS, SOURCE_TYPES } from "../src/lib/types";
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
    expect(SOURCE_TYPES).toEqual(["bulletin", "party", "minutes", "vote", "none"]);
    expect(sourceTypeLabel("bulletin")).toBe("選挙公報");
    expect(sourceTypeLabel("party")).toBe("党公式");
    expect(sourceTypeLabel("minutes")).toBe("会議録");
    expect(sourceTypeLabel("vote")).toBe("本会議表決");
    expect(sourceTypeLabel("none")).toBe("該当なし");
  });

  it("falls back to the raw topic when unmapped", () => {
    expect(topicLabel("political-funds")).toBe("政治資金");
    expect(topicLabel("unknown-topic")).toBe("unknown-topic");
  });
});
