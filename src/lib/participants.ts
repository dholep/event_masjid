import { Gender, Participant } from "@generated/prisma";
import {
  DEFAULT_AKHWAT_GROUP_LINK,
  DEFAULT_EVENT_DESCRIPTION,
  DEFAULT_EVENT_NAME,
  DEFAULT_IKHWAN_GROUP_LINK,
  DEFAULT_SUCCESS_DESCRIPTION,
  PARTICIPANT_PREFIX,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export function normalizeWhatsappNumber(value: string) {
  return value.replace(/\D/g, "").trim();
}

export function formatParticipantNumber(id: number) {
  return `${PARTICIPANT_PREFIX}-${String(id).padStart(3, "0")}`;
}

export async function getActiveEventConfig() {
  const event = await prisma.eventConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return {
    eventName: event?.eventName || DEFAULT_EVENT_NAME,
    registrationDescription: event?.registrationDescription || DEFAULT_EVENT_DESCRIPTION,
    successDescription: event?.successDescription || DEFAULT_SUCCESS_DESCRIPTION,
    ikhwanGroupLink: event?.ikhwanGroupLink || DEFAULT_IKHWAN_GROUP_LINK,
    akhwatGroupLink: event?.akhwatGroupLink || DEFAULT_AKHWAT_GROUP_LINK,
  };
}

export function normalizeParticipantNumber(value: string) {
  return value.trim().toUpperCase();
}

type AttendanceResult =
  | { status: "not_found" }
  | { status: "already_attended"; participant: Participant }
  | { status: "checked_in"; participant: Participant };

export async function markParticipantAttendance(keyword: string): Promise<AttendanceResult> {
  const normalizedKeyword = keyword.trim();
  const normalizedWhatsapp = normalizeWhatsappNumber(normalizedKeyword);
  const participant: Participant | null =
    (normalizedWhatsapp && normalizedWhatsapp.length >= 9
      ? await prisma.participant.findUnique({
          where: { whatsappNumber: normalizedWhatsapp },
        })
      : null) ??
    (await prisma.participant.findUnique({
      where: { participantNumber: normalizeParticipantNumber(normalizedKeyword) },
    }));

  if (!participant) {
    return { status: "not_found" };
  }

  if (participant.attendedAt) {
    return {
      status: "already_attended",
      participant,
    };
  }

  const updatedParticipant = await prisma.participant.update({
    where: { id: participant.id },
    data: {
      attendedAt: new Date(),
    },
  });

  return {
    status: "checked_in",
    participant: updatedParticipant,
  };
}

export async function registerParticipant(input: {
  name: string;
  whatsappNumber: string;
  gender: Gender;
}) {
  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.participant.findUnique({
      where: { whatsappNumber: input.whatsappNumber },
    });

    if (duplicate) {
      return { duplicate } as const;
    }

    const created = await tx.participant.create({
      data: {
        participantNumber: `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: input.name,
        whatsappNumber: input.whatsappNumber,
        gender: input.gender,
      },
    });

    const participantNumber = formatParticipantNumber(created.id);
    const participant = await tx.participant.update({
      where: { id: created.id },
      data: { participantNumber },
    });

    return { participant } as const;
  });
}
