-- CreateTable
CREATE TABLE IF NOT EXISTS "sales_commission_agents" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "contact_number" TEXT,
    "address" TEXT,
    "sales_commission_percent" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_commission_agents_pkey" PRIMARY KEY ("id")
);
