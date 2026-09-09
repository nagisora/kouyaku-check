import { describe, expect, it } from "vitest";
import { shouldWarnSoftOnlyProcess } from "../src/lib/claim-quality";
import type { ClaimQualityInput } from "../src/lib/claim-quality";

describe("shouldWarnSoftOnlyProcess", () => {
  it("warns when there is no 結果到達 and every 過程一致 is soft", () => {
    const entries: ClaimQualityInput[] = [
      { label: "過程一致", claim_kind: "soft" },
      { label: "過程一致", claim_kind: "soft" },
      { label: "不明", claim_kind: "hard" },
    ];
    expect(shouldWarnSoftOnlyProcess(entries)).toBe(true);
  });

  it("does not warn when at least one 過程一致 is hard", () => {
    const entries: ClaimQualityInput[] = [
      { label: "過程一致", claim_kind: "soft" },
      { label: "過程一致", claim_kind: "hard" },
    ];
    expect(shouldWarnSoftOnlyProcess(entries)).toBe(false);
  });

  it("does not warn when 結果到達 exists", () => {
    const entries: ClaimQualityInput[] = [
      { label: "過程一致", claim_kind: "soft" },
      { label: "結果到達", claim_kind: "hard" },
    ];
    expect(shouldWarnSoftOnlyProcess(entries)).toBe(false);
  });

  it("does not warn when there are no 過程一致 rows", () => {
    const entries: ClaimQualityInput[] = [
      { label: "不明", claim_kind: "soft" },
      { label: "ズレ", claim_kind: "hard" },
    ];
    expect(shouldWarnSoftOnlyProcess(entries)).toBe(false);
  });
});
