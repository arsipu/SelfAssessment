# Rencana: Samakan Desain HollandQuestions.vue dengan LikertQuestions.vue

## Tujuan

Mengubah tampilan/desain halaman `src/pages/holland/HollandQuestions.vue` agar **mirip** dengan `src/pages/likert/LikertQuestions.vue`.

> Hanya perubahan desain/tampilan (template + class styling). **Tidak ada perubahan** pada logika `script setup`, alur sesi, penyimpanan jawaban, maupun struktur data.

---

## Analisis Perbedaan Desain Saat Ini

| Aspek             | LikertQuestions.vue (acuan)                                  | HollandQuestions.vue (sekarang)                                        |
| ----------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- | --- |
| Tombol kembali    | Ada ("Kembali" + icon panah)                                 | Tidak ada                                                              |
| Container utama   | Card `bg-surface card rounded-2xl overflow-hidden`           | Tanpa card, konten langsung di halaman                                 |
| Judul             | `card-title p-6 text-center` → nama + deskripsi instrumen    | Header teks biasa ("Holland RIASEC")                                   |     |
| Bagian kategori   | Tanpa kotak border, hanya label section                      | Kotak border `border rounded-xl p-4 bg-surface` + dot warna            |
| Item pertanyaan   | Nomor + teks pertanyaan, opsi polos di bawahnya              | Kotak label checkbox `border rounded-lg p-2.5`, highlight saat dipilih |
| Gaya opsi/jawaban | Radio polos `flex items-center gap-2` + input kecil          | Checkbox dalam kotak ber-border                                        |
| Area submit       | Teks sisa soal + tombol `btn-primary` lebar penuh (`w-full`) | Teks jumlah dipilih + tombol `sm:w-auto`                               |
| Modal konfirmasi  | Ada                                                          | Ada (sudah hampir sama)                                                |

---

## Rencana Perubahan (Template HollandQuestions.vue)

### 1. Tombol Kembali (baru)

- Tambahkan tombol "Kembali" di atas card, persis seperti Likert:
  - `<button @click="$router.push('/')">` dengan icon `fa-solid fa-arrow-left` + teks "Kembali"
  - Class: `flex items-center gap-2 text-sm text-text-secondary mb-5 sm:mb-6 cursor-pointer`

### 2. Card Container (ubah)

- Bungkus seluruh konten kuis dalam:
  - `<div class="bg-surface card rounded-2xl overflow-hidden">`

### 3. Header Card — `card-title` (ubah)

- Ganti blok header teks biasa dengan header ala Likert:
  - Judul: `{{ hollandStore.currentHolland?.name }}` — class `text-xl sm:text-2xl font-semi-bold`
  - Deskripsi: `{{ hollandStore.currentHolland?.description }}` — class `text-xs sm:text-sm mt-1`
  - Wrapper: `card-title p-6 text-center`
- `hollandStore.currentHolland` sudah tersedia & punya field `name` dan `description` (terverifikasi di `src/stores/holland/holland.js`).

### 4. Padding Konten (ubah)

- Konten di dalam card memakai `p-3 md:p-6` (sama seperti Likert).

### 6. Bagian Kategori / Section (ubah styling)

- **Hapus** kotak border luar (`border border-border rounded-xl p-4 md:p-5 bg-surface`).
- Header section disamakan dengan Likert:
  - `<div class="flex items-center gap-3 mb-3">`
  - Label: `text-sm md:text-md font-medium text-black` → `{{ section.label }} <span class="text-xs text-text-muted">({{ section.code }})</span>`
  - **Hapus dot warna** (penanda lingkaran `w-2.5 h-2.5`) agar konsisten dengan Likert. (Variabel `dotColors` di script boleh dibiarkan, tinggal tak dipakai, atau dirapikan saat implementasi.)
- **Pertahankan** layout kolom dinamis (grid `repeat(columns.length, ...)`) karena ini kebutuhan fungsional Holland (kolom per kategori dari Firestore).

### 7. Item Pertanyaan (ubah styling — bagian terbesar)

- **Hapus** kotak label checkbox ber-border (`bg-surface border rounded-lg p-2.5 hover:border-primary`).
- Ganti dengan gaya pertanyaan ala Likert:
  - Wrapper per pertanyaan: `rounded-xl p-1 md:p-4` + header `flex items-start gap-3 mb-3`
  - Nomor: `text-xs md:text-sm font-medium text-black w-2 md:w-6 shrink-0` (index dalam kolom: `colIndex`/indeks pertanyaan + 1)
  - Teks pertanyaan: `text-xs md:text-sm text-black`
- Opsi/jawaban di bawah pertanyaan (dalam baris/kolom sesuai layout kolom):
  - Label checkbox: `flex items-center gap-2 text-xs md:text-sm text-black cursor-pointer`
  - Input checkbox: `w-3 md:w-4 h-3 md:h-4 accent-primary` (tetap `type="checkbox"`, fungsi `isChecked`/`toggleAnswer` dipertahankan)
  - Indikator terpilih dibuat minimal agar tetap terlihat: misalnya warna teks `text-primary` atau `font-medium` saat dicentang (bukan kotak border).

### 8. Label Kolom (pertahankan, rapikan)

- Label nama kolom (`col.label`) tetap tampil sebagai sub-header per kolom:
  - `text-xs font-semibold text-text-secondary mb-2` (dipertahankan).

### 9. Area Submit (ubah, samakan dengan Likert)

- Ganti menjadi:
  - Wrapper: `mt-8 flex flex-col items-left justify-between gap-3` (tanpa `sm:flex-row`)
  - Tombol: `w-full px-6 py-2.5 h-10 btn-primary text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer` (lebar penuh `w-full`)

### 10. Modal Konfirmasi (pertahankan)

- Struktur modal sudah mirip dengan Likert; cukup dipertahankan apa adanya (kecil kemungkinan ada penyesuaian minor, mis. konsistensi wording).

---

## Yang TIDAK Diubah

- Seluruh `script setup` (state, computed, watch, fungsi `toggleAnswer`, `buildAnswers`, `handleSubmit`, dll.)
- Alur sesi & restore jawaban (`checkedMap` dari `session.answers`)
- Layout kolom dinamis per kategori (grid) — kebutuhan fungsional Holland
- Tipe jawaban tetap **checkbox multi-pilih** (bukan radio)
- `progressPct` / `answeredCount` / `sections` computed — hanya dipakai ulang di template

## Catatan Implementasi

- `progressPct` dan `answeredCount` sudah tersedia di script, tinggal dipakai di template.
- `hollandStore.currentHolland` tersedia dan memiliki `name` & `description`.
- Font-awesome sudah dipakai di Likert, jadi aman digunakan untuk icon panah.
- Setelah edit, verifikasi: halaman tetap berfungsi (restore jawaban, centang/uncentang, submit, modal) — hanya tampilan yang berubah.
