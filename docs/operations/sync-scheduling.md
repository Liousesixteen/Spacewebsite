# Sync Scheduling and Alerts

## Required configuration

Set `CRON_SECRET` to a long random value in the deployment environment. Every
scheduled request must include `Authorization: Bearer <CRON_SECRET>`.

Optionally set `SYNC_ALERT_WEBHOOK_URL` to receive a JSON POST when a source
reaches exactly three consecutive failed runs. The payload includes the source,
failure count, error message, and timestamp.

## Schedule

Run one job per invocation. This keeps launch-plan updates independent from
slower reference-data imports and lets the data health center isolate failures.

| Job | UTC schedule | Endpoint |
| --- | --- | --- |
| Launches | `17 */6 * * *` | `/api/internal/sync?job=launches` |
| Agencies | `31 2 * * *` | `/api/internal/sync?job=agencies` |
| Rockets | `47 2 * * *` | `/api/internal/sync?job=rockets` |
| Launch sites | `13 3 * * 1` | `/api/internal/sync?job=launch-sites` |
| Astronauts | `29 3 * * 3` | `/api/internal/sync?job=astronauts` |
| Spacecraft | `43 3 * * 5` | `/api/internal/sync?job=spacecraft` |

## Operational response

1. Open `/data-sources` and identify the stale or failed domain.
2. Inspect the latest `SyncRun` error for that source.
3. Confirm the upstream API and `LL2_API_KEY` quota before retrying.
4. Trigger the single affected job, not a full sync, after resolving the cause.
5. Verify the run transitions to `SUCCEEDED` and the domain freshness recovers.
