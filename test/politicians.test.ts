import { describe, expect, it } from "vitest";
import { countLabels } from "../src/lib/labels";
import { loadPoliticians, getPoliticianByRoute, politicianRoutes } from "../src/lib/politicians";

describe("politicians data", () => {
  it("loads the 安野 ledger with 9 一致 / 0 ズレ / 3 不明", () => {
    const listed = loadPoliticians();
    const anno = listed.find((politician) => politician.id === "hc-7025005");
    expect(listed).toHaveLength(5);
    expect(anno?.name).toBe("安野貴博");
    expect(anno?.office_status).toBe("in_office");
    expect(anno?.entries).toHaveLength(12);
    expect(countLabels(anno?.entries ?? [])).toEqual({ 一致: 9, ズレ: 0, 不明: 3 });
  });

  it("loads the 高市 ledger with 10 一致 / 1 ズレ / 2 不明", () => {
    const takaichi = loadPoliticians().find((politician) => politician.id === "hr-230");
    expect(takaichi?.name).toBe("高市早苗");
    expect(takaichi?.slug).toBe("takaichi-sanae");
    expect(takaichi?.house).toBe("衆議院");
    expect(takaichi?.office_status).toBe("in_office");
    expect(takaichi?.entries).toHaveLength(13);
    expect(countLabels(takaichi?.entries ?? [])).toEqual({ 一致: 10, ズレ: 1, 不明: 2 });
    expect(takaichi?.entries.some((entry) => entry.action.source_type === "vote")).toBe(false);
    expect(takaichi?.entries.every((entry) => entry.action.action_kind !== undefined)).toBe(true);
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

  it("loads 玉木 with 6 一致 / 2 ズレ / 4 不明 and no invented floor votes", () => {
    const tamaki = loadPoliticians().find((politician) => politician.id === "hr-258");
    expect(tamaki?.name).toBe("玉木雄一郎");
    expect(tamaki?.slug).toBe("tamaki-yuichiro");
    expect(tamaki?.office_status).toBe("in_office");
    expect(tamaki?.entries).toHaveLength(12);
    expect(countLabels(tamaki?.entries ?? [])).toEqual({ 一致: 6, ズレ: 2, 不明: 4 });
    expect(tamaki?.entries.some((entry) => entry.action.source_type === "vote")).toBe(false);
  });

  it("loads 河村 with 9 一致 / 0 ズレ / 5 不明", () => {
    const kawamura = loadPoliticians().find((politician) => politician.id === "hr-135");
    expect(kawamura?.name).toBe("河村たかし");
    expect(kawamura?.slug).toBe("kawamura-takashi");
    expect(kawamura?.office_status).toBe("in_office");
    expect(kawamura?.entries).toHaveLength(14);
    expect(countLabels(kawamura?.entries ?? [])).toEqual({ 一致: 9, ズレ: 0, 不明: 5 });
  });

  it("loads 音喜多 as not_in_office with 2 一致 / 0 ズレ / 5 不明", () => {
    const otokita = loadPoliticians().find((politician) => politician.id === "hc-7019010");
    expect(otokita?.name).toBe("音喜多駿");
    expect(otokita?.slug).toBe("otokita-shun");
    expect(otokita?.office_status).toBe("not_in_office");
    expect(otokita?.window.to).toBe("2024-10-15");
    expect(otokita?.entries).toHaveLength(7);
    expect(countLabels(otokita?.entries ?? [])).toEqual({ 一致: 2, ズレ: 0, 不明: 5 });
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
