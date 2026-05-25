-- Add image_url column if repair_categories was created without it
ALTER TABLE "repair_categories" ADD COLUMN IF NOT EXISTS "image_url" TEXT;
