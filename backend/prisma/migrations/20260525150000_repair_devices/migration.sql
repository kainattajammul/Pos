-- CreateTable
CREATE TABLE "repair_devices" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "repair_category_id" INTEGER NOT NULL,
    "repair_manufacturer_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image_url" TEXT,
    "icon_variant" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repair_devices_shop_id_idx" ON "repair_devices"("shop_id");

-- CreateIndex
CREATE INDEX "repair_devices_repair_category_id_idx" ON "repair_devices"("repair_category_id");

-- CreateIndex
CREATE INDEX "repair_devices_repair_manufacturer_id_idx" ON "repair_devices"("repair_manufacturer_id");

-- CreateIndex
CREATE UNIQUE INDEX "repair_devices_shop_id_repair_manufacturer_id_slug_key" ON "repair_devices"("shop_id", "repair_manufacturer_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "repair_devices_shop_id_repair_manufacturer_id_name_key" ON "repair_devices"("shop_id", "repair_manufacturer_id", "name");

-- AddForeignKey
ALTER TABLE "repair_devices" ADD CONSTRAINT "repair_devices_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_devices" ADD CONSTRAINT "repair_devices_repair_category_id_fkey" FOREIGN KEY ("repair_category_id") REFERENCES "repair_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_devices" ADD CONSTRAINT "repair_devices_repair_manufacturer_id_fkey" FOREIGN KEY ("repair_manufacturer_id") REFERENCES "repair_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
