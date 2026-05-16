import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const astronaut = await prisma.astronaut.findUnique({
    where: { id: params.id },
    include: {
      launchCrews: {
        include: {
          launch: {
            include: {
              rocket: { select: { id: true, name: true, country: true } },
              launchSite: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { launch: { date: 'desc' } },
      },
    },
  });

  if (!astronaut) {
    return NextResponse.json({ error: 'Astronaut not found' }, { status: 404 });
  }

  return NextResponse.json(astronaut, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
