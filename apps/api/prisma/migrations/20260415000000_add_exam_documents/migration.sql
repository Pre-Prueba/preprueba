-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('EXAMEN_OFICIAL', 'MODELO', 'CONVOCATORIA_ANTERIOR', 'ORIENTACIONES', 'CRITERIOS_CORRECCION', 'SOLUCIONARIO');

-- CreateEnum
CREATE TYPE "DocumentoStatus" AS ENUM ('FOUND', 'DOWNLOADED', 'CATALOGUED', 'REVIEWED', 'PUBLISHED', 'INTERACTIVE_READY');

-- CreateTable
CREATE TABLE "exam_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "call" TEXT,
    "documentType" "TipoDocumento" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT true,
    "isInteractive" BOOLEAN NOT NULL DEFAULT false,
    "status" "DocumentoStatus" NOT NULL DEFAULT 'FOUND',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_documents_community_idx" ON "exam_documents"("community");

-- CreateIndex
CREATE INDEX "exam_documents_university_idx" ON "exam_documents"("university");

-- CreateIndex
CREATE INDEX "exam_documents_subject_idx" ON "exam_documents"("subject");

-- CreateIndex
CREATE INDEX "exam_documents_year_idx" ON "exam_documents"("year");

-- CreateIndex
CREATE INDEX "exam_documents_documentType_idx" ON "exam_documents"("documentType");

-- CreateIndex
CREATE INDEX "exam_documents_status_idx" ON "exam_documents"("status");
