const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function check() {
  const eventConfig = await prisma.eventConfig.findFirst({
    orderBy: { updatedAt: 'desc' }
  });
  
  console.log('Current Event Config:', JSON.stringify(eventConfig, null, 2));
  await prisma.$disconnect();
}

check();
