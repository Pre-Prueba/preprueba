import { PrismaClient, PruebaType } from '@prisma/client';

const prisma = new PrismaClient();

const materias = [
  { nombre: 'Lengua Castellana y Literatura', fase: 'GENERAL', orden: 1, pruebaType: ['MAYORES_25', 'MAYORES_40', 'MAYORES_45'] as PruebaType[] },
  { nombre: 'Historia de España', fase: 'GENERAL', orden: 2, pruebaType: ['MAYORES_25', 'MAYORES_40', 'MAYORES_45'] as PruebaType[] },
  { nombre: 'Inglés', fase: 'GENERAL', orden: 3, pruebaType: ['MAYORES_25', 'MAYORES_40', 'MAYORES_45'] as PruebaType[] },
  { nombre: 'Biología', fase: 'ESPECIFICA', orden: 4, pruebaType: ['MAYORES_25'] as PruebaType[] },
  { nombre: 'Química', fase: 'ESPECIFICA', orden: 5, pruebaType: ['MAYORES_25'] as PruebaType[] },
  { nombre: 'Matemáticas Aplicadas a las CCSS', fase: 'ESPECIFICA', orden: 6, pruebaType: ['MAYORES_25'] as PruebaType[] },
  { nombre: 'Geografía', fase: 'ESPECIFICA', orden: 7, pruebaType: ['MAYORES_25'] as PruebaType[] },
  { nombre: 'Historia de la Filosofía', fase: 'ESPECIFICA', orden: 8, pruebaType: ['MAYORES_25'] as PruebaType[] },
  { nombre: 'Historia del Arte', fase: 'ESPECIFICA', orden: 9, pruebaType: ['MAYORES_25'] as PruebaType[] },
  { nombre: 'Matemáticas', fase: 'ESPECIFICA', orden: 10, pruebaType: ['MAYORES_25'] as PruebaType[] },
  { nombre: 'Física', fase: 'ESPECIFICA', orden: 11, pruebaType: ['MAYORES_25'] as PruebaType[] },
];

async function main() {
  console.log('Seeding materias...');
  for (const materia of materias) {
    await prisma.materia.upsert({
      where: { id: materia.nombre }, // fallback: won't match, will create
      update: {},
      create: materia,
    }).catch(async () => {
      // upsert by nombre doesn't work by id — just create if not exists
      const exists = await prisma.materia.findFirst({ where: { nombre: materia.nombre } });
      if (!exists) {
        await prisma.materia.create({ data: materia });
        console.log(`  ✓ ${materia.nombre}`);
      } else {
        console.log(`  - ${materia.nombre} (já existe)`);
      }
    });
  }
  console.log('Seed completo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
