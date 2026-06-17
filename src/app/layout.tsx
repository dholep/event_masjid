import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Event Masjid",
  description: "Sistem pendaftaran event masjid berbasis web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
