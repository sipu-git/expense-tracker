/*
  Warnings:

  - You are about to drop the `Grocery` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Grocery" DROP CONSTRAINT "Grocery_bought_by_fkey";

-- DropTable
DROP TABLE "Grocery";

-- CreateTable
CREATE TABLE "Expenses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "bought_at" TIMESTAMP(3) NOT NULL,
    "bought_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expenses_bought_by_bought_at_idx" ON "Expenses"("bought_by", "bought_at");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_bought_by_fkey" FOREIGN KEY ("bought_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
