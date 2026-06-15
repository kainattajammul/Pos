-- Simplify sales commission agents to a single name column (idempotent)
ALTER TABLE "sales_commission_agents" ADD COLUMN IF NOT EXISTS "name" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sales_commission_agents'
      AND column_name = 'prefix'
  ) THEN
    UPDATE "sales_commission_agents"
    SET "name" = TRIM(
      CONCAT_WS(
        ' ',
        NULLIF(TRIM(COALESCE("prefix", '')), ''),
        NULLIF(TRIM(COALESCE("first_name", '')), ''),
        NULLIF(TRIM(COALESCE("last_name", '')), '')
      )
    )
    WHERE "name" IS NULL OR TRIM("name") = '';

    ALTER TABLE "sales_commission_agents" DROP COLUMN IF EXISTS "prefix";
    ALTER TABLE "sales_commission_agents" DROP COLUMN IF EXISTS "first_name";
    ALTER TABLE "sales_commission_agents" DROP COLUMN IF EXISTS "last_name";
  END IF;
END $$;

UPDATE "sales_commission_agents"
SET "name" = 'Unnamed Agent'
WHERE "name" IS NULL OR TRIM("name") = '';

ALTER TABLE "sales_commission_agents" ALTER COLUMN "name" SET NOT NULL;
