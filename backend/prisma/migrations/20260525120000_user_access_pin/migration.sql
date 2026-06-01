-- Add 4-digit POS access PIN to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "access_pin" VARCHAR(4);
