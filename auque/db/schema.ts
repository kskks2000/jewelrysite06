import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull(),
  type: text('type').notNull(), interest: text('interest').notNull(), preferredDate: text('preferred_date'),
  message: text('message').notNull(), consent: integer('consent').notNull(), createdAt: text('created_at').notNull(),
});
