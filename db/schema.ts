import {
	text,
	timestamp,
	pgTableCreator,
	varchar,
	integer,
	json,
	boolean,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const sharedPostgresTable = pgTableCreator(
	(name) => `ns_bot_${name}`,
);

export const discordMessages = sharedPostgresTable("discord_messages", {
	id: varchar("id").primaryKey(),
	channelId: varchar("channel_id").notNull(),
	author: json("author").notNull(),
	content: text("content").notNull(),
	timestamp: timestamp("timestamp").notNull(),
	editedTimestamp: timestamp("edited_timestamp"),
	mentions: json("mentions"),
	attachments: json("attachments"),
	embeds: json("embeds"),
	reactions: json("reactions"),
	pinned: boolean("pinned").notNull(),
	type: integer("type").notNull(),
	flags: integer("flags"),
	messageReference: json("message_reference"),
	referencedMessage: json("referenced_message"),
	thread: json("thread"),
	poll: json("poll"),
});

export const discordMessagesRaw = sharedPostgresTable("discord_messages_raw", {
	blob: json("blob").notNull(),
});

export type DiscordMessage = InferSelectModel<typeof discordMessages>;

export type DiscordMessageRaw = InferSelectModel<typeof discordMessagesRaw>;

