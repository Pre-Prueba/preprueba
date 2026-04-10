import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, PruebaType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL ?? 'admin@preprueba.es';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'TestPassword123!';
const TEST_USER_NO_SUB_EMAIL = process.env.TEST_USER_NO_SUB_EMAIL ?? 'noplan@test.com';
const TEST_USER_NO_SUB_PASSWORD = process.env.TEST_USER_NO_SUB_PASSWORD ?? 'TestPassword123!';

async function upsertTestUser(input: {
  email: string;
  password: string;
  nombre: string;
  pruebaType: PruebaType;
  comunidad: string;
  role: UserRole;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      passwordHash,
      nombre: input.nombre,
      pruebaType: input.pruebaType,
      comunidad: input.comunidad,
      onboardingDone: true,
      role: input.role,
    },
    create: {
      email: input.email,
      passwordHash,
      nombre: input.nombre,
      pruebaType: input.pruebaType,
      comunidad: input.comunidad,
      onboardingDone: true,
      role: input.role,
    },
  });
}

async function main() {
  const subscribedUser = await upsertTestUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    nombre: 'Usuario de prueba',
    pruebaType: 'MAYORES_25',
    comunidad: 'Madrid',
    role: 'USER',
  });

  const noSubscriptionUser = await upsertTestUser({
    email: TEST_USER_NO_SUB_EMAIL,
    password: TEST_USER_NO_SUB_PASSWORD,
    nombre: 'Usuario sin plan',
    pruebaType: 'MAYORES_25',
    comunidad: 'Madrid',
    role: 'USER',
  });

  await prisma.$transaction([
    prisma.respuestaUsuario.deleteMany({
      where: { userId: { in: [subscribedUser.id, noSubscriptionUser.id] } },
    }),
    prisma.sesion.deleteMany({
      where: { userId: { in: [subscribedUser.id, noSubscriptionUser.id] } },
    }),
  ]);

  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

  await prisma.subscription.upsert({
    where: { userId: subscribedUser.id },
    update: {
      stripeSubscriptionId: `sub_e2e_${subscribedUser.id}`,
      status: 'ACTIVE',
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: subscribedUser.id,
      stripeSubscriptionId: `sub_e2e_${subscribedUser.id}`,
      status: 'ACTIVE',
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  await prisma.subscription.deleteMany({
    where: { userId: noSubscriptionUser.id },
  });

  console.log(`E2E user ready: ${TEST_USER_EMAIL}`);
  console.log(`E2E no-subscription user ready: ${TEST_USER_NO_SUB_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
