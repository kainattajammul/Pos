-- Repair categories for POS workflow (per shop)

CREATE TABLE "repair_categories" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon_key" TEXT NOT NULL DEFAULT 'wrench',
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "repair_categories_shop_id_slug_key" ON "repair_categories"("shop_id", "slug");
CREATE UNIQUE INDEX "repair_categories_shop_id_name_key" ON "repair_categories"("shop_id", "name");
CREATE INDEX "repair_categories_shop_id_idx" ON "repair_categories"("shop_id");

ALTER TABLE "repair_categories" ADD CONSTRAINT "repair_categories_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
