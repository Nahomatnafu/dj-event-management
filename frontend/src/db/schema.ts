import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  serviceCategory: text('service_category'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
});

export const hourLogs = sqliteTable('hour_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  serviceCategory: text('service_category').notNull(),
  eventType: text('event_type').notNull(),
  clientName: text('client_name').notNull(),
  venue: text('venue').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  totalHours: real('total_hours').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  // DJ-specific fields
  equipmentPickupTime: text('equipment_pickup_time'),
  mileage: real('mileage'),
});

export const usersRelations = relations(users, ({ many }) => ({
  hourLogs: many(hourLogs),
}));

export const hourLogsRelations = relations(hourLogs, ({ one }) => ({
  user: one(users, {
    fields: [hourLogs.userId],
    references: [users.id],
  }),
}));