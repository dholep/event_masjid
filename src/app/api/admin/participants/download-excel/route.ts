import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

function genderLabel(gender: "L" | "P") {
  return gender === "L" ? "Ikhwan" : "Akhwat";
}

export async function GET() {
  await requireAdmin();

  const participants = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
  });

  const data = participants.map((p) => ({
    "Nomor Peserta": p.participantNumber,
    "Nama Lengkap": p.name,
    "Nomor WhatsApp": p.whatsappNumber,
    "Jenis Kelamin": genderLabel(p.gender),
    "Tanggal Daftar": new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(p.createdAt),
    "Status Kehadiran": p.attendedAt ? "Sudah Hadir" : "Belum Hadir",
    "Tanggal Hadir": p.attendedAt
      ? new Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(p.attendedAt)
      : "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Peserta");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const filename = `data-peserta-event-${new Date().toISOString().split("T")[0]}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
