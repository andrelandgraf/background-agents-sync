ALTER TABLE "tasks" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;