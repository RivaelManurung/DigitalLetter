import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { adminUser } from '@/db/schema';
import { serverEnv } from './env';

/**
 * Auth single-user: satu akun admin, sesi disimpan di cookie httpOnly
 * yang ditandatangani (JWT HS256). Cukup untuk satu operator, tanpa
 * menambah dependency auth berat.
 *
 * PENTING: middleware saja tidak cukup — Server Action bisa dipanggil
 * langsung, jadi setiap action wajib memanggil requireAdmin().
 */

const COOKIE = 'dl_session';
const MAX_AGE = 60 * 60 * 24 * 14; // 14 hari

function secret(): Uint8Array {
  return new TextEncoder().encode(serverEnv.authSecret);
}

export type Session = { userId: string; email: string };

export async function createSession(session: Session): Promise<void> {
  const token = await new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return { userId: payload.sub, email: String(payload.email ?? '') };
  } catch {
    return null;
  }
}

/** Dipanggil di awal SETIAP Server Action yang mengubah data. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<Session | null> {
  const [user] = await db
    .select()
    .from(adminUser)
    .where(eq(adminUser.email, email.trim().toLowerCase()))
    .limit(1);

  // Bandingkan hash walau user tidak ada, supaya waktu respons seragam
  // dan tidak membocorkan email mana yang terdaftar.
  const hash = user?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvaliduO';
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok) return null;
  return { userId: user.id, email: user.email };
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
