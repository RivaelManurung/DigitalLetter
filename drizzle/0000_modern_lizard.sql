CREATE TABLE "admin_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "letter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text DEFAULT 'Untitled' NOT NULL,
	"recipient_name" text DEFAULT '' NOT NULL,
	"design" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"password_hash" text,
	"opens_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letter_view" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"letter_id" uuid NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"referrer" text,
	"country" text,
	"device" text
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"letter_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"storage_path" text NOT NULL,
	"caption" text,
	"order" integer DEFAULT 0 NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"letter_id" uuid NOT NULL,
	"type" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "letter_view" ADD CONSTRAINT "letter_view_letter_id_letter_id_fk" FOREIGN KEY ("letter_id") REFERENCES "public"."letter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_letter_id_letter_id_fk" FOREIGN KEY ("letter_id") REFERENCES "public"."letter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_letter_id_letter_id_fk" FOREIGN KEY ("letter_id") REFERENCES "public"."letter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "letter_slug_idx" ON "letter" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "letter_view_letter_idx" ON "letter_view" USING btree ("letter_id","viewed_at");--> statement-breakpoint
CREATE INDEX "media_letter_kind_idx" ON "media" USING btree ("letter_id","kind","order");--> statement-breakpoint
CREATE INDEX "section_letter_order_idx" ON "section" USING btree ("letter_id","order");