CREATE TABLE "custom_block" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"layout" text DEFAULT 'cards' NOT NULL,
	"spec" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"starter" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letter_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"preset" text DEFAULT 'dark-romantic' NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"design" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "custom_block_slug_idx" ON "custom_block" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "letter_template_slug_idx" ON "letter_template" USING btree ("slug");