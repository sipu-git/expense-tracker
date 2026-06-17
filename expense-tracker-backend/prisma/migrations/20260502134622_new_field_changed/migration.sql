/*
  Warnings:

  - Added the required column `userId` to the `GroupInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GroupInvite" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "GroupInvite" ADD CONSTRAINT "GroupInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
