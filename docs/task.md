# Task: Kelola Soal Holland per Kategori RIASEC

## Ringkasan

Mengubah halaman `AdminHollandQuestions.vue` agar setiap kartu kategori RIASEC
menampilkan **tabel read-only** (mirip tampilan front-end `HollandQuestions.vue`)
dan memiliki tombol **Kelola** yang mengarah ke **halaman baru** untuk mengelola
soal & kolom pada kategori tersebut. Pola ini meniru alur yang sudah ada pada
modul Likert (`AdminLikertQuestions.vue` → `AdminLikertCategoryQuestions.vue`).

---

## 1. Perubahan pada `src/pages/admin/holland/AdminHollandQuestions.vue`

### 1.1 Header Kartu Kategori (tambah tombol Kelola)

Pada header tiap kartu kategori (bagian `table-header`), tambahkan tombol
**Kelola** di samping tombol "Edit" yang sudah ada, dengan gaya mirip tombol
"Kelola Kategori" di `AdminLikertQuestions.vue`:

- Ikon: `fa-solid fa-gear`
- Teks: `Kelola`
- Aksi: `router.push({ name: 'admin-holland-category-questions', params: { slug: hollandSlug, riasecId: cat.id } })`
- Gaya: `text-white border border-border rounded-lg hover:bg-white/10`

### 1.2 Isi Kartu Kategori → Tabel Read-Only (gaya front-end)

Ganti isi kartu (yang sekarang berupa sub-kartu per kolom dengan CRUD) menjadi
**satu tabel read-only per kategori**, meniru layout `HollandQuestions.vue`:

- **Header tabel**: setiap kolom (dari `columnsFor(cat.id)`) menjadi satu `<th>`.
- **Baris tabel**: dihitung dari jumlah soal terbanyak di antara kolom-kolom
  kategori tersebut (`Math.max(...columns.map(c => c.questions.length))`).
- **Sel**: menampilkan teks soal (`q.question`) tanpa checkbox (read-only).
- **Empty state**: jika kategori belum punya kolom/soal, tampilkan pesan
  "Belum ada pernyataan di kategori ini."

Struktur tabel (desktop):

```
| Kolom A        | Kolom B        | Kolom C        |
|----------------|----------------|----------------|
| Soal 1 (A)     | Soal 1 (B)     | Soal 1 (C)     |
| Soal 2 (A)     | Soal 2 (B)     |                |
| Soal 3 (A)     |                |                |
```

### 1.3 Hapus CRUD dari halaman ini

Karena penambahan/editing/hapus soal & kolom pindah ke halaman baru, hapus dari
`AdminHollandQuestions.vue`:

- Form inline tambah pernyataan (`openInlineAdd`, `saveInline`, `cancelInline`)
- Modal edit soal (`openEditModal`, `saveEdit`, `closeEditModal`)
- Modal hapus soal (`openDeleteModal`, `confirmDelete`)
- Modal tambah/edit kolom (`openAddColumnModal`, `openEditColumnModal`, `saveColumn`)
- Modal hapus kolom (`openDeleteColumnModal`, `confirmDeleteColumn`)
- Alert batasan 4 kolom (`showMaxColumnsAlert`)
- State & helper terkait CRUD di atas

### 1.4 Yang TETAP di halaman ini

- Breadcrumb & header instrumen
- Tombol "Lihat Submissions"
- Tombol **Edit** kategori (deskripsi, skills, careers, subjects) — `openRiasecEditModal`
- Badge jumlah soal per kategori
- Loading state

---

## 2. Halaman Baru: `src/pages/admin/holland/AdminHollandCategoryQuestions.vue`

Halaman untuk mengelola soal & kolom pada **satu kategori RIASEC** tertentu.
Gaya mengikuti `AdminLikertScales.vue` / `AdminLikertCategoryQuestions.vue`.

### 2.1 Struktur Halaman

1. **Breadcrumb** (3 level):
   - `Holland RIASEC` → `admin-holland`
   - `{nama instrumen}` → `admin-holland-questions`
   - `{label kategori}` (aktif)

2. **Header**: judul `{label kategori}` + deskripsi singkat
   "Kelola pertanyaan dan kolom pada kategori ini."

3. **Tombol Kembali** → `admin-holland-questions`

4. **Kartu Kelola Soal** (`table-content`):
   - Header kartu: `Soal ({jumlah})` + tombol **Tambah Kolom** (jika < 4 kolom)
   - Untuk tiap kolom: sub-header nama kolom + tombol edit/hapus kolom
   - Tabel per kolom: `No | Pernyataan | Aksi` (edit/hapus soal)
   - Form inline tambah/edit soal (textarea + tombol Simpan/Batal)
   - Tombol "Tambah Pernyataan" per kolom

5. **Modal**:
   - Modal tambah/edit kolom (nama + posisi)
   - Modal hapus kolom (konfirmasi, termasuk jumlah soal yang ikut terhapus)
   - `ConfirmDeleteModal` untuk hapus soal
   - Alert batasan maksimal 4 kolom

### 2.2 Logika (script)

- Ambil `slug` & `riasecId` dari `route.params`
- `onMounted`:
  1. `hollandStore.getHollandBySlug(slug)` → jika tidak ada, redirect ke `admin-holland`
  2. `riasecStore.fetchRiasecList(hollandId)` → cari kategori; jika tidak ada, redirect ke `admin-holland-questions`
  3. `columnsStore.fetchColumns(hollandId, riasecId)`
  4. `questionsStore.fetchQuestions(hollandId, riasecId, columnId)` per kolom (atau pakai `fetchAllQuestions` dengan map 1 kategori)
- Reuse helper dari `AdminHollandQuestions.vue` yang lama:
  - `columnsFor`, `questionsByRiasecAndColumn`, `keyOf`
  - `openInlineAdd`, `saveInline`, `cancelInline`
  - `openEditModal`, `saveEdit`, `closeEditModal`
  - `openDeleteModal`, `confirmDelete`
  - `openAddColumnModal`, `openEditColumnModal`, `saveColumn`, `closeColumnModal`
  - `openDeleteColumnModal`, `confirmDeleteColumn`, `closeDeleteColumnModal`
  - `orderOptions`, `showMaxColumnsAlert`

---

## 3. Routing Baru (`src/router/index.js`)

Tambahkan route admin Holland baru di dalam `children`:

```js
{
  path: "holland/:slug/riasec/:riasecId",
  name: "admin-holland-category-questions",
  component: AdminHollandCategoryQuestions,
},
```

Import komponen baru di bagian atas file:

```js
import AdminHollandCategoryQuestions from "@/pages/admin/holland/AdminHollandCategoryQuestions.vue";
```

---

## 4. Referensi Gaya

- **Tabel read-only kartu kategori** → `src/pages/holland/HollandQuestions.vue`
  (layout kolom-sebagai-header, soal-sebagai-baris)
- **Tombol Kelola di header kartu** → tombol "Kelola Kategori" di
  `src/pages/admin/likert/AdminLikertQuestions.vue`
- **Halaman kelola soal** → `src/pages/admin/likert/AdminLikertCategoryQuestions.vue`
  dan `src/pages/admin/likert/AdminLikertScales.vue`
- **Kelas CSS yang dipakai**: `table-content`, `table-header`, `table-fixed`,
  `divide-y divide-border`, `border-black-secondary`, `text-table-value-text`,
  `bg-primary`, `bg-primary-soft`, `text-text-primary/secondary/muted`,
  `bg-surface`, `border-border`, `rounded-lg/xl`

---

## 5. Langkah Implementasi

1. Buat file baru `src/pages/admin/holland/AdminHollandCategoryQuestions.vue`
   (pindahkan logika CRUD soal & kolom dari `AdminHollandQuestions.vue`).
2. Tambahkan route `admin-holland-category-questions` di `src/router/index.js`.
3. Ubah `AdminHollandQuestions.vue`:
   - Tambah tombol **Kelola** di header tiap kartu kategori.
   - Ganti isi kartu menjadi tabel read-only gaya front-end.
   - Hapus semua CRUD soal & kolom (pindah ke halaman baru).
4. Uji alur: daftar kategori → klik Kelola → kelola soal/kolom → kembali.
