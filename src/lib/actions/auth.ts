'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSession, destroySession, verifyCredentials } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().trim().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi').max(72),
});

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Input tidak valid' };
  }

  const session = await verifyCredentials(parsed.data.email, parsed.data.password);

  // Pesan sengaja sama untuk email salah dan password salah —
  // jangan bocorkan email mana yang terdaftar.
  if (!session) return { error: 'Email atau password salah.' };

  await createSession(session);
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/login');
}
