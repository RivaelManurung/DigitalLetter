import { NextResponse, type NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { letter, letterView } from '@/db/schema';

const bodySchema = z.object({
  slug: z.string().trim().min(1).max(60),
  referrer: z.string().max(300).nullable().optional(),
});

/** Analitik best-effort: selalu balas 204 supaya kegagalan tidak terlihat penerima. */
export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return new NextResponse(null, { status: 204 });

    const [row] = await db
      .select({ id: letter.id, status: letter.status })
      .from(letter)
      .where(eq(letter.slug, parsed.data.slug))
      .limit(1);

    if (!row || row.status !== 'published') {
      return new NextResponse(null, { status: 204 });
    }

    const userAgent = request.headers.get('user-agent') ?? '';
    const device = /Mobi|Android|iPhone|iPad/i.test(userAgent) ? 'mobile' : 'desktop';

    await Promise.all([
      db.insert(letterView).values({
        letterId: row.id,
        referrer: parsed.data.referrer?.slice(0, 300) ?? null,
        // header ini diisi oleh Vercel; di lokal akan null
        country: request.headers.get('x-vercel-ip-country'),
        device,
      }),
      db
        .update(letter)
        .set({ viewCount: sql`${letter.viewCount} + 1` })
        .where(eq(letter.id, row.id)),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
