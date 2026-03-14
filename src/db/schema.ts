import { boolean, text, timestamp, uuid, varchar, integer } from "drizzle-orm/pg-core";
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

export const usersToken = pgTable("users_token",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        refreshToken: varchar("refresh_token", { length: 255 }).notNull(),
        userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
        revoked: boolean("revoked").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        userAgent: varchar("user_agent", { length: 255 }),
        ipAddress: varchar("ip_address", { length: 45 })
    }
)

export const installations = pgTable("installations",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        installationId: integer("installation_id"),
        githubAccount: text("github_account").unique(),
        accountType: varchar("account_type", { length: 255 }).$type<"user" | "organization">(),
        createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    }
)

export const projects = pgTable("projects",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        fullName: text("full_name").notNull(),
        isPrivate: boolean("is_private").default(false).notNull(),
        plan: varchar("plan", { length: 40 }).$type<"FREE" | "PRO" | "ENTERPRISE">().default("FREE").notNull(),
        provider: varchar("provider", { length: 255 }).$type<"github" | "gitlab">().default("github").notNull(),
        repoUrl: text("repo_url").notNull(),
        commitSha: text("commit_sha").notNull(),
        language: varchar("language", { length: 100 }).$type<"JS" | "Go" | "Rust">().default("JS"),
        defaultBranch: text("default_branch").default("main"),
        createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
        deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
    }
);


export const deployments = pgTable("deployments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        projectId: uuid("project_id").references(() => projects.id).notNull(),
        status: text("status").$type<"queued" | "building" | "deploying" | "ready" | "failed">().default("queued").notNull(),
        branch: text("branch").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    }
)
