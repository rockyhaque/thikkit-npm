# thikkit

> **Thikana** (ঠিকানা) is the Bangla word for *address*.

A bilingual (**English + Bangla**), zero-runtime-dependency Bangladesh address dataset for npm — with **full coverage** of administrative divisions, districts, rural upazilas, and metropolitan thanas (DMP, CMP, KMP, RMP, SMP, BMP, GMP, MMP, Rangpur Metro).

[![npm](https://img.shields.io/npm/v/thikkit.svg)](https://www.npmjs.com/package/thikkit)
[![license](https://img.shields.io/npm/l/thikkit.svg)](./LICENSE)
[![types](https://img.shields.io/badge/types-included-blue.svg)](./dist/index.d.ts)

---

## Why this exists

Building an e-commerce or delivery app in Bangladesh? You need every administrative unit a courier can actually reach — not just the rural upazilas. Existing address packages stop at the BBS upazila list, which means a customer in **Mirpur, Gulshan, Dhanmondi, Khilgaon, Banani, Wari, Uttara** — anywhere inside Dhaka City — can't pick a valid address.

`thikkit` includes **all 495 upazilas plus 108 metropolitan thanas** sourced from each metropolitan police authority.

### Coverage at a glance

|  | Count |
|---|---:|
| Divisions | **8** |
| Districts | **64** |
| Total admin units | **603** |
|  &nbsp;&nbsp;&nbsp;Rural upazilas | 495 |
|  &nbsp;&nbsp;&nbsp;Metropolitan thanas | 108 |
| Bilingual (English + Bangla) | **100%** |
| Runtime dependencies | **0** |

---

## Install

```sh
npm install thikkit
# or
pnpm add thikkit
# or
yarn add thikkit
```

ESM and CommonJS both supported. Full TypeScript types included.

---

## Quick start

```ts
import { divisions, districts, unitNames, search } from "thikkit";

// All 8 divisions
divisions();
// → [{ id: "barisal", en: "Barisal", bn: "বরিশাল" }, ...]

// 13 districts in Dhaka division
districts({ divisionId: "dhaka" });

// Every admin unit a customer in Dhaka district might live in (50+)
unitNames("dhaka-dhaka");
// → ["Adabor", "Badda", "Banani", ..., "Wari"]

// Bangla version of the same list
unitNames("dhaka-dhaka", "bn");
// → ["আদাবর", "বাড্ডা", "বনানী", ..., "ওয়ারী"]

// Search across both languages, all three levels
search("mirpur");
search("ঢাকা");
```

---

## Real-world usage

### Cascading dropdowns (React)

```tsx
import { useState } from "react";
import {
  divisions,
  districts,
  unitNames,
  type Division,
  type District,
} from "thikkit";

export function AddressForm() {
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [unit, setUnit] = useState("");

  return (
    <>
      <select
        value={divisionId}
        onChange={(e) => {
          setDivisionId(e.target.value);
          setDistrictId("");
          setUnit("");
        }}
      >
        <option value="">— Select Division —</option>
        {divisions().map((d) => (
          <option key={d.id} value={d.id}>
            {d.en} ({d.bn})
          </option>
        ))}
      </select>

      <select
        value={districtId}
        onChange={(e) => {
          setDistrictId(e.target.value);
          setUnit("");
        }}
        disabled={!divisionId}
      >
        <option value="">— Select District —</option>
        {districts({ divisionId }).map((d) => (
          <option key={d.id} value={d.id}>
            {d.en} ({d.bn})
          </option>
        ))}
      </select>

      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        disabled={!districtId}
      >
        <option value="">— Select Area —</option>
        {unitNames(districtId).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </>
  );
}
```

### Autocomplete (any framework)

```ts
import { search } from "thikkit";

function autocomplete(query: string) {
  return search(query, { types: ["unit"], limit: 8 }).map((r) => ({
    label: `${r.en} · ${r.bn}`,
    value: r.id,
  }));
}
```

### Server-side validation

```ts
import { getUnit, getDistrict, getDivision } from "thikkit";

function validateShippingAddress(input: {
  divisionId: string;
  districtId: string;
  unitId: string;
}) {
  const unit = getUnit(input.unitId);
  if (!unit) return { ok: false, error: "Unknown area" };
  if (unit.districtId !== input.districtId)
    return { ok: false, error: "Area doesn't belong to that district" };
  const district = getDistrict(input.districtId);
  if (!district || district.divisionId !== input.divisionId)
    return { ok: false, error: "District doesn't belong to that division" };
  return { ok: true };
}
```

---

## API reference

### Lookups

| Function | Returns |
|---|---|
| `divisions(opts?)` | All 8 divisions, optionally sorted/paginated |
| `districts(opts?)` | All 64 districts; filter with `{ divisionId }` |
| `units(opts?)` | All admin units; filter with `{ districtId | divisionId | type }` |
| `getDivision(id)` | One division (O(1)) or `undefined` |
| `getDistrict(id)` | One district (O(1)) or `undefined` |
| `getUnit(id)` | One unit (O(1)) or `undefined` |

### Convenience name helpers

| Function | Returns |
|---|---|
| `divisionNames(lang?, opts?)` | `string[]` of just the names |
| `districtNames(divisionId, lang?, opts?)` | `string[]` of districts in a division |
| `unitNames(districtId, lang?, opts?)` | `string[]` of units in a district |

`lang` is `"en"` (default) or `"bn"`.

### Search

```ts
search(query: string, opts?: SearchOptions): SearchResult[]
```

- Substring match across **both** English and Bangla.
- Searches divisions, districts, **and** units by default.
- Returns parent ids for context (so you can show "Mirpur — Dhaka, Dhaka").

```ts
type SearchOptions = {
  types?: ("division" | "district" | "unit")[]; // default: all three
  limit?: number; // default: 50
};

type SearchResult = {
  type: "division" | "district" | "unit";
  id: string;
  en: string;
  bn: string;
  parentIds?: { divisionId?: string; districtId?: string };
};
```

### Sort & paginate (every list function)

```ts
divisions({ sortBy: "bn", order: "desc", page: 1, limit: 20 });
```

- `sortBy`: `"en"` (default) | `"bn"` | `"id"`
- `order`: `"asc"` (default) | `"desc"`
- `page` + `limit` for pagination

### Type filter (units only)

```ts
units({ districtId: "dhaka-dhaka", type: "thana" }); // metropolitan thanas only
units({ districtId: "dhaka-dhaka", type: "upazila" }); // rural upazilas only
```

### Stats

```ts
import { counts } from "thikkit";
counts();
// {
//   divisions: 8,
//   districts: 64,
//   units: 603,
//   upazilas: 495,
//   thanas: 108,
// }
```

### Direct JSON access

If you'd rather just import the raw data:

```ts
import divisions from "thikkit/data/divisions.json";
import districts from "thikkit/data/districts.json";
import units from "thikkit/data/units.json";
```

---

## Data sources

The dataset is hand-assembled from authoritative Bangladeshi government sources, then verified entry-by-entry. The package ships the JSON files directly — there is no runtime fetch, no build-time scraping, and no dependency on any other npm address package.

| Layer | Source |
|---|---|
| 8 divisions, 64 districts, 495 upazilas | Bangladesh Bureau of Statistics |
| **DMP** thanas (49) | dmp.gov.bd |
| **CMP** thanas (16) | cmp.gov.bd |
| **KMP** thanas (8) | kmp.gov.bd |
| **RMP** thanas (6) | rmp.gov.bd |
| **SMP** thanas (6) | smp.gov.bd |
| **BMP** thanas (4) | bmp.gov.bd |
| **Rangpur Metro** thanas (6) | Rangpur Metropolitan Police |
| **GMP** thanas (8, est. 2017) | gmp.gov.bd |
| **MMP** thanas (4, est. 2018) | mmp.gov.bd |
| Bangla translations | Hand-curated against official admin records |

Verification is enforced in CI:
- Every unit has a non-empty Bangla name (no nulls)
- Every district references a valid division
- Every unit references a valid district
- Every id is unique within its collection
- Counts match the verified totals

---

## Roadmap

`thikkit` is designed for forward compatibility — interfaces already accept optional fields so future minor versions don't break consumers.

- **v0.2** — Postal codes per district / unit (BBPO data)
- **v0.3** — Centroid coordinates (lat/lng) per division and district
- **v0.4** — Optional union/ward layer (4500+ entries) — opt-in import to avoid bundle bloat
- **v0.5** — ISO 3166-2:BD codes
- **v1.0** — Stabilized API + locked data versioning

---

## What this package is *not*

- **Not** a courier delivery zone API. For "is this address deliverable today?" use Pathao / Steadfast / RedX / eCourier APIs.
- **Not** a geocoder. Returns admin units, not free-form address parsing.

---

## Contributing

PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). Especially helpful:
- New thanas as authorities add them
- Bangla spelling corrections with a citation
- Example integrations for popular frameworks

The dataset lives directly in `data/*.json`. Edit, run `npm test`, open a PR.

---

## Author

**Rocky Haque** · Software Engineer @ [Iqra Wave](https://github.com/rockyhaque)
[`info.rockyhaque@gmail.com`](mailto:info.rockyhaque@gmail.com)

---

## License

[MIT](./LICENSE) — free to use, fork, and ship in commercial products.
