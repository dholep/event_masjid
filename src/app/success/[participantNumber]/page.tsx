import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { getActiveEventConfig } from "@/lib/participants";
import { prisma } from "@/lib/prisma";

function genderLabel(gender: "L" | "P") {
  return gender === "L" ? "Ikhwan / Laki-laki" : "Akhwat / Perempuan";
}

function whatsappGroupLink(
  gender: "L" | "P",
  links: {
    ikhwanGroupLink: string;
    akhwatGroupLink: string;
  },
) {
  return gender === "L" ? links.ikhwanGroupLink : links.akhwatGroupLink;
}

function whatsappGroupLabel(gender: "L" | "P") {
  return gender === "L" ? "Gabung Grup WA Ikhwan" : "Gabung Grup WA Akhwat";
}

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ participantNumber: string }>;
}) {
  const { participantNumber } = await params;
  const [participant, eventConfig] = await Promise.all([
    prisma.participant.findUnique({
      where: { participantNumber },
    }),
    getActiveEventConfig(),
  ]);

  if (!participant) {
    notFound();
  }

  const qrCode = await QRCode.toDataURL(participant.participantNumber, { width: 320, margin: 1 });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Pendaftaran Berhasil</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Nomor peserta Anda: {participant.participantNumber}</h1>
          <p className="mt-3 whitespace-pre-line text-slate-600">{eventConfig.successDescription}</p>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px] md:items-center">
          <div className="space-y-4 rounded-2xl bg-slate-50 p-6">
            <div>
              <p className="text-sm text-slate-500">Nama lengkap</p>
              <p className="text-lg font-semibold text-slate-900">{participant.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Nomor WhatsApp</p>
              <p className="text-lg font-semibold text-slate-900">{participant.whatsappNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Jenis kelamin</p>
              <p className="text-lg font-semibold text-slate-900">{genderLabel(participant.gender)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Tanggal daftar</p>
              <p className="text-lg font-semibold text-slate-900">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "full",
                  timeStyle: "short",
                }).format(participant.createdAt)}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">Grup informasi peserta</p>
              <p className="mt-1 text-sm text-emerald-900">Silakan gabung ke grup WhatsApp sesuai kategori peserta Anda.</p>
              <a
                className="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
                href={whatsappGroupLink(participant.gender, eventConfig)}
                rel="noreferrer"
                target="_blank"
              >
                {whatsappGroupLabel(participant.gender)}
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <Image
              alt={`QR Code ${participant.participantNumber}`}
              className="mx-auto h-auto w-full max-w-72"
              height={320}
              src={qrCode}
              unoptimized
              width={320}
            />
            <p className="mt-3 text-sm text-slate-500">QR code ini hanya berisi kode peserta saat discan.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800" href="/">
            Kembali ke halaman utama
          </Link>
        </div>
      </div>
    </main>
  );
}
