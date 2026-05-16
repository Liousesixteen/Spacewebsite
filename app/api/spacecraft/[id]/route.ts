import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const spacecraft = await prisma.spacecraft.findUnique({
    where: { id: params.id },
  });

  if (!spacecraft) {
    return NextResponse.json({ error: 'Spacecraft not found' }, { status: 404 });
  }

  return NextResponse.json(spacecraft, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
