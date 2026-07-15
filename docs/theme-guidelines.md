# Tailwind Custom Theme Guidelines

Proyek ini menggunakan Tailwind CSS v4 dengan sistem warna kustom yang didefinisikan melalui `@theme` di `main.css`.
Saat melakukan refactor atau membuat komponen baru, DILARANG menggunakan warna bawaan Tailwind (seperti `bg-white`, `text-gray-900`, `bg-green-500`, `bg-blue-600`, `bg-purple-100`) atau *hardcoded hex color* di class/style manapun.

Gunakan kelas warna semantik berikut:

## 1. Background & Surface
- `bg-bg`: Background utama aplikasi / body (Krem sangat terang - `#feffed`).
- `bg-surface`: Background untuk card, modal, dropdown, atau container putih (`#ffffff`).
- `bg-surface-muted`: Background alternatif untuk elemen yang sedikit ditekankan — dipakai untuk input field, row hover di tabel, background badge netral (`#f7f6ee`).
- `border-border`: Warna untuk SEMUA garis tepi / border / divider (`#e8e6d9`).

## 2. Typography (Text)
- `text-text-primary`: Teks utama / judul / heading (`#1c1b16`).
- `text-text-secondary`: Teks paragraf / deskripsi / label form (`#6b6a5f`).
- `text-text-muted`: Teks disabled / placeholder / keterangan kecil / eyebrow text (`#9a988a`).
- `text-text-on-primary`: Teks/icon putih yang duduk DI ATAS background gelap (`bg-primary`, `bg-instrument`, atau warna solid gelap lain) — SELALU pakai token ini, JANGAN `text-white` langsung (`#ffffff`).

## 3. Brand & Primary Action
Dipakai untuk navigasi umum (topbar, sidebar), tombol aksi utama (submit, login, CTA), dan elemen chrome yang TIDAK spesifik ke instrumen tertentu.
- `bg-primary`, `text-primary`, `border-primary`: Warna utama aplikasi (Hijau tua - `#2d6a4f`).
- `bg-primary-hover`: Efek hover untuk tombol/link primary (`#1f4d3a`).
- `bg-primary-soft`: Background tipis untuk hover state nav link, highlight ringan, active state (`#e3ede7`).

## 4. Instrumen (Likert & Holland — SATU tema, bukan dibedain per jenis)
Likert dan Holland TIDAK punya warna terpisah. Keduanya sama-sama pakai token `instrument` ini. JANGAN buat percabangan warna berdasarkan tipe instrumen (`v-if type === 'holland' ? ... : ...` untuk warna) — kalau nemu pattern itu di kode lama, hapus percabangannya, ganti jadi 1 class tetap.
- `bg-instrument`, `text-instrument`, `border-instrument`: Warna aksen instrumen (Tone Clay/Terracotta - `#a8623f`).
- `bg-instrument-hover`: Efek hover (`#8a4f32`).
- `bg-instrument-soft`: Background tipis untuk badge/tag/highlight terkait instrumen (`#f3e7df`).

Dipakai untuk: badge tag "Likert"/"RIASEC" di kartu instrumen, tombol submit kuesioner, progress bar pengisian soal, radio/checkbox accent di form Likert/Holland, border card instrumen saat hover.

## 5. Semantic / Status
Dipakai KHUSUS untuk status sistem (active/inactive, sukses/gagal, validasi form). JANGAN dipakai untuk kebutuhan dekoratif/kategorikal lain.
- **Success**: `bg-success`, `text-success`, `bg-success-soft` (Hijau — status active, submission completed, validasi sukses).
- **Warning**: `bg-warning`, `text-warning`, `bg-warning-soft` (Emas/Kuning — status inactive, submission in_progress).
- **Danger**: `bg-danger`, `text-danger`, `border-danger`, `bg-danger-soft` (Merah — error, delete action, field wajib `*`).

## 6. Categorical / Data-viz (dot indicator, chart, legend banyak warna)
Dipakai KHUSUS untuk elemen yang butuh banyak warna berbeda demi keterbacaan (misal dot indikator kategori Likert yang jumlahnya dinamis, chart legend). BUKAN token semantik — jangan diasosiasikan dengan makna tertentu (sukses/gagal/dst).
- `--color-viz-1` s.d. `--color-viz-6`: dipakai via inline style `background-color: var(--color-viz-1)` (karena jumlah kategori dinamis dan warnanya di-assign berdasarkan index, bukan lewat nama class Tailwind statis). Loop pakai modulo kalau kategori lebih dari 6: `dotColors[index % dotColors.length]`.

## 7. Level Scale (5 tingkat skor Likert: Sangat Rendah → Sangat Tinggi)
Dipakai KHUSUS untuk badge/label level hasil skor Likert 5-tingkat. BUKAN pengganti token status di poin 5 — ini legend performa, bukan status sistem.
- `--color-level-1` / `--color-level-1-soft`: Sangat Rendah (merah)
- `--color-level-2` / `--color-level-2-soft`: Rendah (clay)
- `--color-level-3` / `--color-level-3-soft`: Sedang (emas)
- `--color-level-4` / `--color-level-4-soft`: Tinggi (teal)
- `--color-level-5` / `--color-level-5-soft`: Sangat Tinggi (hijau)
- Sama seperti poin 6, dipakai via inline style/`var()` karena mapping label→warna ditentukan dinamis dari data Firestore, bukan class Tailwind statis.

## 8. Sidebar / Navigasi Admin
Sidebar BUKAN elemen spesifik instrumen, jadi JANGAN pakai token `instrument`. Gunakan kombinasi neutral + primary:
- Background sidebar: `bg-surface`
- Border pemisah: `border-border`
- Link nav default: `text-text-secondary`
- Link nav hover: `hover:bg-primary-soft hover:text-text-primary`
- Link nav aktif (halaman terbuka): `bg-primary-soft text-primary` (atau `bg-primary text-text-on-primary` kalau mau gaya solid, pilih salah satu dan konsisten di semua link aktif)
- Section label/divider (mis. "MANAJEMEN", "INSTRUMEN"): `text-text-muted`, uppercase, ukuran kecil

## Contoh Implementasi Kelas Tailwind
- Text: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- Background: `bg-bg`, `bg-surface`, `bg-surface-muted`, `bg-primary`, `bg-instrument`
- Border: `border-border`, `border-primary`, `border-instrument`, `border-danger`
- Hover state: `hover:bg-primary-hover`, `hover:bg-instrument-hover`, `hover:border-primary`
- Teks di atas background gelap: `text-text-on-primary` (JANGAN `text-white`)

## Larangan Eksplisit
- JANGAN gunakan `text-white`, `bg-white`, `text-black`, `bg-black` (kecuali untuk overlay modal seperti `bg-black/40`, itu terkecuali karena bukan warna tema).
- JANGAN gunakan skala warna default Tailwind (`gray-*`, `blue-*`, `purple-*`, `green-*`, `red-*`, `amber-*`, `rose-*`, `teal-*`, `emerald-*`, `orange-*`, dst) di manapun.
- JANGAN buat token warna baru tanpa konfirmasi — kalau ada kebutuhan warna yang belum ke-cover panduan ini, tanyakan dulu sebelum menambah `@theme` baru di `main.css`.
- JANGAN bedakan warna Likert vs Holland — keduanya pakai `instrument` yang sama.