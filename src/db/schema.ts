import { boolean, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        avatar: text("avatar").notNull(),
        role: varchar("role", { length: 40 }).$type<"USER" | "ADMIN">().default("USER").notNull(),
        githubId: text("github_id").unique(),
        deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    }
);

export const projects = pgTable("projects",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        fullName: text("full_name").notNull(),
        isPrivate: boolean("is_private").default(false).notNull(),
        provider: varchar("provider", { length: 255 }).$type<"github" | "gitlab">().default("github").notNull(),
        plan: varchar("plan", { length: 40 }).$type<"FREE" | "PRO" | "ENTERPRISE">().default("FREE").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
        deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
    }
);


export const deployments = pgTable("deployments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        projectId: uuid("project_id").references(() => projects.id).notNull(),
        commitSha: text("commit_sha").notNull(),
        status: text("status").$type<"queued" | "building" | "deploying" |  "ready" | "failed">().default("queued").notNull(),
        branch: text("branch").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    }
)
