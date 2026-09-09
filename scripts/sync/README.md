# Data Sync Scripts

Pulls real space data from public APIs (Launch Library 2 + SpaceX API v4) into the
Postgres database referenced by `DATABASE_URL`. All operations are idempotent
upserts, so re-running the sync is safe.

## Prerequisites

- `DATABASE_URL` must be set in `.env`
- `tsx` installed as a dev dependency (already in `package.json`)

## Scripts

| Command                | What it does                                                              |
| ---------------------- | ------------------------------------------------------------------------- |
| `pnpm sync`            | Run everything in dependency order (rockets, sites, astronauts, etc.)     |
| `pnpm sync:rockets`    | Refresh rocket configurations from LL2 `/launcher`                        |
| `pnpm sync:launch-sites` | Refresh launch sites from LL2 `/pad` grouped by location                |
| `pnpm sync:astronauts` | Refresh astronauts from LL2 `/astronaut`                                  |
| `pnpm sync:spacecraft` | Refresh spacecraft configs from LL2 `/spacecraft`                         |
| `pnpm sync:launches`   | Refresh upcoming + previous launches from LL2, enrich SpaceX with YouTube |
| `pnpm sync:agencies`   | Refresh global agencies and launch providers from LL2 `/agencies`         |
| `pnpm sync:historical` | Import curated major historical launches across countries                 |
| `pnpm sync:satcat`     | Import satellite/payload catalog records from CelesTrak SATCAT            |
| `pnpm sync:spacex-full` | Import full SpaceX rockets, pads, and launch history from SpaceX API v4   |

If `pnpm` is unavailable in your environment, you can call the scripts
directly: `node node_modules/tsx/dist/cli.mjs scripts/sync/index.ts`.

## How it works

- All synced records use a stable `ll2-${slug}` ID prefix so they don't collide
  with existing seed data.
- Launches reference rockets and launch sites by foreign key. When the launch
  syncer encounters an unknown rocket/site, it creates a placeholder so the
  launch can still be inserted; the next `sync:rockets` / `sync:launch-sites`
  run will fill in the missing details.
- External record identity is tracked via `Launch.externalId = ll2-${ll2_id}`.

## Rate limits

Launch Library 2 limits anonymous traffic to ~15 requests/hour. The clients
include a 200 ms inter-request delay and the launch sync caps results at
~150 rows total. Don't run the full sync more than once per hour.

If you exceed the limit you'll see HTTP 429 errors. Wait an hour or supply an
email-authenticated key (out of scope for this script).

## Scheduling

Production should schedule each domain independently so a slow backfill does not
delay urgent launch-plan updates. The application exposes a protected endpoint:

```text
GET /api/internal/sync?job=launches
Authorization: Bearer $CRON_SECRET
```

Valid jobs are `launches`, `agencies`, `rockets`, `launch-sites`, `astronauts`,
and `spacecraft`. The endpoint rejects a duplicate in-progress run for the same
domain. Suggested UTC cadences:

| Job | Cadence |
| --- | --- |
| `launches` | Every 6 hours |
| `agencies`, `rockets` | Daily |
| `launch-sites`, `astronauts`, `spacecraft` | Weekly |

Configure `CRON_SECRET` in the deployment environment, then use Vercel Cron,
GitHub Actions, or any scheduler capable of adding the bearer header. For a
self-hosted deployment, a reasonable fallback is a local cron entry:

```cron
17 */6 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" "https://your-domain.example/api/internal/sync?job=launches"
```

When `SYNC_ALERT_WEBHOOK_URL` is configured, the system sends one JSON event
when a source reaches three consecutive failed runs. Successful runs reset the
streak; notification delivery failures never interrupt data synchronization.

## Troubleshooting

- **HTTP 429 from LL2**: rate-limited. Wait an hour, then re-run.
- **Foreign key errors on launches**: re-run `pnpm sync:rockets` and
  `pnpm sync:launch-sites` first.
- **Skipped records**: external API responses are sometimes incomplete. The
  scripts log how many records were skipped; check the log line for the
  reason. Common reasons: missing name, missing required date.
