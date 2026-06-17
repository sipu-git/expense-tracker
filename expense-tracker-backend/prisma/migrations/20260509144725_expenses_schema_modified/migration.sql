-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "groupId" TEXT;

-- CreateIndex
CREATE INDEX "Expenses_groupId_idx" ON "Expenses"("groupId");

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
