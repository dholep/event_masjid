"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type CheckDuplicateResponse = {
  exists: boolean;
  participantNumber?: string;
};

type CaptchaResponse = {
  question: string;
  expiresAt: number;
};

type RegisterResponse = {
  success: boolean;
  redirectTo?: string;
  participantNumber?: string;
  message?: string;
  duplicateParticipantNumber?: string;
};

type RegistrationFormProps = {
  eventName: string;
};

export function RegistrationForm({ eventName }: RegistrationFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captchaQuestion, setCaptchaQuestion] = useState<string | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const cleanedWhatsapp = useMemo(() => whatsappNumber.replace(/\D/g, ""), [whatsappNumber]);

  async function loadCaptcha() {
    const response = await fetch("/api/captcha", { cache: "no-store" });
    const result = (await response.json()) as CaptchaResponse;
    setCaptchaQuestion(result.question);
    setCaptchaAnswer("");
  }

  async function handleInitialSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChecking(true);
    setError(null);
    setWarning(null);

    try {
      const response = await fetch("/api/participants/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ whatsappNumber: cleanedWhatsapp }),
      });

      const result = (await response.json()) as CheckDuplicateResponse & { message?: string };

      if (!response.ok) {
        setError(result.message || "Gagal memeriksa nomor WhatsApp.");
        return;
      }

      if (result.exists && result.participantNumber) {
        setWarning(`Anda sudah terdaftar dengan nomor peserta ${result.participantNumber}.`);
        return;
      }

      await loadCaptcha();
    } catch {
      setError("Terjadi kendala jaringan saat memeriksa data.");
    } finally {
      setIsChecking(false);
    }
  }

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);
    setWarning(null);

    try {
      const response = await fetch("/api/participants/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          whatsappNumber: cleanedWhatsapp,
          gender,
          captchaAnswer,
        }),
      });

      const result = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        if (result.duplicateParticipantNumber) {
          setWarning(`Anda sudah terdaftar dengan nomor peserta ${result.duplicateParticipantNumber}.`);
        } else {
          setError(result.message || "Pendaftaran gagal diproses.");
        }

        await loadCaptcha();
        return;
      }

      router.push(result.redirectTo || `/success/${result.participantNumber}`);
    } catch {
      setError("Terjadi kendala jaringan saat menyimpan data.");
      await loadCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Form Pendaftaran</p>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">{eventName}</h2>
      <p className="mt-2 text-sm text-slate-600">Isi data berikut dengan benar. Nomor WhatsApp hanya bisa dipakai satu kali.</p>

      <form className="mt-6 space-y-4" onSubmit={handleInitialSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">
            Nama lengkap
          </label>
          <input
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-emerald-500"
            id="name"
            maxLength={150}
            minLength={3}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Ahmad Fauzi"
            value={name}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="whatsappNumber">
            Nomor WhatsApp
          </label>
          <input
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-emerald-500"
            id="whatsappNumber"
            inputMode="numeric"
            onChange={(event) => setWhatsappNumber(event.target.value)}
            placeholder="Contoh: 081234567890"
            value={whatsappNumber}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="gender">
            Jenis kelamin
          </label>
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
            id="gender"
            onChange={(event) => setGender(event.target.value as "L" | "P")}
            value={gender}
          >
            <option value="L">Ikhwan / Laki-laki</option>
            <option value="P">Akhwat / Perempuan</option>
          </select>
        </div>

        {warning ? <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{warning}</div> : null}
        {error ? <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <button
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isChecking || !name.trim() || cleanedWhatsapp.length < 9}
          type="submit"
        >
          {isChecking ? "Memeriksa data..." : "Daftar Sekarang"}
        </button>
      </form>

      {captchaQuestion ? (
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">Verifikasi Anti-Bot</p>
          <p className="mt-2 text-slate-700">Jawab tantangan berikut untuk melanjutkan penyimpanan data.</p>
          <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-lg font-bold text-slate-900">{captchaQuestion}</div>
          <input
            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
            inputMode="numeric"
            onChange={(event) => setCaptchaAnswer(event.target.value)}
            placeholder="Isi jawaban CAPTCHA"
            value={captchaAnswer}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSubmitting || !captchaAnswer.trim()}
              onClick={handleRegister}
              type="button"
            >
              {isSubmitting ? "Menyimpan data..." : "Verifikasi dan Simpan"}
            </button>
            <button
              className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={loadCaptcha}
              type="button"
            >
              Refresh CAPTCHA
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
