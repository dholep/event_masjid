"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type AttendanceResponse = {
  status?: "checked_in" | "already_attended";
  message?: string;
  participant?: {
    participantNumber: string;
    name: string;
    gender: string;
    attendedAt: string | null;
  };
};

export function AttendanceCheckIn() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "warning" | "error";
    message: string;
    participant?: AttendanceResponse["participant"];
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword }),
      });

      const result = (await response.json()) as AttendanceResponse;

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: result.message || "Absensi gagal diproses.",
        });
        return;
      }

      setFeedback({
        type: result.status === "already_attended" ? "warning" : "success",
        message: result.message || "Absensi berhasil.",
        participant: result.participant,
      });

      setKeyword("");
      router.refresh();
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kendala jaringan saat memproses absensi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const feedbackStyles = {
    success: "border-emerald-300 bg-emerald-50 text-emerald-900",
    warning: "border-amber-300 bg-amber-50 text-amber-900",
    error: "border-red-300 bg-red-50 text-red-700",
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Check-In Event</p>
        <h2 className="text-2xl font-bold text-slate-900">Scan QR atau input nomor WhatsApp</h2>
        <p className="text-sm text-slate-600">
          Fokuskan scanner ke kolom input di bawah. Jika tidak memakai scanner, ketik nomor peserta atau nomor WhatsApp lalu klik tombol
          absen.
        </p>
      </div>

      <form className="mt-5 flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          autoFocus
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Scan QR code / ketik kode peserta / nomor WA"
          value={keyword}
        />
        <button
          className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting || !keyword.trim()}
          type="submit"
        >
          {isSubmitting ? "Memproses..." : "Absen Peserta"}
        </button>
      </form>

      {feedback ? (
        <div className={`mt-4 rounded-2xl border px-4 py-4 ${feedbackStyles[feedback.type]}`}>
          <p className="font-semibold">{feedback.message}</p>
          {feedback.participant ? (
            <div className="mt-3 space-y-1 text-sm">
              <p>Nomor peserta: {feedback.participant.participantNumber}</p>
              <p>Nama: {feedback.participant.name}</p>
              <p>Jenis kelamin: {feedback.participant.gender}</p>
              <p>
                Waktu absensi:{" "}
                {feedback.participant.attendedAt
                  ? new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(feedback.participant.attendedAt))
                  : "-"}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
