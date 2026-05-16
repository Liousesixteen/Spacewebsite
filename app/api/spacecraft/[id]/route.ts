import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

  return NextResponse.json(spacecraft);
}
