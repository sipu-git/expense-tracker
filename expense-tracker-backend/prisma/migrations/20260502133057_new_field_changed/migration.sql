/*
  Warnings:

  - You are about to drop the column `userId` on the `GroupInvite` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `GroupInvite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroupInvite" DROP CONSTRAINT "GroupInvite_userId_fkey";

-- AlterTable
ALTER TABLE "GroupInvite" DROP COLUMN "userId",
ADD COLUMN     "senderId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "GroupInvite" ADD CONSTRAINT "GroupInvite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
