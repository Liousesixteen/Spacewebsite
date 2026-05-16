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

A reasonable cadence is once or twice per day. Example crontab entry running at
5:17 AM and 5:17 PM local time:

```cron
17 5,17 * * * cd /path/to/Spacewebsite && /usr/local/bin/pnpm sync >> /var/log/spacesync.log 2>&1
```

For Vercel/Render-style deployments, schedule a serverless cron job that hits
an internal endpoint which calls the same `syncRockets()` / `syncLaunches()`
functions exported from these modules.

## Troubleshooting

- **HTTP 429 from LL2**: rate-limited. Wait an hour, then re-run.
- **Foreign key errors on launches**: re-run `pnpm sync:rockets` and
  `pnpm sync:launch-sites` first.
- **Skipped records**: external API responses are sometimes incomplete. The
  scripts log how many records were skipped; check the log line for the
  reason. Common reasons: missing name, missing required date.
