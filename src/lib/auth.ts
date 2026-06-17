import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

function getSecret() {
  return process.env.APP_SECRET || "dev-secret-yang-harus-diganti";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeCompare(a: string, b: string) {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function createSession(username: string) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${username}.${expiresAt}`;
  const signature = sign(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  const [username, expiresAt, signature] = raw.split(".");
  if (!username || !expiresAt || !signature) {
    return null;
  }

  const payload = `${username}.${expiresAt}`;
  const expected = sign(payload);

  if (expected.length !== signature.length || !safeCompare(expected, signature)) {
    return null;
  }

  if (Number(expiresAt) < Date.now()) {
    return null;
  }

  return { username };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { username: session.username },
  });

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function validateAdminCredentials(username: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) {
    return null;
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  return isValid ? admin : null;
}
