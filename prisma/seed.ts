import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Verificar se já existem roles
  const existingRoles = await prisma.$queryRaw`
    SELECT typname FROM pg_type WHERE typname = 'user_role'
  `;

  if (!existingRoles || (existingRoles as any[]).length === 0) {
    // Criar enum UserRole se não existir
    await prisma.$executeRaw`
      CREATE TYPE user_role AS ENUM ('ADMIN', 'USER')
    `;
    console.log('✅ Enum UserRole criado');
  }

  console.log('✅ Seed concluído');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 