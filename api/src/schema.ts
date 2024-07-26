import { relations, sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`)
    .notNull(),
  discordId: text("discord_id").notNull(),
  refreshTokenVersion: integer("refresh_token_version").default(1).notNull(),
});
