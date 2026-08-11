# 📐 Code Rule — Panduan Penulisan Kode JavaScript

Dokumen ini berisi aturan wajib untuk penulisan kode JavaScript/TypeScript di proyek ini. Tujuan utama: **kode yang mudah dibaca, mudah dirawat, dan konsisten** di seluruh codebase.

---

## 1. Komentar & JSDoc (WAJIB)

> **Setiap kode WAJIB menyertakan komentar penjelasan dan JSDoc.**

### 1.1 JSDoc untuk Fungsi

Setiap fungsi **wajib** memiliki blok JSDoc yang menjelaskan:

- **Deskripsi** — apa yang dilakukan fungsi
- **@param** — setiap parameter (nama, tipe, dan penjelasan singkat)
- **@returns** — nilai yang dikembalikan beserta tipenya

#### Contoh Wajib:

```js
/**
 * Mengambil semua dokumen dari collection `likert`.
 *
 * @returns {Promise<Array<{ id: string, ...data }>>}
 */
export const fetchLikerts = async () => {
	const snap = await getDocs(collection(db, "likert"));
	return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
```

```js
/**
 * Mengambil 1 dokumen dari `likert/{likertId}`.
 *
 * @param {string} likertId - ID dokumen likert
 * @returns {Promise<{ id: string, ...data } | null>}
 */
export const getLikertById = async (likertId) => {
	const snap = await getDoc(doc(db, "likert", likertId));
	if (snap.exists()) {
		return { id: snap.id, ...snap.data() };
	}
	return null;
};
```

### 1.2 Komentar Penjelasan

- Gunakan komentar `//` untuk menjelaskan **logika yang tidak langsung terlihat**.
- Jangan menulis komentar yang hanya mengulang kode (redundant).
- Komentar harus menjelaskan **"mengapa"** bukan hanya **"apa"**.

#### Contoh Benar:

```js
// Cek currentLikert (data yang sedang aktif) — hindari fetch ulang
if (currentLikert.value?.slug === slug) {
	return currentLikert.value;
}
```

```js
// regex ini nangkep -, –, — dikelilingi spasi opsional
const parts = data.range.split(/\s*[-–—]\s*/).map((s) => s.trim());
```

#### Contoh Salah (redundant):

```js
// Mengambil data likert
const data = await getLikertById(id); // ❌ komentar tidak menambah informasi
```

### 1.3 Komentar Section / Pembatas

Gunakan komentar section untuk memisahkan kelompok fungsi yang berkaitan:

```js
// ── Likert (surveys) ──────────────────────────────────────

// ── Scale CRUD ────────────────────────────────────────────

// ── Hapus likert (cascading penuh) ──────────────────────────
```

---

## 2. Alur Pengambilan Data (WAJIB)

> **Urutan pengambilan data: `Front (Vue) → Store (Pinia) → Firebase (file terpisah)`**

### 2.1 Arsitektur Berlapis

```
┌─────────────────────────────────────────────────────────┐
│  FRONT (Vue Component / Page)                           │
│  - Hanya berinteraksi dengan Store                      │
│  - TIDAK PERNAH memanggil Firebase langsung             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  STORE (Pinia)                                          │
│  - Mengelola state (ref)                                │
│  - Memanggil fungsi dari folder /firebase               │
│  - Mengupdate state setelah operasi Firebase            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  FIREBASE (folder /firebase)                            │
│  - File terpisah dari Store                             │
│  - Satu-satunya layer yang berinteraksi dengan Firestore│
│  - Berisi fungsi CRUD murni (tanpa state management)    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Aturan Wajib

| Layer             | Boleh                                                           | Tidak Boleh                                                 |
| ----------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| **Front (Vue)**   | Memanggil Store, membaca state via `storeToRefs`                | ❌ Memanggil fungsi `/firebase` langsung                    |
| **Store (Pinia)** | Memanggil fungsi `/firebase`, mengelola state                   | ❌ Mengakses Firestore langsung (`db`, `collection`, `doc`) |
| **Firebase**      | Mengakses Firestore (`db`, `collection`, `doc`, `getDocs`, dll) | ❌ Mengelola state Pinia / Vue reactivity                   |

### 2.3 Contoh Implementasi yang Benar

#### Front (Vue Component) — `src/pages/likert/LikertForm.vue`

```js
import { useLikertStore } from "@/stores/likert/likert";

const likertStore = useLikertStore();

// ✅ Benar: Front hanya memanggil Store
onMounted(async () => {
	await likertStore.getLikertBySlug(likertSlug);
});
```

#### Store (Pinia) — `src/stores/likert/likert.js`

```js
import { addLikert as addLikertFirebase } from "@/firebase/add-likert";
import { fetchLikerts as fetchLikertsFirebase } from "@/firebase/fetch-likert";

export const useLikertStore = defineStore("likert", () => {
	const likerts = ref([]);

	/**
	 * Mengambil semua data likert dari Firebase dan menyimpannya ke state.
	 *
	 * @returns {Promise<void>}
	 */
	const fetchLikerts = async () => {
		loading.value = true;
		try {
			// ✅ Benar: Store memanggil fungsi dari folder /firebase
			likerts.value = await fetchLikertsFirebase();
		} catch (error) {
			console.error("Error fetching likerts:", error);
		} finally {
			loading.value = false;
		}
	};

	return { likerts, fetchLikerts };
});
```

#### Firebase (Layer Data) — `src/firebase/fetch-likert.js`

```js
import { db } from "@/firebase/firebase-config";
import { collection, getDocs } from "firebase/firestore";

/**
 * Mengambil semua dokumen dari collection `likert`.
 *
 * @returns {Promise<Array<{ id: string, ...data }>>}
 */
export const fetchLikerts = async () => {
	// ✅ Benar: Hanya layer Firebase yang mengakses Firestore
	const snap = await getDocs(collection(db, "likert"));
	return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
```

### 2.4 Contoh yang SALAH (Dilarang)

```js
// ❌ SALAH: Front memanggil Firebase langsung
import { fetchLikerts } from "@/firebase/fetch-likert";

onMounted(async () => {
	const data = await fetchLikerts(); // Langsung ke Firebase, lewati Store
});
```

```js
// ❌ SALAH: Store mengakses Firestore langsung
import { db } from "@/firebase/firebase-config";
import { collection, getDocs } from "firebase/firestore";

export const useLikertStore = defineStore("likert", () => {
	const fetchLikerts = async () => {
		// Store tidak boleh akses Firestore langsung
		const snap = await getDocs(collection(db, "likert"));
		likerts.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
	};
});
```

---

## 3. Penamaan File & Fungsi

### 3.1 Folder `/firebase`

Setiap file di folder `src/firebase/` mengikuti pola:

| Pola                   | Contoh                                             |
| ---------------------- | -------------------------------------------------- |
| `add-{resource}.js`    | `add-likert.js`, `add-scale.js`, `add-category.js` |
| `fetch-{resource}.js`  | `fetch-likert.js`, `fetch-categories.js`           |
| `update-{resource}.js` | `update-likert.js`, `update-scale.js`              |
| `delete-{resource}.js` | `delete-likert.js`, `delete-scale.js`              |
| `firebase-config.js`   | Konfigurasi Firebase (khusus, tidak berubah)       |

### 3.2 Folder `/stores`

Setiap store mengikuti pola:

| Pola                  | Contoh                                                               |
| --------------------- | -------------------------------------------------------------------- |
| `{resource}.js`       | `likert.js`, `holland.js`                                            |
| `{resource}-{sub}.js` | `likert-categories.js`, `likert-session.js`, `likert-submissions.js` |

### 3.3 Penamaan Fungsi

- Gunakan **camelCase** untuk fungsi dan variabel.
- Gunakan **PascalCase** untuk komponen Vue dan class.
- Fungsi yang memanggil Firebase diberi nama sesuai resource, contoh: `fetchLikerts`, `addLikert`, `updateScale`, `deleteCategory`.

---

## 4. Pola Store (Pinia)

### 4.1 Struktur Store

```js
import { defineStore } from "pinia";
import { ref } from "vue";

// Import fungsi Firebase (dengan alias `Firebase` di belakang)
import { fetchLikerts as fetchLikertsFirebase } from "@/firebase/fetch-likert";

export const useLikertStore = defineStore("likert", () => {
	// ── State ─────────────────────────────────────────────
	const likerts = ref([]);
	const loading = ref(false);

	// ── Actions ───────────────────────────────────────────

	/**
	 * Mengambil semua data likert.
	 *
	 * @returns {Promise<void>}
	 */
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

	return { likerts, loading, fetchLikerts };
});
```

### 4.2 Aturan Store

1. **State** dideklarasikan dengan `ref()` di bagian atas.
2. **Actions** memanggil fungsi Firebase, lalu **mengupdate state langsung** (tidak perlu fetch ulang).
3. Setiap action **wajib** punya JSDoc.
4. Gunakan `try/catch/finally` untuk menangani error.
5. Jangan pernah mengakses `db` / Firestore langsung di Store.

---

## 5. Pola Firebase (Layer Data)

### 5.1 Struktur File Firebase

```js
import { db } from "@/firebase/firebase-config";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";

/**
 * Deskripsi fungsi.
 *
 * @param {string} param1 - Penjelasan param1
 * @returns {Promise<...>}
 */
export const namaFungsi = async (param1) => {
	// komentar penjelasan logika
	const snap = await getDocs(collection(db, "collectionName"));
	return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
```

### 5.2 Aturan Firebase

1. **Satu-satunya layer** yang boleh mengimpor `db` dari `firebase-config.js`.
2. Setiap fungsi **wajib** punya JSDoc lengkap.
3. Fungsi bersifat **murni** — hanya menerima parameter, mengembalikan data, tanpa state management.
4. Gunakan `console.log` / `console.error` untuk debugging yang jelas.

---

## 6. Pola Front (Vue Component)

### 6.1 Aturan Front

1. **Hanya** berinteraksi dengan Store (Pinia) — tidak pernah langsung ke Firebase.
2. Gunakan `storeToRefs` untuk membaca state secara reaktif.
3. Panggil action store di dalam `onMounted` atau event handler.
4. Setiap fungsi di `<script setup>` **wajib** punya JSDoc.

### 6.2 Contoh

```js
<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useLikertStore } from "@/stores/likert/likert";

const route = useRoute();
const router = useRouter();
const likertStore = useLikertStore();

const { currentLikert } = storeToRefs(likertStore);

/**
 * Mengambil data likert berdasarkan slug saat halaman dimuat.
 *
 * @returns {Promise<void>}
 */
onMounted(async () => {
	// ✅ Benar: Front memanggil Store, bukan Firebase
	await likertStore.getLikertBySlug(route.params.slug);
});
</script>
```

---

## 7. Checklist Kepatuhan

Sebelum menganggap kode selesai, pastikan:

- [ ] **Setiap fungsi** memiliki JSDoc (`@param`, `@returns`)
- [ ] **Logika kompleks** memiliki komentar penjelasan
- [ ] **Front (Vue)** tidak memanggil Firebase langsung
- [ ] **Store (Pinia)** tidak mengakses Firestore langsung
- [ ] **Firebase** adalah satu-satunya layer yang mengakses `db`
- [ ] Alur data mengikuti: **Front → Store → Firebase**
- [ ] Penamaan file & fungsi konsisten dengan pola yang ada
- [ ] Error handling menggunakan `try/catch/finally`
