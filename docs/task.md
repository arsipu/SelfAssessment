# Task Plan: Pindahkan Fungsi Delete Likert ke Folder Firebase

## Tujuan

Memindahkan fungsi `deleteLikert` (cascading delete) dari `src/stores/likert/likert.js` ke file khusus di folder `src/firebase/`. Store hanya bertanggung jawab untuk state management dan memanggil fungsi dari folder firebase.

## Analisis Kode Saat Ini (`src/stores/likert/likert.js`)

Fungsi `deleteLikert(likertId)` saat ini melakukan **cascading delete**:

1. **Mengambil semua dokumen** dari subcollection:
   - `likert/{likertId}/submissions`
   - `likert/{likertId}/categories`
   - `likert/{likertId}/scale`

2. **Mengumpulkan operasi delete** dalam satu `writeBatch`:
   - Semua dokumen submissions
   - Semua dokumen categories
   - Semua dokumen scales
   - Document utama `likert/{likertId}`

3. **Commit batch** jika ada operasi (operationCount > 0)

4. **Memanggil `fetchLikerts()`** untuk memperbarui state store (akan diubah — lihat rencana)

## Rencana Implementasi

### 1. Buat file `src/firebase/delete-likert.js`

Buat file baru di folder `src/firebase/` yang berisi fungsi `deleteLikert`:

```js
// Struktur yang direncanakan
import { db } from "@/firebase/firebase-config";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
```

**Fungsi yang diekspor: `deleteLikert(likertId)`**

- Mengambil semua dokumen dari subcollection:
  - `likert/{likertId}/submissions`
  - `likert/{likertId}/categories`
  - `likert/{likertId}/scale`
- Mengumpulkan semua operasi delete dalam satu `writeBatch`
- Menghapus document utama `likert/{likertId}`
- Commit batch jika ada operasi
- **Tidak** memanggil `fetchLikerts()` — itu tanggung jawab store

### 2. Update `src/stores/likert/likert.js`

- **Hapus** import yang tidak lagi digunakan dari `firebase/firestore`:
  - `getDocs` (dipindah ke file delete)
  - `writeBatch` (dipindah ke file delete)
  - `collection` (masih dipakai untuk operasi lain seperti `addScale`)
- **Tambahkan** import dari file delete baru:
  ```js
  import { deleteLikert as deleteLikertFirebase } from "@/firebase/delete-likert";
  ```
- **Ganti implementasi** `deleteLikert` di store agar memanggil fungsi dari file firebase, lalu **menghapus item dari `likerts.value` berdasarkan id** (tidak perlu fetch ulang dari Firebase):

```js
const deleteLikert = async (likertId) => {
	try {
		await deleteLikertFirebase(likertId);
		// Hapus dari state store berdasarkan id — tidak perlu fetch ulang
		likerts.value = likerts.value.filter((l) => l.id !== likertId);
	} catch (error) {
		console.error("Error deleting likert:", error);
		throw error;
	}
};
```

### 3. Verifikasi

- Pastikan fungsi `deleteLikert` dipindahkan ke `src/firebase/delete-likert.js`
- Pastikan store menghapus item dari `likerts.value` berdasarkan id setelah delete berhasil (tidak fetch ulang dari Firebase)
- Pastikan tidak ada import yang rusak
- Pastikan pemanggil di komponen (misal `AdminLikert.vue`) tetap berfungsi karena nama fungsi di store tidak berubah
- Jalankan `npm run build` untuk memastikan tidak ada error

## Catatan

- Nama fungsi di store **tidak berubah** agar pemanggil di komponen tidak perlu diubah
- Logika cascading delete (getDocs + writeBatch) dipindahkan ke file firebase
- Store tetap bertanggung jawab untuk state management (menghapus item dari `likerts.value` berdasarkan id setelah delete) dan error handling
- File delete murni berisi logika Firestore (delete data)
