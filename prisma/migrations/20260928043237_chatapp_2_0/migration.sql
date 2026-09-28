/*
  Warnings:

  - You are about to drop the column `isReaded` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isReaded",
ADD COLUMN     "is_readed" BOOLEAN NOT NULL DEFAULT false;
