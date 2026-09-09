import { timingSafeEqual } from 'node:crypto';

/** Verify a bearer token without exposing a timing oracle for valid secrets. */
export function isCronAuthorized(
  authorization: string | null,
  secret: string | undefined
): boolean {
  if (!secret || !authorization?.startsWith('Bearer ')) return false;

  const token = authorization.slice('Bearer '.length);
  const expected = Buffer.from(secret);
  const actual = Buffer.from(token);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
