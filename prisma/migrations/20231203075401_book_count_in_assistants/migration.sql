/*
  Warnings:

  - You are about to drop the column `booksFileId` on the `Assistant` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "subject" ADD VALUE 'History';

-- AlterTable
ALTER TABLE "Assistant" DROP COLUMN "booksFileId",
ADD COLUMN     "bookCount" INTEGER NOT NULL DEFAULT 0;
