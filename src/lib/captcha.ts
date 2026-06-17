import { cookies } from "next/headers";
import { CAPTCHA_ANSWER_COOKIE, CAPTCHA_EXPIRY_COOKIE } from "@/lib/constants";

function getCookieConfig(expiresAt: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  };
}

export function generateCaptcha() {
  const first = Math.floor(Math.random() * 8) + 1;
  const second = Math.floor(Math.random() * 8) + 1;

  return {
    question: `${first} + ${second} = ?`,
    answer: String(first + second),
  };
}

export async function storeCaptcha(answer: string) {
  const expiresAt = Date.now() + 1000 * 60 * 5;
  const cookieStore = await cookies();

  cookieStore.set(CAPTCHA_ANSWER_COOKIE, answer, getCookieConfig(expiresAt));
  cookieStore.set(CAPTCHA_EXPIRY_COOKIE, String(expiresAt), getCookieConfig(expiresAt));

  return expiresAt;
}

export async function clearCaptcha() {
  const cookieStore = await cookies();
  cookieStore.delete(CAPTCHA_ANSWER_COOKIE);
  cookieStore.delete(CAPTCHA_EXPIRY_COOKIE);
}

export async function verifyCaptcha(input: string) {
  const cookieStore = await cookies();
  const answer = cookieStore.get(CAPTCHA_ANSWER_COOKIE)?.value;
  const expiresAt = cookieStore.get(CAPTCHA_EXPIRY_COOKIE)?.value;

  const isValid = Boolean(answer) && Boolean(expiresAt) && Number(expiresAt) > Date.now() && input.trim() === answer;

  await clearCaptcha();
  return isValid;
}
