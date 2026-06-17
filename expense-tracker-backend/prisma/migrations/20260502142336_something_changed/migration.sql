-- DropForeignKey
ALTER TABLE "GroupInvite" DROP CONSTRAINT "GroupInvite_userId_fkey";

-- AlterTable
ALTER TABLE "GroupInvite" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GroupInvite" ADD CONSTRAINT "GroupInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
