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
npm run discover      # probe discovery targets for schema endpoints
npm run refresh       # fetch + normalize schemas from seeds/discovered
npm run build:index   # rebuild catalog index from schemas
npm run validate      # validate all stored schemas
```

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
