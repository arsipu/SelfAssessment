# Task Plan: Pisahkan Semua Operasi Baca/Tulis Firestore dari Store

## Tujuan

Memisahkan **semua** operasi baca/tulis Firestore dari `src/stores/likert/likert.js` ke file terpisah di folder `src/firebase/`. Store hanya fokus ke **state management** (ref, computed, actions yang mengelola state) dan memanggil fungsi-fungsi dari folder firebase. Tidak ada lagi import `firebase/firestore` langsung di store.

## Analisis Kode Saat Ini (`src/stores/likert/likert.js`)

### Operasi Firestore yang Sudah Dipisahkan

| Operasi             | File Firebase                   |
| ------------------- | ------------------------------- |
| `addLikert`         | `src/firebase/add-likert.js`    |
| `deleteLikert`      | `src/firebase/delete-likert.js` |
| `fetchLikerts`      | `src/firebase/fetch-likert.js`  |
| `getLikertById`     | `src/firebase/fetch-likert.js`  |
| `getLikertBySlug`   | `src/firebase/fetch-likert.js`  |
| `fetchLikertScales` | `src/firebase/fetch-likert.js`  |

### Operasi Firestore yang Masih Langsung di Store

| Operasi              | Fungsi Store                                                    | Operasi Firestore                                                    |
| -------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| `updateLikert`       | `updateLikert(likertId, { name, description })`                 | `updateDoc` + `serverTimestamp`                                      |
| `updateLikertStatus` | `updateLikertStatus(id, status)`                                | `updateDoc` + `serverTimestamp` (loop untuk nonaktifkan likert lain) |
| `addScale`           | `addScale(likertId, { score, range, description })`             | `addDoc`                                                             |
| `updateScale`        | `updateScale(likertId, scaleId, { score, range, description })` | `updateDoc`                                                          |
| `deleteScale`        | `deleteScale(likertId, scaleId)`                                | `deleteDoc`                                                          |

### Import `firebase/firestore` yang Masih Ada di Store

```js
import {
	collection,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
} from "firebase/firestore";
```

Semua import ini harus dihapus dari store setelah operasi dipindahkan.

## Rencana Implementasi

### 1. Buat file `src/firebase/update-likert.js`

Buat file baru untuk operasi update likert:

```js
// Struktur yang direncanakan
import { db } from "@/firebase/firebase-config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { slugify } from "@/utils/slug";
```

**Fungsi yang diekspor: `updateLikert(likertId, { name, description })`**

- Mengupdate dokumen `likert/{likertId}` dengan field:
  - `name`
  - `slug` — hasil `slugify(name)`
  - `description`
  - `updatedAt` — `serverTimestamp()`

### 2. Buat file `src/firebase/update-likert-status.js`

Buat file baru untuk operasi update status likert:

```js
// Struktur yang direncanakan
import { db } from "@/firebase/firebase-config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { INACTIVE } from "@/apps/status";
```

**Fungsi yang diekspor: `updateLikertStatus(id, status, activeLikertIds)`**

- Jika status = `ACTIVE`:
  - Loop `activeLikertIds` (daftar id likert lain yang masih active) dan update statusnya menjadi `INACTIVE` + `updatedAt`
- Update dokumen `likert/{id}` dengan:
  - `status`
  - `updatedAt` — `serverTimestamp()`

> **Catatan:** Logika untuk mencari likert lain yang active (`likerts.value.filter(...)`) tetap di store karena itu bagian dari state management. Store mengirimkan daftar `activeLikertIds` ke fungsi firebase.

### 3. Buat file `src/firebase/add-scale.js`

Buat file baru untuk operasi tambah scale:

```js
// Struktur yang direncanakan
import { db } from "@/firebase/firebase-config";
import { collection, addDoc } from "firebase/firestore";
```

**Fungsi yang diekspor: `addScale(likertId, { score, range, description })`**

- Menambahkan dokumen ke subcollection `likert/{likertId}/scale`
- Mengembalikan `ref.id`

### 4. Buat file `src/firebase/update-scale.js`

Buat file baru untuk operasi update scale:

```js
// Struktur yang direncanakan
import { db } from "@/firebase/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
```

**Fungsi yang diekspor: `updateScale(likertId, scaleId, { score, range, description })`**

- Mengupdate dokumen `likert/{likertId}/scale/{scaleId}` dengan field:
  - `score`
  - `range`
  - `description`

### 5. Buat file `src/firebase/delete-scale.js`

Buat file baru untuk operasi hapus scale:

```js
// Struktur yang direncanakan
import { db } from "@/firebase/firebase-config";
import { doc, deleteDoc } from "firebase/firestore";
```

**Fungsi yang diekspor: `deleteScale(likertId, scaleId)`**

- Menghapus dokumen `likert/{likertId}/scale/{scaleId}`

### 6. Update `src/stores/likert/likert.js`

- **Hapus semua** import dari `firebase/firestore`:
  ```js
  import {
  	collection,
  	doc,
  	addDoc,
  	updateDoc,
  	deleteDoc,
  	serverTimestamp,
  } from "firebase/firestore";
  ```
- **Hapus** import `db` dari `@/firebase/firebase-config` (tidak lagi digunakan)
- **Tambahkan** import dari file-file firebase baru:
  ```js
  import { updateLikert as updateLikertFirebase } from "@/firebase/update-likert";
  import { updateLikertStatus as updateLikertStatusFirebase } from "@/firebase/update-likert-status";
  import { addScale as addScaleFirebase } from "@/firebase/add-scale";
  import { updateScale as updateScaleFirebase } from "@/firebase/update-scale";
  import { deleteScale as deleteScaleFirebase } from "@/firebase/delete-scale";
  ```
- **Ganti implementasi** fungsi-fungsi di store agar memanggil fungsi dari file firebase:

#### `updateLikert`

```js
const updateLikert = async (likertId, { name, description }) => {
	try {
		await updateLikertFirebase(likertId, { name, description });
		await fetchLikerts();
	} catch (error) {
		console.error("Error updating likert:", error);
		throw error;
	}
};
```

#### `updateLikertStatus`

```js
const updateLikertStatus = async (id, status) => {
	try {
		// Cari likert lain yang masih active (state management di store)
		const activeLikertIds =
			status === ACTIVE
				? likerts.value
						.filter((l) => l.id !== id && l.status === ACTIVE)
						.map((l) => l.id)
				: [];

		await updateLikertStatusFirebase(id, status, activeLikertIds);
		await fetchLikerts();
	} catch (error) {
		console.error("Error updating likert status:", error);
		throw error;
	}
};
```

#### `addScale`

```js
const addScale = async (likertId, { score, range, description }) => {
	try {
		return await addScaleFirebase(likertId, { score, range, description });
	} catch (error) {
		console.error("Error adding scale:", error);
		throw error;
	}
};
```

#### `updateScale`

```js
const updateScale = async (
	likertId,
	scaleId,
	{ score, range, description },
) => {
	try {
		await updateScaleFirebase(likertId, scaleId, { score, range, description });
	} catch (error) {
		console.error("Error updating scale:", error);
		throw error;
	}
};
```

#### `deleteScale`

```js
const deleteScale = async (likertId, scaleId) => {
	try {
		await deleteScaleFirebase(likertId, scaleId);
	} catch (error) {
		console.error("Error deleting scale:", error);
		throw error;
	}
};
```

### 7. Verifikasi

- Pastikan **tidak ada** import `firebase/firestore` di `src/stores/likert/likert.js`
- Pastikan **tidak ada** import `db` dari `@/firebase/firebase-config` di store
- Pastikan semua operasi baca/tulis Firestore ada di folder `src/firebase/`
- Pastikan store hanya fokus ke state management
- Pastikan pemanggil di komponen tetap berfungsi karena nama fungsi di store tidak berubah
- Jalankan `npm run build` untuk memastikan tidak ada error

## Struktur Folder `src/firebase/` Setelah Implementasi

```
src/firebase/
├── add-likert.js          # (sudah ada) Tambah likert
├── add-scale.js           # (baru) Tambah scale
├── delete-likert.js       # (sudah ada) Hapus likert (cascading)
├── delete-scale.js        # (baru) Hapus scale
├── fetch-likert.js        # (sudah ada) Fetch likert & scales
├── firebase-config.js     # (sudah ada) Konfigurasi Firebase
├── update-likert.js       # (baru) Update likert
├── update-likert-status.js # (baru) Update status likert
└── update-scale.js        # (baru) Update scale
```

## Catatan

- Nama fungsi di store **tidak berubah** agar pemanggil di komponen tidak perlu diubah
- Store tetap bertanggung jawab untuk state management dan error handling
- Logika untuk mencari likert lain yang active (`likerts.value.filter(...)`) tetap di store karena itu bagian dari state management
- File-file firebase murni berisi logika Firestore (baca/tulis data)
