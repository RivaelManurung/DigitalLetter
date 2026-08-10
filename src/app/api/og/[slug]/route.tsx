import { ImageResponse } from 'next/og';
import { getLetterMeta } from '@/lib/queries';
import { getPreset } from '@/design/presets';

export const runtime = 'nodejs';

/**
 * Preview di WhatsApp/IG dibuat dari palet surat itu sendiri, jadi tautan
 * yang dibagikan sudah terasa personal sebelum dibuka.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const meta = await getLetterMeta(slug);

  if (!meta || meta.status !== 'published') {
    return new Response('Not found', { status: 404 });
  }

  const design = meta.design ?? getPreset('dark-romantic');
  const { palette } = design;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(150deg, ${palette.bgDeep} 0%, ${palette.bgMid} 45%, ${palette.bgSoft} 100%)`,
          color: palette.text,
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 120,
            height: 4,
            background: palette.accent,
            marginBottom: 44,
          }}
        />

        <div
          style={{
            fontSize: 26,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: palette.accentSoft,
            marginBottom: 24,
          }}
        >
          sebuah surat
        </div>

        <div
          style={{
            fontSize: 82,
            lineHeight: 1.1,
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          {meta.recipientName ? `Untuk ${meta.recipientName}` : meta.title}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 52,
            gap: 14,
          }}
        >
          {[palette.accent, palette.accentSoft, palette.accent].map((color, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: 12,
                background: color,
                opacity: 1 - i * 0.25,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
