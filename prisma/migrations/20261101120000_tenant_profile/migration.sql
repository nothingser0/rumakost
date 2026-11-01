-- CreateTable
CREATE TABLE "tenant_profiles" (
    "user_id" UUID NOT NULL,
    "emergency_contact" TEXT,

    CONSTRAINT "tenant_profiles_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "tenant_profiles" ADD CONSTRAINT "tenant_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
