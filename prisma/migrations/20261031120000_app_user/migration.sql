-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('OWNER', 'STAFF', 'TENANT');

-- CreateTable
CREATE TABLE "app_users" (
    "id" UUID NOT NULL,
    "auth_subject" TEXT NOT NULL,
    "email_normalized" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" "AppRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_users_auth_subject_key" ON "app_users"("auth_subject");

-- CreateIndex
CREATE UNIQUE INDEX "app_users_email_normalized_key" ON "app_users"("email_normalized");

-- CreateIndex
CREATE INDEX "app_users_created_by_id_idx" ON "app_users"("created_by_id");

-- AddForeignKey
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
