-- CreateTable
CREATE TABLE "repair_device_parts" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "repair_category_id" INTEGER NOT NULL,
    "repair_manufacturer_id" INTEGER NOT NULL,
    "repair_device_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "on_hand" INTEGER NOT NULL DEFAULT 0,
    "image_variant" TEXT NOT NULL DEFAULT 'screen',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_device_parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repair_device_parts_shop_id_idx" ON "repair_device_parts"("shop_id");

-- CreateIndex
CREATE INDEX "repair_device_parts_repair_device_id_idx" ON "repair_device_parts"("repair_device_id");

-- CreateIndex
CREATE UNIQUE INDEX "repair_device_parts_shop_id_repair_device_id_slug_key" ON "repair_device_parts"("shop_id", "repair_device_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "repair_device_parts_shop_id_repair_device_id_name_key" ON "repair_device_parts"("shop_id", "repair_device_id", "name");

-- AddForeignKey
ALTER TABLE "repair_device_parts" ADD CONSTRAINT "repair_device_parts_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_device_parts" ADD CONSTRAINT "repair_device_parts_repair_category_id_fkey" FOREIGN KEY ("repair_category_id") REFERENCES "repair_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_device_parts" ADD CONSTRAINT "repair_device_parts_repair_manufacturer_id_fkey" FOREIGN KEY ("repair_manufacturer_id") REFERENCES "repair_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_device_parts" ADD CONSTRAINT "repair_device_parts_repair_device_id_fkey" FOREIGN KEY ("repair_device_id") REFERENCES "repair_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
