# Task: Tampilkan Soal di Dalam Card Kategori (Style Skala)

## Tujuan

Mengubah halaman `src/pages/admin/likert/AdminLikertQuestions.vue` agar:

- Kategori tetap ditampilkan sebagai **card** (bukan tabel).
- Setiap card kategori menampilkan **daftar soal** yang ada di dalam kategori tersebut.
- Setiap card kategori bisa **dikelola langsung** (tambah/edit/hapus soal, edit nama, hapus kategori).
- **Style mengikuti skala/scale** (`AdminLikertScales.vue`): `table-content`, `table-header` biru, tabel, inline form, tombol tambah di bawah.

---

## Kondisi Saat Ini

| Aspek                | Kondisi                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Kategori             | Card per kategori (`bg-surface border rounded-xl`)                                                        |
| Header card          | `bg-surface-muted`                                                                                        |
| Soal                 | Tidak ditampilkan di card — hanya jumlah soal                                                             |
| Kelola soal          | Navigasi ke halaman terpisah `AdminLikertCategoryQuestions.vue` (route `admin-likert-category-questions`) |
| Tambah/Edit kategori | Modal dialog (`showCategoryModal`)                                                                        |
| Tambah/Edit soal     | Di halaman terpisah (`AdminLikertCategoryQuestions.vue`)                                                  |

---

## Desain Target

### Card Kategori (Style Skala)

Setiap kategori dirender sebagai card dengan struktur:

```
┌─────────────────────────────────────────────────────────┐
│ table-header (biru, teks putih)                         │
│ Nama Kategori  [Jumlah Soal]  [Edit] [Hapus]            │
├─────────────────────────────────────────────────────────┤
│ Tabel Soal (table-content)                              │
│ ┌────────┬──────────────────┬───────────┬────────────┐  │
│ │ No     │ Pertanyaan       │ Jenis     │ Aksi       │  │
│ ├────────┼──────────────────┼───────────┼────────────┤  │
│ │ 1      │ ...              │ Favorable │ [✏] [🗑]   │  │
│ │ 2      │ ...              │ Unfav.    │ [✏] [🗑]   │  │
│ └────────┴──────────────────┴───────────┴────────────┘  │
├─────────────────────────────────────────────────────────┤
│ Inline form tambah/edit soal (bg-table-value)           │
│ [textarea pertanyaan] [radio F/U] [Simpan] [Batal]      │
│ ATAU tombol "Tambah Soal" (saat form tertutup)          │
└─────────────────────────────────────────────────────────┘
```

### Header Card

- Ganti `bg-surface-muted` → `table-header` (biru, teks putih).
- Berisi: nama kategori, jumlah soal, tombol aksi (Edit nama, Hapus kategori).

### Tabel Soal di Dalam Card

- Kolom: **No** (8%), **Pertanyaan** (48%), **Jenis** (24%), **Aksi** (20%).
- Badge jenis: `Favorable` (hijau) / `Unfavorable` (merah).
- Tombol aksi: Edit (pensil), Hapus (trash).
- Empty state: "Belum ada soal untuk kategori ini."

### Inline Form Soal (Tambah/Edit)

- Satu inline form per card kategori untuk tambah & edit soal.
- Indikator mode: `"Edit Soal"` / `"Tambah Soal"`.
- Field: textarea pertanyaan, radio Favorable/Unfavorable.
- Tombol: Simpan & Batal.
- Saat form tertutup: tombol "Tambah Soal" (ikon `fa-plus`).

### Inline Form Kategori (Tambah/Edit Nama)

- Ganti modal `showCategoryModal` → inline form di bawah daftar card.
- Indikator mode: `"Edit Kategori"` / `"Tambah Kategori"`.
- Field: Nama Kategori, Posisi (select).
- Tombol: Simpan & Batal.
- Saat form tertutup: tombol "Tambah Kategori" (ikon `fa-plus`).

---

## Rencana Perubahan

### 1. Template: Card Kategori

- Pertahankan `v-for="cat in categories"` dengan card `bg-surface border border-border rounded-xl overflow-hidden`.
- Ganti header card → `table-header` (biru, teks putih).
- Tambahkan tabel soal di dalam card (mengikuti pola `AdminLikertCategoryQuestions.vue`).
- Tambahkan inline form soal di bawah tabel dalam card.

### 2. Template: Inline Form Kategori

- Hapus modal `showCategoryModal`.
- Tambahkan inline form kategori di bawah daftar card (mengikuti pola skala).

### 3. Script: State & Logika Soal

Tambahkan state & fungsi untuk kelola soal per kategori (mengikuti `AdminLikertCategoryQuestions.vue`):

| State/Fungsi                 | Keterangan                                         |
| ---------------------------- | -------------------------------------------------- |
| `showQuestionForm` (ref)     | Tampilkan inline form soal                         |
| `questionForm` (ref)         | `{ id, question, favorable }`                      |
| `editingQuestionId` (ref)    | ID soal yang sedang diedit                         |
| `activeCategoryId` (ref)     | Kategori yang form soalnya aktif                   |
| `savingQuestion` (ref)       | Loading state simpan soal                          |
| `openAddQuestion(cat)`       | Reset form, set `activeCategoryId`, tampilkan form |
| `openEditQuestion(cat, q)`   | Isi form, set `editingQuestionId`, tampilkan form  |
| `closeQuestionForm()`        | Reset form, tutup form                             |
| `saveQuestion()`             | Tambah/update soal via `likertQuestionsStore`      |
| `deleteQuestionItem(cat, q)` | Buka modal hapus soal                              |
| `confirmDeleteQuestion()`    | Hapus soal via `likertQuestionsStore`              |

### 4. Script: State & Logika Kategori (Inline Form)

| State/Fungsi            | Perubahan                                              |
| ----------------------- | ------------------------------------------------------ |
| `showCategoryModal`     | Dihapus, diganti `showCategoryForm`                    |
| `openAddCategoryModal`  | → `openAddCategory`: reset form, tampilkan inline form |
| `openEditCategoryModal` | → `openEditCategory`: isi form, tampilkan inline form  |
| `closeCategoryModal`    | → `closeCategoryForm`: reset form, tutup inline form   |
| `saveCategory`          | Tutup inline form setelah simpan                       |

### 5. Store yang Digunakan

- `useLikertCategoriesStore` — untuk kategori (sudah ada).
- `useLikertQuestionsStore` — untuk kelola soal (perlu diimpor).
- `useLikertStore` — untuk likert & skala (sudah ada).

### 6. Modal Hapus

- **Modal Hapus Kategori** — tetap `ConfirmDeleteModal` (tidak diubah).
- **Modal Hapus Soal** — tambahkan `ConfirmDeleteModal` baru untuk soal.

### 7. Halaman `AdminLikertCategoryQuestions.vue`

- **Tidak dihapus** — tetap ada sebagai halaman terpisah (route tetap berfungsi).
- Halaman `AdminLikertQuestions.vue` kini juga bisa kelola soal langsung di card.

---

## Ringkasan Perubahan Kode

| Bagian                                     | Perubahan                                  |
| ------------------------------------------ | ------------------------------------------ |
| Header card kategori                       | `bg-surface-muted` → `table-header` (biru) |
| Tabel soal di card                         | Ditambahkan (No, Pertanyaan, Jenis, Aksi)  |
| Inline form soal                           | Ditambahkan per card                       |
| Modal tambah/edit kategori                 | Dihapus, diganti inline form               |
| `showCategoryModal`                        | Dihapus, diganti `showCategoryForm`        |
| `useLikertQuestionsStore`                  | Diimpor & digunakan                        |
| Modal hapus soal                           | Ditambahkan (`ConfirmDeleteModal`)         |
| Modal hapus kategori                       | Tetap (`ConfirmDeleteModal`)               |
| Halaman `AdminLikertCategoryQuestions.vue` | Tidak diubah                               |

---

## Catatan

- Hanya file `src/pages/admin/likert/AdminLikertQuestions.vue` yang diubah.
- Style mengikuti `AdminLikertScales.vue` (table-header biru, inline form, tombol tambah di bawah).
- Logika kelola soal mengikuti `AdminLikertCategoryQuestions.vue`.
