import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteParticipantAction,
  logoutAdminAction,
  updateEventNameAction,
  openRegistrationAction,
  closeRegistrationAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

function genderLabel(gender: "L" | "P") {
  return gender === "L" ? "Ikhwan" : "Akhwat";
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const [eventConfig, totalParticipants, ikhwanCount, akhwatCount, attendedCount, participants] = await Promise.all([
    prisma.eventConfig.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.participant.count(),
    prisma.participant.count({ where: { gender: "L" } }),
    prisma.participant.count({ where: { gender: "P" } }),
    prisma.participant.count({ where: { attendedAt: { not: null } } }),
    prisma.participant.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const notAttendedCount = totalParticipants - attendedCount;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Dashboard Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Assalamu'alaikum, {admin.username}
            </h1>
            <p className="mt-2 text-slate-600">
              Kelola peserta, perbarui nama event, dan monitor absensi.
            </p>
          </div>
          <form action={logoutAdminAction}>
            <button
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              type="submit"
            >
              Logout
            </button>
          </form>
        </div>

        {/* Statistic Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-lg">
            <p className="text-sm font-medium text-emerald-100">Total Peserta</p>
            <p className="mt-3 text-4xl font-bold">{totalParticipants}</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg">
            <p className="text-sm font-medium text-blue-100">Ikhwan</p>
            <p className="mt-3 text-4xl font-bold">{ikhwanCount}</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-fuchsia-600 to-fuchsia-700 p-6 text-white shadow-lg">
            <p className="text-sm font-medium text-fuchsia-100">Akhwat</p>
            <p className="mt-3 text-4xl font-bold">{akhwatCount}</p>
          </div>
        </div>

        {/* Registration Status */}
        <div className={`rounded-3xl p-6 shadow-xl ring-1 ${
          eventConfig?.isRegistrationClosed 
            ? "bg-red-50 ring-red-200" 
            : "bg-emerald-50 ring-emerald-200"
        }`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                eventConfig?.isRegistrationClosed ? "text-red-600" : "text-emerald-600"
              }`}>
                Status Pendaftaran
              </p>
              <h2 className={`mt-2 text-3xl font-bold ${
                eventConfig?.isRegistrationClosed ? "text-red-700" : "text-emerald-700"
              }`}>
                {eventConfig?.isRegistrationClosed ? "PENDAFTARAN DITUTUP" : "PENDAFTARAN DIBUKA"}
              </h2>
              <p className={`mt-2 ${
                eventConfig?.isRegistrationClosed ? "text-red-600" : "text-emerald-600"
              }`}>
                {eventConfig?.isRegistrationClosed 
                  ? "Pengunjung tidak bisa mendaftar saat ini." 
                  : "Pengunjung bisa mendaftar event ini."}
              </p>
            </div>
            {eventConfig?.isRegistrationClosed ? (
              <form action={openRegistrationAction}>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-8 py-4 font-bold text-white shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all"
                >
                  Buka Pendaftaran
                </button>
              </form>
            ) : (
              <form action={closeRegistrationAction}>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-8 py-4 font-bold text-white shadow-lg hover:bg-red-700 hover:shadow-xl transition-all"
                >
                  Tutup Pendaftaran
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Attendance Section */}
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Monitoring Absensi
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Kehadiran Peserta
              </h2>
              <p className="mt-2 text-slate-600">
                Gunakan halaman absensi untuk scan QR code atau masukkan nomor WhatsApp.
              </p>
            </div>
            <Link
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
              href="/admin/attendance"
            >
              Buka Halaman Absensi
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
              <p className="text-sm text-emerald-600">Sudah Hadir</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{attendedCount}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
              <p className="text-sm text-amber-600">Belum Absen</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">{notAttendedCount}</p>
            </div>
          </div>
        </div>

        {/* Event Configuration */}
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Konfigurasi Event
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              Pengaturan Halaman Pendaftaran
            </h2>
          </div>
          <form action={updateEventNameAction} className="mt-5 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Nama Event</p>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                defaultValue={eventConfig?.eventName || "Kajian Akbar Masjid Pekan Ini"}
                name="eventName"
                required
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Deskripsi Halaman Pendaftaran
              </p>
              <textarea
                className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                defaultValue={
                  eventConfig?.registrationDescription ||
                  "Daftarkan diri Anda secara mandiri. Sistem akan memeriksa nomor WhatsApp, menampilkan CAPTCHA anti-bot, lalu membuat nomor peserta dan QR code sebagai bukti pendaftaran."
                }
                name="registrationDescription"
                required
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Deskripsi Halaman Pendaftaran Berhasil
              </p>
              <textarea
                className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                defaultValue={eventConfig?.successDescription || "Mohon simpan atau screenshot halaman ini sebagai bukti fisik masuk event."}
                name="successDescription"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Link Grup WA Ikhwan</p>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  defaultValue={eventConfig?.ikhwanGroupLink || "https://chat.whatsapp.com/J9e2mcC9nye4K8i31SX44U?s=cl&p=a&ilr=2&amv=2"}
                  name="ikhwanGroupLink"
                  required
                  type="url"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Link Grup WA Akhwat</p>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  defaultValue={eventConfig?.akhwatGroupLink || "https://chat.whatsapp.com/IVrJ2guOh8b1eynrxderxT?s=cl&p=a&ilr=2&amv=2"}
                  name="akhwatGroupLink"
                  required
                  type="url"
                />
              </div>
            </div>
            <button
              className="w-full rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white hover:bg-emerald-700 transition-all"
              type="submit"
            >
              Simpan Konfigurasi Event
            </button>
          </form>
        </div>

        {/* Participants List */}
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Data Peserta
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                Daftar Pendaftar Terbaru
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-500">Total: {participants.length} orang</p>
              <a
                href="/api/admin/participants/download-excel"
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition-all"
              >
                Download Excel
              </a>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-4 py-3 font-semibold">Nomor Peserta</th>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">No. WA</th>
                  <th className="px-4 py-3 font-semibold">Jenis Kelamin</th>
                  <th className="px-4 py-3 font-semibold">Tanggal Daftar</th>
                  <th className="px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((participant) => (
                  <tr key={participant.id} className="align-top">
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {participant.participantNumber}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{participant.name}</td>
                    <td className="px-4 py-4 text-slate-700">{participant.whatsappNumber}</td>
                    <td className="px-4 py-4 text-slate-700">{genderLabel(participant.gender)}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(participant.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                          href={`/admin/participants/${participant.id}`}
                        >
                          Edit
                        </Link>
                        <form action={deleteParticipantAction}>
                          <input name="id" type="hidden" value={participant.id} />
                          <button
                            className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700"
                            type="submit"
                          >
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
