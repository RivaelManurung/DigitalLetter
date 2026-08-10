import type { DesignSpec } from '@/design/types';

/**
 * Bentuk data template. Sengaja terpisah dari berkas Server Action:
 * di sana setiap ekspor harus async, jadi tipe & konstanta tinggal di sini
 * dan bisa diimpor dari klien maupun server.
 */

export type TemplateSection = {
  type: string;
  variant: string;
  enabled: boolean;
  /** kosong = pakai naskah awal block-nya */
  content?: Record<string, unknown>;
};

export type TemplateRow = {
  id: string;
  slug: string;
  label: string;
  note: string;
  preset: string;
  sections: TemplateSection[];
  design: DesignSpec | null;
  builtin: false;
};
