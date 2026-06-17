const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();
const DEFAULT_EVENT_DESCRIPTION =
  "Daftarkan diri Anda secara mandiri. Sistem akan memeriksa nomor WhatsApp, menampilkan CAPTCHA anti-bot, lalu membuat nomor peserta dan QR code sebagai bukti pendaftaran.";
const DEFAULT_SUCCESS_DESCRIPTION = "Mohon simpan atau screenshot halaman ini sebagai bukti fisik masuk event.";
const DEFAULT_IKHWAN_GROUP_LINK = "https://chat.whatsapp.com/J9e2mcC9nye4K8i31SX44U?s=cl&p=a&ilr=2&amv=2";
const DEFAULT_AKHWAT_GROUP_LINK = "https://chat.whatsapp.com/IVrJ2guOh8b1eynrxderxT?s=cl&p=a&ilr=2&amv=2";

async function main() {
  const eventName = process.env.DEFAULT_EVENT_NAME || "Kajian Akbar Masjid Pekan Ini";
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin12345";
  const passwordHash = await bcrypt.hash(password, 10);

  const existingEvent = await prisma.eventConfig.findFirst();
  if (!existingEvent) {
    await prisma.eventConfig.create({
      data: {
        eventName,
        registrationDescription: DEFAULT_EVENT_DESCRIPTION,
        successDescription: DEFAULT_SUCCESS_DESCRIPTION,
        ikhwanGroupLink: DEFAULT_IKHWAN_GROUP_LINK,
        akhwatGroupLink: DEFAULT_AKHWAT_GROUP_LINK,
      },
    });
  } else if (
    !existingEvent.registrationDescription ||
    !existingEvent.successDescription ||
    !existingEvent.ikhwanGroupLink ||
    !existingEvent.akhwatGroupLink
  ) {
    await prisma.eventConfig.update({
      where: { id: existingEvent.id },
      data: {
        registrationDescription: existingEvent.registrationDescription || DEFAULT_EVENT_DESCRIPTION,
        successDescription: existingEvent.successDescription || DEFAULT_SUCCESS_DESCRIPTION,
        ikhwanGroupLink: existingEvent.ikhwanGroupLink || DEFAULT_IKHWAN_GROUP_LINK,
        akhwatGroupLink: existingEvent.akhwatGroupLink || DEFAULT_AKHWAT_GROUP_LINK,
      },
    });
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        username,
        passwordHash,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
