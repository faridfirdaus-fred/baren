-- Migration: Rename waitlist table to wishlist
-- Date: 2026-10-17
-- Reason: Rebrand "waiting list" to "wishlist" (user-facing term change)
-- Safe: Preserves all data, rollback via reverse ALTER TABLE

ALTER TABLE "waitlist" RENAME TO "wishlist";
