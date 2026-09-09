import { describe, expect, it } from "vitest";
import { compareFileNames } from "../src/lib/file-names";

describe("compareFileNames", () => {
  it("orders ASCII names the same way as a locale-aware sort", () => {
    const names = ["hc-7025006.yaml", "hc-7025005.yaml", "a.yml"];
    expect([...names].sort(compareFileNames)).toEqual(["a.yml", "hc-7025005.yaml", "hc-7025006.yaml"]);
  });

  it("is stable for equal names", () => {
    expect(compareFileNames("same.yaml", "same.yaml")).toBe(0);
  });
});
