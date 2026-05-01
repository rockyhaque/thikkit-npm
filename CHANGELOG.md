# Changelog

All notable changes to `thikkit` will be documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Planned for v0.2
- Postal codes per district / unit (BBPO data)
- Centroid coordinates (lat/lng) for divisions and districts

## [0.1.1] — 2026-05-01

### Changed
- Repository URL updated to `rockyhaque/thikkit-npm`. No code or data changes.

## [0.1.0] — initial release

### Added
- Bilingual dataset for Bangladesh administrative geography:
  - 8 divisions
  - 64 districts
  - 603 admin units (495 rural upazilas + 108 metropolitan thanas)
- Every entry has both English and Bangla names — no nulls
- Metropolitan thana coverage from each authority's published 2024 jurisdiction:
  - DMP (49), CMP (16), KMP (8), RMP (6), SMP (6), BMP (4), Rangpur Metro (6), GMP (8), MMP (4)
- Public API:
  - `divisions()`, `districts()`, `units()` with sort + pagination + filter
  - `getDivision(id)`, `getDistrict(id)`, `getUnit(id)` for O(1) lookups
  - `divisionNames(lang)`, `districtNames(divisionId, lang)`, `unitNames(districtId, lang)`
  - `search(query)` — substring across both languages, all three levels
  - `counts()` — dataset stats
- Full TypeScript type definitions
- ESM + CommonJS build via `tsup`
- 27 passing vitest tests covering counts, lookups, filters, search, and data integrity
- Direct JSON access via `thikkit/data/*.json`
- Zero runtime dependencies

[Unreleased]: https://github.com/rockyhaque/thikkit-npm/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/rockyhaque/thikkit-npm/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/rockyhaque/thikkit-npm/releases/tag/v0.1.0
