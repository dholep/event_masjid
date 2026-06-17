import { NextResponse } from "next/server";
import { generateCaptcha, storeCaptcha } from "@/lib/captcha";

export async function GET() {
  const captcha = generateCaptcha();
  const expiresAt = await storeCaptcha(captcha.answer);

  return NextResponse.json({
    question: captcha.question,
    expiresAt,
  });
}
