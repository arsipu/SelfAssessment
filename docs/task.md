# Task Plan: Dedicated Firestore Function untuk Add Likert

## Tujuan

Membuat fungsi khusus Firestore di `src/firebase/add-likert.js` untuk menambahkan instrumen Likert baru, berdasarkan skema di `docs/firestore_schema.md` dan logika `addLikert` yang ada di `src/stores/likert/likert.js`.

## Analisis Kode Saat Ini (`src/stores/likert/likert.js`)

Fungsi `addLikert` saat ini melakukan:

1. **Membuat dokumen** di collection `likert` dengan field:
   - `name` — dari parameter `{ name }`
   - `slug` — hasil `slugify(name)`
   - `description` — dari parameter `{ description }`
   - `status` — `INACTIVE` (dari `@/apps/status`)
   - `createdAt` — `serverTimestamp()`
   - `updatedAt` — `serverTimestamp()`

2. **Mengembalikan** dokumen yang baru dibuat (bukan hanya ID)

## Rencana Implementasi

### 1. Buat file `src/firebase/add-likert.js`

Buat fungsi `addLikert` yang mengekspor fungsi utama:

```js
// Struktur yang direncanakan
import { db } from "@/firebase/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { INACTIVE } from "@/apps/status";
import { slugify } from "@/utils/slug";
```

**Fungsi utama: `addLikert({ name, description })`**

- Membuat dokumen di collection `likert` sesuai skema:
  - `name` (string)
  - `slug` (string) — `slugify(name)`
  - `description` (string)
  - `status` (string) — `INACTIVE`
  - `createdAt` (timestamp) — `serverTimestamp()`
  - `updatedAt` (timestamp) — `serverTimestamp()`
- Mengembalikan dokumen yang baru dibuat (lengkap dengan `id` dan semua field)

### 2. Update `src/stores/likert/likert.js`

- Ganti implementasi `addLikert` di store agar memanggil fungsi dari `src/firebase/add-likert.js`
- Hapus logika duplikat (pembuatan dokumen) dari store
- Store tetap bertanggung jawab untuk `fetchLikerts()` setelah berhasil

### 3. Verifikasi

- Pastikan field yang dibuat sesuai dengan `docs/firestore_schema.md`
- Pastikan error handling tetap ada
- Pastikan tidak ada import yang rusak

## Catatan

- `slugify` diambil dari `@/utils/slug`
- `INACTIVE` diambil dari `@/apps/status`
- `serverTimestamp()` digunakan untuk `createdAt` dan `updatedAt` agar konsisten dengan skema
