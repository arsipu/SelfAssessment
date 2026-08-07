# Task Plan: Pisahkan Fungsi Fetch dari Store ke Folder Firebase

## Tujuan

Memisahkan semua fungsi yang berhubungan dengan **fetch/read data** dari `src/stores/likert/likert.js` ke file khusus di folder `src/firebase/`. Store hanya bertanggung jawab untuk state management (ref) dan memanggil fungsi-fungsi dari folder firebase.

## Analisis Kode Saat Ini (`src/stores/likert/likert.js`)

Fungsi-fungsi fetch yang ada di store saat ini:

### 1. `fetchLikerts()`

- Mengambil **semua dokumen** dari collection `likert`
- Mengembalikan array `{ id, ...data }`
- Mengatur state `loading` dan `likerts`

### 2. `getLikertById(likertId)`

- Mengambil **1 dokumen** dari `likert/{likertId}`
- Mengembalikan `{ id, ...data }` atau `null` jika tidak ada
- Mengatur state `currentLikert`

### 3. `getLikertBySlug(slug)`

- Mengambil **1 dokumen** dari collection `likert` berdasarkan `where('slug', '==', slug)` dengan `limit(1)`
- Mengembalikan `{ id, ...data }` atau `null` jika tidak ada
- Mengatur state `currentLikert`

### 4. `fetchLikertScales(likertId)`

- Mengambil **semua dokumen** dari subcollection `likert/{likertId}/scale`
- Melakukan transformasi data:
  - Parse field `range` (misal `"1 - 5"`) menjadi `min` dan `max` menggunakan regex `/\s*[-–—]\s*/`
  - `label` diambil dari field `score`
  - `description` diambil dari field `description`
- Mengurutkan scales dari `min` terbesar ke terkecil
- Mengembalikan array scales yang sudah ditransformasi
- Mengatur state `currentLikertScales`

## Rencana Implementasi

### 1. Buat file `src/firebase/fetch-likert.js`

Buat file baru di folder `src/firebase/` yang berisi semua fungsi fetch:

```js
// Struktur yang direncanakan
import { db } from "@/firebase/firebase-config";
import {
	collection,
	doc,
	getDocs,
	getDoc,
	query,
	where,
	limit,
} from "firebase/firestore";
```

**Fungsi yang diekspor:**

#### `fetchLikerts()`

- Mengambil semua dokumen dari collection `likert`
- Mengembalikan array `{ id, ...data }`
- **Tidak** mengatur state `loading` — itu tanggung jawab store

#### `getLikertById(likertId)`

- Mengambil 1 dokumen dari `likert/{likertId}`
- Mengembalikan `{ id, ...data }` atau `null` jika tidak ada

#### `getLikertBySlug(slug)`

- Mengambil 1 dokumen berdasarkan `where('slug', '==', slug)` dengan `limit(1)`
- Mengembalikan `{ id, ...data }` atau `null` jika tidak ada

#### `fetchLikertScales(likertId)`

- Mengambil semua dokumen dari subcollection `likert/{likertId}/scale`
- Melakukan transformasi data (parse `range` → `min`/`max`, `label` dari `score`)
- Mengurutkan scales dari `min` terbesar ke terkecil
- Mengembalikan array scales yang sudah ditransformasi

### 2. Update `src/stores/likert/likert.js`

- **Hapus** import yang tidak lagi digunakan dari `firebase/firestore`:
  - `getDocs`, `getDoc`, `query`, `where`, `limit` (dipindah ke file fetch)
  - `collection` (masih dipakai untuk operasi lain seperti `addScale`, `deleteLikert`)
- **Tambahkan** import dari file fetch baru:
  ```js
  import {
  	fetchLikerts as fetchLikertsFirebase,
  	getLikertById as getLikertByIdFirebase,
  	getLikertBySlug as getLikertBySlugFirebase,
  	fetchLikertScales as fetchLikertScalesFirebase,
  } from "@/firebase/fetch-likert";
  ```
- **Ganti implementasi** fungsi-fungsi fetch di store agar memanggil fungsi dari file firebase:

#### `fetchLikerts()`

```js
const fetchLikerts = async () => {
	loading.value = true;
	try {
		likerts.value = await fetchLikertsFirebase();
	} catch (error) {
		console.error("Error fetching likerts:", error);
	} finally {
		loading.value = false;
	}
};
```

#### `getLikertById(likertId)`

```js
const getLikertById = async (likertId) => {
	try {
		currentLikert.value = await getLikertByIdFirebase(likertId);
		return currentLikert.value;
	} catch (error) {
		console.error("Error fetching likert:", error);
	}
};
```

#### `getLikertBySlug(slug)`

```js
const getLikertBySlug = async (slug) => {
	try {
		currentLikert.value = await getLikertBySlugFirebase(slug);
		return currentLikert.value;
	} catch (error) {
		console.error("Error fetching likert by slug:", error);
	}
};
```

#### `fetchLikertScales(likertId)`

```js
const fetchLikertScales = async (likertId) => {
	try {
		currentLikertScales.value = await fetchLikertScalesFirebase(likertId);
		return currentLikertScales.value;
	} catch (error) {
		console.error("Error fetching likert scales:", error);
		currentLikertScales.value = [];
		throw error;
	}
};
```

### 3. Verifikasi

- Pastikan semua fungsi fetch dipindahkan ke `src/firebase/fetch-likert.js`
- Pastikan store tetap memiliki state management (`likerts`, `currentLikert`, `loading`, `currentLikertScales`)
- Pastikan tidak ada import yang rusak
- Pastikan pemanggil di komponen (misal `AdminLikert.vue`) tetap berfungsi karena nama fungsi di store tidak berubah
- Jalankan `npm run build` untuk memastikan tidak ada error

## Catatan

- Nama fungsi di store **tidak berubah** agar pemanggil di komponen tidak perlu diubah
- Logika transformasi data (parse `range` → `min`/`max`) dipindahkan ke file fetch
- Store tetap bertanggung jawab untuk state management dan error handling
- File fetch murni berisi logika Firestore (read data)
