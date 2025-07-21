import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "succeeded",
  "failed",
]);

export const messagesTable = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom(),
  content: text().notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tasksTable = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  status: taskStatusEnum().notNull().default("pending"),
  result: text(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messageTasksTable = pgTable("message_tasks", {
  id: uuid().primaryKey().defaultRandom(),
  message_id: uuid()
    .notNull()
    .references(() => messagesTable.id, { onDelete: "cascade" }),
  task_id: uuid()
    .notNull()
    .references(() => tasksTable.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Drizzle-Zod schemas
export const selectMessageSchema = createSelectSchema(messagesTable);
export const createMessageSchema = createInsertSchema(messagesTable).omit({
  created_at: true,
  updated_at: true,
});
export const updateMessageSchema = createUpdateSchema(messagesTable);

export const selectTaskSchema = createSelectSchema(tasksTable);
export const createTaskSchema = createInsertSchema(tasksTable).omit({
  created_at: true,
  updated_at: true,
});
export const updateTaskSchema = createUpdateSchema(tasksTable);

export const selectMessageTaskSchema = createSelectSchema(messageTasksTable);
export const createMessageTaskSchema = createInsertSchema(
  messageTasksTable,
).omit({
  created_at: true,
});
export const updateMessageTaskSchema = createUpdateSchema(messageTasksTable);

// Types
export type Message = z.infer<typeof selectMessageSchema>;
export type CreateMessage = z.infer<typeof createMessageSchema>;
export type UpdateMessage = z.infer<typeof updateMessageSchema>;

export type Task = z.infer<typeof selectTaskSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type TaskStatus = Task["status"];

export type MessageTask = z.infer<typeof selectMessageTaskSchema>;
export type CreateMessageTask = z.infer<typeof createMessageTaskSchema>;
export type UpdateMessageTask = z.infer<typeof updateMessageTaskSchema>;
