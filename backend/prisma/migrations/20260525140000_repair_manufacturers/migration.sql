-- Repair manufacturers per shop + category

CREATE TABLE "repair_manufacturers" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "repair_category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon_key" TEXT NOT NULL DEFAULT 'smartphone',
    "image_url" TEXT,
    "logo_slug" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_manufacturers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "repair_manufacturers_shop_id_repair_category_id_slug_key" ON "repair_manufacturers"("shop_id", "repair_category_id", "slug");
CREATE UNIQUE INDEX "repair_manufacturers_shop_id_repair_category_id_name_key" ON "repair_manufacturers"("shop_id", "repair_category_id", "name");
CREATE INDEX "repair_manufacturers_shop_id_idx" ON "repair_manufacturers"("shop_id");
CREATE INDEX "repair_manufacturers_repair_category_id_idx" ON "repair_manufacturers"("repair_category_id");

ALTER TABLE "repair_manufacturers" ADD CONSTRAINT "repair_manufacturers_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "repair_manufacturers" ADD CONSTRAINT "repair_manufacturers_repair_category_id_fkey" FOREIGN KEY ("repair_category_id") REFERENCES "repair_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
