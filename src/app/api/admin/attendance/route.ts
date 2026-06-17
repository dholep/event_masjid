import { NextResponse } from "next/server";
import type { Participant } from "@generated/prisma";
import { getSession } from "@/lib/auth";
import { markParticipantAttendance } from "@/lib/participants";
import { prisma } from "@/lib/prisma";
import { attendanceLookupSchema } from "@/lib/validation";

function genderLabel(gender: "L" | "P") {
  return gender === "L" ? "Ikhwan" : "Akhwat";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Sesi admin tidak valid." }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { username: session.username },
  });

  if (!admin) {
    return NextResponse.json({ message: "Akses admin ditolak." }, { status: 401 });
  }

  const body = (await request.json()) as { keyword?: string };
  const parsed = attendanceLookupSchema.safeParse({
    keyword: body.keyword,
  });

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input absensi tidak valid." }, { status: 400 });
  }

  const result = await markParticipantAttendance(parsed.data.keyword);

  if (result.status === "not_found") {
    return NextResponse.json({ message: "Peserta tidak ditemukan. Scan QR code atau cek nomor WA." }, { status: 404 });
  }

  if (result.status === "already_attended") {
    const participant = result.participant as Participant;

    return NextResponse.json({
      status: result.status,
      message: `${participant.name} sudah tercatat hadir sebelumnya.`,
      participant: {
        participantNumber: participant.participantNumber,
        name: participant.name,
        gender: genderLabel(participant.gender),
        attendedAt: participant.attendedAt,
      },
    });
  }

  const participant = result.participant as Participant;

  return NextResponse.json({
    status: result.status,
    message: `${participant.name} berhasil diabsen.`,
    participant: {
      participantNumber: participant.participantNumber,
      name: participant.name,
      gender: genderLabel(participant.gender),
      attendedAt: participant.attendedAt,
    },
  });
}
