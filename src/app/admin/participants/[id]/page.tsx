import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateParticipantAction } from "@/app/admin/actions";

export default async function EditParticipantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const participant = await prisma.participant.findUnique({
    where: { id: Number(id) },
  });

  if (!participant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Edit Peserta</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{participant.participantNumber}</h1>
          </div>
          <Link className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50" href="/admin">
            Kembali
          </Link>
        </div>

        <form action={updateParticipantAction} className="mt-6 space-y-4">
          <input name="id" type="hidden" value={participant.id} />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">
              Nama lengkap
            </label>
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" defaultValue={participant.name} id="name" name="name" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="whatsappNumber">
              Nomor WhatsApp
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              defaultValue={participant.whatsappNumber}
              id="whatsappNumber"
              name="whatsappNumber"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="gender">
              Jenis kelamin
            </label>
            <select className="w-full rounded-xl border border-slate-300 px-4 py-3" defaultValue={participant.gender} id="gender" name="gender">
              <option value="L">Ikhwan / Laki-laki</option>
              <option value="P">Akhwat / Perempuan</option>
            </select>
          </div>

          <button className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800" type="submit">
            Simpan Perubahan
          </button>
        </form>
      </div>
    </main>
  );
}
