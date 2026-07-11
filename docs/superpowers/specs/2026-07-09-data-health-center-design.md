# Data Health Center Design

**Date:** 2026-07-09

## Goal

Turn the static data-source notice into a trustworthy, localized data health
center. Users should be able to see which parts of SpaceData are available,
how much data each domain contains, when it was last refreshed, and whether a
source is delayed or unavailable.

This milestone establishes the observability contract required before adding
more global launch, country, agency, and industry sources.

## Scope

### Included

- A reusable server-side health snapshot builder.
- A public `GET /api/data-health` endpoint.
- Health rows for launches, agencies, rockets, launch sites, astronauts, and
  spacecraft.
- Record counts and latest known synchronization timestamps.
- Overall and per-domain `healthy`, `stale`, `empty`, and `unavailable`
  statuses.
- Graceful degradation when PostgreSQL or one domain query is unavailable.
- A redesigned `/[locale]/data-sources` operational status page.
- Complete Simplified Chinese and English strings for the new experience.
- Unit tests for status classification, partial failure, and API response
  behavior.

### Excluded

- Running synchronization jobs from the public page.
- Persisting a new sync-run history table in this milestone.
- Synthetic timestamps for models that do not currently store
  `lastSyncedAt`.
- Automated incident notifications.
- Adding new third-party providers before the health contract is stable.

## Product Design

The page is an operational reference rather than a marketing page. It uses a
dense, restrained layout consistent with the launch mission center:

1. A compact header explains current platform coverage.
2. A summary strip shows overall status, total indexed records, healthy
   domains, and snapshot generation time.
3. A responsive status table lists each data domain with status, record count,
   latest update, source label, and expected refresh interval.
4. A source registry below the table explains Launch Library 2, SpaceX API,
   NASA APIs, and other configured providers without claiming that an
   unimplemented connector is active.
5. A short accuracy notice explains launch schedule volatility and directs
   critical decisions to primary sources.

Status is communicated by icon, label, and color together. The page must remain
readable without color and must not nest cards inside cards.

## Architecture

### Pure Health Classifier

Create a framework-independent module that accepts domain samples and produces
a normalized snapshot. Each sample contains:

- `key`
- `count`
- `latestUpdatedAt`
- `latestSyncedAt`
- `source`
- `expectedRefreshHours`
- optional `error`

Classification rules:

- `unavailable`: the domain query failed.
- `empty`: the query succeeded but returned no records.
- `stale`: the latest usable timestamp is older than the domain's expected
  refresh window.
- `healthy`: records exist and the latest usable timestamp is within the
  expected refresh window.

When `lastSyncedAt` does not exist for a model, `updatedAt` is labeled as the
latest record update rather than presented as a confirmed external sync time.

Overall status:

- `healthy` when every non-empty domain is healthy and none are unavailable.
- `degraded` when at least one domain is stale, empty, or unavailable but at
  least one domain remains available.
- `unavailable` when all domain queries fail.

### Data Loader

A server-only loader runs independent Prisma aggregate queries with
`Promise.allSettled`. One failed query must not discard successful domain
results. It maps database records into the pure classifier input.

The first version reads only existing tables and fields. It does not change the
Prisma schema.

### API Route

`GET /api/data-health` returns:

```json
{
  "generatedAt": "2026-07-09T00:00:00.000Z",
  "status": "degraded",
  "summary": {
    "totalRecords": 0,
    "healthyDomains": 0,
    "totalDomains": 6
  },
  "domains": []
}
```

Successful and partially successful snapshots use status `200` with
`Cache-Control: public, s-maxage=300, stale-while-revalidate=900`.
An invalid internal result or complete loader failure returns status `503` with
`Cache-Control: no-store`.

### Page Rendering

The data-source page is a Server Component. It calls the same loader directly
instead of making a loopback HTTP request. If the loader cannot produce a
snapshot, the page renders a localized unavailable state and keeps the static
source registry visible.

## Localization

All user-facing text is stored under a dedicated `dataHealth` namespace in
`messages/zh-CN.json` and `messages/en.json`. Status labels, domain names,
relative freshness text, source descriptions, empty states, and accuracy
notices must be translated.

Other locale files receive English fallback strings in this milestone so no
raw translation keys appear in Japanese or Russian routes.

Provider and mission names remain proper nouns and are not mechanically
translated.

## Error Handling

- Domain query errors are captured independently and never expose database
  connection details to clients.
- Logs include the failed domain key and original server-side error.
- The API exposes only a localized-neutral machine status and a safe message.
- Missing timestamps are displayed as unknown, not stale, unless the domain
  has no records.
- The page renders useful source documentation even during total database
  failure.

## Testing

Follow test-driven development:

1. Unit tests for healthy, stale, empty, unavailable, degraded, and total
   failure classification.
2. Response tests for `200` cacheable partial snapshots and `503` no-store
   failures.
3. Full API test suite.
4. Lint and production build.
5. Browser verification of Chinese and English routes at desktop and mobile
   widths, including database-unavailable rendering and error-overlay checks.

## Success Criteria

- Users can distinguish fresh, delayed, empty, and unavailable data domains.
- A PostgreSQL outage does not produce a blank data-source page.
- Chinese routes contain no untranslated interface copy; English routes contain
  no Chinese interface copy.
- The API has a stable machine-readable contract for future home-page and admin
  health indicators.
- Tests, lint, build, and browser verification pass.
