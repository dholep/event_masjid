import Link from "next/link";
import { getActiveEventConfig } from "@/lib/participants";
import { RegistrationForm } from "@/components/registration-form";

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
          <RegistrationForm eventName={eventConfig.eventName} />
        </section>
      </div>
    </main>
  );
}
