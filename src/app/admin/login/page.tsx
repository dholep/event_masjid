import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { loginAdminAction } from "@/app/admin/actions";

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Username atau password tidak valid.";
  }

  return null;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Admin Masjid</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Masuk ke Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Gunakan kredensial admin yang tersimpan di database.</p>

        <form action={loginAdminAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="username">
              Username
            </label>
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" id="username" name="username" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" id="password" name="password" required type="password" />
          </div>

          {errorMessage ? <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div> : null}

          <button className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800" type="submit">
            Masuk
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Kembali ke <Link className="font-semibold text-emerald-700 underline" href="/">halaman pendaftaran</Link>
        </div>
      </div>
    </main>
  );
}
