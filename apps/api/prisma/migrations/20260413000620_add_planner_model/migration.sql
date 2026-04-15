-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fechaExamen" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "tareas_plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tareas_plan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tareas_plan" ADD CONSTRAINT "tareas_plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_plan" ADD CONSTRAINT "tareas_plan_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
