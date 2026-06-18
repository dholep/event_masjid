"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loginAdminAction } from "@/app/admin/actions";

type CaptchaResponse = {
  question: string;
  expiresAt: number;
};

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Username atau password tidak valid.";
  }
  if (error === "invalid_captcha") {
    return "CAPTCHA tidak valid atau sudah kedaluwarsa.";
  }
  return null;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState<string | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCaptcha() {
    const response = await fetch("/api/captcha", { cache: "no-store" });
    const result = (await response.json()) as CaptchaResponse;
    setCaptchaQuestion(result.question);
    setCaptchaAnswer("");
  }

  useEffect(() => {
    loadCaptcha();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAdminAction({ username, password, captchaAnswer });

      if (result.success) {
        router.push("/admin");
      } else {
        setError(getErrorMessage(result.error));
        await loadCaptcha();
      }
    } catch {
      setError("Terjadi kesalahan, silakan coba lagi.");
      await loadCaptcha();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Admin Masjid</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Masuk ke Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Gunakan kredensial admin yang tersimpan di database.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="username">
              Username
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              id="password"
              name="password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {captchaQuestion ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">Verifikasi Anti-Bot</p>
              <div className="mt-4 rounded-xl bg-white px-4 py-3 text-lg font-bold text-slate-900">{captchaQuestion}</div>
              <input
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
                inputMode="numeric"
                placeholder="Isi jawaban CAPTCHA"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                required
              />
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <button
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isLoading || !captchaQuestion}
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Kembali ke <Link className="font-semibold text-emerald-700 underline" href="/">halaman pendaftaran</Link>
        </div>
      </div>
    </main>
  );
}
