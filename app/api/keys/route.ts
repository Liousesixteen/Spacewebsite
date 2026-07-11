import { NextRequest, NextResponse } from 'next/server';
import { generateApiKey, hashKey } from '@/lib/api/api-keys';

export const dynamic = 'force-dynamic';

/**
 * GET /api/keys — list user's API keys (requires auth in production).
 */
export async function GET(_req: NextRequest) {
  try {
    // TODO: authenticate user, then:
    // const keys = await prisma.apiKey.findMany({
    //   where: { userId: session.user.id, revokedAt: null },
    //   select: { id: true, name: true, keyPrefix: true, permissions: true, lastUsedAt: true, createdAt: true },
    // });

    return NextResponse.json({
      keys: [],
      message: 'Authentication required in production. Return empty list for now.',
    });
  } catch (error) {
    console.error('[keys] List failed:', error);
    return NextResponse.json(
      { code: 'UNAVAILABLE', message: 'Key management unavailable' },
      { status: 503 }
    );
  }
}

/**
 * POST /api/keys — create a new API key (requires auth in production).
 *
 * Body: { name: string, permissions?: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { code: 'INVALID_INPUT', message: 'Key name is required' },
        { status: 400 }
      );
    }

    const { rawKey, hash, prefix } = generateApiKey();

    // TODO: authenticate user, then store:
    // await prisma.apiKey.create({
    //   data: {
    //     userId: session.user.id,
    //     name,
    //     keyHash: hash,
    //     keyPrefix: prefix,
    //     permissions: body.permissions ?? [],
    //   },
    // });

    return NextResponse.json(
      {
        key: rawKey,
        prefix,
        name,
        message: 'Store this key securely — it cannot be retrieved again.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[keys] Create failed:', error);
    return NextResponse.json(
      { code: 'UNAVAILABLE', message: 'Key creation unavailable' },
      { status: 503 }
    );
  }
}

/**
 * DELETE /api/keys?id=<keyId> — revoke an API key.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { code: 'INVALID_INPUT', message: 'Key ID is required' },
        { status: 400 }
      );
    }

    // TODO: authenticate user, then:
    // await prisma.apiKey.update({
    //   where: { id, userId: session.user.id },
    //   data: { revokedAt: new Date() },
    // });

    return NextResponse.json({ revoked: true, id });
  } catch (error) {
    console.error('[keys] Revoke failed:', error);
    return NextResponse.json(
      { code: 'UNAVAILABLE', message: 'Key revocation unavailable' },
      { status: 503 }
    );
  }
}
