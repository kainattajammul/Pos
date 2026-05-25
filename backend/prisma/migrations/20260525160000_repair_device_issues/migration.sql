-- CreateTable
CREATE TABLE "repair_device_issues" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "repair_category_id" INTEGER NOT NULL,
    "repair_manufacturer_id" INTEGER NOT NULL,
    "repair_device_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "icon_key" TEXT NOT NULL DEFAULT 'diagnostic',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_device_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repair_device_issues_shop_id_idx" ON "repair_device_issues"("shop_id");

-- CreateIndex
CREATE INDEX "repair_device_issues_repair_device_id_idx" ON "repair_device_issues"("repair_device_id");

-- CreateIndex
CREATE UNIQUE INDEX "repair_device_issues_shop_id_repair_device_id_slug_key" ON "repair_device_issues"("shop_id", "repair_device_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "repair_device_issues_shop_id_repair_device_id_name_key" ON "repair_device_issues"("shop_id", "repair_device_id", "name");

-- AddForeignKey
ALTER TABLE "repair_device_issues" ADD CONSTRAINT "repair_device_issues_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_device_issues" ADD CONSTRAINT "repair_device_issues_repair_category_id_fkey" FOREIGN KEY ("repair_category_id") REFERENCES "repair_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_device_issues" ADD CONSTRAINT "repair_device_issues_repair_manufacturer_id_fkey" FOREIGN KEY ("repair_manufacturer_id") REFERENCES "repair_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_device_issues" ADD CONSTRAINT "repair_device_issues_repair_device_id_fkey" FOREIGN KEY ("repair_device_id") REFERENCES "repair_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
