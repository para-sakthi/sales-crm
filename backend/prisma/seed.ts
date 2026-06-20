import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

// ── Production guard ────────────────────────────────────────────────
// Replace <PROD_HOST_SUBSTRING> with your actual Neon production branch
// hostname fragment (e.g. "ep-abc123" without "-pooler").
const PROD_HOST = process.env['NEON_PROD_HOST'] ?? '<PROD_HOST_SUBSTRING>';
if (process.env['DATABASE_URL']?.includes(PROD_HOST)) {
  throw new Error(
    `Refusing to seed against production! DATABASE_URL contains "${PROD_HOST}".`,
  );
}

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL']!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── 1. Seed admin user ──────────────────────────────────────────
  const adminEmail = process.env['ADMIN_DEFAULT_USERNAME'];
  const adminPass = process.env['ADMIN_DEFAULT_PASS'];

  if (!adminEmail || !adminPass) {
    throw new Error(
      'ADMIN_DEFAULT_USERNAME and ADMIN_DEFAULT_PASS must be set in .env',
    );
  }

  const adminHash = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded admin: ${adminEmail}`);

  // ── 2. Seed synthetic users (dev only) ──────────────────────────
  const syntheticUsers = Array.from({ length: 10 }, () => ({
    email: faker.internet.email().toLowerCase(),
    passwordHash: bcrypt.hashSync('password123', 10),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: Role.USER,
  }));

  for (const user of syntheticUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log(`Seeded ${syntheticUsers.length} synthetic users`);

  // ── 3. Seed example records ─────────────────────────────────────
  const examples = Array.from({ length: 5 }, () => ({
    name: faker.commerce.productName(),
  }));

  for (const example of examples) {
    await prisma.example.create({ data: example });
  }

  console.log(`Seeded ${examples.length} example records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
