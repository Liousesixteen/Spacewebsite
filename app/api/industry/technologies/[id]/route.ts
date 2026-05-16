import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const technology = await prisma.technology.findUnique({
    where: { id },
  });

  if (!technology) {
    return NextResponse.json({ error: 'Technology not found' }, { status: 404 });
  }

  return NextResponse.json(technology);
}
