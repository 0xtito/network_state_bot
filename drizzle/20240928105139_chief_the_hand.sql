CREATE TABLE IF NOT EXISTS "ns_bot_{name}" (
	"id" varchar PRIMARY KEY NOT NULL,
	"channel_id" varchar NOT NULL,
	"author" json NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"edited_timestamp" timestamp,
	"mentions" json,
	"attachments" json,
	"embeds" json,
	"reactions" json,
	"pinned" boolean NOT NULL,
	"type" integer NOT NULL,
	"flags" integer,
	"message_reference" json,
	"referenced_message" json,
	"thread" json,
	"poll" json
);
