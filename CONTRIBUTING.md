# Contributing to thikkit

Thanks for considering a contribution! This package exists because Bangladesh's address landscape evolves — new thanas get carved out, spellings get standardised, BBS publishes updates. Community contributions keep it accurate.

## Quick start

```sh
git clone https://github.com/rockyhaque/thikkit.git
cd thikkit
npm install
npm test            # 27 tests should pass
npm run build       # produces dist/
```

## Where the data lives

Three JSON files in `data/` are the source of truth — the package literally ships these.

| File | What's inside |
|---|---|
| `data/divisions.json` | 8 divisions: `id`, `en`, `bn` |
| `data/districts.json` | 64 districts: `id`, `en`, `bn`, `divisionId` |
| `data/units.json` | 603 admin units: `id`, `en`, `bn`, `type`, `districtId` |

### `id` convention

- Division: lowercased English name (e.g. `dhaka`, `chattogram`)
- District: `{divisionId}-{lowercased-en}` (e.g. `dhaka-dhaka`, `dhaka-gazipur`)
- Unit: `{districtId}-{lowercased-en}` with non-alphanumerics → `-` (e.g. `dhaka-dhaka-mirpur`)

When in doubt, copy the pattern of an existing entry.

## Adding a new thana

1. Find the official source (metropolitan police authority, BBS gazette, etc.) and link it in your PR.
2. Add an entry to `data/units.json` with `type: "thana"` (or `"upazila"` for rural).
3. Both `en` and `bn` are **required** — no nulls allowed.
4. Keep the file alphabetized within each district (the array is sorted by `districtId` then `en`).
5. Run:
   ```sh
   npm run lint:data    # checks no nulls
   npm test             # checks integrity
   ```
6. Open a PR with the source link.

## Fixing a Bangla spelling

1. Edit the entry's `bn` field in the appropriate JSON file.
2. Cite your source in the PR description (BBS publication, government website, Banglapedia, etc.).
3. `npm test` to make sure nothing else broke.

## Ground rules

- **Only verifiable changes.** Don't add a thana you saw on a Facebook post — link the gov.bd page.
- **Don't break the public API** without a major version bump.
- **No runtime dependencies.** This package is intentionally zero-dep — keep it that way.
- **Tests must pass.** Counts in `tests/index.test.ts` get adjusted when entries are added/removed.

## Reporting a bug

Open an issue with:
- The function call you made and the result you got
- The result you expected
- A link to the source proving the expected result

## Releasing (maintainers)

```sh
npm version patch | minor | major
git push --follow-tags
npm publish
```

`prepublishOnly` runs `npm run build && npm test` automatically.
