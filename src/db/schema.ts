import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "succeeded",
  "failed",
]);

export const messagesTable = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom(),
  content: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const tasksTable = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  status: taskStatusEnum().notNull().default("pending"),
  result: text(),
});
