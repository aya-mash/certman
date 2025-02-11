/*
  Warnings:

  - You are about to drop the column `ca` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `Certificate` table. All the data in the column will be lost.
  - Added the required column `content` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "ca",
DROP COLUMN "mode",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
