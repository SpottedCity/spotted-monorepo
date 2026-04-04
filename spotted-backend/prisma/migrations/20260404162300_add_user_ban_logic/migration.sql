-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedById" TEXT,
ADD COLUMN     "bannedReason" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
