-- CreateTable
CREATE TABLE "PushNotification" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushNotification_endpoint_key" ON "PushNotification"("endpoint");

-- CreateIndex
CREATE INDEX "PushNotification_user_id_idx" ON "PushNotification"("user_id");

-- AddForeignKey
ALTER TABLE "PushNotification" ADD CONSTRAINT "PushNotification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
