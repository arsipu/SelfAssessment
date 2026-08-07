# Task Plan: Pisahkan Halaman Skala Penilaian dari AdminLikertQuestions

## Tujuan

Memisahkan bagian **Skala Penilaian** dari `src/pages/admin/likert/AdminLikertQuestions.vue` ke halaman terpisah dengan routing sendiri. Di `AdminLikertQuestions.vue`, bagian skala hanya menampilkan **hasil skala saja** (read-only) dengan link/button untuk menuju halaman skala yang menangani tambah, edit, dan delete.

## Analisis Kode Saat Ini (`src/pages/admin/likert/AdminLikertQuestions.vue`)

### Bagian Skala yang Ada di Halaman Ini

1. **Card "Skala Penilaian"** — menampilkan tabel skala:
   - Kolom: Rentang, Label, Deskripsi, Aksi
   - Aksi: Edit (modal), Hapus (modal konfirmasi)
   - Empty state: "Belum ada skala penilaian."

2. **Inline Add Form** — form tambah skala di bagian bawah card:
   - Input: Min, Max, Label (score), Deskripsi
   - Tombol: Simpan, Batal

3. **Modal Edit Skala** — modal untuk edit skala:
   - Input: Label, Min, Max, Deskripsi

4. **Modal Konfirmasi Hapus Skala** — konfirmasi hapus skala

### State & Fungsi Skala yang Ada

| State                  | Fungsi                 |
| ---------------------- | ---------------------- |
| `scales`               | `fetchScales()`        |
| `scaleSaving`          | `openAddScale()`       |
| `scaleForm`            | `cancelAddScale()`     |
| `editingScaleId`       | `saveScale()`          |
| `showAddScaleForm`     | `editScaleItem()`      |
| `showEditScaleModal`   | `cancelScaleEdit()`    |
| `showDeleteScaleModal` | `deleteScaleItem()`    |
| `deletingScaleId`      | `confirmDeleteScale()` |

### Routing Saat Ini (`src/router/index.js`)

```js
{
    path: "likert/:slug",
    name: "admin-likert-questions",
    component: AdminLikertQuestions,
},
```

## Rencana Implementasi

### 1. Buat halaman baru `src/pages/admin/likert/AdminLikertScales.vue`

Buat halaman baru yang berisi **seluruh** fungsionalitas skala penilaian:

- **Breadcrumb**: `Likert Form / {nama likert} / Skala Penilaian`
- **Header**: Nama likert + deskripsi + tombol kembali ke pertanyaan
- **Card "Skala Penilaian"**:
  - Tabel skala (Rentang, Label, Deskripsi, Aksi)
  - Inline add form (Min, Max, Label, Deskripsi)
  - Modal edit skala
  - Modal konfirmasi hapus skala
- **State & fungsi skala** dipindahkan dari `AdminLikertQuestions.vue`:
  - `scales`, `scaleSaving`, `scaleForm`, `editingScaleId`
  - `showAddScaleForm`, `showEditScaleModal`, `showDeleteScaleModal`, `deletingScaleId`
  - `fetchScales`, `openAddScale`, `cancelAddScale`, `saveScale`, `editScaleItem`, `cancelScaleEdit`, `deleteScaleItem`, `confirmDeleteScale`
- Menggunakan `likertStore.getLikertBySlug(slug)` untuk mendapatkan `likertId` dan `currentLikert`

### 2. Update `src/pages/admin/likert/AdminLikertQuestions.vue`

- **Hapus** semua state & fungsi skala:
  - State: `scales`, `scaleSaving`, `scaleForm`, `editingScaleId`, `showAddScaleForm`, `showEditScaleModal`, `showDeleteScaleModal`, `deletingScaleId`
  - Fungsi: `fetchScales`, `openAddScale`, `cancelAddScale`, `saveScale`, `editScaleItem`, `cancelScaleEdit`, `deleteScaleItem`, `confirmDeleteScale`
- **Hapus** template skala:
  - Card "Skala Penilaian" (tabel + inline add form)
  - Modal Edit Skala
  - Modal Konfirmasi Hapus Skala
- **Ganti** dengan card read-only yang menampilkan hasil skala saja:
  - Tabel skala (Rentang, Label, Deskripsi) — tanpa kolom Aksi
  - Empty state: "Belum ada skala penilaian."
  - Button "Kelola Skala" yang mengarah ke halaman skala:
    ```js
    router.push({
    	name: "admin-likert-scales",
    	params: { slug: likertSlug },
    });
    ```
- **Hapus** pemanggilan `fetchScales()` di `onMounted` (tidak lagi diperlukan di halaman ini)
- **Tambahkan** `fetchScales()` di halaman ini untuk menampilkan hasil skala (read-only)

### 3. Update `src/router/index.js`

Tambahkan route baru untuk halaman skala:

```js
import AdminLikertScales from '@/pages/admin/likert/AdminLikertScales.vue';

// Di dalam children admin, setelah route admin-likert-questions
{
    path: "likert/:slug/scales",
    name: "admin-likert-scales",
    component: AdminLikertScales,
},
```

### 4. Verifikasi

- Pastikan halaman `AdminLikertQuestions.vue` hanya menampilkan hasil skala (read-only) + link ke halaman skala
- Pastikan halaman `AdminLikertScales.vue` menangani tambah, edit, dan delete skala
- Pastikan routing `admin-likert-scales` berfungsi
- Pastikan tidak ada import yang rusak
- Jalankan `npm run build` untuk memastikan tidak ada error

## Struktur Routing Setelah Implementasi

```
/admin/likert                          → AdminLikert (daftar formulir)
/admin/likert/:slug                    → AdminLikertQuestions (kategori & pertanyaan + hasil skala read-only)
/admin/likert/:slug/scales             → AdminLikertScales (kelola skala: tambah, edit, hapus)
/admin/likert/:slug/submissions        → AdminLikertSubmissions
/admin/likert/:slug/submissions/:submissionSlug → AdminLikertSubmissionDetail
```

## Catatan

- Nama route baru: `admin-likert-scales`
- Path route baru: `likert/:slug/scales`
- Halaman `AdminLikertQuestions.vue` tetap menampilkan hasil skala (read-only) agar admin bisa melihat skala tanpa pindah halaman
- Halaman `AdminLikertScales.vue` menangani semua operasi CRUD skala
