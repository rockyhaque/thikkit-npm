import { describe, it, expect } from "vitest";
import {
  divisions,
  districts,
  units,
  unitNames,
  divisionNames,
  districtNames,
  getDivision,
  getDistrict,
  getUnit,
  search,
  counts,
} from "../src";

describe("counts", () => {
  it("matches the verified totals", () => {
    expect(counts()).toEqual({
      divisions: 8,
      districts: 64,
      units: 603,
      upazilas: 495,
      thanas: 108,
    });
  });
});

describe("divisions", () => {
  it("returns all 8", () => {
    expect(divisions()).toHaveLength(8);
  });
  it("each has both en + bn", () => {
    for (const d of divisions()) {
      expect(d.en).toBeTruthy();
      expect(d.bn).toBeTruthy();
      expect(d.id).toBeTruthy();
    }
  });
  it("supports descending sort", () => {
    const asc = divisions({ order: "asc" }).map((d) => d.en);
    const desc = divisions({ order: "desc" }).map((d) => d.en);
    expect(desc).toEqual([...asc].reverse());
  });
  it("can sort by Bangla", () => {
    const bn = divisions({ sortBy: "bn" }).map((d) => d.bn);
    expect(bn).toEqual([...bn].sort((a, b) => a.localeCompare(b, "bn")));
  });
});

describe("districts", () => {
  it("returns all 64", () => {
    expect(districts()).toHaveLength(64);
  });
  it("Dhaka division has exactly 13 districts", () => {
    expect(districts({ divisionId: "dhaka" })).toHaveLength(13);
  });
  it("paginates", () => {
    const page1 = districts({ page: 1, limit: 10 });
    const page2 = districts({ page: 2, limit: 10 });
    expect(page1).toHaveLength(10);
    expect(page2).toHaveLength(10);
    expect(page1[0].id).not.toBe(page2[0].id);
  });
});

describe("units", () => {
  it("Dhaka district has 50+ units (full DMP coverage)", () => {
    const u = units({ districtId: "dhaka-dhaka" });
    expect(u.length).toBeGreaterThanOrEqual(50);
  });
  it("includes well-known DMP thanas", () => {
    const names = unitNames("dhaka-dhaka");
    expect(names).toContain("Mirpur");
    expect(names).toContain("Gulshan");
    expect(names).toContain("Dhanmondi");
    expect(names).toContain("Khilgaon");
    expect(names).toContain("Wari");
    expect(names).toContain("Banani");
    expect(names).toContain("Uttara");
  });
  it("returns Bangla when requested", () => {
    const bn = unitNames("dhaka-dhaka", "bn");
    expect(bn).toContain("মিরপুর");
    expect(bn).toContain("গুলশান");
  });
  it("can filter by type", () => {
    const upa = units({ districtId: "dhaka-dhaka", type: "upazila" });
    const tha = units({ districtId: "dhaka-dhaka", type: "thana" });
    expect(upa.every((u) => u.type === "upazila")).toBe(true);
    expect(tha.every((u) => u.type === "thana")).toBe(true);
    expect(tha.length).toBeGreaterThan(40);
  });
  it("filters by division (every district below it)", () => {
    const all = units({ divisionId: "dhaka" });
    expect(all.length).toBeGreaterThan(80);
  });
});

describe("getById lookups", () => {
  it("getDivision", () => {
    expect(getDivision("dhaka")?.bn).toBe("ঢাকা");
    expect(getDivision("nonexistent")).toBeUndefined();
  });
  it("getDistrict", () => {
    expect(getDistrict("dhaka-dhaka")?.bn).toBe("ঢাকা");
  });
  it("getUnit", () => {
    const mirpur = units({ districtId: "dhaka-dhaka" }).find(
      (u) => u.en === "Mirpur",
    );
    expect(mirpur).toBeDefined();
    expect(getUnit(mirpur!.id)?.bn).toBe("মিরপুর");
  });
});

describe("convenience name helpers", () => {
  it("divisionNames(en) returns all 8", () => {
    expect(divisionNames("en")).toContain("Dhaka");
    expect(divisionNames("en")).toHaveLength(8);
  });
  it("divisionNames(bn) returns Bangla", () => {
    expect(divisionNames("bn")).toContain("ঢাকা");
  });
  it("districtNames", () => {
    const names = districtNames("dhaka", "en");
    expect(names).toContain("Dhaka");
    expect(names).toContain("Gazipur");
  });
});

describe("search", () => {
  it("finds by English substring", () => {
    const r = search("mirpur");
    expect(r.length).toBeGreaterThan(0);
    expect(r.some((x) => x.en === "Mirpur")).toBe(true);
  });
  it("finds by Bangla substring", () => {
    const r = search("ঢাকা");
    expect(r.length).toBeGreaterThan(0);
  });
  it("can scope by type", () => {
    const r = search("dhaka", { types: ["division"] });
    expect(r.every((x) => x.type === "division")).toBe(true);
  });
  it("limit", () => {
    expect(search("a", { limit: 5 }).length).toBeLessThanOrEqual(5);
  });
});

describe("data integrity", () => {
  it("every unit's districtId references a real district", () => {
    const districtIds = new Set(districts().map((d) => d.id));
    for (const u of units()) {
      expect(districtIds.has(u.districtId)).toBe(true);
    }
  });
  it("every district's divisionId references a real division", () => {
    const divIds = new Set(divisions().map((d) => d.id));
    for (const d of districts()) {
      expect(divIds.has(d.divisionId)).toBe(true);
    }
  });
  it("no entry is missing Bangla", () => {
    expect(divisions().filter((d) => !d.bn)).toHaveLength(0);
    expect(districts().filter((d) => !d.bn)).toHaveLength(0);
    expect(units().filter((u) => !u.bn)).toHaveLength(0);
  });
  it("ids are unique within each collection", () => {
    const dIds = divisions().map((x) => x.id);
    expect(new Set(dIds).size).toBe(dIds.length);
    const distIds = districts().map((x) => x.id);
    expect(new Set(distIds).size).toBe(distIds.length);
    const unitIds = units().map((x) => x.id);
    expect(new Set(unitIds).size).toBe(unitIds.length);
  });
});
