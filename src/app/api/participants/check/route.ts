import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeWhatsappNumber } from "@/lib/participants";
import { whatsappSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = (await request.json()) as { whatsappNumber?: string };
  const whatsappNumber = normalizeWhatsappNumber(body.whatsappNumber || "");
  const parsed = whatsappSchema.safeParse(whatsappNumber);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Nomor WhatsApp tidak valid." }, { status: 400 });
  }

  const participant = await prisma.participant.findUnique({
    where: { whatsappNumber: parsed.data },
  });

  return NextResponse.json({
    exists: Boolean(participant),
    participantNumber: participant?.participantNumber,
  });
}
