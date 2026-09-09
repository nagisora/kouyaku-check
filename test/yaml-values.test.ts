import { describe, expect, it } from "vitest";
import {
  formatDietSession,
  isActionKind,
  isAgencyCapacity,
  isClaimKind,
  isHorizonStatus,
  isLabel,
  isOfficeStatus,
  isSourceType,
  isVotingMethod,
  toMessage,
  entrySlot,
} from "../src/lib/yaml-values";

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
  it("accepts only 行動一致 / 公約実現 / ズレ / 不明", () => {
    expect(isLabel("行動一致")).toBe(true);
    expect(isLabel("公約実現")).toBe(true);
    expect(isLabel("ズレ")).toBe(true);
    expect(isLabel("不明")).toBe(true);
    expect(isLabel("過程一致")).toBe(false);
    expect(isLabel("結果到達")).toBe(false);
    expect(isLabel("一致")).toBe(false);
    expect(isLabel("信頼")).toBe(false);
    expect(isLabel(1)).toBe(false);
  });
});

describe("isClaimKind", () => {
  it("accepts only hard and soft", () => {
    expect(isClaimKind("hard")).toBe(true);
    expect(isClaimKind("soft")).toBe(true);
    expect(isClaimKind("medium")).toBe(false);
    expect(isClaimKind("一致")).toBe(false);
  });
});

describe("isSourceType", () => {
  it("accepts the official source types only", () => {
    expect(isSourceType("bulletin")).toBe(true);
    expect(isSourceType("vote")).toBe(true);
    expect(isSourceType("statement")).toBe(true);
    expect(isSourceType("bill")).toBe(true);
    expect(isSourceType("tweet")).toBe(false);
  });
});

describe("isActionKind", () => {
  it("accepts cabinet and other-member kinds only", () => {
    expect(isActionKind("cabinet_bill")).toBe(true);
    expect(isActionKind("pm_speech")).toBe(true);
    expect(isActionKind("member_bill")).toBe(true);
    expect(isActionKind("speech")).toBe(true);
    expect(isActionKind("written_question")).toBe(true);
    expect(isActionKind("caucus_position")).toBe(true);
    expect(isActionKind("resignation")).toBe(true);
    expect(isActionKind("floor_vote")).toBe(false);
  });

  it("accepts office status values only", () => {
    expect(isOfficeStatus("in_office")).toBe(true);
    expect(isOfficeStatus("not_in_office")).toBe(true);
    expect(isOfficeStatus("sitting")).toBe(false);
  });
});

describe("optional entry tags", () => {
  it("accepts only the coarse agency, voting, and horizon enums", () => {
    expect(isAgencyCapacity("individual")).toBe(true);
    expect(isAgencyCapacity("caucus_or_party")).toBe(true);
    expect(isAgencyCapacity("cabinet_or_executive")).toBe(true);
    expect(isAgencyCapacity("unknown")).toBe(true);
    expect(isAgencyCapacity("personal")).toBe(false);
    expect(isVotingMethod("named_rollcall")).toBe(true);
    expect(isVotingMethod("standing_or_voice")).toBe(true);
    expect(isVotingMethod("rollcall")).toBe(false);
    expect(isHorizonStatus("achieved")).toBe(true);
    expect(isHorizonStatus("in_flight")).toBe(true);
    expect(isHorizonStatus("not_applicable")).toBe(true);
    expect(isHorizonStatus("pending")).toBe(false);
  });
});

describe("toMessage", () => {
  it("stringifies numbers and booleans for error text", () => {
    expect(toMessage(12)).toBe("12");
    expect(toMessage("L01")).toBe("L01");
    expect(toMessage(true)).toBe("true");
    expect(entrySlot(3)).toBe("entries[3]");
  });
});
