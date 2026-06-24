import { relations } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `witstartuppitch_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const beaches = createTable(
  "beach",
  (d) => ({
    id: d.varchar({ length: 64 }).primaryKey(),
    name: d.varchar({ length: 256 }).notNull(),
    lat: d.doublePrecision().notNull(),
    lng: d.doublePrecision().notNull(),
    patrolType: d.varchar({ length: 32 }).notNull(),
    councilLga: d.varchar({ length: 128 }).notNull(),
    slsClub: d.varchar({ length: 128 }),
    flagStatus: d.varchar({ length: 32 }).notNull().default("green"),
    threatLevel: d.integer().notNull().default(0),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("beach_lga_idx").on(t.councilLga)],
);

export const threatEvents = createTable(
  "threat_event",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    beachId: d
      .varchar({ length: 64 })
      .notNull()
      .references(() => beaches.id),
    type: d.varchar({ length: 32 }).notNull(),
    source: d.varchar({ length: 128 }).notNull(),
    confidence: d.doublePrecision(),
    level: d.integer().notNull(),
    reasoning: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("threat_beach_idx").on(t.beachId)],
);

export const coordinationActions = createTable(
  "coordination_action",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    threatEventId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => threatEvents.id),
    channel: d.varchar({ length: 64 }).notNull(),
    status: d.varchar({ length: 32 }).notNull().default("pending"),
    priority: d.integer().notNull(),
    message: d.text().notNull(),
    newFlagStatus: d.varchar({ length: 32 }),
    completedAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("action_threat_idx").on(t.threatEventId)],
);

export const acks = createTable("ack", (d) => ({
  id: d
    .varchar({ length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  threatEventId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => threatEvents.id),
  actorType: d.varchar({ length: 64 }).notNull(),
  actorId: d.varchar({ length: 128 }),
  response: d.varchar({ length: 64 }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const beachesRelations = relations(beaches, ({ many }) => ({
  threatEvents: many(threatEvents),
}));

export const threatEventsRelations = relations(
  threatEvents,
  ({ one, many }) => ({
    beach: one(beaches, {
      fields: [threatEvents.beachId],
      references: [beaches.id],
    }),
    actions: many(coordinationActions),
  }),
);

export const coordinationActionsRelations = relations(
  coordinationActions,
  ({ one }) => ({
    threatEvent: one(threatEvents, {
      fields: [coordinationActions.threatEventId],
      references: [threatEvents.id],
    }),
  }),
);
