import { z } from "zod";

export const whatsappSchema = z
  .string()
  .min(9, "Nomor WhatsApp minimal 9 digit")
  .max(20, "Nomor WhatsApp maksimal 20 digit")
  .regex(/^[0-9]+$/, "Nomor WhatsApp hanya boleh angka");

export const participantSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(150, "Nama maksimal 150 karakter"),
  whatsappNumber: whatsappSchema,
  gender: z.enum(["L", "P"]),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(3),
  password: z.string().min(6),
});

export const attendanceLookupSchema = z.object({
  keyword: z.string().trim().min(3, "Scan QR code atau isi nomor WhatsApp terlebih dahulu."),
});
