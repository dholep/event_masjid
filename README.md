# Aplikasi Event Masjid

Aplikasi pendaftaran dan manajemen kehadiran event masjid berbasis Next.js dengan database PostgreSQL (Neon DB).

## Fitur Utama

- 📝 Pendaftaran peserta dengan CAPTCHA anti-bot
- 🎫 Generate nomor peserta dan QR code sebagai bukti pendaftaran
- 📊 Panel admin untuk melihat daftar peserta
- ✅ Check-in kehadiran peserta
- 🏷️ Pengelompokan WhatsApp berdasarkan gender (ikhwan/akhwat)

## Teknologi yang Digunakan

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Bahasa**: TypeScript

## Cara Setup

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```
3. Salin file `.env.example` menjadi `.env` dan isi variabel lingkungan:
   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   APP_SECRET="secret-kamu-yang-panjang"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="password-admin"
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
5. Push schema ke database:
   ```bash
   npx prisma db push
   ```
6. Jalankan seed untuk mengisi data awal:
   ```bash
   npm run db:seed
   ```
7. Jalankan development server:
   ```bash
   npm run dev
   ```
8. Buka http://localhost:3000 di browser

## Akses Admin

- URL: http://localhost:3000/admin/login
- Gunakan username dan password yang ada di file `.env`

## Struktur Folder

```
event_masjid/
├── prisma/              # Konfigurasi Prisma dan seed
├── src/
│   ├── app/             # Halaman dan route API (App Router)
│   ├── components/      # Komponen React
│   └── lib/             # Utility dan helper
├── .env.example         # Contoh variabel lingkungan
└── package.json         # Dependensi dan script
```

## Script yang Tersedia

- `npm run dev`: Jalankan development server
- `npm run build`: Build untuk production
- `npm start`: Jalankan production server
- `npm run lint`: Cek kode dengan ESLint
- `npm run db:push`: Push schema ke database
- `npm run db:seed`: Isi data awal ke database

## Lisensi

MIT
