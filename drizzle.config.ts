import { defineConfig } from 'drizzle-kit'
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.CONNECTION_STRING || "";

export default defineConfig({
	schema: "./db/schema.ts",
	dialect: 'postgresql',
	migrations: {
		prefix: 'supabase'
	},
	dbCredentials: {
		url: url,
	},
})
