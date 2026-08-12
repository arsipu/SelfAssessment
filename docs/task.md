# Task: Ubah Style Card Halaman Kelola Soal Holland per Kategori

## Ringkasan

Pada halaman `src/pages/admin/holland/AdminHollandCategoryQuestions.vue`,
ubah style setiap card kolom agar mengikuti pola `AdminLikertScales.vue`:

- Setiap kolom tetap menjadi **card terpisah** (sesuai permintaan sebelumnya).
- Namun style card diubah dari `bg-surface border border-border rounded-xl`
  menjadi **`table-content`** dengan **`table-header`** (header berwarna primary,
  teks putih) — persis seperti kartu "Skala Penilaian" di `AdminLikertScales.vue`.
- Tombol "Tambah Kolom" tetap di atas kanan, di atas daftar card.

---

## 1. Perubahan pada `src/pages/admin/holland/AdminHollandCategoryQuestions.vue`

### 1.1 Tombol "Tambah Kolom" di atas (kanan) — TETAP

- Baris aksi di atas daftar card, sejajar kanan (tidak berubah dari implementasi
  sebelumnya).

### 1.2 Style Card per Kolom → mengikuti `AdminLikertScales.vue`

Ubah setiap card kolom dari:

```
bg-surface border border-border rounded-xl overflow-hidden
  └─ sub-header bg-primary-soft (nama kolom + tombol edit/hapus)
  └─ tabel
  └─ footer form inline / tombol tambah
```

menjadi (pola `AdminLikertScales.vue`):

```
table-content
  └─ table-header (bg primary, teks putih)
       ├─ h2: nama kolom (text-white)
       └─ tombol edit/hapus kolom (text-white, border, hover:bg-white/10)
  └─ overflow-x-auto → tabel No | Pernyataan | Aksi
  └─ border-t border-border → form inline tambah / tombol "Tambah Pernyataan"
```

Detail:

- **Header card**: gunakan `table-header px-4 md:px-5 py-3 md:py-4 flex ...`
  dengan `h2 class="text-sm font-medium text-white"` berisi nama kolom.
  Tombol edit/hapus kolom di sisi kanan dengan gaya tombol putih
  (`text-white border border-border rounded-lg hover:bg-white/10`).
- **Tabel**: tetap `overflow-x-auto` dengan kolom `No | Pernyataan | Aksi`.
- **Footer**: `border-t border-border` berisi form inline tambah soal
  (saat aktif) atau tombol "Tambah Pernyataan" (saat tidak aktif).
- Card disusun vertikal dengan `space-y-4 md:space-y-6`.

### 1.3 Empty state — TETAP

- Jika kategori belum punya kolom, tampilkan pesan + tombol "Tambah Kolom Pertama".

### 1.4 Yang TIDAK berubah

- Breadcrumb, header halaman, tombol Kembali, loading state.
- Semua modal (edit soal, tambah/edit kolom, hapus kolom, hapus soal, alert 4 kolom).
- Seluruh logika script (computed, lifecycle, helper, CRUD).

---

## 2. Referensi Gaya

- **Card per kolom** → `src/pages/admin/likert/AdminLikertScales.vue`
  (kelas `table-content`, `table-header`, `text-white`, `border-t border-border`).

---

## 3. Langkah Implementasi

1. Ubah template `AdminHollandCategoryQuestions.vue`:
   - Ganti class card kolom dari `bg-surface border ... rounded-xl` menjadi `table-content`.
   - Ganti sub-header `bg-primary-soft` menjadi `table-header` dengan teks putih.
   - Sesuaikan tombol edit/hapus kolom menjadi gaya putih.
2. Tidak ada perubahan pada script.
3. Verifikasi build (`npm run build`).
