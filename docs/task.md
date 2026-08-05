# Task: Ubah `RiasecAnswerDetails.vue` menjadi format tabel seperti `HollandQuestions.vue`

## Latar Belakang

Komponen `RiasecAnswerDetails.vue` saat ini menampilkan rincian jawaban RIASEC dalam bentuk **kartu per kolom** (layout grid dengan border per item jawaban). Tujuannya adalah mengubah tampilan tersebut menjadi **format tabel** seperti yang digunakan di `HollandQuestions.vue`, agar lebih ringkas, rapi, dan konsisten dengan halaman kuesioner.

## Penggunaan Komponen Saat Ini

Komponen dipakai di **2 tempat**:

1. **`src/pages/holland/HollandResult.vue`** (baris 155-159)
   - Props: `detail-sections`, `answered-ids`, `bare`
   - Mode: `bare` (tanpa wrapper/title/toggle)
   - Konteks: collapsible di dalam card hasil, bisa di-print (PDF)

2. **`src/pages/admin/holland/AdminHollandSubmissionDetail.vue`** (baris 133-139)
   - Props: `detail-sections`, `answered-ids`, `bare`, `avoid-break`, `unanswered-class`
   - Mode: `bare` (selalu expanded)
   - Konteks: detail submission admin, bisa di-print (PDF)

Kedua pemanggil **hanya menggunakan mode `bare`**. Mode `card` (legacy) tidak dipakai oleh pemanggil mana pun saat ini, tetapi tetap dipertahankan untuk kompatibilitas.

## Struktur Data

- `detailSections`: array of sections, masing-masing berisi:
  - `key`, `code`, `label`, `dot` (warna)
  - `columns`: array of columns, masing-masing berisi:
    - `key`, `label`
    - `questions`: array of questions, masing-masing berisi `id` dan `question`
- `answeredIds`: `Set` berisi `questionId` yang dijawab (isChecked = true)

## Rencana Perubahan

### 1. Mode `bare` → Format Tabel (Perubahan Utama)

Ubah blok `v-if="bare"` agar menampilkan tabel per section, mengikuti pola `HollandQuestions.vue`:

**Struktur per section:**

- Header section: label + kode (pertahankan gaya saat ini)
- **Desktop (`md:block`)**: Tabel dengan:
  - `<thead>` berisi header kolom (label tiap column)
  - `<tbody>` berisi baris per indeks soal (seperti `Math.max(...section.columns.map(c => c.questions.length))`)
  - Setiap `<td>` berisi soal pada indeks tersebut (jika ada)
  - Gaya sel: centang (checkmark SVG) + teks soal
  - Warna sel: `border-primary bg-primary-soft` jika dijawab, `unansweredClass` jika tidak
- **Mobile (`md:hidden`)**: Daftar per kolom (seperti saat ini, atau mengikuti pola mobile `HollandQuestions.vue`)

**Perbedaan dengan `HollandQuestions.vue`:**

- Tidak ada checkbox input — diganti **ikon centang SVG** (karena ini tampilan hasil, bukan input)
- Tidak ada `@change`/`toggleAnswer` — murni read-only
- Warna sel dijawab: `border-primary bg-primary-soft` (mengikuti gaya saat ini)
- Warna sel tidak dijawab: `unansweredClass` (prop yang sudah ada)

### 2. Mode `card` (Legacy) → Tetap Dipertahankan

- Mode `card` tidak diubah (tetap layout grid seperti sekarang)
- Hanya mode `bare` yang diubah ke tabel
- Alasan: mode `card` tidak dipakai pemanggil mana pun, tapi dipertahankan agar tidak merusak kompatibilitas jika ada penggunaan lain di masa depan

### 3. Pertimbangan Print/PDF

- Kedua pemanggil mendukung print/PDF
- `HollandResult.vue` memiliki aturan print global yang menghilangkan border di dalam `.print-area` (termasuk tabel)
- `AdminHollandSubmissionDetail.vue` memiliki aturan print sendiri
- Pastikan tabel tetap terbaca saat print (border dihilangkan, tapi spacing antar baris tetap ada)
- Pertahankan prop `avoidBreak` untuk mencegah section terpotong antar halaman

### 4. Props yang Dipertahankan

Semua props tetap dipertahankan (tidak ada yang dihapus):

- `detailSections` (Array, required)
- `answeredIds` (Set, required)
- `collapsible` (Boolean, default false)
- `title` (String, default "Rincian jawaban")
- `noBg` (Boolean, default false)
- `unansweredClass` (String, default "border-border bg-surface-muted/40")
- `bare` (Boolean, default false)
- `avoidBreak` (Boolean, default false)

## Langkah Implementasi

1. **Buka `src/components/holland/RiasecAnswerDetails.vue`**
2. **Ubah blok `v-if="bare"`** (baris 3-55) menjadi format tabel:
   - Tambahkan blok desktop (`hidden md:block`) dengan `<table>` per section
   - Tambahkan blok mobile (`md:hidden`) dengan daftar per kolom
   - Gunakan ikon centang SVG (bukan checkbox input)
   - Terapkan `unansweredClass` untuk sel yang tidak dijawab
   - Terapkan `avoidBreak` pada section
3. **Pertahankan blok `v-else`** (mode card legacy) tanpa perubahan
4. **Verifikasi** di kedua pemanggil (`HollandResult.vue` dan `AdminHollandSubmissionDetail.vue`) bahwa tampilan tetap benar
5. **Uji print/PDF** untuk memastikan tabel tetap terbaca

## Catatan Tambahan

- Tidak perlu mengubah file pemanggil (`HollandResult.vue`, `AdminHollandSubmissionDetail.vue`) karena props yang dikirim sudah sesuai
- Tidak perlu mengubah `holland-result.js` (utils) karena struktur `detailSections` sudah sesuai
- Gaya visual mengikuti `HollandQuestions.vue` (border, padding, ukuran teks) agar konsisten
