import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type { DesignSpec, SectionType } from '@/design/types';

/**
 * Kunci arsitektur: `design` dan `section.content` bertipe JSONB.
 * Menambah tipe section atau token desain baru tidak butuh migration —
 * cukup daftarkan schema Zod dan komponen renderer-nya.
 */

export const adminUser = pgTable('admin_user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const letter = pgTable(
  'letter',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull().default('Untitled'),
    recipientName: text('recipient_name').notNull().default(''),
    design: jsonb('design').$type<DesignSpec>().notNull(),
    status: text('status', { enum: ['draft', 'published'] })
      .notNull()
      .default('draft'),
    /** proteksi opsional untuk penerima */
    passwordHash: text('password_hash'),
    /** surat baru bisa dibuka setelah tanggal ini */
    opensAt: timestamp('opens_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    viewCount: integer('view_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('letter_slug_idx').on(t.slug)],
);

export const section = pgTable(
  'section',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    letterId: uuid('letter_id')
      .notNull()
      .references(() => letter.id, { onDelete: 'cascade' }),
    type: text('type').$type<SectionType>().notNull(),
    order: integer('order').notNull().default(0),
    enabled: boolean('enabled').notNull().default(true),
    content: jsonb('content').$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [index('section_letter_order_idx').on(t.letterId, t.order)],
);

export const media = pgTable(
  'media',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    letterId: uuid('letter_id')
      .notNull()
      .references(() => letter.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['photo', 'audio'] }).notNull(),
    /** path di Supabase Storage, bukan URL penuh */
    storagePath: text('storage_path').notNull(),
    caption: text('caption'),
    order: integer('order').notNull().default(0),
    /** audio: { title, artist, startTime, endTime, loop } · photo: { width, height } */
    meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('media_letter_kind_idx').on(t.letterId, t.kind, t.order)],
);

export const letterView = pgTable(
  'letter_view',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    letterId: uuid('letter_id')
      .notNull()
      .references(() => letter.id, { onDelete: 'cascade' }),
    viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
    referrer: text('referrer'),
    country: text('country'),
    device: text('device'),
  },
  (t) => [index('letter_view_letter_idx').on(t.letterId, t.viewedAt)],
);

export type Letter = typeof letter.$inferSelect;
export type Section = typeof section.$inferSelect;
export type Media = typeof media.$inferSelect;
