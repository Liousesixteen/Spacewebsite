import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const launch = await prisma.launch.findUnique({
    where: { id: params.id },
    include: {
      rocket: true,
      launchSite: true,
      crews: {
        include: { astronaut: true },
      },
    },
  });

  if (!launch) {
    return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
  }

  return NextResponse.json(launch);
}
