"use client";

import { clearParticipantAttendanceAction } from "@/app/admin/actions";

type ConfirmAttendanceResetFormProps = {
  participantId: number;
  participantName: string;
};

export function ConfirmAttendanceResetForm({
  participantId,
  participantName,
}: ConfirmAttendanceResetFormProps) {
  return (
    <form
      action={clearParticipantAttendanceAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Batalkan absensi untuk ${participantName}? Peserta akan kembali masuk ke daftar belum absen.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={participantId} />
      <button className="rounded-lg bg-amber-600 px-3 py-2 font-semibold text-white hover:bg-amber-700" type="submit">
        Batalkan Absen
      </button>
    </form>
  );
}
