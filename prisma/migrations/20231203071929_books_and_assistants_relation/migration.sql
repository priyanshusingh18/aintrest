/*
  Warnings:

  - You are about to drop the column `bookFileId` on the `Books` table. All the data in the column will be lost.
  - You are about to drop the `BookFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AssistantToBookFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Books_bookFileId_idx";

-- AlterTable
ALTER TABLE "Books" DROP COLUMN "bookFileId",
ADD COLUMN     "assistantsCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "BookFile";

-- DropTable
DROP TABLE "_AssistantToBookFile";

-- CreateTable
CREATE TABLE "AssistantBooks" (
    "assistantId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantBooks_pkey" PRIMARY KEY ("assistantId","bookId")
);

-- CreateTable
CREATE TABLE "_BooksToAssistant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AssistantBooks_assistantId_key" ON "AssistantBooks"("assistantId");

-- CreateIndex
CREATE UNIQUE INDEX "AssistantBooks_bookId_key" ON "AssistantBooks"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "_BooksToAssistant_AB_unique" ON "_BooksToAssistant"("A", "B");

-- CreateIndex
CREATE INDEX "_BooksToAssistant_B_index" ON "_BooksToAssistant"("B");
