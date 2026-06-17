/*
  Warnings:

  - You are about to drop the column `price` on the `Expenses` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expenses" DROP COLUMN "price",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE TEXT;
