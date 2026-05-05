CREATE TYPE "public"."consent_type" AS ENUM('ccpa_optin', 'mhmda_health_data', 'modpa_health_data', 'terms', 'privacy');--> statement-breakpoint
CREATE TYPE "public"."dsar_status" AS ENUM('received', 'in_progress', 'fulfilled', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."dsar_type" AS ENUM('access', 'deletion', 'correction');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('in_progress', 'completed', 'aborted');--> statement-breakpoint
CREATE TYPE "public"."chamber_type" AS ENUM('soft_1_3', 'hard_1_5', 'hard_2_0_plus');--> statement-breakpoint
CREATE TYPE "public"."checkin_type" AS ENUM('pre', 'post');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'monthly', 'yearly', 'lifetime');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_protocol_status" AS ENUM('active', 'paused', 'completed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" varchar(64) NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consent_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "consent_type" NOT NULL,
	"version" varchar(32) NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" varchar(64),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dsar_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "dsar_type" NOT NULL,
	"status" "dsar_status" DEFAULT 'received' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fulfilled_at" timestamp with time zone,
	"fulfillment_notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hbot_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_protocol_id" uuid,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"total_duration_sec" integer DEFAULT 0 NOT NULL,
	"treatment_duration_sec" integer DEFAULT 0 NOT NULL,
	"paused_duration_sec" integer DEFAULT 0 NOT NULL,
	"pressure_ata" numeric(3, 2) NOT NULL,
	"status" "session_status" DEFAULT 'in_progress' NOT NULL,
	"client_state" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"dob" date,
	"goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"chamber_type" "chamber_type" DEFAULT 'soft_1_3' NOT NULL,
	"accepted_disclaimers_at" timestamp with time zone,
	"fire_safety_acknowledged_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"pressure_ata" numeric(3, 2) NOT NULL,
	"treatment_min" integer NOT NULL,
	"total_min" integer NOT NULL,
	"goal_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"target_session_count" integer DEFAULT 40 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"apple_transaction_id" varchar(128),
	"status" "subscription_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "suicidality_screens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phq9_item9_score" integer NOT NULL,
	"follow_up_acknowledged_at" timestamp with time zone,
	"crisis_resources_shown_at" timestamp with time zone,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"protocol_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"target_session_count" integer NOT NULL,
	"status" "user_protocol_status" DEFAULT 'active' NOT NULL,
	"paused_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"apple_sub" varchar(255),
	"locale" varchar(16) DEFAULT 'en-US' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wellness_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"checkin_type" "checkin_type" NOT NULL,
	"promis_global_physical" integer NOT NULL,
	"promis_global_mental" integer NOT NULL,
	"pain_level" integer NOT NULL,
	"energy_level" integer NOT NULL,
	"sleep_quality" integer NOT NULL,
	"focus_level" integer NOT NULL,
	"notes" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dsar_requests" ADD CONSTRAINT "dsar_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hbot_sessions" ADD CONSTRAINT "hbot_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hbot_sessions" ADD CONSTRAINT "hbot_sessions_user_protocol_id_user_protocols_id_fk" FOREIGN KEY ("user_protocol_id") REFERENCES "public"."user_protocols"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "suicidality_screens" ADD CONSTRAINT "suicidality_screens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_protocols" ADD CONSTRAINT "user_protocols_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_protocols" ADD CONSTRAINT "user_protocols_protocol_id_protocols_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocols"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wellness_checkins" ADD CONSTRAINT "wellness_checkins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wellness_checkins" ADD CONSTRAINT "wellness_checkins_session_id_hbot_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."hbot_sessions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "achievements_user_achievement_idx" ON "achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "achievements_user_idx" ON "achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "consent_user_idx" ON "consent_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dsar_user_idx" ON "dsar_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hbot_sessions_user_idx" ON "hbot_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hbot_sessions_started_idx" ON "hbot_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "protocols_slug_idx" ON "protocols" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_user_idx" ON "subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "suicidality_user_idx" ON "suicidality_screens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_protocols_user_idx" ON "user_protocols" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_apple_sub_idx" ON "users" USING btree ("apple_sub");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkins_user_idx" ON "wellness_checkins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkins_session_idx" ON "wellness_checkins" USING btree ("session_id");