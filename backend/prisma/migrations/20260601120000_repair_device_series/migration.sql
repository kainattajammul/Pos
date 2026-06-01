-- CreateTable
CREATE TABLE "repair_device_series" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "repair_category_id" INTEGER NOT NULL,
    "repair_manufacturer_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_device_series_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "repair_devices" ADD COLUMN "repair_device_series_id" INTEGER;

-- CreateIndex
CREATE INDEX "repair_device_series_shop_id_idx" ON "repair_device_series"("shop_id");

-- CreateIndex
CREATE INDEX "repair_device_series_repair_category_id_idx" ON "repair_device_series"("repair_category_id");

-- CreateIndex
CREATE INDEX "repair_device_series_repair_manufacturer_id_idx" ON "repair_device_series"("repair_manufacturer_id");

-- CreateIndex
CREATE UNIQUE INDEX "repair_device_series_shop_id_repair_manufacturer_id_slug_key" ON "repair_device_series"("shop_id", "repair_manufacturer_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "repair_device_series_shop_id_repair_manufacturer_id_name_key" ON "repair_device_series"("shop_id", "repair_manufacturer_id", "name");

-- CreateIndex
CREATE INDEX "repair_devices_repair_device_series_id_idx" ON "repair_devices"("repair_device_series_id");

-- AddForeignKey
ALTER TABLE "repair_device_series" ADD CONSTRAINT "repair_device_series_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_device_series" ADD CONSTRAINT "repair_device_series_repair_category_id_fkey" FOREIGN KEY ("repair_category_id") REFERENCES "repair_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_device_series" ADD CONSTRAINT "repair_device_series_repair_manufacturer_id_fkey" FOREIGN KEY ("repair_manufacturer_id") REFERENCES "repair_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_devices" ADD CONSTRAINT "repair_devices_repair_device_series_id_fkey" FOREIGN KEY ("repair_device_series_id") REFERENCES "repair_device_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
