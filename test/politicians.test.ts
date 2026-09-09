import { describe, expect, it } from "vitest";
import { countLabels } from "../src/lib/labels";
import { loadPoliticians, getPoliticianByRoute, politicianRoutes } from "../src/lib/politicians";

describe("politicians data", () => {
  it("loads the 安野 ledger with 9 一致 / 0 ズレ / 3 不明", () => {
    const listed = loadPoliticians();
    const anno = listed.find((politician) => politician.id === "hc-7025005");
    expect(listed).toHaveLength(1);
    expect(anno?.name).toBe("安野貴博");
    expect(anno?.entries).toHaveLength(12);
    expect(countLabels(anno?.entries ?? [])).toEqual({ 一致: 9, ズレ: 0, 不明: 3 });
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
});
