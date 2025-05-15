import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma Client connection...');
  
  const userCount = await prisma.user.count();
  console.log(`Database has ${userCount} users`);
  
  const users = await prisma.user.findMany({ take: 2 });
  console.log('Sample Users:', users);
  
  const teams = await prisma.team.findMany({ take: 2 });
  console.log('Sample Teams:', teams);
  
  const memberships = await prisma.membership.findMany({ take: 2 });
  console.log('Sample Memberships:', memberships);
  
  const teamUsers = await prisma.teamUser.findMany({ take: 2 });
  console.log('Sample TeamUsers:', teamUsers);
  
  console.log('Prisma Client is working!');
}

main()
  .catch((e) => {
    console.error('Error testing Prisma Client:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 