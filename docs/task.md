# Task: Refactoring Desain AdminHollandQuestions agar Selaras dengan AdminLikertQuestions

**File yang diubah:** `src/pages/admin/holland/AdminHollandQuestions.vue`
**Acuan desain:** `src/pages/admin/likert/AdminLikertQuestions.vue`

## Tujuan

Menyelaraskan desain halaman **AdminHollandQuestions** agar mengikuti pola desain **AdminLikertQuestions**. Fokus utama: bagian **tiap kolom pernyataan** yang saat ini berbentuk **card/grid** diubah menjadi **table** (mengikuti pola tabel soal kategori di Likert).

---

## Rencana Perubahan

### 1. Breadcrumb

**Kondisi saat ini (Holland):**

- Teks breadcrumb: `Holland RIASEC / Pertanyaan`

**Perubahan (mengikuti pola Likert):**

- Tampilkan nama instrumen Holland pada breadcrumb alih-alih teks statis "Pertanyaan":
  - Teks akhir: `Holland RIASEC / {nama instrumen}`
  - Tambahkan `truncate max-w-[200px] md:max-w-none` pada span nama instrumen.
  - Ganti teks "Pertanyaan" → `{{ hollandName }}` (perlu state `hollandName` yang diisi dari hasil `getHollandBySlug`).

### 2. Header

**Kondisi saat ini (Holland):**

- Header card berisi judul "Kelola Pertanyaan RIASEC", deskripsi, dan tombol "Lihat Submissions" di dalam card.

**Perubahan (mengikuti pola Likert):**

- Pertahankan card header `bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6`.
- Judul: ganti menjadi nama instrumen → `{{ hollandName ?? "Memuat..." }}` (mengikuti pola `currentLikert?.name` di Likert).
- Deskripsi: gunakan deskripsi instrumen → `{{ hollandDescription }}` (optional, jika tersedia di data store).
- Tambahkan baris teks bantu `text-xs text-text-muted mt-1` (mengikuti pola Likert), contoh: "Kelola pertanyaan di setiap kolom RIASEC."
- Hapus tombol "Lihat Submissions" dari dalam header (dipindah ke baris aksi terpisah, lihat poin 3).

### 3. Tombol Aksi "Lihat Submissions"

**Kondisi saat ini (Holland):**

- Tombol "Lihat Submissions" di dalam card header.

**Perubahan (mengikuti pola Likert):**

- Pindahkan tombol ke baris aksi terpisah di atas konten, rata kanan:
  ```
  <div class="flex flex-wrap justify-end gap-2 mb-4 md:mb-6">
    <button ...>Lihat Submissions</button>
  </div>
  ```
- Ganti styling mengikuti tombol "Lihat Submissions" di Likert:
  - Class: `inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium bg-primary rounded-sm border border-black secondary text-white hover:bg-primary/80 transition-colors whitespace-nowrap h-10 cursor-pointer`
  - Ikon `fa-solid fa-right-to-bracket` tetap.

### 4. Loading State

**Perubahan:**

- Tetap menggunakan card loading `bg-surface border border-border rounded-xl p-8 md:p-12 text-center`, sesuaikan padding ke `p-8 md:p-12` (mengikuti Likert).

### 5. Konten per Kategori — Konversi Card → Table (FOKUS UTAMA)

**Kondisi saat ini (Holland):**

- Setiap kategori RIASEC dirender sebagai card:
  - Header kategori: `bg-surface-muted` dengan judul + badge jumlah soal + tombol aksi (tambah kolom, edit kategori).
  - Isi: grid/flex kolom, di mana **setiap kolom adalah card** (`border rounded-lg`) berisi:
    - Column header
    - Daftar pertanyaan
    - Inline add form / tombol "Tambah Pernyataan"

**Perubahan (mengikuti pola tabel kategori di Likert — `table-content`):**

#### a. Card Kategori → `table-content`

- Ganti class card kategori dari `bg-surface border border-border rounded-xl overflow-hidden` menjadi `table-content` (class yang dipakai Likert pada daftar kategori).

#### b. Header Kategori → `table-header`

- Ganti stlyling header kategori menjadi mengikuti pola Likert (`table-header`):
  - Class: `table-header px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2`
  - Background jadi `bg-primary`, teks judul jadi `text-white`.
- Ganti badge "{{ n }} Soal" menjadi tombol/teks putih `text-white` (atau pertahankan logika jumlah soal, tapi style disesuaikan).
- Ubah tombol ikon (tambah kolom, edit kategori) menjadi tombol teks putih bertulisan, mengikuti pola tombol di header kategori Likert:
  - Tombol ikon `fa-table-columns` → tombol teks "Tambah Kolom" berstyle `text-white border border-border`.
  - Tombol ikon `fa-pen` → tombol teks "Edit" berstyle `text-white border border-border`.

#### c. Kolom (card → table)

- **Hapus** layout grid/flex kolom (`flex flex-col lg:grid`).
- **Ubah** setiap kolom dari **card** menjadi **table** (inilah fokus utama):
  ```
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse table-fixed">
      <thead class="border-b border-black-secondary">
        <tr>
          <th class="w-[8%]">No</th>
          <th class="w-[68%]">Nama Kolom</th>        <!-- header kolom -->
          <th class="w-[24%]">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        <tr v-for="(q, index) in questionsByRiasecAndColumn(cat.id, col.id)" :key="q.id">
          <td>{{ index + 1 }}</td>
          <td>{{ q.question }}</td>
          <td> <!-- tombol edit/hapus soal --> </td>
        </tr>
        <!-- Empty state -->
        <tr v-if="questionsByRiasecAndColumn(cat.id, col.id).length === 0">
          <td colspan="3" class="text-center py-6 text-text-muted">Belum ada pernyataan di kolom ini.</td>
        </tr>
      </tbody>
    </table>
  </div>
  ```
- **Judul kolom:** Letakkan nama kolom di dalam `thead` (bukan header card). Jika ingin lebih jelas, gunakan `colspan` dinamis atau tetap satu baris header dengan nama kolom sebagai label.
  - Alternatif: tampilkan nama kolom pada baris `thead` sebagai `<th>` teks biasa, atau tambahkan sub-header di atas tabel kolom dengan nama kolom (style `bg-primary`).
  - **Keputusan desain disarankan:** Pisahkan setiap kolom menjadi blok tabel sendiri di dalam kategori, dengan:
    - Sub-header kolom: baris kecil bertuliskan `{{ col.name }}` style `bg-primary-soft text-text-primary font-medium`.
    - Tabel: header `No | Pernyataan | Aksi`, tbody berisi pertanyaan.
- **Ke atas setiap tabel kolom**: pertahankan tombol aksi kolom (Edit & Hapus kolom) dan inline add, tetapi tampilkan dalam format tombol teks/table-friendly mengikuti Likert.

#### d. Inline Add Form

- Pertahankan logika inline add (`openInlineAdd`, `saveInline`, `cancelInline`).
- Tambahkan tombol "Tambah Pernyataan" dengan style mengikuti pola tombol kecil Likert:
  - Class: `inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-muted transition-colors whitespace-nowrap cursor-pointer`
  - Letakkan di bawah tabel kolom (rata kanan atau kiri).

#### e. Empty State Kategori (tanpa kolom)

- Pertahankan empty state "Kategori ini belum punya kolom pernyataan." dengan tombol "Tambah Kolom Pertama", namun samakan style tombol dengan tombol kecil Likert (outline).

### 6. Modal Edit Soal

**Perubahan (mengikuti pola modal Likert):**

- Header modal: ganti `border-b border-border` → tetap, samakan dengan gaya Likert (banyak modal Likert memakai `border-t border-border` di footer tanpa border header).
- Judul modal: `text-text-primary` tetap.
- Label form: `text-text-primary` tetap.
- Input/select/textarea: `border-border` tetap (konsisten dengan modal Likert).
- Footer modal: samakan `px-6 py-4 border-t border-border flex justify-end gap-3` (hapus `bg-surface` jika mengikuti Likert).
- Tombol Batal: `px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm cursor-pointer`.
- Tombol Simpan: `px-4 py-2 bg-primary text-text-on-primary rounded-lg hover:bg-primary-hover text-sm disabled:opacity-60 cursor-pointer`.
- Field kategori & kolom tetap dipertahankan.

### 7. Modal Edit Kategori RIASEC (deskripsi & rekomendasi)

**Perubahan:**

- Ikuti pola modal yang sama (footer `border-t border-border flex justify-end gap-3`, button style disamakan dengan poin 6).
- Konten (kode, label, deskripsi, keterampilan, pekerjaan, subjek) tetap dipertahankan.

### 8. Modal Tambah/Edit Kolom

**Perubahan:**

- Judul modal `text-text-primary` tetap.
- Input/select `border-border` tetap.
- Footer & tombol disamakan dengan pola poin 6.

### 9. Alert Maksimal 4 Kolom

**Perubahan:**

- Pertahankan struktur alert, samakan tombol "Mengerti" dengan style tombol Batal (outline) di poin 6.

### 10. Modal Hapus (Soal & Kolom)

**Perubahan:**

- Pertahankan penggunaan `ConfirmDeleteModal`, hanya pastikan konsisten dengan halaman lain (tidak ada perubahan besar).

### 11. Script (`<script setup>`)

**Catatan:**

- Tidak ada perubahan logika utama.
- Tambah state `hollandName` (dan opsional `hollandDescription`) yang diisi saat `getHollandBySlug` berhasil.
- Semua fungsi CRUD, inline add, kolom, kategori, dan hapus tetap dipertahankan.
- Opsional: samakan gaya penulisan (indentasi tab, tanda kutip ganda) mengikuti Likert.

---

## Langkah Implementasi

1. Edit `src/pages/admin/holland/AdminHollandQuestions.vue`:
   - Breadcrumb: tampilkan nama instrumen.
   - Header: tampilkan judul & deskripsi instrumen, pindahkan tombol "Lihat Submissions" ke baris aksi terpisah.
   - **Konversi bagian tiap kolom dari card/grid menjadi table** (fokus utama): setiap kolom dirender sebagai tabel dengan header `No | Pernyataan | Aksi`, mengikuti pola tabel kategori di Likert.
   - Sesuaikan header kategori menjadi `table-header` (bg-primary, teks putih).
   - Sesuaikan semua modal (footer, tombol, style) mengikuti pola modal Likert.
2. Verifikasi hasil di browser (mode admin, halaman Pertanyaan Holland RIASEC).

---

## Catatan

- Perubahan bersifat tata letak (layout) dan styling saja.
- Logika CRUD (pertanyaan, kolom, kategori RIASEC), inline add, dan batas maksimal 4 kolom tidak diubah.
- Fokus utama: bagian **tiap kolom** yang tadinya **card** diubah menjadi **table**.
- Field khusus Holland (kode RIASEC, skills, careers, subjects pada modal edit kategori) tetap dipertahankan.
