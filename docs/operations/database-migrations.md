# Database Migration Runbook

This project now tracks additive Prisma migrations in `prisma/migrations`.
The existing production database predates migration history, so the first
migration only creates the missing `ProductCapability` table and is safe to
run more than once.

## Release procedure

1. Confirm the target `DATABASE_URL` points at the intended environment.
2. Take or verify a database backup and record the release window.
3. Run `pnpm db:validate` and `pnpm db:status`.
4. Run `pnpm db:deploy` once per deployed release.
5. Call `/api/health` and verify `database_schema` reports `up`.
6. Open an industry company detail page and verify the capability section is
   either populated or omitted without a database error.

## Rollback

The migration is additive. Rollback means disabling writes to capabilities and
removing the table only after confirming no production data depends on it.
Do not use `prisma db push` against production as a replacement for this flow.
