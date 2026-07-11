# Launch Schedule And Industry Chain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make recent global launch plans the platform's primary operational experience, then connect launch providers to a browsable upstream, midstream, and downstream industry map.

**Architecture:** Extend the existing launch overview with deterministic schedule buckets and a compact schedule board. Add a pure industry coverage aggregator over the current `IndustrySegment`, `Company`, and agency data, then expose it through an API and a filterable industry-chain browser. Keep external API normalization inside sync scripts and preserve graceful database-failure states.

**Tech Stack:** Next.js App Router, React, Prisma, PostgreSQL, TanStack Query, next-intl, Tailwind CSS, Node test runner with `tsx`.

---

## File Map

- Modify `lib/api/launch-overview.ts`: produce today, next 24 hours, next 7 days, next 30 days, date-pending, and recently completed schedule buckets.
- Modify `tests/api/launch-overview.test.ts`: lock schedule boundary and tentative-date behavior.
- Modify `components/launches/launch-mission-control.tsx`: replace duplicated panels with a compact schedule board and direct task actions.
- Modify `lib/api/launches.ts`: expose the new overview fields to the client.
- Modify `messages/zh-CN.json`, `messages/en.json`, `messages/ja.json`, and `messages/ru.json`: localize schedule board and industry coverage UI.
- Create `lib/api/industry-coverage.ts`: aggregate segment, company, country, and provider coverage without depending on React or Prisma.
- Create `tests/api/industry-coverage.test.ts`: cover all three chain levels, country filtering, and empty inputs.
- Create `app/api/industry/overview/route.ts`: query current industry relations and return a cacheable overview.
- Create `components/industry/industry-chain-browser.tsx`: render three stable chain lanes with filters and company links.
- Modify `app/[locale]/(main)/industry/page.tsx`: use resilient data loading and the new chain browser.
- Modify `app/[locale]/(main)/launches/[id]/page.tsx`: add an industry-context section linking the provider and matching companies/segments.

## Task 1: Reliable Recent Launch Buckets

**Files:**
- Modify: `tests/api/launch-overview.test.ts`
- Modify: `lib/api/launch-overview.ts`
- Modify: `lib/api/launches.ts`

- [ ] **Step 1: Write failing tests for schedule boundaries**

Add fixtures at exactly now, within 24 hours, within seven days, within thirty
days, beyond thirty days, and with `POSTPONED` status. Assert the wished-for
fields:

```ts
assert.deepEqual(
  overview.next24Hours.map((launch) => launch.id),
  ['now', 'plus-12-hours']
);
assert.deepEqual(
  overview.upcoming7Days.map((launch) => launch.id),
  ['now', 'plus-12-hours', 'plus-6-days']
);
assert.deepEqual(
  overview.upcoming30Days.map((launch) => launch.id),
  ['now', 'plus-12-hours', 'plus-6-days', 'plus-20-days', 'postponed']
);
assert.deepEqual(
  overview.datePending.map((launch) => launch.id),
  ['postponed']
);
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec tsx --test tests/api/launch-overview.test.ts
```

Expected: FAIL because `next24Hours` and `datePending` do not exist.

- [ ] **Step 3: Implement the minimal bucket logic**

Extend `LaunchOverview`:

```ts
next24Hours: LaunchOverviewInput[];
datePending: LaunchOverviewInput[];
```

Use an inclusive start and end boundary. `nextLaunch` must select the earliest
`PLANNED` launch across all future records, not only records inside thirty days.
`datePending` contains future `POSTPONED` launches and records whose
`rawStatus` indicates a tentative or to-be-determined window.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
pnpm exec tsx --test tests/api/launch-overview.test.ts
```

Expected: all launch overview tests pass.

## Task 2: Launch Schedule Board

**Files:**
- Modify: `components/launches/launch-mission-control.tsx`
- Modify: `messages/zh-CN.json`
- Modify: `messages/en.json`
- Modify: `messages/ja.json`
- Modify: `messages/ru.json`

- [ ] **Step 1: Add translation keys**

Add keys under `launches.overview` for:

```json
{
  "scheduleBoard": "近期发射计划",
  "next24Hours": "未来 24 小时",
  "next7Days": "未来 7 天",
  "next30Days": "未来 30 天",
  "datePending": "时间待确认",
  "recentResults": "最近结果",
  "viewMission": "查看任务",
  "watchLive": "观看直播"
}
```

Provide equivalent English, Japanese, and Russian values so no locale renders
raw keys.

- [ ] **Step 2: Build the schedule board**

Refactor `LaunchMissionControl` into:

```tsx
<LaunchHero launch={data.nextLaunch} freshness={data.freshness} />
<ScheduleTabs
  groups={[
    { key: 'next24Hours', launches: data.next24Hours },
    { key: 'upcoming7Days', launches: data.upcoming7Days },
    { key: 'upcoming30Days', launches: data.upcoming30Days },
    { key: 'datePending', launches: data.datePending },
    { key: 'recentCompleted', launches: data.recentCompleted },
  ]}
  locale={locale}
/>
```

Use a segmented tab control, a stable-height list, localized dates, status
badges, provider, rocket, launch site, and detail/live actions. Do not duplicate
the same launch in multiple visible panels at once.

- [ ] **Step 3: Check responsive behavior**

At widths `390`, `768`, and `1440`, confirm tabs wrap or horizontally scroll,
action icons stay aligned, and long mission/provider names truncate without
changing row height.

- [ ] **Step 4: Verify the launch experience**

Run:

```bash
pnpm lint
pnpm exec tsx --test tests/api/launch-overview.test.ts
```

Expected: both commands exit successfully.

## Task 3: Industry Coverage Aggregator And API

**Files:**
- Create: `tests/api/industry-coverage.test.ts`
- Create: `lib/api/industry-coverage.ts`
- Create: `app/api/industry/overview/route.ts`

- [ ] **Step 1: Write failing aggregator tests**

Define a small fixture with one segment per level, companies in two countries,
and one empty segment. Assert:

```ts
assert.equal(result.summary.totalSegments, 3);
assert.equal(result.summary.totalCompanies, 2);
assert.deepEqual(
  result.levels.map((level) => [level.level, level.companyCount]),
  [['UPSTREAM', 1], ['MIDSTREAM', 1], ['DOWNSTREAM', 0]]
);
assert.deepEqual(result.countries, [
  { country: 'China', count: 1 },
  { country: 'United States', count: 1 },
]);
```

Add a second assertion proving `country: 'China'` filters company counts while
retaining all three chain levels.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec tsx --test tests/api/industry-coverage.test.ts
```

Expected: FAIL because `buildIndustryCoverage` does not exist.

- [ ] **Step 3: Implement the pure aggregator**

Export:

```ts
export function buildIndustryCoverage(
  segments: IndustryCoverageSegment[],
  options: { country?: string } = {}
): IndustryCoverage
```

Return stable `UPSTREAM`, `MIDSTREAM`, and `DOWNSTREAM` entries even when one
level has no rows. Each segment result includes its company count and up to six
company summaries.

- [ ] **Step 4: Implement the API route**

Query:

```ts
prisma.industrySegment.findMany({
  include: {
    companies: {
      include: { company: true },
    },
  },
  orderBy: [{ level: 'asc' }, { category: 'asc' }],
});
```

Map the Prisma join shape into the pure input. Return `200` with
`Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. On database
failure return a safe `503` body with `Cache-Control: no-store`.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
pnpm exec tsx --test tests/api/industry-coverage.test.ts
```

Expected: all industry coverage tests pass.

## Task 4: Filterable Industry Chain Browser

**Files:**
- Create: `components/industry/industry-chain-browser.tsx`
- Modify: `app/[locale]/(main)/industry/page.tsx`
- Modify: `messages/zh-CN.json`
- Modify: `messages/en.json`
- Modify: `messages/ja.json`
- Modify: `messages/ru.json`

- [ ] **Step 1: Add localized industry controls**

Add `industry.coverage`, `industry.allCountries`, `industry.companyCoverage`,
`industry.segmentCoverage`, `industry.noCoverage`, `industry.sourceUnavailable`,
and localized level descriptions.

- [ ] **Step 2: Replace the accordion diagram**

Render three adjacent lanes on desktop and three stacked lanes on mobile:

```tsx
<IndustryChainBrowser
  levels={coverage.levels}
  countries={coverage.countries}
  locale={locale}
/>
```

Each lane always remains visible and contains segment rows, company counts,
country markers, and links to
`/[locale]/industry/companies?segmentId=<id>&country=<country>`.

- [ ] **Step 3: Add resilient page loading**

Load overview data through a server helper with `try/catch`. During a database
outage, preserve the page header, chain taxonomy, source status, and navigation
links instead of throwing the entire route.

- [ ] **Step 4: Verify the industry experience**

Run:

```bash
pnpm lint
pnpm exec tsx --test tests/api/industry-coverage.test.ts
```

Expected: both commands exit successfully.

## Task 5: Connect Launches To The Industry Chain

**Files:**
- Create: `lib/api/launch-industry.ts`
- Create: `tests/api/launch-industry.test.ts`
- Modify: `app/[locale]/(main)/launches/[id]/page.tsx`
- Modify: `messages/zh-CN.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Write a failing provider matching test**

Use normalized exact names and abbreviations:

```ts
assert.deepEqual(
  matchLaunchIndustry(
    { agencyName: 'SpaceX', agencyAbbrev: 'SPX' },
    [{ id: 'c1', name: 'SpaceX', segments: [{ id: 's1', level: 'MIDSTREAM' }] }]
  ).companies.map((company) => company.id),
  ['c1']
);
```

Also prove that partial substrings such as `Space` do not match `SpaceX`.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec tsx --test tests/api/launch-industry.test.ts
```

Expected: FAIL because `matchLaunchIndustry` does not exist.

- [ ] **Step 3: Implement conservative matching**

Normalize case, punctuation, legal suffixes, and repeated whitespace. Match only
normalized full company names or explicit aliases. Return matched companies and
deduplicated industry segments; never infer a relationship from country alone.

- [ ] **Step 4: Add industry context to launch details**

Under the provider and payload information, add a compact section containing:

- matched company links;
- upstream, midstream, and downstream segment badges;
- a link to the industry page filtered by provider country;
- a localized empty state that explains no verified relationship exists yet.

- [ ] **Step 5: Verify the connection**

Run:

```bash
pnpm exec tsx --test tests/api/launch-industry.test.ts
pnpm lint
```

Expected: tests and lint pass.

## Task 6: Full Verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run the complete API suite**

```bash
pnpm exec tsx --test tests/api/*.test.ts
```

Expected: zero failures.

- [ ] **Step 2: Run static checks**

```bash
pnpm lint
pnpm build
```

Expected: both commands exit successfully.

- [ ] **Step 3: Verify in the browser**

Check:

- `/zh-CN/launches`
- `/en/launches`
- `/zh-CN/industry`
- `/en/industry`
- one launch detail route

At desktop and mobile widths, confirm meaningful content, no framework error
overlay, no Chinese UI in English, no English UI keys in Chinese, stable row
alignment, and usable failure states when the database is unavailable.
