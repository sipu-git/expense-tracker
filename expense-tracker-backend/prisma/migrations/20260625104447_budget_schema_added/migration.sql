-- CreateEnum
CREATE TYPE "BudgetPeriod" AS ENUM ('MONTHLY', 'WEEKLY');

-- CreateTable
CREATE TABLE "Budgets" (
    "id" TEXT NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "limitAmount" DECIMAL(65,30) NOT NULL,
    "period" "BudgetPeriod" NOT NULL DEFAULT 'MONTHLY',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Budgets_created_by_idx" ON "Budgets"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "Budgets_created_by_type_key" ON "Budgets"("created_by", "type");

-- AddForeignKey
ALTER TABLE "Budgets" ADD CONSTRAINT "Budgets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
