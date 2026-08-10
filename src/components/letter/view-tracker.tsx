'use client';

import { useEffect } from 'react';

/**
 * Catat kunjungan sekali per sesi tab. Sengaja `keepalive` dan tanpa await —
 * statistik tidak boleh memperlambat surat terbuka.
 */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `dl_viewed_${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    void fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, referrer: document.referrer || null }),
      keepalive: true,
    }).catch(() => {
      // Statistik gagal bukan alasan mengganggu penerima.
    });
  }, [slug]);

  return null;
}
