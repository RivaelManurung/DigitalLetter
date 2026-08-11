/**
 * Pemeriksaan cepat perilaku SectionStyle → CSS vars.
 * Dijalankan manual: npx tsx scripts/check-section-style.ts
 */
import { sectionStyleToCssVars } from '../src/design/tokens';
import { sectionStyleSchema } from '../src/design/schemas';

let failed = 0;

function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) {
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${name}`, detail ?? '');
  }
}

console.log('\nCSS vars');
const empty = sectionStyleToCssVars(undefined);
check('tanpa style → tidak ada variabel', Object.keys(empty).length === 0, empty);

const none = sectionStyleToCssVars({});
check('style kosong → tidak ada variabel', Object.keys(none).length === 0, none);

const colored = sectionStyleToCssVars({ text: '#fff', accent: '#f0f' }) as Record<string, string>;
check('warna teks diterjemahkan', colored['--c-text'] === '#fff', colored);
check('aksen mengisi accent & accent-soft', colored['--c-accent-soft'] === '#f0f', colored);
check('field lain tetap kosong', colored['--ff-display'] === undefined, colored);

const scaled = sectionStyleToCssVars({ titleScale: 1.5 }) as Record<string, string>;
check('skala judul memakai calc + clamp', scaled['--text-hero']?.startsWith('calc(clamp('), scaled);

const noScale = sectionStyleToCssVars({ titleScale: 1 }) as Record<string, string>;
check('skala 1 tidak menghasilkan variabel', noScale['--text-hero'] === undefined, noScale);

const pad = sectionStyleToCssVars({ padTop: 0 }) as Record<string, string>;
check('padding 0 tetap ditulis (bukan dianggap kosong)', pad['--section-pad-top'] === '0rem', pad);

console.log('\nValidasi');
check('gradient diterima', sectionStyleSchema.safeParse({ bg: 'linear-gradient(180deg, #000 0%, #fff 100%)' }).success);
check('hex diterima', sectionStyleSchema.safeParse({ bg: '#101010' }).success);
check(
  'url() ditolak sebagai bg',
  !sectionStyleSchema.safeParse({ bg: 'url(https://x.test/a.png)' }).success,
);
check(
  'javascript: ditolak sebagai gambar',
  !sectionStyleSchema.safeParse({ bgImage: 'javascript:alert(1)' }).success,
);
check(
  'http (bukan https) ditolak sebagai gambar',
  !sectionStyleSchema.safeParse({ bgImage: 'http://x.test/a.png' }).success,
);
check('path relatif diterima', sectionStyleSchema.safeParse({ bgImage: '/foto.jpg' }).success);
check('https diterima', sectionStyleSchema.safeParse({ bgImage: 'https://x.test/a.png' }).success);
check(
  'tanda kutip dalam url ditolak',
  !sectionStyleSchema.safeParse({ bgImage: '/a.png") ; x:url("b' }).success,
);
check('skala di luar batas ditolak', !sectionStyleSchema.safeParse({ titleScale: 9 }).success);

console.log(failed === 0 ? '\nSemua lolos.\n' : `\n${failed} gagal.\n`);
process.exit(failed === 0 ? 0 : 1);
