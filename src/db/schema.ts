import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

// Auth.js v5 tables (E1-3). Strategi sesi database (E2-1) agar Credentials +
// Google berbagi sesi. Kolom role: admin vs visitor; passwordHash hanya admin.
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: text("role").notNull().default("visitor"),
  passwordHash: text("password_hash"),
  ...timestamps,
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// Konten E1-1 (SRS 3.5): branding->site_settings, how_to_play->steps+video.
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").notNull().unique(),
  value: text("value"),
  ...timestamps,
});

export const hero = pgTable("hero", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  backgroundUrl: text("background_url"),
  videoUrl: text("video_url"),
  primaryCtaLabel: text("primary_cta_label"),
  primaryCtaUrl: text("primary_cta_url"),
  secondaryCtaLabel: text("secondary_cta_label"),
  secondaryCtaUrl: text("secondary_cta_url"),
  isPublished: integer("is_published").notNull().default(1),
  ...timestamps,
});

export const heroBanners = pgTable("hero_banners", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const about = pgTable("about", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  ...timestamps,
});

export const features = pgTable("features", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const howToPlaySteps = pgTable("how_to_play_steps", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  step: integer("step").notNull().default(1),
  title: text("title").notNull(),
  description: text("description"),
  mediaUrl: text("media_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const howToPlayVideo = pgTable("how_to_play_video", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  videoUrl: text("video_url").notNull(),
  ...timestamps,
});

// Konten dinamis E1-2.
export const galleryAssets = pgTable("gallery_assets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  kind: text("kind").notNull().default("image"),
  title: text("title"),
  fileUrl: text("file_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const news = pgTable("news", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  body: text("body").notNull(),
  coverUrl: text("cover_url"),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const faq = pgTable("faq", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// Kartu fleksibel landing E1-6: pengganti seksi statis Event/About/Agents/
// Maps. Admin tambah/kurang/urut; `tone` mengendalikan palet (dark/light/
// ember). CTA label+url wajib berpasangan (ditegakkan di Zod).
export const landingCards = pgTable("landing_cards", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slot: text("slot").notNull().default("general"),
  eyebrow: text("eyebrow"),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  body: text("body"),
  imageUrl: text("image_url"),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  tone: text("tone").notNull().default("dark"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published").notNull().default(1),
  ...timestamps,
});

export const socialLinks = pgTable("social_links", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const downloadLinks = pgTable("download_links", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  platform: text("platform").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// Waiting list E1-4: email unik DB; tanpa token OAuth (NFR-SEC-07).
export const wishlist = pgTable("wishlist", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  name: text("name"),
  photoUrl: text("photo_url"),
  provider: text("provider").notNull().default("google"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Komentar landing E1-7: satu kolom, wajib login Google (user_id pemilik),
// langsung tayang tanpa antre moderasi; penindakan = DELETE admin.
export const comments = pgTable("comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  ...timestamps,
});

export type UserRole = "admin" | "visitor";
