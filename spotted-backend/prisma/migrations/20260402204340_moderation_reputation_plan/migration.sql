/*
  Warnings:

  - The `status` column on the `Flag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[postId,reporterId]` on the table `Flag` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `reason` on the `Flag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PostModerationStatus" AS ENUM ('ACTIVE', 'HIDDEN_BY_REPORTS', 'REMOVED_BY_MODERATOR', 'RESTORED');

-- CreateEnum
CREATE TYPE "FlagReason" AS ENUM ('SPAM', 'NUDITY', 'VIOLENCE', 'HATE', 'HARASSMENT', 'FALSE_INFO', 'OTHER');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- AlterTable
ALTER TABLE "Flag" ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "weight" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "reason",
ADD COLUMN     "reason" "FlagReason" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "FlagStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedById" TEXT,
ADD COLUMN     "moderationReason" TEXT,
ADD COLUMN     "moderationStatus" "PostModerationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "reportCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reportScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "moderatorSince" TIMESTAMP(3),
ADD COLUMN     "penaltyPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reputationScore" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Flag_status_idx" ON "Flag"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Flag_postId_reporterId_key" ON "Flag"("postId", "reporterId");
