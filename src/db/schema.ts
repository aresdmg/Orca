import { text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        password: text("password"),
        avatar: text("avatar").notNull(),
        role: varchar("role", { length: 40 }).$type<"USER" | "ADMIN">().default("USER").notNull(),
        deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    }
);
