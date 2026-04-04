/*
  Warnings:

  - A unique constraint covering the columns `[commentId,reporterId]` on the table `Flag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CommentModerationStatus" AS ENUM ('ACTIVE', 'HIDDEN_BY_REPORTS', 'REMOVED_BY_MODERATOR', 'RESTORED');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedById" TEXT,
ADD COLUMN     "moderationReason" TEXT,
ADD COLUMN     "moderationStatus" "CommentModerationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "reportCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reportScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Flag" ADD COLUMN     "commentId" TEXT,
ALTER COLUMN "postId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Comment_isActive_idx" ON "Comment"("isActive");

-- CreateIndex
CREATE INDEX "Comment_moderationStatus_idx" ON "Comment"("moderationStatus");

-- CreateIndex
CREATE INDEX "Flag_commentId_idx" ON "Flag"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Flag_commentId_reporterId_key" ON "Flag"("commentId", "reporterId");

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
