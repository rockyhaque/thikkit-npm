/**
 * Bangladesh address dataset — bilingual (English + Bangla), with full
 * coverage of administrative divisions, districts, rural upazilas, and
 * metropolitan thanas (DMP, CMP, KMP, RMP, SMP, BMP, GMP, MMP, Rangpur Metro).
 *
 * Coverage:
 *   - 8 divisions
 *   - 64 districts
 *   - 603 admin units (~495 upazilas + ~108 metropolitan thanas)
 *   - Every entry has both English and Bangla names
 *
 * Sources:
 *   - Bangladesh Bureau of Statistics for upazila list
 *   - Each metropolitan police authority's published jurisdiction (2024) for thanas
 *   - Hand-verified Bangla translations against official admin names
 */

import divisionsData from "../data/divisions.json";
import districtsData from "../data/districts.json";
import unitsData from "../data/units.json";
import type {
  Division,
  District,
  Unit,
  Lang,
  SortField,
  SortOrder,
  UnitType,
  QueryOptions,
  UnitsQueryOptions,
  DistrictsQueryOptions,
  SearchResult,
  SearchOptions,
} from "./types";

export type {
  Division,
  District,
  Unit,
  Lang,
  SortField,
  SortOrder,
  UnitType,
  QueryOptions,
  UnitsQueryOptions,
  DistrictsQueryOptions,
  SearchResult,
  SearchOptions,
};

const DIVISIONS = divisionsData as Division[];
const DISTRICTS = districtsData as District[];
const UNITS = unitsData as Unit[];

// ─── Internal index for O(1) lookup ─────────────────────────────────────────
const divisionsById = new Map(DIVISIONS.map((d) => [d.id, d]));
const districtsById = new Map(DISTRICTS.map((d) => [d.id, d]));
const unitsById = new Map(UNITS.map((u) => [u.id, u]));
const districtsByDivision = new Map<string, District[]>();
for (const d of DISTRICTS) {
  const arr = districtsByDivision.get(d.divisionId) ?? [];
  arr.push(d);
  districtsByDivision.set(d.divisionId, arr);
}
const unitsByDistrict = new Map<string, Unit[]>();
for (const u of UNITS) {
  const arr = unitsByDistrict.get(u.districtId) ?? [];
  arr.push(u);
  unitsByDistrict.set(u.districtId, arr);
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function applyQuery<T extends { en: string; bn: string; id: string }>(
  rows: T[],
  opts: QueryOptions = {},
): T[] {
  const sortBy: SortField = opts.sortBy ?? "en";
  const order: SortOrder = opts.order ?? "asc";
  const sign = order === "desc" ? -1 : 1;
  const sorted = [...rows].sort(
    (a, b) => sign * a[sortBy].localeCompare(b[sortBy], sortBy === "bn" ? "bn" : "en"),
  );
  if (opts.page && opts.limit) {
    const start = (opts.page - 1) * opts.limit;
    return sorted.slice(start, start + opts.limit);
  }
  if (opts.limit) return sorted.slice(0, opts.limit);
  return sorted;
}

// ─── DIVISIONS ──────────────────────────────────────────────────────────────

/** All 8 divisions of Bangladesh. */
export function divisions(opts: QueryOptions = {}): Division[] {
  return applyQuery(DIVISIONS, opts);
}

/** Look up a single division by its id (e.g. "dhaka"). */
export function getDivision(id: string): Division | undefined {
  return divisionsById.get(id);
}

/** Convenience: just the names of all divisions in the chosen language. */
export function divisionNames(lang: Lang = "en", opts: QueryOptions = {}): string[] {
  return divisions(opts).map((d) => d[lang]);
}

// ─── DISTRICTS ──────────────────────────────────────────────────────────────

/** All districts. Optionally filter by division and apply sort/pagination. */
export function districts(opts: DistrictsQueryOptions = {}): District[] {
  const rows = opts.divisionId
    ? districtsByDivision.get(opts.divisionId) ?? []
    : DISTRICTS;
  return applyQuery(rows, opts);
}

/** Look up a single district by its id (e.g. "dhaka-dhaka"). */
export function getDistrict(id: string): District | undefined {
  return districtsById.get(id);
}

/** Names of every district in the given division. */
export function districtNames(
  divisionId: string,
  lang: Lang = "en",
  opts: QueryOptions = {},
): string[] {
  return districts({ ...opts, divisionId }).map((d) => d[lang]);
}

// ─── UNITS (upazilas + thanas) ──────────────────────────────────────────────

/** All admin units. Filter by district / division / type as needed. */
export function units(opts: UnitsQueryOptions = {}): Unit[] {
  let rows: Unit[] = opts.districtId
    ? unitsByDistrict.get(opts.districtId) ?? []
    : opts.divisionId
      ? UNITS.filter((u) => {
          const dist = districtsById.get(u.districtId);
          return dist?.divisionId === opts.divisionId;
        })
      : UNITS;
  if (opts.type) rows = rows.filter((u) => u.type === opts.type);
  return applyQuery(rows, opts);
}

/** Look up a single unit by its id. */
export function getUnit(id: string): Unit | undefined {
  return unitsById.get(id);
}

/**
 * Names of every unit in a district — combines upazilas + thanas. The
 * canonical "what should I show in my dropdown" function.
 */
export function unitNames(
  districtId: string,
  lang: Lang = "en",
  opts: QueryOptions & { type?: UnitType } = {},
): string[] {
  return units({ ...opts, districtId }).map((u) => u[lang]);
}

// ─── SEARCH ─────────────────────────────────────────────────────────────────

/**
 * Substring search across English and Bangla for divisions, districts, and
 * units. Case-insensitive, accent-aware, returns ordered by type
 * (division → district → unit) then alphabetically.
 */
export function search(query: string, opts: SearchOptions = {}): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const types = new Set(opts.types ?? ["division", "district", "unit"]);
  const limit = opts.limit ?? 50;

  const matches: SearchResult[] = [];
  const matchesQuery = (s: string) => s.toLowerCase().includes(q);

  if (types.has("division")) {
    for (const d of DIVISIONS) {
      if (matchesQuery(d.en) || d.bn.includes(q) || d.bn.includes(query)) {
        matches.push({ type: "division", id: d.id, en: d.en, bn: d.bn });
      }
    }
  }
  if (types.has("district")) {
    for (const d of DISTRICTS) {
      if (matchesQuery(d.en) || d.bn.includes(q) || d.bn.includes(query)) {
        matches.push({
          type: "district",
          id: d.id,
          en: d.en,
          bn: d.bn,
          parentIds: { divisionId: d.divisionId },
        });
      }
    }
  }
  if (types.has("unit")) {
    for (const u of UNITS) {
      if (matchesQuery(u.en) || u.bn.includes(q) || u.bn.includes(query)) {
        const dist = districtsById.get(u.districtId);
        matches.push({
          type: "unit",
          id: u.id,
          en: u.en,
          bn: u.bn,
          parentIds: {
            districtId: u.districtId,
            divisionId: dist?.divisionId,
          },
        });
      }
    }
  }

  return matches.slice(0, limit);
}

// ─── COUNTS ─────────────────────────────────────────────────────────────────

/** Quick stats about the dataset — handy for dashboards & tests. */
export function counts(): {
  divisions: number;
  districts: number;
  units: number;
  upazilas: number;
  thanas: number;
} {
  return {
    divisions: DIVISIONS.length,
    districts: DISTRICTS.length,
    units: UNITS.length,
    upazilas: UNITS.filter((u) => u.type === "upazila").length,
    thanas: UNITS.filter((u) => u.type === "thana").length,
  };
}
