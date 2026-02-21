# openapi-schema-directory

Public, community-maintained OpenAPI schema directory with automated refresh and discovery workflows.

## Goals
- Keep API schemas up to date
- Provide stable index format for tooling
- Support automatic discovery + curation

## Structure
- `sources/seeds.json` — curated source URLs
- `sources/discovery-targets.json` — domains checked for common OpenAPI endpoints
- `schemas/<provider>/<version>.json` — normalized schemas
- `catalog/index.json` — canonical machine-readable directory index
- `catalog/discovered.json` — latest discovered candidates

## Commands
```bash
npm ci
npm run seed:apis-guru   # import full APIs.guru source index + preferred seed URLs
npm run discover         # probe discovery targets for schema endpoints
npm run intake:community # scan repo issues/PRs for schema URLs (requires GITHUB_TOKEN)
npm run refresh          # fetch + normalize schemas from seeds/discovered/community
npm run fetch:all-versions # fetch all known versions from APIs.guru index (supports MAX_SCHEMAS)
npm run build:index      # rebuild catalog index from schemas
npm run validate         # validate all stored schemas
```

### Environment variables
- `GITHUB_TOKEN` for `intake:community` GitHub API access
- `MAX_SCHEMAS` for bounded fetch in `fetch:all-versions` (e.g. `MAX_SCHEMAS=200`)

## Automation
GitHub Action `.github/workflows/refresh-catalog.yml` runs every 6 hours to:
1. discover
2. refresh
3. rebuild index
4. commit updates

## Add a new API
- Open issue using **Add API Schema** template
- or open PR editing `sources/seeds.json`

## Output contract (`catalog/index.json`)
```json
{
  "updatedAt": "...",
  "count": 123,
  "entries": [
    {
      "id": "stripe.com",
      "title": "Stripe API",
      "version": "2023-10-16",
      "openapi": "3.0.3",
      "schemaPath": "schemas/stripe.com/2023-10-16.json"
    }
  ]
}
```

## License
MIT
