import { describe, expect, it } from "vitest";
import { shouldWarnSoftOnlyProcess } from "../src/lib/claim-quality";
import type { ClaimQualityInput } from "../src/lib/claim-quality";

describe("shouldWarnSoftOnlyProcess", () => {
  it("warns when there is no 公約実現 and every 行動一致 is soft", () => {
    const entries: ClaimQualityInput[] = [
      { label: "行動一致", claim_kind: "soft" },
      { label: "行動一致", claim_kind: "soft" },
      { label: "不明", claim_kind: "hard" },
    ];
    expect(shouldWarnSoftOnlyProcess(entries)).toBe(true);
  });

  it("does not warn when at least one 行動一致 is hard", () => {
    const entries: ClaimQualityInput[] = [
      { label: "行動一致", claim_kind: "soft" },
      { label: "行動一致", claim_kind: "hard" },
    ];
    expect(shouldWarnSoftOnlyProcess(entries)).toBe(false);
  });

  it("does not warn when 公約実現 exists", () => {
    const entries: ClaimQualityInput[] = [
      { label: "行動一致", claim_kind: "soft" },
      { label: "公約実現", claim_kind: "hard" },
    ];
    expect(shouldWarnSoftOnlyProcess(entries)).toBe(false);
  });

  it("does not warn when there are no 行動一致 rows", () => {
    const entries: ClaimQualityInput[] = [
      { label: "不明", claim_kind: "soft" },
      { label: "ズレ", claim_kind: "hard" },
    ];
    expect(shouldWarnSoftOnlyProcess(entries)).toBe(false);
  });
});
