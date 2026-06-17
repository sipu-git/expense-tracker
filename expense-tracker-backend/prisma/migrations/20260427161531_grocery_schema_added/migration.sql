-- CreateTable
CREATE TABLE "Grocery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "bought_at" TIMESTAMP(3) NOT NULL,
    "bought_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grocery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Grocery" ADD CONSTRAINT "Grocery_bought_by_fkey" FOREIGN KEY ("bought_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
