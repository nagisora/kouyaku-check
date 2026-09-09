import { describe, expect, it } from "vitest";
import { shouldWarnSoftOnlyProcess } from "../src/lib/claim-quality";
import { countLabels } from "../src/lib/labels";
import { loadPoliticians, getPoliticianByRoute, politicianRoutes } from "../src/lib/politicians";

describe("politicians data", () => {
  it("loads the 安野 ledger with 9 行動一致 / 0 公約実現 / 0 ズレ / 3 不明", () => {
    const listed = loadPoliticians();
    const anno = listed.find((politician) => politician.id === "hc-7025005");
    expect(listed).toHaveLength(5);
    expect(anno?.name).toBe("安野貴博");
    expect(anno?.office_status).toBe("in_office");
    expect(anno?.entries).toHaveLength(12);
    expect(countLabels(anno?.entries ?? [])).toEqual({ 行動一致: 9, 公約実現: 0, ズレ: 0, 不明: 3 });
    expect(anno?.entries.some((entry) => entry.label === "公約実現")).toBe(false);
    expect(anno?.entries.find((entry) => entry.id === "L02")?.voting_method).toBe("named_rollcall");
    expect(anno?.entries.find((entry) => entry.id === "L02")?.agency_capacity).toBe("individual");
  });

  it("loads the 高市 ledger with 4 行動一致 / 6 公約実現 / 1 ズレ / 2 不明", () => {
    const takaichi = loadPoliticians().find((politician) => politician.id === "hr-230");
    expect(takaichi?.name).toBe("高市早苗");
    expect(takaichi?.slug).toBe("takaichi-sanae");
    expect(takaichi?.house).toBe("衆議院");
    expect(takaichi?.office_status).toBe("in_office");
    expect(takaichi?.entries).toHaveLength(13);
    expect(countLabels(takaichi?.entries ?? [])).toEqual({ 行動一致: 4, 公約実現: 6, ズレ: 1, 不明: 2 });
    expect(takaichi?.entries.filter((entry) => entry.label === "公約実現").map((entry) => entry.id)).toEqual(["L01", "L04", "L05", "L06", "L08", "L09"]);
    expect(takaichi?.entries.some((entry) => entry.action.source_type === "vote")).toBe(false);
    expect(takaichi?.entries.every((entry) => entry.action.action_kind !== undefined)).toBe(true);
  });

  it("tags 高市 L04 as cabinet agency and leaves L09 as 公約実現 in flight", () => {
    const takaichi = loadPoliticians().find((politician) => politician.id === "hr-230");
    const tuition = takaichi?.entries.find((entry) => entry.id === "L04");
    const taxCredit = takaichi?.entries.find((entry) => entry.id === "L09");
    expect(tuition?.agency_capacity).toBe("cabinet_or_executive");
    expect(taxCredit?.label).toBe("公約実現");
    expect(taxCredit?.horizon_status).toBe("in_flight");
  });

  it("resolves the politician by id and slug", () => {
    const byId = getPoliticianByRoute("hc-7025005");
    const bySlug = getPoliticianByRoute("anno-takahiro");
    expect(byId?.id).toBe("hc-7025005");
    expect(bySlug?.id).toBe("hc-7025005");
    if (!byId) {
      throw new Error("hc-7025005 must load");
    }
    expect(politicianRoutes(byId)).toEqual(["hc-7025005", "anno-takahiro"]);
  });

  it("loads 玉木 with 6 行動一致 / 0 公約実現 / 2 ズレ / 4 不明 and no invented floor votes", () => {
    const tamaki = loadPoliticians().find((politician) => politician.id === "hr-258");
    expect(tamaki?.name).toBe("玉木雄一郎");
    expect(tamaki?.slug).toBe("tamaki-yuichiro");
    expect(tamaki?.office_status).toBe("in_office");
    expect(tamaki?.entries).toHaveLength(12);
    expect(countLabels(tamaki?.entries ?? [])).toEqual({ 行動一致: 6, 公約実現: 0, ズレ: 2, 不明: 4 });
    expect(tamaki?.entries.some((entry) => entry.action.source_type === "vote")).toBe(false);
    expect(tamaki?.entries.some((entry) => entry.label === "公約実現")).toBe(false);
    expect(tamaki?.entries.find((entry) => entry.id === "L02")?.agency_capacity).toBe("caucus_or_party");
  });

  it("loads 河村 with 9 行動一致 / 0 公約実現 / 0 ズレ / 5 不明", () => {
    const kawamura = loadPoliticians().find((politician) => politician.id === "hr-135");
    expect(kawamura?.name).toBe("河村たかし");
    expect(kawamura?.slug).toBe("kawamura-takashi");
    expect(kawamura?.office_status).toBe("in_office");
    expect(kawamura?.entries).toHaveLength(14);
    expect(countLabels(kawamura?.entries ?? [])).toEqual({ 行動一致: 9, 公約実現: 0, ズレ: 0, 不明: 5 });
    expect(kawamura?.entries.find((entry) => entry.id === "L03")?.agency_capacity).toBe("individual");
    expect(kawamura?.entries.find((entry) => entry.id === "L02")?.agency_capacity).toBeUndefined();
  });

  it("loads 音喜多 as not_in_office with 0 行動一致 / 2 公約実現 / 0 ズレ / 5 不明", () => {
    const otokita = loadPoliticians().find((politician) => politician.id === "hc-7019010");
    expect(otokita?.name).toBe("音喜多駿");
    expect(otokita?.slug).toBe("otokita-shun");
    expect(otokita?.office_status).toBe("not_in_office");
    expect(otokita?.window.to).toBe("2024-10-15");
    expect(otokita?.entries).toHaveLength(7);
    expect(countLabels(otokita?.entries ?? [])).toEqual({ 行動一致: 0, 公約実現: 2, ズレ: 0, 不明: 5 });
    expect(otokita?.entries.filter((entry) => entry.label === "公約実現").map((entry) => entry.id)).toEqual(["L01", "L06"]);
    expect(otokita?.entries.find((entry) => entry.id === "L01")?.voting_method).toBe("named_rollcall");
  });

  it("tags every existing entry with hard or soft claim_kind", () => {
    const listed = loadPoliticians();
    for (const politician of listed) {
      expect(politician.entries.every((entry) => entry.claim_kind === "hard" || entry.claim_kind === "soft")).toBe(true);
      expect(shouldWarnSoftOnlyProcess(politician.entries)).toBe(false);
    }
  });

  it("resolves 高市 by id and slug", () => {
    const byId = getPoliticianByRoute("hr-230");
    const bySlug = getPoliticianByRoute("takaichi-sanae");
    expect(byId?.id).toBe("hr-230");
    expect(bySlug?.id).toBe("hr-230");
    if (!byId) {
      throw new Error("hr-230 must load");
    }
    expect(politicianRoutes(byId)).toEqual(["hr-230", "takaichi-sanae"]);
  });

  it("resolves the new ledgers by id and slug", () => {
    expect(getPoliticianByRoute("tamaki-yuichiro")?.id).toBe("hr-258");
    expect(getPoliticianByRoute("kawamura-takashi")?.id).toBe("hr-135");
    expect(getPoliticianByRoute("otokita-shun")?.id).toBe("hc-7019010");
  });
});
