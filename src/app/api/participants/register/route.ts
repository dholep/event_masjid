import { NextResponse } from "next/server";
import { verifyCaptcha } from "@/lib/captcha";
import { normalizeWhatsappNumber, registerParticipant, getActiveEventConfig } from "@/lib/participants";
import { participantSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const eventConfig = await getActiveEventConfig();
  
  if (eventConfig.isRegistrationClosed) {
    return NextResponse.json({ message: "Pendaftaran sudah ditutup." }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    whatsappNumber?: string;
    gender?: "L" | "P";
    captchaAnswer?: string;
  };

  const parsed = participantSchema.safeParse({
    name: body.name,
    whatsappNumber: normalizeWhatsappNumber(body.whatsappNumber || ""),
    gender: body.gender,
  });

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Data pendaftaran tidak valid." }, { status: 400 });
  }

  const isCaptchaValid = await verifyCaptcha(String(body.captchaAnswer || ""));
  if (!isCaptchaValid) {
    return NextResponse.json({ message: "CAPTCHA tidak valid atau sudah kedaluwarsa." }, { status: 400 });
  }

  const result = await registerParticipant(parsed.data);

  if ("duplicate" in result && result.duplicate) {
    return NextResponse.json(
      {
        message: "Nomor WhatsApp sudah terdaftar.",
        duplicateParticipantNumber: result.duplicate.participantNumber,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    success: true,
    participantNumber: result.participant.participantNumber,
    redirectTo: `/success/${result.participant.participantNumber}`,
  });
}
