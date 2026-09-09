import { describe, expect, it } from "vitest";
import { formatDietSession, isLabel, isSourceType } from "../src/lib/yaml-values";

describe("formatDietSession", () => {
  it("keeps empty values as null", () => {
    expect(formatDietSession(null)).toBeNull();
    expect(formatDietSession(undefined)).toBeNull();
  });

  it("stringifies finite numbers the way YAML session ids arrive", () => {
    expect(formatDietSession(218)).toBe("218");
    expect(formatDietSession("218")).toBe("218");
  });

  it("rejects objects that String() would turn into [object Object]", () => {
    expect(() => formatDietSession({ session: 218 })).toThrow(/diet_session/);
    expect(() => formatDietSession(true)).toThrow(/diet_session/);
  });
});

describe("isLabel", () => {
  it("accepts only 一致 / ズレ / 不明", () => {
    expect(isLabel("一致")).toBe(true);
    expect(isLabel("ズレ")).toBe(true);
    expect(isLabel("不明")).toBe(true);
    expect(isLabel("信頼")).toBe(false);
    expect(isLabel(1)).toBe(false);
  });
});

describe("isSourceType", () => {
  it("accepts the official source types only", () => {
    expect(isSourceType("bulletin")).toBe(true);
    expect(isSourceType("vote")).toBe(true);
    expect(isSourceType("tweet")).toBe(false);
  });
});
