const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function reset() {
  const eventConfig = await prisma.eventConfig.findFirst({
    orderBy: { updatedAt: 'desc' }
  });
  
  if (eventConfig) {
    const updated = await prisma.eventConfig.update({
      where: { id: eventConfig.id },
      data: { isRegistrationClosed: false }
    });
    console.log('Reset to isRegistrationClosed: false');
  }
  
  await prisma.$disconnect();
}

reset();
