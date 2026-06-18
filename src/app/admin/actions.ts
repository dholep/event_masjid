"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, clearSession, requireAdmin, validateAdminCredentials } from "@/lib/auth";
import { normalizeWhatsappNumber } from "@/lib/participants";
import { prisma } from "@/lib/prisma";
import { adminLoginSchema, participantSchema } from "@/lib/validation";

export async function loginAdminAction(formData: FormData) {
  const parsed = adminLoginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/admin/login?error=invalid");
  }

  const admin = await validateAdminCredentials(parsed.data.username, parsed.data.password);
  if (!admin) {
    redirect("/admin/login?error=invalid");
  }

  await createSession(admin.username);
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearSession();
  redirect("/admin/login");
}

export async function openRegistrationAction() {
  await requireAdmin();
  const existingEvent = await prisma.eventConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (existingEvent) {
    await prisma.eventConfig.update({
      where: { id: existingEvent.id },
      data: { isRegistrationClosed: false },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function closeRegistrationAction() {
  await requireAdmin();
  const existingEvent = await prisma.eventConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (existingEvent) {
    await prisma.eventConfig.update({
      where: { id: existingEvent.id },
      data: { isRegistrationClosed: true },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateEventNameAction(formData: FormData) {
  await requireAdmin();
  const eventName = String(formData.get("eventName") || "").trim();
  const registrationDescription = String(formData.get("registrationDescription") || "").trim();
  const successDescription = String(formData.get("successDescription") || "").trim();
  const ikhwanGroupLink = String(formData.get("ikhwanGroupLink") || "").trim();
  const akhwatGroupLink = String(formData.get("akhwatGroupLink") || "").trim();
  const isRegistrationClosed = !!formData.get("isRegistrationClosed");

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  if (
    eventName.length < 5 ||
    registrationDescription.length < 20 ||
    successDescription.length < 10 ||
    !isValidUrl(ikhwanGroupLink) ||
    !isValidUrl(akhwatGroupLink)
  ) {
    redirect("/admin");
  }

  const existingEvent = await prisma.eventConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (!existingEvent) {
    await prisma.eventConfig.create({
      data: {
        eventName,
        registrationDescription,
        successDescription,
        ikhwanGroupLink,
        akhwatGroupLink,
        isRegistrationClosed,
      },
    });
  } else {
    await prisma.eventConfig.update({
      where: { id: existingEvent.id },
      data: {
        eventName,
        registrationDescription,
        successDescription,
        ikhwanGroupLink,
        akhwatGroupLink,
        isRegistrationClosed,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteParticipantAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const redirectTo = String(formData.get("redirectTo") || "/admin");

  if (Number.isNaN(id)) {
    redirect("/admin");
  }

  await prisma.participant.delete({
    where: { id },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/attendance");
  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
}

export async function clearParticipantAttendanceAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  if (Number.isNaN(id)) {
    redirect("/admin/attendance");
  }

  await prisma.participant.update({
    where: { id },
    data: {
      attendedAt: null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/attendance");
  redirect("/admin/attendance");
}

export async function updateParticipantAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const parsed = participantSchema.safeParse({
    name: formData.get("name"),
    whatsappNumber: normalizeWhatsappNumber(
      String(formData.get("whatsappNumber") || ""),
    ),
    gender: formData.get("gender"),
  });

  if (Number.isNaN(id)) {
    redirect("/admin");
  }

  if (!parsed.success) {
    redirect(`/admin/participants/${id}`);
  }

  const duplicate = await prisma.participant.findFirst({
    where: {
      whatsappNumber: parsed.data.whatsappNumber,
      NOT: { id },
    },
  });

  if (duplicate) {
    redirect(`/admin/participants/${id}`);
  }

  await prisma.participant.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/participants/${id}`);
  redirect("/admin");
}
