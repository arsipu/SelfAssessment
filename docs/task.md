# Task Plan: Pisahkan Halaman Soal per Kategori dari AdminLikertQuestions

## Tujuan

Memisahkan pengelolaan soal dari `src/pages/admin/likert/AdminLikertQuestions.vue` agar **setiap kategori memiliki halaman terpisah** untuk menambahkan soal. Di `AdminLikertQuestions.vue`, hanya menampilkan **daftar kategori** (read-only) dengan link/button untuk menuju halaman soal per kategori. Halaman baru menangani tambah, edit, dan hapus soal untuk satu kategori.

## Analisis Kode Saat Ini (`src/pages/admin/likert/AdminLikertQuestions.vue`)

### Yang Ada di Halaman Ini

1. **Panduan Penilaian Skala Likert** — guide expandable (tetap di halaman ini)
2. **Card "Skala Penilaian" (read-only)** — hasil skala + button "Kelola Skala" (tetap di halaman ini, sudah dipisahkan di task sebelumnya)
3. **Blocks per Category** — untuk setiap kategori:
   - Header kategori (nama, jumlah soal, tombol edit/hapus kategori)
   - Tabel soal (No, Pertanyaan, Jenis, Aksi — Edit/Hapus)
   - Inline add form per kategori (textarea + radio favorable/unfavorable + Simpan/Batal)
   - Tombol "Tambah Soal" per kategori
4. **Tombol "Tambah Kategori Baru"** — di bawah daftar kategori
5. **Modal Edit Soal** — modal untuk edit soal (termasuk pindah kategori)
6. **Modal Hapus Soal** — konfirmasi hapus soal
7. **Modal Tambah/Edit Kategori** — modal untuk tambah/edit nama & posisi kategori
8. **Modal Hapus Kategori** — konfirmasi hapus kategori

### State & Fungsi Soal yang Ada

| State                    | Fungsi                            |
| ------------------------ | --------------------------------- |
| `saving`                 | `saveInline(categoryId)`          |
| `activeAddCategoryId`    | `openInlineAdd(categoryId)`       |
| `inlineForm`             | `cancelInline()`                  |
| `showEditModal`          | `openEditModal(q)`                |
| `editingId`              | `closeEditModal()`                |
| `editOriginalCategoryId` | `saveEdit()`                      |
| `editForm`               | `openDeleteModal(id, categoryId)` |
| `showDeleteModal`        | `confirmDelete()`                 |
| `deletingId`             |                                   |
| `deleteCategoryId`       |                                   |

### Routing Saat Ini (`src/router/index.js`)

```js
{
    path: "likert/:slug",
    name: "admin-likert-questions",
    component: AdminLikertQuestions,
},
{
    path: "likert/:slug/scales",
    name: "admin-likert-scales",
    component: AdminLikertScales,
},
```

## Rencana Implementasi

### 1. Buat halaman baru `src/pages/admin/likert/AdminLikertCategoryQuestions.vue`

Buat halaman baru yang berisi **seluruh** fungsionalitas soal untuk **satu kategori**:

- **Breadcrumb**: `Likert Form / {nama likert} / {nama kategori}`
  - Route params: `slug` (likert slug) + `categoryId` (id kategori)
- **Header**: Nama likert + nama kategori + tombol kembali ke daftar kategori
- **Card "Soal"** untuk kategori tersebut:
  - Tabel soal (No, Pertanyaan, Jenis, Aksi — Edit/Hapus)
  - Inline add form (textarea + radio favorable/unfavorable + Simpan/Batal)
  - Tombol "Tambah Soal"
  - Empty state: "Belum ada pertanyaan untuk kategori ini."
- **Modal Edit Soal** — edit soal (termasuk pindah kategori jika diperlukan)
- **Modal Hapus Soal** — konfirmasi hapus soal
- **State & fungsi soal** dipindahkan dari `AdminLikertQuestions.vue`:
  - `saving`, `activeAddCategoryId`, `inlineForm`
  - `showEditModal`, `editingId`, `editOriginalCategoryId`, `editForm`
  - `showDeleteModal`, `deletingId`, `deleteCategoryId`
  - `saveInline`, `openInlineAdd`, `cancelInline`, `saveEdit`, `closeEditModal`, `openEditModal`, `confirmDelete`, `openDeleteModal`
- Menggunakan `likertStore.getLikertBySlug(slug)` + `categoryStore.fetchCategories(likertId)` untuk mendapatkan nama kategori
- Menggunakan `likertQuestionsStore.fetchQuestions(likertId, categoryId)` untuk memuat soal kategori tersebut
- Menggunakan `likertQuestionsStore.addQuestion`, `updateQuestion`, `deleteQuestion` untuk CRUD soal

### 2. Update `src/pages/admin/likert/AdminLikertQuestions.vue`

- **Hapus** semua state & fungsi soal:
  - State: `saving`, `activeAddCategoryId`, `inlineForm`, `showEditModal`, `editingId`, `editOriginalCategoryId`, `editForm`, `showDeleteModal`, `deletingId`, `deleteCategoryId`
  - Fungsi: `saveInline`, `openInlineAdd`, `cancelInline`, `saveEdit`, `closeEditModal`, `openEditModal`, `confirmDelete`, `openDeleteModal`
- **Hapus** template soal:
  - Tabel soal per kategori (No, Pertanyaan, Jenis, Aksi)
  - Inline add form per kategori
  - Modal Edit Soal
  - Modal Hapus Soal
- **Ganti** dengan card daftar kategori yang menampilkan:
  - Nama kategori + jumlah soal
  - Button "Kelola Soal" yang mengarah ke halaman soal per kategori:
    ```js
    router.push({
    	name: "admin-likert-category-questions",
    	params: { slug: likertSlug, categoryId: cat.id },
    });
    ```
  - Tombol edit/hapus kategori (tetap di halaman ini)
- **Pertahankan**:
  - Panduan Penilaian Skala Likert
  - Card "Skala Penilaian" (read-only) + button "Kelola Skala"
  - Tombol "Tambah Kategori Baru"
  - Modal Tambah/Edit Kategori
  - Modal Hapus Kategori
- **Hapus** import `likertQuestionsStore` (tidak lagi digunakan)
- `questionsByCategory` helper tidak lagi diperlukan (sudah dipindah ke halaman per kategori)
- Jumlah soal per kategori diambil dari `cat.questions?.length` (field array di dokumen kategori)

### 3. Update `src/router/index.js`

Tambahkan route baru untuk halaman soal per kategori:

```js
{
    path: "likert/:slug/categories/:categoryId",
    name: "admin-likert-category-questions",
    component: AdminLikertCategoryQuestions,
},
```

**Urutan route** (penting — route dengan lebih spesifik harus didaftarkan):

```js
{
    path: "likert/:slug",
    name: "admin-likert-questions",
    component: AdminLikertQuestions,
},
{
    path: "likert/:slug/categories/:categoryId",
    name: "admin-likert-category-questions",
    component: AdminLikertCategoryQuestions,
},
{
    path: "likert/:slug/scales",
    name: "admin-likert-scales",
    component: AdminLikertScales,
},
```

### 4. Verifikasi

- Pastikan halaman `AdminLikertQuestions.vue` hanya menampilkan daftar kategori + link ke halaman soal per kategori
- Pastikan halaman `AdminLikertCategoryQuestions.vue` menangani tambah, edit, dan hapus soal untuk satu kategori
- Pastikan routing `admin-likert-category-questions` berfungsi dengan `categoryId`
- Pastikan tidak ada import yang rusak
- Pastikan pemanggilan `likertQuestionsStore` di halaman lama dihapus
- Jalankan `npm run build` untuk memastikan tidak ada error

## Struktur Routing Setelah Implementasi

```
/admin/likert                          → AdminLikert (daftar formulir)
/admin/likert/:slug                    → AdminLikertQuestions (daftar kategori + hasil skala read-only)
/admin/likert/:slug/categories/:categoryId → AdminLikertCategoryQuestions (kelola soal per kategori)
/admin/likert/:slug/scales             → AdminLikertScales (kelola skala: tambah, edit, hapus)
/admin/likert/:slug/submissions        → AdminLikertSubmissions
/admin/likert/:slug/submissions/:submissionSlug → AdminLikertSubmissionDetail
```

## Catatan

- Nama route baru: `admin-likert-category-questions`
- Path route baru: `likert/:slug/categories/:categoryId`
- Halaman `AdminLikertQuestions.vue` tetap menampilkan daftar kategori (dengan edit/hapus kategori) + link ke halaman soal per kategori
- Halaman `AdminLikertCategoryQuestions.vue` menangani semua operasi CRUD soal untuk satu kategori
- `questionsByCategory` helper tidak lagi diperlukan di halaman daftar karena soal sudah dipindah ke halaman per kategori
