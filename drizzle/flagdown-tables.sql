-- FlagDown tables only (safe to re-run). Use when db:push fails on Supabase introspection.
CREATE TABLE IF NOT EXISTS "witstartuppitch_beach" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"patrolType" varchar(32) NOT NULL,
	"councilLga" varchar(128) NOT NULL,
	"slsClub" varchar(128),
	"flagStatus" varchar(32) DEFAULT 'green' NOT NULL,
	"threatLevel" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "witstartuppitch_threat_event" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"beachId" varchar(64) NOT NULL,
	"type" varchar(32) NOT NULL,
	"source" varchar(128) NOT NULL,
	"confidence" double precision,
	"level" integer NOT NULL,
	"reasoning" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "witstartuppitch_coordination_action" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"threatEventId" varchar(255) NOT NULL,
	"channel" varchar(64) NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"priority" integer NOT NULL,
	"message" text NOT NULL,
	"newFlagStatus" varchar(32),
	"completedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "witstartuppitch_ack" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"threatEventId" varchar(255) NOT NULL,
	"actorType" varchar(64) NOT NULL,
	"actorId" varchar(128),
	"response" varchar(64) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "beach_lga_idx" ON "witstartuppitch_beach" USING btree ("councilLga");
CREATE INDEX IF NOT EXISTS "threat_beach_idx" ON "witstartuppitch_threat_event" USING btree ("beachId");
CREATE INDEX IF NOT EXISTS "action_threat_idx" ON "witstartuppitch_coordination_action" USING btree ("threatEventId");

DO $$ BEGIN
  ALTER TABLE "witstartuppitch_threat_event"
    ADD CONSTRAINT "witstartuppitch_threat_event_beachId_witstartuppitch_beach_id_fk"
    FOREIGN KEY ("beachId") REFERENCES "public"."witstartuppitch_beach"("id")
    ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "witstartuppitch_coordination_action"
    ADD CONSTRAINT "witstartuppitch_coordination_action_threatEventId_witstartuppitch_threat_event_id_fk"
    FOREIGN KEY ("threatEventId") REFERENCES "public"."witstartuppitch_threat_event"("id")
    ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "witstartuppitch_ack"
    ADD CONSTRAINT "witstartuppitch_ack_threatEventId_witstartuppitch_threat_event_id_fk"
    FOREIGN KEY ("threatEventId") REFERENCES "public"."witstartuppitch_threat_event"("id")
    ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
