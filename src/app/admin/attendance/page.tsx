import Link from "next/link";
import { AttendanceCheckIn } from "@/components/attendance-check-in";
import { ConfirmAttendanceResetForm } from "@/components/confirm-attendance-reset-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function genderLabel(gender: "L" | "P") {
  return gender === "L" ? "Ikhwan" : "Akhwat";
}

export default async function AttendancePage() {
  await requireAdmin();

  const [totalParticipants, attendedCount, attendedIkhwan, attendedAkhwat, attendedParticipants] = await Promise.all([
    prisma.participant.count(),
    prisma.participant.count({
      where: { attendedAt: { not: null } },
    }),
    prisma.participant.count({
      where: {
        gender: "L",
        attendedAt: { not: null },
      },
    }),
    prisma.participant.count({
      where: {
        gender: "P",
        attendedAt: { not: null },
      },
    }),
    prisma.participant.findMany({
      where: { attendedAt: { not: null } },
      orderBy: { attendedAt: "desc" },
    }),
  ]);

  const notAttendedCount = totalParticipants - attendedCount;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Dashboard Absensi</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Absensi Peserta Event</h1>
            <p className="mt-2 text-slate-600">Scan QR code peserta atau input nomor WhatsApp untuk menandai kehadiran saat acara berlangsung.</p>
          </div>
          <Link className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50" href="/admin">
            Kembali ke Dashboard
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-emerald-700 p-6 text-white shadow-lg">
            <p className="text-sm text-emerald-100">Sudah hadir</p>
            <p className="mt-3 text-4xl font-bold">{attendedCount}</p>
          </div>
          <div className="rounded-3xl bg-amber-600 p-6 text-white shadow-lg">
            <p className="text-sm text-amber-100">Belum absen</p>
            <p className="mt-3 text-4xl font-bold">{notAttendedCount}</p>
          </div>
          <div className="rounded-3xl bg-sky-700 p-6 text-white shadow-lg">
            <p className="text-sm text-sky-100">Ikhwan hadir</p>
            <p className="mt-3 text-4xl font-bold">{attendedIkhwan}</p>
          </div>
          <div className="rounded-3xl bg-fuchsia-700 p-6 text-white shadow-lg">
            <p className="text-sm text-fuchsia-100">Akhwat hadir</p>
            <p className="mt-3 text-4xl font-bold">{attendedAkhwat}</p>
          </div>
        </section>

        <AttendanceCheckIn />

        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Riwayat Kehadiran</p>
              <h2 className="text-2xl font-bold text-slate-900">Peserta yang sudah absen</h2>
              <p className="mt-1 text-sm text-slate-500">Aksi di tabel ini hanya membatalkan status hadir, tidak menghapus data peserta dari daftar pendaftaran.</p>
            </div>
            <p className="text-sm text-slate-500">Total hadir: {attendedParticipants.length}</p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-4 py-3 font-semibold">Nomor Peserta</th>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">No. WA</th>
                  <th className="px-4 py-3 font-semibold">Jenis Kelamin</th>
                  <th className="px-4 py-3 font-semibold">Tanggal Absen</th>
                  <th className="px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendedParticipants.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      Belum ada peserta yang melakukan absensi.
                    </td>
                  </tr>
                ) : (
                  attendedParticipants.map((participant) => (
                    <tr key={participant.id}>
                      <td className="px-4 py-4 font-semibold text-slate-900">{participant.participantNumber}</td>
                      <td className="px-4 py-4 text-slate-700">{participant.name}</td>
                      <td className="px-4 py-4 text-slate-700">{participant.whatsappNumber}</td>
                      <td className="px-4 py-4 text-slate-700">{genderLabel(participant.gender)}</td>
                      <td className="px-4 py-4 text-slate-700">
                        {participant.attendedAt
                          ? new Intl.DateTimeFormat("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(participant.attendedAt)
                          : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <ConfirmAttendanceResetForm participantId={participant.id} participantName={participant.name} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
