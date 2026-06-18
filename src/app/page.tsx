import Link from "next/link";
import { getActiveEventConfig } from "@/lib/participants";
import { RegistrationForm } from "@/components/registration-form";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const eventConfig = await getActiveEventConfig();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-900 p-8 text-white shadow-xl">
          <p className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold tracking-wide">
            Pendaftaran Event Masjid
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight">{eventConfig.eventName}</h1>
          <p className="mt-5 max-w-2xl whitespace-pre-line text-base text-emerald-50">{eventConfig.registrationDescription}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-emerald-100">Alur cepat</p>
              <p className="mt-2 text-lg font-semibold">Isi data, verifikasi, selesai</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-emerald-100">Validasi unik</p>
              <p className="mt-2 text-lg font-semibold">Cegah duplikasi nomor WA</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-emerald-100">Bukti masuk</p>
              <p className="mt-2 text-lg font-semibold">Nomor peserta + QR code</p>
            </div>
          </div>
          <div className="mt-8 text-sm text-emerald-100">
            Admin? Masuk ke dashboard di <Link className="font-semibold text-white underline" href="/admin/login">/admin/login</Link>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          {eventConfig.isRegistrationClosed ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 rounded-full bg-red-100 p-4">
                <svg className="h-16 w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Pendaftaran Ditutup</h2>
              <p className="mt-3 text-slate-600">Maaf, pendaftaran untuk event ini sudah ditutup. Terima kasih atas minat Anda!</p>
            </div>
          ) : (
            <RegistrationForm eventName={eventConfig.eventName} />
          )}
        </section>
      </div>
    </main>
  );
}
