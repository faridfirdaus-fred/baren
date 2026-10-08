import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const branding = pgTable("branding", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  siteName: text("site_name").notNull().default("Baren"),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
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

export const howToPlay = pgTable("how_to_play", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  step: integer("step").notNull().default(1),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  ...timestamps,
});

export const gallery = pgTable("gallery", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title"),
  kind: text("kind").notNull().default("image"),
  assetUrl: text("asset_url").notNull(),
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
  isPublished: integer("is_published").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const faqs = pgTable("faqs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const socialLinks = pgTable("social_links", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").notNull().unique(),
  value: text("value"),
  ...timestamps,
});

export const admins = pgTable("admins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  ...timestamps,
});
