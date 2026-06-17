/*
  Warnings:

  - You are about to drop the column `bought_by` on the `Expenses` table. All the data in the column will be lost.
  - Added the required column `created_by` to the `Expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Expenses" DROP CONSTRAINT "Expenses_bought_by_fkey";

-- DropIndex
DROP INDEX "Expenses_bought_by_bought_at_idx";

-- AlterTable
ALTER TABLE "Expenses" DROP COLUMN "bought_by",
ADD COLUMN     "created_by" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Expenses_created_by_bought_at_idx" ON "Expenses"("created_by", "bought_at");

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
