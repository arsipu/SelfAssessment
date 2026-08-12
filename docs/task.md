# Task: Penyesuaian Halaman Admin Likert Submissions

**File yang diubah:** `src/pages/admin/likert/AdminLikertSubmissions.vue`

## Tujuan

1. Memindahkan tombol **Export Excel** ke atas border card, di sisi kanan (mengikuti pola `AdminLikertQuestions.vue`).
2. Menghilangkan **border pada header** tabel.

---

## Rencana Perubahan

### 1. Pindahkan Tombol Export Excel ke Atas Border Card (Kanan)

**Kondisi saat ini:**

- Tombol "Export Excel" berada di dalam blok Header (kartu atas) bersama judul "Submissions" dan jumlah responden.

**Perubahan (mengikuti pola `AdminLikertQuestions.vue`):**

- Hapus tombol "Export Excel" dari blok Header.
- Tambahkan blok aksi terpisah di atas card tabel, dengan posisi rata kanan (`flex justify-end`), persis seperti pola tombol di `AdminLikertQuestions.vue`:
  ```
  <!-- Tombol Aksi (Export) -->
  <div class="flex flex-wrap justify-end gap-2 mb-4 md:mb-6">
    <button ...>Export Excel</button>
  </div>
  ```
- Gaya tombol mengikuti pola tombol "Lihat Submissions" di `AdminLikertQuestions.vue`:
  - Class: `inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium bg-primary rounded-sm border border-black secondary text-white hover:bg-primary/80 transition-colors whitespace-nowrap h-10 disabled:opacity-50 cursor-pointer`
  - Dengan ikon `fa-solid fa-file-excel`
  - Logika: `@click="showExportModal = true"`, `:disabled="submissions.length === 0"`

---

### 2. Hilangkan Border pada Header Tabel

**Kondisi saat ini:**

- Header tabel menggunakan class `app-table` yang memberikan border pada `<th>`.

**Perubahan:**

- Tambahkan class `border-0` pada semua elemen `<th>` di `<thead>`.

---

## Langkah Implementasi

1. Baca definisi class `app-table` di `src/assets/main.css` untuk memahami sumber border header.
2. Edit `src/pages/admin/likert/AdminLikertSubmissions.vue`:
   - Hapus tombol Export Excel dari blok Header.
   - Tambahkan blok tombol Export Excel di atas card tabel (rata kanan), mengikuti pola `AdminLikertQuestions.vue`.
   - Hilangkan border pada `<th>` header tabel dengan class `border-0`.
3. Verifikasi hasil di browser (mode admin, halaman Submissions Likert).

---

## Catatan

- Tidak ada perubahan pada logika export, modal konfirmasi, atau fungsi `confirmExportExcel`.
- Perubahan hanya bersifat tata letak (layout) dan styling.
