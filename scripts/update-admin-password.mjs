import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPassword = "@dm1nM4sj1dAnN4B4";
  const passwordHash = await bcrypt.hash(newPassword, 10);

  console.log("Updating admin password...");

  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: { passwordHash },
    create: { username: "admin", passwordHash },
  });

  console.log("\n✅ SUCCESS! Admin password updated in NeonDB!");
  console.log("Username: admin");
  console.log("Password: @dm1nM4sj1dAnN4B4");
}

main()
  .catch((e) => {
    console.error("\n❌ Error updating admin password:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
