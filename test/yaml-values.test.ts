import { describe, expect, it } from "vitest";
import { formatDietSession } from "../src/lib/yaml-values";

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
