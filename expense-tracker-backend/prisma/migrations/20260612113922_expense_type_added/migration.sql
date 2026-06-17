/*
  Warnings:

  - Added the required column `type` to the `Expenses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('FOOD', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT', 'HEALTHCARE', 'UTILITIES', 'HOUSING', 'TRAVEL', 'EDUCATION', 'OTHER');

-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "type" "ExpenseType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP NOT NULL;
