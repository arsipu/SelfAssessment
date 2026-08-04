# Task: Samakan Desain & Style HollandForm.vue dengan LikertForm.vue

## Tujuan

Mengubah tampilan `src/pages/holland/HollandForm.vue` agar desain & style-nya **mirip** dengan `src/pages/likert/LikertForm.vue`, **tanpa mengubah fungsionalitas/logika** Holland (field berbeda, state `preparing`, `loadError`, `computedAge`, label tombol dinamis, alur redirect, dsb).

## Referensi Style LikertForm.vue (Target)

Class-class kunci yang dipakai LikertForm:

| Elemen                          | Class LikertForm                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Container card                  | `bg-surface card rounded-2xl overflow-hidden`                                                                                                                      |
| Header card (judul + deskripsi) | `card-title p-6` (background primary, teks putih, border bawah)                                                                                                    |
| Label form                      | `text-sm font-semibold text-black`                                                                                                                                 |
| Input                           | `px-3 py-2.5 border border-border-primary rounded-lg text-sm bg-surface focus:outline-none focus:border-primary focus:bg-surface transition`                       |
| Radio label                     | `flex items-center gap-2 text-sm text-black cursor-pointer`                                                                                                        |
| Tombol submit                   | `w-full mt-2 py-3 btn-primary text-sm font-semibold rounded-xl transition active:scale-[0.98] cursor-pointer` + `disabled:opacity-50 disabled:pointer-events-none` |

## Perbedaan Saat Ini (HollandForm vs LikertForm)

| Aspek          | HollandForm (sekarang)                                                                | LikertForm (target)                                                                           |
| -------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Container card | `border border-border rounded-2xl p-5 sm:p-8 shadow-sm`                               | `bg-surface card rounded-2xl overflow-hidden` (tanpa padding luar, tanpa shadow)              |
| Header         | `<div class="mb-5 sm:mb-6">` terpisah, teks `text-text-primary`/`text-text-secondary` | `<div class="card-title p-6">` menyatu, background primary + teks putih                       |
| Label          | `text-text-primary`                                                                   | `text-black` (`#262625`)                                                                      |
| Input          | `bg-surface-muted` + `border-border`                                                  | `bg-surface` + `border-border-primary`                                                        |
| Tombol submit  | `bg-primary text-text-on-primary ... hover:bg-primary-hover`                          | `btn-primary` (border 1.5px `#262625`, radius 20px dari CSS, tetapi di-override `rounded-xl`) |

## Rencana Perubahan (Hanya Template/Class, Logika Tetap)

### 1. Container card

- Hapus: `border border-border rounded-2xl p-5 sm:p-8 shadow-sm`
- Ganti: `bg-surface card rounded-2xl overflow-hidden`
- Tambahkan `p-6` / `sm:p-6` bila perlu di dalam form (karena padding card dihilangkan) — ikuti struktur LikertForm di mana form pakai `p-6`.

### 2. Header judul + deskripsi

- Gabungkan `<h1>` dan `<p>` ke dalam satu div dengan class `card-title p-6` (bukan div terpisah).
- Hapus class `text-text-primary` / `text-text-secondary` pada h1/p (karena `card-title` sudah memberi background primary + teks putih).
- Pertahankan ukuran teks: `text-xl sm:text-2xl font-bold` (h1), `text-xs sm:text-sm mt-1` (p).

### 3. Label form

- Ganti semua `text-text-primary` pada `<label>` menjadi `text-black`.
- Struktur label tetap memakai `text-sm font-semibold` + `<span class="text-danger">*</span>` untuk field wajib.

### 4. Input & radio

- Ganti `bg-surface-muted` → `bg-surface` pada semua input.
- Ganti `border-border` → `border-border-primary` pada semua input.
- Radio label: `text-text-primary` → `text-black`.

### 5. Tombol submit

- Ganti class tombol menjadi seperti LikertForm:
  ```
  w-full mt-2 py-3 btn-primary text-sm font-semibold rounded-xl transition
  active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
  ```
- **Pertahankan**: `:disabled="submitting || preparing"` dan label dinamis `{{ submitButtonLabel }}` (Menyimpan... / Menyiapkan soal... / Lanjut ke Kuesioner →) — fungsionalitas tidak berubah.

### 6. Pesan error (`loadError`)

- Tetap tampilkan `<p v-if="loadError" class="text-xs text-danger">{{ loadError }}</p>` — letakkan di atas tombol submit, sesuai posisi saat ini.

## Yang TIDAK Diubah

- Semua logika `<script setup>` Holland (store, `preparing`, `loadError`, `computedAge`, `formatBirthDateAge`, `prepareQuestions`, `onMounted`, `goToKuesioner`).
- Field & urutan field Holland (Nama, Jurusan, Sekolah/Universitas, Jenis Kelamin, Tanggal Lahir, Pekerjaan, Tanggal Tes, Tujuan Tes) — tetap sesuai kebutuhan data Holland.
- Nama store, route, session, dsb.

## Verifikasi

1. Buka halaman form Holland (via route `/tes-holland/:slug` atau sesuai router) — pastikan tampilan header card, input, dan tombol mirip LikertForm.
2. Pastikan Tombol submit tetap disable saat `preparing` dan menampilkan label dinamis.
3. Pastikan error `loadError` tetap muncul jika soal belum tersedia.
4. Pastikan alur submit & redirect ke `holland-questions` tetap berjalan normal.
