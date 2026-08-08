# Task: Standarisasi Class Table Content & Update Style AdminLikertScales.vue

## Tujuan

1. Mengubah style tabel skala di `AdminLikertScales.vue` agar konsisten dengan style tabel skala di `AdminLikertQuestions.vue`.
2. Membuat class standar baru `table-content` di `src/assets/main.css` agar style tabel tidak perlu ditulis berulang-ulang di setiap halaman yang memakai tabel.

---

## Referensi Style Tabel Skala (AdminLikertQuestions.vue)

Style yang menjadi acuan (Card Skala Penilaian read-only):

| Elemen         | Class yang dipakai                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| Container card | `bg-surface border border-black-secondary rounded-xl overflow-hidden mb-4 md:mb-6`                                   |
| Header card    | `px-4 md:px-5 py-3 md:py-4 border-b bg-primary border-black-secondary` dengan judul `text-sm font-medium text-white` |
| Tabel          | `w-full text-left border-collapse table-fixed`                                                                       |
| thead          | `border-b border-black-secondary`                                                                                    |
| th             | `px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider`                                                     |
| tbody          | `divide-y divide-border`                                                                                             |
| td             | `px-4 md:px-5 py-3 text-sm text-table-value-text`                                                                    |

---

## Rencana Implementasi

### 1. `src/assets/main.css` — Tambah class standar `table-content`

Tambahkan class baru di dalam `@layer components`:

- **`.table-content`** (berlaku pada container card tabel):
  - `background-color: var(--color-surface)`
  - `border: 1px solid var(--color-border-primary)` (border-black-secondary / #262625)
  - `border-radius: 0.75rem` (rounded-xl)
  - `overflow: hidden`

- **`.table-content > .table-header`** (berlaku pada header card):
  - `background-color: var(--color-primary)`
  - `border-bottom: 1px solid var(--color-border-primary)`
  - `padding` responsive (px-4 md:px-5 py-3 md:py-4)
  - Judul di dalamnya: `font-size: 0.875rem; font-weight: 500; color: white`

- **`.table-content table`**:
  - `width: 100%`
  - `text-align: left`
  - `border-collapse: collapse`
  - `table-layout: fixed`

- **`.table-content thead`**:
  - `border-bottom: 1px solid var(--color-border-primary)`

- **`.table-content th`**:
  - `padding: 0.75rem 1rem` (md: 1.25rem)
  - `font-size: 0.75rem` (text-xs)
  - `font-weight: 500` (font-medium)
  - `text-transform: uppercase`
  - `letter-spacing: 0.05em` (tracking-wider)

- **`.table-content tbody`**:
  - `border-collapse: collapse`
  - Row separator: `border-bottom: 1px solid var(--color-border)`

- **`.table-content td`**:
  - `padding: 0.75rem 1rem` (md: 1.25rem)
  - `font-size: 0.875rem` (text-sm)
  - `color: var(--color-table-value-text)`

> Catatan: Lebar kolom (`w-[25%]`, `w-[35%]`, dst) tetap ditulis per-instance di template karena berbeda-beda tiap tabel. Class standar hanya menangani styling yang berulang (warna, padding, border, font).

---

### 2. `src/pages/admin/likert/AdminLikertScales.vue` — Update template

#### a. Container card tabel

- Ubah dari:
  ```
  class="bg-surface border border-border rounded-xl overflow-hidden mb-4 md:mb-6"
  ```
- Menjadi:
  ```
  class="table-content mb-4 md:mb-6"
  ```

#### b. Header card tabel

- Ubah dari:
  ```
  class="px-4 md:px-5 py-3 md:py-4 border-b border-border bg-surface-muted"
  <h2 class="text-sm font-medium text-text-primary">Skala Penilaian</h2>
  ```
- Menjadi:
  ```
  class="table-header px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
  <h2 class="text-sm font-medium text-white">Skala Penilaian</h2>
  ```

#### c. Tabel

- Ubah dari:
  ```
  <table class="app-table w-full text-left border-collapse table-fixed">
  ```
- Menjadi:
  ```
  <table class="w-full text-left border-collapse table-fixed">
  ```
  (karena styling sudah ditangani oleh `.table-content`)

#### d. thead

- Tambahkan class `border-b border-black-secondary` pada `<thead>`.
- Hapus class berulang pada `<th>` (padding, text-xs, uppercase, tracking) — cukup sisakan class lebar kolom:
  ```
  <thead class="border-b border-black-secondary">
    <tr>
      <th class="w-[25%]">Rentang</th>
      <th class="w-[30%]">Label</th>
      <th class="w-[30%]">Deskripsi</th>
      <th class="w-[15%]">Aksi</th>
    </tr>
  </thead>
  ```
  > Catatan: lebar kolom disesuaikan karena halaman Scales punya kolom tambahan "Aksi" (edit & hapus). Total harus 100%.

#### e. tbody & td

- Hapus class berulang pada `<td>` (padding, text-sm, text-table-value-text) — cukup:
  ```
  <tbody class="divide-y divide-border">
    <tr v-for="s in scales" :key="s.id">
      <td>{{ s.min }} – {{ s.max }}</td>
      ...
  ```

#### f. Area Inline Add Form

- Ubah border dari `border border-black-secondary` menjadi `border-t border-border` agar konsisten (bukan border penuh).

---

### 3. Verifikasi

- Pastikan tidak ada class lama yang tertinggal (`app-table`, `bg-surface-muted` di header card, dll).
- Pastikan style tabel di halaman lain tidak berubah (class `app-table` tetap dipertahankan untuk kompatibilitas).
- Jalankan dev server dan cek halaman:
  - `/admin/likert/{slug}/scales`
  - Pastikan header card berwarna primary dengan teks putih.
  - Pastikan border tabel menggunakan `border-black-secondary`.
  - Pastikan tombol aksi (edit/hapus) tetap berfungsi.

---

## File yang Diubah

| File                                           | Perubahan                                                                   |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `src/assets/main.css`                          | Tambah class `table-content`, `table-header`, dan styling tabel di dalamnya |
| `src/pages/admin/likert/AdminLikertScales.vue` | Ganti class template tabel dengan class standar `table-content`             |
