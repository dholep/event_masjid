const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function update() {
  const eventConfig = await prisma.eventConfig.findFirst({
    orderBy: { updatedAt: 'desc' }
  });
  
  if (eventConfig) {
    const updated = await prisma.eventConfig.update({
      where: { id: eventConfig.id },
      data: { isRegistrationClosed: true }
    });
    console.log('Updated Event Config:', JSON.stringify(updated, null, 2));
  }
  
  await prisma.$disconnect();
}

update();
