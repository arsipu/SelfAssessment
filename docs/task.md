# Task: Samakan Tampilan HollandResult.vue dengan LikertResult.vue

## Tujuan

Mengubah **tampilan** halaman `src/pages/holland/HollandResult.vue` agar konsisten dengan
halaman `src/pages/likert/LikertResult.vue` (gaya khas Likert: teks hitam `#262625`,
card putih dengan border `#262625`, tombol `btn-primary`, box kode polos, dan aturan print
A4 18mm).

> ⚠️ **Batasan:** JANGAN mengubah logic / business logic. `<script setup>` (store,
> fetch data, computed, router, watcher, handler print) dipertahankan **100%**.
> Perubahan hanya pada `<template>` (class/struktur styling) dan `<style>`.

---

## Lingkup Perubahan

### A. Template

| #   | Bagian                         | Dari (Holland sekarang)                                         | Menjadi (meniru Likert)                                                                                           |
| --- | ------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Warna teks umum                | `text-text-primary` / `text-text-secondary` / `text-text-muted` | `text-black` (`#262625`) / `text-black-secondary` (`#636362`)                                                     |
| 2   | Card rapor                     | `bg-surface border border-border`                               | `card border border-border` (class global `.card`: bg putih + border `#262625`) + tambah `print:p-8`              |
| 3   | Kop                            | Subtitle "Laporan hasil tes" (uppercase)                        | "Hai, Berikut Hasil dari :" (tanpa uppercase), judul tetap "Minat karier RIASEC"                                  |
| 4   | Box kode tracking              | `bg-primary-soft border border-primary/20`                      | Polos (tanpa bg/border), tombol Salin jadi plain `text-black`                                                     |
| 5   | Label & value data responden   | Token tema                                                      | `text-black-secondary` (label) & `text-black` (value)                                                             |
| 6   | Ringkasan (hex chart)          | `p-5 md:p-6`                                                    | `p-5 md:p-8` (sama seperti section ringkasan Likert)                                                              |
| 7   | Ikon chevron "Rincian jawaban" | SVG manual + `rotate-180`                                       | `<font-awesome-icon>` `fa-chevron-down` + `fa-rotate-180`, tombol diberi `print:hidden`                           |
| 8   | Tombol aksi bawah              | `border-border` + `bg-primary`                                  | `border-black-secondary` + `btn-primary`                                                                          |
| 9   | Modal PDF                      | `p-4 md:p-6` + `flex-col-reverse`                               | `p-6` + `max-h-[90vh] overflow-y-auto` + `flex gap-3`, teks modal "Rekap jawaban akan diunduh dalam format .pdf." |

### B. Style

1. **Hapus** seluruh aturan `<style scoped>` print lama (pendekatan `position: absolute`).
   Pertahankan hanya `.avoid-break`.
2. **Tambah** `<style>` global (tidak scoped) berisi aturan print ala Likert:
   - `@page { size: A4 portrait; margin: 18mm }`
   - `body * { visibility: hidden }`, `.print-area, .print-area * { visibility: visible }`
   - Hapus margin/padding kontainer (`.min-h-screen`, `.max-w-3xl`, `.space-y-6`)
   - `.print-area { overflow: visible }` agar tidak terpotong antar halaman
   - Hilangkan semua border & shadow saat print (menembus komponen child)

   Catatan: selector kontainer disesuaikan `max-w-2xl` → `max-w-3xl` karena Holland
   memakai kontainer lebih lebar.

### C. Yang Tidak Diubah

- `<script setup>` — semua logic dipertahankan apa adanya
- Komponen child Holland (RiasecSummaryHeader, RiasecScoreBreakdown, RiasecNotes,
  RiasecAnswerDetails)
- Data/isi (nama, skor, RIASEC, catatan) tidak berubah

---

## File yang Diubah

- `src/pages/holland/HollandResult.vue`
- `docs/task.md` (file rencana ini)

## Verifikasi

- Buka hasil Holland (submit tes atau `?code=...`) → pastikan tampilan mengikuti gaya Likert
- Uji fitur "Unduh PDF" / Ctrl+P → hasil print A4, tanpa border, konten tidak terpotong
- Pastikan tombol Salin, expand rincian jawaban, dan navigasi tetap berfungsi
