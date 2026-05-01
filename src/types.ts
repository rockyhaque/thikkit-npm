/** Language for return values. */
export type Lang = "en" | "bn";

/** Type of administrative unit. */
export type UnitType = "upazila" | "thana";

/**
 * A division of Bangladesh (8 total).
 *
 * Optional fields are reserved for future minor versions (lat/lng,
 * population, ISO codes). Adding more optional fields is non-breaking.
 */
export interface Division {
  id: string;
  en: string;
  bn: string;
  /** ISO 3166-2:BD code (planned, v0.2+). */
  iso?: string;
  /** Centroid coordinates (planned, v0.2+). */
  lat?: number;
  lng?: number;
}

/** A district within a division (64 total). */
export interface District {
  id: string;
  en: string;
  bn: string;
  divisionId: string;
  /** Postal code prefix (planned, v0.2+). */
  postcodePrefix?: string;
  lat?: number;
  lng?: number;
}

/** An administrative unit — rural upazila or metropolitan thana. */
export interface Unit {
  id: string;
  en: string;
  bn: string;
  type: UnitType;
  districtId: string;
  /** Specific postcode for this unit (planned, v0.2+). */
  postcode?: string;
  lat?: number;
  lng?: number;
}

/** Sort order. */
export type SortOrder = "asc" | "desc";

/** Sortable fields for `sortBy`. */
export type SortField = "en" | "bn" | "id";

/** Common query options accepted by every list function. */
export interface QueryOptions {
  /** Sort by field (default: "en"). */
  sortBy?: SortField;
  /** Order (default: "asc"). */
  order?: SortOrder;
  /** Pagination — 1-indexed page number. */
  page?: number;
  /** Pagination — page size. */
  limit?: number;
}

export interface UnitsQueryOptions extends QueryOptions {
  /** Filter by district id. */
  districtId?: string;
  /** Filter by division id (matches every unit in that division). */
  divisionId?: string;
  /** Filter by unit type. */
  type?: UnitType;
}

export interface DistrictsQueryOptions extends QueryOptions {
  /** Filter to a single division. */
  divisionId?: string;
}

export interface SearchResult {
  type: "division" | "district" | "unit";
  id: string;
  en: string;
  bn: string;
  /** Parent ids for context (district has divisionId, unit has both). */
  parentIds?: { divisionId?: string; districtId?: string };
}

export interface SearchOptions {
  /** Restrict search to a subset of types (default: all three). */
  types?: ReadonlyArray<"division" | "district" | "unit">;
  /** Cap results (default: 50). */
  limit?: number;
}
