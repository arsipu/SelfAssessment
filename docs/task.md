# Task: Refactor CRUD Likert Categories ke `src/firebase`

## Tujuan

Memisahkan logika CRUD (operasi Firestore) untuk subcollection `likert/{likertId}/categories` dari `src/stores/likert/likert-categories.js` ke file terpisah di folder `src/firebase`.

Store hanya berperan sebagai _state container_ (memanggil fungsi dari `src/firebase` dan mengelola `ref` state), sedangkan semua interaksi Firestore dipindahkan ke fungsi murni di `src/firebase`.

## Pola yang Diikuti

Mengikuti pola file yang sudah ada di `src/firebase`:

| File Existing             | Fungsi                                                                          |
| ------------------------- | ------------------------------------------------------------------------------- |
| `add-likert.js`           | `addLikert()`                                                                   |
| `add-scale.js`            | `addScale()`                                                                    |
| `fetch-likert.js`         | `fetchLikerts()`, `getLikertById()`, `getLikertBySlug()`, `fetchLikertScales()` |
| `delete-likert.js`        | `deleteLikert()`                                                                |
| `delete-scale.js`         | `deleteScale()`                                                                 |
| `update-likert.js`        | `updateLikert()`                                                                |
| `update-likert-status.js` | `updateLikertStatus()`                                                          |
| `update-scale.js`         | `updateScale()`                                                                 |

Semua file tersebut:

- Import `db` dari `@/firebase/firebase-config`
- Menyediakan fungsi async yang menerima parameter (id, dll.) dan mengembalikan data hasil operasi
- Menangani `console.log` / `console.error` untuk debugging
- **Tidak** mengelola state Vue (`ref`)

## Rencana File Baru

Buat 4 file baru di `src/firebase`:

### 1. `src/firebase/fetch-categories.js`

Berisi 2 fungsi:

- **`fetchCategories(likertId)`**
  - Query collection `likert/{likertId}/categories` dengan `orderBy('order')`
  - Ambil semua dokumen, map ke `{ id, ...data }`
  - Kembalikan array. Jika error, log error dan kembalikan `[]`.

- **`getCategoryById(likertId, categoryId)`**
  - `getDoc(doc(db, 'likert', likertId, 'categories', categoryId))`
  - Kembalikan `{ id, ...data }` jika ada, `null` jika tidak.

### 2. `src/firebase/add-category.js`

Berisi 1 fungsi:

- **`addCategory(likertId, { name, order }, existingCategories)`**
  - **Catatan:** Karena logika update state bergantung pada data kategori yang sudah ada (untuk menggeser `order` category other), fungsi ini perlu menerima daftar kategori existing sebagai parameter (`existingCategories`). Ini membuat fungsi di `src/firebase` tetap _pure_ terhadap Firestore, dan store cukup meneruskan `categories.value`.
  - Hitung `toShift` = kategori yang `order >= order` yang baru.
  - Buat batch: `set` dokumen baru + `update` order kategori yang digeser (+1).
  - Commit batch.
  - Kembalikan `{ id, ...payload }` (dokumen baru) agar store bisa mengupdate state lokal tanpa fetch ulang.

### 3. `src/firebase/update-category.js`

Berisi 1 fungsi:

- **`updateCategory(likertId, categoryId, { name, order }, existingCategories)`**
  - Terima `existingCategories` untuk menghitung pergeseran order kategori lain.
  - Logic:
    - Jika `order === undefined` atau sama dengan order lama → `updateDoc` biasa.
    - Jika order berubah:
      - Hitung `toShift` (kategori di antara posisi lama & baru)
      - Batch: update dokumen utama + update order kategori yang digeser sesuai arah (+1 / -1)
      - Commit
  - Kembalikan `{ id, name, order }` hasil update (dan info pergeseran bila perlu) agar store bisa sinkron state lokal.

### 4. `src/firebase/delete-category.js`

Berisi 1 fungsi:

- **`deleteCategory(likertId, categoryId)`**
  - `deleteDoc(doc(db, 'likert', likertId, 'categories', categoryId))`
  - Kembalikan `categoryId` yang dihapus (atau `void`) agar store bisa menghapus dari state lokal.

## Perubahan pada Store `src/stores/likert/likert-categories.js`

Setelah file `src/firebase` dibuat, store akan:

- **Hapus** semua import Firestore (`collection`, `doc`, `getDocs`, dll.) dan import `db`.
- **Import** fungsi dari file baru:

```js
import { fetchCategories, getCategoryById } from "@/firebase/fetch-categories";
import { addCategory } from "@/firebase/add-category";
import { updateCategory } from "@/firebase/update-category";
import { deleteCategory } from "@/firebase/delete-category";
```

- Setiap method store cukup:
  - Memanggil fungsi `src/firebase` (meneruskan `categories.value` bila diperlukan).
  - Mengupdate state `categories.value` / `loading.value` sesuai hasil kembalian fungsi.
  - Menjaga logika penyortiran state lokal setelah operasi add/update.

### Rincian per method di store:

| Method Store      | Panggil Fungsi                                                 | Update State Lokal                               |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| `fetchCategories` | `fetchCategories(likertId)`                                    | `loading` true/false, `categories.value = hasil` |
| `getCategoryById` | `getCategoryById(likertId, categoryId)`                        | tidak ada (return saja)                          |
| `addCategory`     | `addCategory(likertId, data, categories.value)`                | tambah hasil ke array, sort                      |
| `updateCategory`  | `updateCategory(likertId, categoryId, data, categories.value)` | update item & pergeseran order, sort             |
| `deleteCategory`  | `deleteCategory(likertId, categoryId)`                         | filter array                                     |

> Catatan: Untuk `addCategory` & `updateCategory`, karena logika pergeseran _order_ kompleks dan bergantung pada data existing, disarankan fungsi `src/firebase` mengembalikan data yang cukup (misalnya hasil dokumen + daftar kategori yang ikut tergeser) sehingga store bisa memperbarui state dengan tepat. Alternatif yang lebih sederhana: store melakukan `fetchCategories` ulang setelah operasi, tapi ini kurang efisien. Rencana default: fungsi mengembalikan objek berisi `{ doc: {...}, shiftedIds: [...] }` atau format serupa agar store bisa sinkron lokal tanpa fetch ulang.

## Isi File `docs/task.md` Ini (Task Plan)

- [x] Analisis kode store & pola folder `src/firebase`
- [ ] Buat `src/firebase/fetch-categories.js`
- [ ] Buat `src/firebase/add-category.js`
- [ ] Buat `src/firebase/update-category.js`
- [ ] Buat `src/firebase/delete-category.js`
- [ ] Refactor `src/stores/likert/likert-categories.js` untuk memanggil fungsi tersebut
- [ ] Verifikasi tidak ada import Firestore tersisa di store
- [ ] Uji / jalankan build untuk memastikan tidak error

## Catatan / Keputusan Desain

1. **Konsistensi nama file** mengikuti pola `add-*.js`, `update-*.js`, `delete-*.js`, `fetch-*.js` yang sudah ada.
2. **Store tetap menangani state** (ref) dan logika penyortiran lokal — hanya interaksi Firestore yang dipindah.
3. **Fungsi di `src/firebase` menerima data existing** (misal `existingCategories`) untuk operasi yang butuh pergeseran order, sehingga logika bisnis tetap di fungsi murni & mudah diuji.
4. **Error handling** tetap di dalam fungsi `src/firebase` (console.error + throw), mengikuti pola file lain.
