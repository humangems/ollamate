import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamps = {
  created_at: integer()
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updated_at: integer()
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

export const chats = sqliteTable('chats', {
  id: text().primaryKey(),
  model: text().notNull().default(''),
  title: text(),
  ...timestamps,
});

export const messages = sqliteTable('messages', {
  id: text().primaryKey(),
  chat_id: text()
    .notNull()
    .references(() => chats.id),
  role: text().notNull(),
  content: text().notNull().default(''),
  model: text(),
  images: text({ mode: 'json' }).$type<string[]>(),
  eval_count: integer(),
  ...timestamps,
});

export type DbChat = typeof chats.$inferSelect;
export type NewDbChat = typeof chats.$inferInsert;

export type DbMessage = typeof messages.$inferSelect;
export type NewDbMessage = typeof messages.$inferInsert;
