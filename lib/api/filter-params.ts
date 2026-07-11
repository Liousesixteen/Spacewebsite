import type { Prisma } from '@prisma/client';

export function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function cleanParam(searchParams: URLSearchParams, key: string): string | undefined {
  const value = searchParams.get(key)?.trim();
  return value || undefined;
}

function insensitiveContains(value: string) {
  return { contains: value, mode: 'insensitive' as const };
}

function parseStartOfDay(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseEndOfDay(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function buildLaunchWhere(searchParams: URLSearchParams): Prisma.LaunchWhereInput {
  const status = cleanParam(searchParams, 'status');
  const country = cleanParam(searchParams, 'country');
  const year = cleanParam(searchParams, 'year');
  const rocketName = cleanParam(searchParams, 'rocketName');
  const launchSite = cleanParam(searchParams, 'launchSite');
  const provider = cleanParam(searchParams, 'provider');
  const missionType = cleanParam(searchParams, 'missionType');
  const orbit = cleanParam(searchParams, 'orbit');
  const launchPad = cleanParam(searchParams, 'launchPad');
  const from = parseStartOfDay(cleanParam(searchParams, 'from'));
  const to = parseEndOfDay(cleanParam(searchParams, 'to'));

  const where: Prisma.LaunchWhereInput = {};
  const andClauses: Prisma.LaunchWhereInput[] = [];
  if (status) where.status = status as Prisma.LaunchWhereInput['status'];
  if (year) {
    const parsedYear = Number.parseInt(year, 10);
    if (Number.isFinite(parsedYear) && parsedYear > 0) {
      where.date = {
        gte: new Date(`${parsedYear}-01-01T00:00:00.000Z`),
        lt: new Date(`${parsedYear + 1}-01-01T00:00:00.000Z`),
      };
    }
  }
  if (from || to) {
    where.date = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }
  if (country || rocketName) {
    where.rocket = {
      ...(country ? { country } : {}),
      ...(rocketName ? { name: insensitiveContains(rocketName) } : {}),
    };
  }
  if (launchSite) {
    where.launchSite = {
      name: insensitiveContains(launchSite),
    };
  }
  if (provider) {
    andClauses.push({
      OR: [
        { agency: { name: insensitiveContains(provider) } },
        { rocket: { manufacturer: insensitiveContains(provider) } },
      ],
    });
  }
  if (missionType) {
    where.missionType = insensitiveContains(missionType);
  }
  if (orbit) {
    andClauses.push({
      OR: [
        { orbitName: insensitiveContains(orbit) },
        { orbitAbbrev: insensitiveContains(orbit) },
      ],
    });
  }
  if (launchPad) {
    where.launchPad = {
      name: insensitiveContains(launchPad),
    };
  }
  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  return where;
}

export function buildSpacecraftWhere(searchParams: URLSearchParams): Prisma.SpacecraftWhereInput {
  const type = cleanParam(searchParams, 'type');
  const status = cleanParam(searchParams, 'status');
  const operator = cleanParam(searchParams, 'operator');
  const orbitType = cleanParam(searchParams, 'orbitType');
  const name = cleanParam(searchParams, 'name');

  const where: Prisma.SpacecraftWhereInput = {};
  if (type) where.type = type as Prisma.SpacecraftWhereInput['type'];
  if (status) where.status = status as Prisma.SpacecraftWhereInput['status'];
  if (name) where.name = insensitiveContains(name);
  if (operator) where.operator = insensitiveContains(operator);
  if (orbitType) where.orbitType = insensitiveContains(orbitType);

  return where;
}

export function buildAstronautWhere(searchParams: URLSearchParams): Prisma.AstronautWhereInput {
  const nationality = cleanParam(searchParams, 'nationality');
  const agency = cleanParam(searchParams, 'agency');
  const status = cleanParam(searchParams, 'status');
  const name = cleanParam(searchParams, 'name');
  const flightsMin = cleanParam(searchParams, 'flightsMin');
  const flightsMax = cleanParam(searchParams, 'flightsMax');

  const where: Prisma.AstronautWhereInput = {};
  if (nationality) where.nationality = nationality;
  if (agency) where.agency = agency;
  if (status) where.status = status as Prisma.AstronautWhereInput['status'];
  if (name) where.name = insensitiveContains(name);

  const min = flightsMin ? Number.parseInt(flightsMin, 10) : undefined;
  const max = flightsMax ? Number.parseInt(flightsMax, 10) : undefined;
  const spaceFlights: Prisma.IntFilter = {};
  if (Number.isFinite(min) && min !== undefined && min >= 0) spaceFlights.gte = min;
  if (Number.isFinite(max) && max !== undefined && max >= 0) spaceFlights.lte = max;
  if (Object.keys(spaceFlights).length > 0) where.spaceFlights = spaceFlights;

  return where;
}
