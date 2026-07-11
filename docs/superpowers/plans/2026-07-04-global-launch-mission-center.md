# Global Launch Mission Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first milestone of the global aerospace data platform: a launch mission center backed by normalized agencies, launch pads, payloads, richer launch metadata, source health, and complete Chinese/English launch UI strings.

**Architecture:** Extend the existing Next.js + Prisma monolith without replacing current pages. Keep external API shapes inside sync scripts, normalize into local database tables, and expose richer data through existing `/api/launches` and `/api/launches/overview` routes.

**Tech Stack:** Next.js App Router, Prisma, PostgreSQL, React Query, next-intl, Tailwind CSS, Node test runner with `tsx`.

---

## File Map

- Modify `prisma/schema.prisma`: add `Agency`, `LaunchPad`, `Payload`, `DataSourceRecord`; add nullable metadata fields to `Launch`.
- Modify `scripts/sync/sync-agencies.ts`: write LL2 agencies into both `Agency` and existing `Company`.
- Modify `scripts/sync/sync-launches.ts`: upsert agencies, pads, launch metadata, payload rows, media links, and data source records.
- Modify `scripts/sync/lib/utils.ts`: add reusable LL2 country and status helpers.
- Modify `lib/api/filter-params.ts`: support provider, mission type, orbit, launch pad, and date range filters.
- Modify `lib/api/launch-overview.ts`: add provider counts, mission type counts, source freshness, richer attention grouping.
- Modify `lib/api/launches.ts`: expose new launch fields to frontend types and API client.
- Modify `app/api/launches/route.ts`: include agency, launch pad, payloads, and new filters.
- Modify `app/api/launches/overview/route.ts`: include source freshness and new selected relations.
- Modify `app/api/launches/[id]/route.ts`: include richer relations for client consumers.
- Modify `app/[locale]/(main)/launches/page.tsx`: keep current layout but wire richer filters and overview panels.
- Modify `components/launches/launch-mission-control.tsx`: show provider, mission type, orbit, source freshness, provider counts, mission type counts.
- Modify `components/launches/launch-filters.tsx`: add provider, mission type, orbit, launch pad, date range filters.
- Modify `components/launches/launch-card.tsx` and `components/launches/launch-table-row.tsx`: surface provider, orbit, and mission type when available.
- Modify `app/[locale]/(main)/launches/[id]/page.tsx`: show agency, pad, payloads, source freshness, and media links.
- Modify `app/[locale]/(main)/industry/page.tsx` and `components/industry/industry-chain-diagram.tsx`: tighten upstream/midstream/downstream presentation and remove hardcoded English strings from the first screen.
- Modify `messages/zh-CN.json` and `messages/en.json`: add all launch mission center and industry overview strings.
- Create/modify tests under `tests/api/`: add coverage for new filters, overview counts, source health, and LL2 status/provider mapping.

---

## Task 1: Data Model And Normalization Tests

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `scripts/sync/lib/utils.ts`
- Modify: `tests/api/filter-params.test.ts`
- Modify: `tests/api/launch-overview.test.ts`
- Create: `tests/api/sync-utils.test.ts`

- [ ] **Step 1: Write failing tests for new filters and sync utilities**

Add assertions for `provider`, `missionType`, `orbit`, `launchPad`, `from`, and `to` in `tests/api/filter-params.test.ts`. Add `tests/api/sync-utils.test.ts` with country mapping and LL2 launch status mapping.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
pnpm exec tsx --test tests/api/filter-params.test.ts tests/api/sync-utils.test.ts
```

Expected: tests fail because the new filter fields and exported helpers do not exist yet.

- [ ] **Step 3: Extend Prisma schema**

Add `Agency`, `LaunchPad`, `Payload`, `DataSourceRecord` and nullable relations/fields on `Launch`. Keep existing required fields unchanged so old data remains valid.

- [ ] **Step 4: Implement utilities and filter support**

Export `mapCountryCode`, keep `mapLaunchStatus`, and update `buildLaunchWhere` to support:

- `provider` through `agency.name`
- `missionType` through `Launch.missionType`
- `orbit` through `Launch.orbitName` or `Launch.orbitAbbrev`
- `launchPad` through `launchPad.name`
- `from` / `to` through `Launch.date`

- [ ] **Step 5: Verify GREEN**

Run:

```bash
pnpm exec prisma generate
pnpm exec tsx --test tests/api/filter-params.test.ts tests/api/sync-utils.test.ts
```

Expected: tests pass.

---

## Task 2: Launch Overview API Enrichment

**Files:**
- Modify: `lib/api/launch-overview.ts`
- Modify: `app/api/launches/overview/route.ts`
- Modify: `lib/api/launches.ts`
- Modify: `tests/api/launch-overview.test.ts`

- [ ] **Step 1: Write failing overview tests**

Add tests proving overview returns provider counts, mission type counts, source freshness, and treats postponed future launches plus recent failures as attention items.

- [ ] **Step 2: Run test and verify RED**

Run:

```bash
pnpm exec tsx --test tests/api/launch-overview.test.ts
```

Expected: fail because new overview fields do not exist.

- [ ] **Step 3: Extend overview builder**

Add optional `agency`, `launchPad`, `missionType`, `orbitName`, `orbitAbbrev`, `source`, and `lastSyncedAt` to launch overview input. Return:

- `providerCounts`
- `missionTypeCounts`
- `freshness`

- [ ] **Step 4: Extend API route include/select**

Include agency and launch pad relations in `/api/launches/overview`, and read latest `DataSourceRecord` when available.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
pnpm exec tsx --test tests/api/launch-overview.test.ts
```

Expected: pass.

---

## Task 3: Sync Scripts And Launch List API

**Files:**
- Modify: `scripts/sync/sync-agencies.ts`
- Modify: `scripts/sync/sync-launches.ts`
- Modify: `app/api/launches/route.ts`
- Modify: `app/api/launches/[id]/route.ts`
- Modify: `lib/api/launches.ts`

- [ ] **Step 1: Add API shape tests where behavior is pure**

Use the filter tests from Task 1 as the pure API behavior guard. Avoid database integration tests in this project because there is no isolated test database setup.

- [ ] **Step 2: Implement agency and pad upserts**

Update sync scripts so LL2 agency records create `Agency` rows and launch records resolve `agencyId` and `launchPadId`.

- [ ] **Step 3: Implement launch metadata and payload extraction**

Write `missionName`, `missionType`, `orbitName`, `orbitAbbrev`, `rawStatus`, `webcastUrl`, `source`, `sourceUrl`, `lastSyncedAt`, and `Payload` rows from LL2 detailed launch responses.

- [ ] **Step 4: Extend launch APIs**

`/api/launches` includes `agency`, `launchPad`, and payload rows. `/api/launches/[id]` includes the same richer relations for detail pages.

- [ ] **Step 5: Verify with generated client and tests**

Run:

```bash
pnpm exec prisma generate
pnpm exec tsx --test tests/api/filter-params.test.ts tests/api/launch-overview.test.ts tests/api/sync-utils.test.ts
```

Expected: pass.

---

## Task 4: Frontend Mission Center

**Files:**
- Modify: `components/launches/launch-mission-control.tsx`
- Modify: `components/launches/launch-filters.tsx`
- Modify: `components/launches/launch-card.tsx`
- Modify: `components/launches/launch-table-row.tsx`
- Modify: `app/[locale]/(main)/launches/page.tsx`
- Modify: `app/[locale]/(main)/launches/[id]/page.tsx`
- Modify: `messages/zh-CN.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add translation keys first**

Add keys for provider, launch pad, mission type, orbit, source, last synced, webcast, article, wiki, unknown, stale data, provider coverage, and mission type coverage.

- [ ] **Step 2: Update filters**

Add provider, mission type, orbit, pad, from, and to controls. Keep advanced filters collapsed by default.

- [ ] **Step 3: Update mission control**

Show provider, mission type, orbit, source freshness, provider counts, and mission type counts. Keep layout dense and readable.

- [ ] **Step 4: Update launch cards and table rows**

Surface provider, mission type, and orbit when present without increasing card height unpredictably.

- [ ] **Step 5: Update launch detail page**

Add localized sections for agency/provider, pad, mission metadata, payload rows, media links, source, and last synced time.

- [ ] **Step 6: Verify frontend**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass.

---

## Task 5: Industry First-Screen Alignment

**Files:**
- Modify: `app/[locale]/(main)/industry/page.tsx`
- Modify: `components/industry/industry-chain-diagram.tsx`
- Modify: `messages/zh-CN.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add industry overview translation keys**

Add title, description, quick link, upstream, midstream, downstream, empty, trends, challenges, and count labels.

- [ ] **Step 2: Update industry page first screen**

Use translated text and present the industry chain as three bands with counts and quick drill-downs.

- [ ] **Step 3: Verify**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass.

---

## Final Verification

Run:

```bash
pnpm exec tsx --test tests/api/filter-params.test.ts tests/api/launch-overview.test.ts tests/api/sync-utils.test.ts
pnpm lint
pnpm build
curl -I --max-time 15 http://localhost:3001/zh-CN/launches
```

Expected:

- Tests pass.
- Lint passes.
- Build passes.
- Local launches page returns HTTP 200 after dev server restart if needed.

