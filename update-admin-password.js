const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const newPassword = "@dm1nM4sj1dAnN4B4";
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: { passwordHash },
    create: { username: "admin", passwordHash },
  });

  console.log("✅ Admin password updated successfully!");
  console.log("New username: admin");
  console.log("New password: @dm1nM4sj1dAnN4B4");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
