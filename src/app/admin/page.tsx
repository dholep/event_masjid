import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteParticipantAction, logoutAdminAction, updateEventNameAction } from "@/app/admin/actions";

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
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Dashboard Admin</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Assalamu&apos;alaikum, {admin.username}</h1>
            <p className="mt-2 text-slate-600">Kelola peserta, perbarui nama event, pantau statistik pendaftaran, dan monitor absensi acara.</p>
          </div>

          <form action={logoutAdminAction}>
            <button className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50" type="submit">
              Logout
            </button>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-emerald-700 p-6 text-white shadow-lg">
            <p className="text-sm text-emerald-100">Total peserta</p>
            <p className="mt-3 text-4xl font-bold">{totalParticipants}</p>
          </div>
          <div className="rounded-3xl bg-sky-700 p-6 text-white shadow-lg">
            <p className="text-sm text-sky-100">Ikhwan</p>
            <p className="mt-3 text-4xl font-bold">{ikhwanCount}</p>
          </div>
          <div className="rounded-3xl bg-fuchsia-700 p-6 text-white shadow-lg">
            <p className="text-sm text-fuchsia-100">Akhwat</p>
            <p className="mt-3 text-4xl font-bold">{akhwatCount}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Monitoring Absensi</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Kehadiran peserta saat event</h2>
              <p className="mt-2 text-slate-600">Gunakan halaman absensi untuk scan QR code peserta atau input nomor WhatsApp saat acara berlangsung.</p>
            </div>
            <Link className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800" href="/admin/attendance">
              Buka Halaman Absensi
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
              <p className="text-sm text-emerald-700">Sudah hadir</p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">{attendedCount}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-100">
              <p className="text-sm text-amber-700">Belum absen</p>
              <p className="mt-2 text-3xl font-bold text-amber-900">{notAttendedCount}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Konfigurasi Event</p>
            <h2 className="text-2xl font-bold text-slate-900">Pengaturan halaman register, sukses, dan grup WA</h2>
          </div>

          <form action={updateEventNameAction} className="mt-5 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Status Pendaftaran</p>
                  <p className="text-sm text-slate-500">Buka atau tutup akses ke halaman pendaftaran</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${eventConfig?.isRegistrationClosed ? "text-red-700" : "text-emerald-700"}`}>
                    {eventConfig?.isRegistrationClosed ? "Ditutup" : "Dibuka"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isRegistrationClosed"
                      className="sr-only peer"
                      defaultChecked={eventConfig?.isRegistrationClosed}
                    />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Nama event</p>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              defaultValue={eventConfig?.eventName || "Kajian Akbar Masjid Pekan Ini"}
              name="eventName"
              required
            />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Deskripsi halaman register</p>
            <textarea
              className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
              defaultValue={
                eventConfig?.registrationDescription ||
                "Daftarkan diri Anda secara mandiri. Sistem akan memeriksa nomor WhatsApp, menampilkan CAPTCHA anti-bot, lalu membuat nomor peserta dan QR code sebagai bukti pendaftaran."
              }
              name="registrationDescription"
              required
            />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Deskripsi halaman registrasi berhasil</p>
            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
              defaultValue={eventConfig?.successDescription || "Mohon simpan atau screenshot halaman ini sebagai bukti fisik masuk event."}
              name="successDescription"
              required
            />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Link grup WA ikhwan</p>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              defaultValue={eventConfig?.ikhwanGroupLink || "https://chat.whatsapp.com/J9e2mcC9nye4K8i31SX44U?s=cl&p=a&ilr=2&amv=2"}
              name="ikhwanGroupLink"
              required
              type="url"
            />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Link grup WA akhwat</p>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              defaultValue={eventConfig?.akhwatGroupLink || "https://chat.whatsapp.com/IVrJ2guOh8b1eynrxderxT?s=cl&p=a&ilr=2&amv=2"}
              name="akhwatGroupLink"
              required
              type="url"
            />
            </div>
            <button className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800" type="submit">
              Simpan Konfigurasi Event
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Data Peserta</p>
              <h2 className="text-2xl font-bold text-slate-900">Daftar pendaftar terbaru</h2>
            </div>
            <p className="text-sm text-slate-500">Total record: {participants.length}</p>
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
                    <td className="px-4 py-4 font-semibold text-slate-900">{participant.participantNumber}</td>
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
                          <button className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700" type="submit">
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
        </section>
      </div>
    </main>
  );
}
