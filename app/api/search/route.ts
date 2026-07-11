import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 30;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ results: {}, total: 0 });
  }

  const limit = 5;
  const [launches, spacecraft, astronauts, rockets, agencies, companies, technologies] =
    await Promise.all([
      prisma.launch.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { missionDescription: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, name: true, date: true, status: true },
      }),
      prisma.spacecraft.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, name: true, type: true, operator: true },
      }),
      prisma.astronaut.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, name: true, nationality: true, agency: true },
      }),
      prisma.rocket.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { manufacturer: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, name: true, manufacturer: true, country: true },
      }),
      prisma.agency.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { abbrev: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, name: true, country: true, type: true },
      }),
      prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, name: true, country: true, type: true },
      }),
      prisma.technology.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, name: true, category: true, maturityLevel: true },
      }),
    ]);

  return NextResponse.json(
    {
      results: {
        launches: launches.map((l) => ({
          ...l,
          type: 'launch' as const,
          url: `/launches/${l.id}`,
        })),
        spacecraft: spacecraft.map((s) => ({
          ...s,
          type: 'spacecraft' as const,
          url: `/spacecraft/${s.id}`,
        })),
        astronauts: astronauts.map((a) => ({
          ...a,
          type: 'astronaut' as const,
          url: `/astronauts/${a.id}`,
        })),
        rockets: rockets.map((r) => ({
          ...r,
          type: 'rocket' as const,
          url: `/rockets/${r.id}`,
        })),
        agencies: agencies.map((a) => ({
          ...a,
          type: 'agency' as const,
          url: `/agencies/${a.id}`,
        })),
        companies: companies.map((c) => ({
          ...c,
          type: 'company' as const,
          url: `/industry/companies/${c.id}`,
        })),
        technologies: technologies.map((t) => ({
          ...t,
          type: 'technology' as const,
          url: `/industry/technologies/${t.id}`,
        })),
      },
      total:
        launches.length +
        spacecraft.length +
        astronauts.length +
        rockets.length +
        agencies.length +
        companies.length +
        technologies.length,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    }
  );
}
