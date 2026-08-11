# Task: Pemisahan CRUD Database dari Store `likert-questions.js`

## Tujuan

Memindahkan seluruh logika database (Firestore) dari `src/stores/likert/likert-questions.js` ke folder `src/firebase/`, sehingga store hanya bertanggung jawab atas **state management** dan **sinkronisasi state lokal** — mengikuti pola yang sudah diterapkan pada `src/stores/likert/likert-categories.js`.

## Pola yang Diikuti (Referensi: `likert-categories.js`)

- Store mengimpor fungsi CRUD dari `@/firebase/*`.
- Store hanya berisi:
  - State (`ref`)
  - Logika sinkronisasi state setelah operasi CRUD selesai
  - Alias method lama agar komponen yang sudah ada tidak perlu diubah
- File `src/firebase/*` berisi:
  - Seluruh operasi Firestore (getDoc, updateDoc, writeBatch, arrayUnion, dll)
  - Helper internal (misal `getQuestionsArray`)
  - Logging & error handling

## File Baru yang Dibuat di `src/firebase/`

### 1. `src/firebase/fetch-likert-questions.js`

Berisi 2 fungsi:

- **`fetchQuestions(likertId, categoryId)`**
  - Membaca dokumen `likert/{likertId}/categories/{categoryId}`.
  - Mengambil field `questions` (array) dari dokumen.
  - Mengembalikan array `{ id, categoryId, question, favorable }`.
  - Jika dokumen tidak ada → return `[]`.

- **`fetchAllQuestions(categoriesData)`**
  - Menerima array kategori (sudah include field `questions`).
  - Meng-extract semua pertanyaan dari setiap kategori.
  - Mengembalikan flat array `{ id, categoryId, question, favorable }`.

> Catatan: `fetchAllQuestions` tidak melakukan query Firestore tambahan — data sudah tersedia di `categoriesData` (dari `fetchCategories`). Fungsi ini murni transformasi data, tetapi tetap diletakkan di `src/firebase` agar konsisten & store tetap bersih.

### 2. `src/firebase/add-likert-question.js`

Berisi 1 fungsi:

- **`addQuestion(likertId, categoryId, { question, favorable })`**
  - Generate ID unik (pindahkan helper `generateId` ke sini).
  - `updateDoc` dengan `arrayUnion` untuk append item baru ke array `questions`.
  - Mengembalikan `{ id, categoryId, question, favorable }` (data lengkap yang sudah ditambahkan).

### 3. `src/firebase/update-likert-question.js`

Berisi 1 fungsi:

- **`updateQuestion(likertId, categoryId, questionId, { question, favorable, newCategoryId })`**
  - Jika `newCategoryId` ada & berbeda dari `categoryId`:
    - Baca array `questions` dari kategori sumber.
    - Cari item yang akan dipindah.
    - Hapus dari kategori sumber.
    - Baca array `questions` dari kategori target (helper `getQuestionsArray`).
    - Append item (dengan data terbaru) ke kategori target.
    - Gunakan `writeBatch` untuk update kedua kategori secara atomik.
  - Jika tidak pindah kategori:
    - Baca array `questions` dari kategori.
    - Map item yang cocok dengan `questionId` → update `question` & `favorable`.
    - `updateDoc` dengan array baru.
  - Mengembalikan data hasil update (untuk sinkronisasi state di store).

### 4. `src/firebase/delete-likert-question.js`

Berisi 1 fungsi:

- **`deleteQuestion(likertId, categoryId, questionId)`**
  - Baca array `questions` dari kategori.
  - Filter item dengan `questionId`.
  - `updateDoc` dengan array baru (tanpa item yang dihapus).
  - Mengembalikan `questionId` yang dihapus.

## Perubahan pada `src/stores/likert/likert-questions.js`

Store akan di-refactor menjadi:

```js
import { defineStore } from "pinia";
import { ref } from "vue";
import {
	fetchQuestions,
	fetchAllQuestions,
} from "@/firebase/fetch-likert-questions";
import { addQuestion } from "@/firebase/add-likert-question";
import { updateQuestion } from "@/firebase/update-likert-question";
import { deleteQuestion } from "@/firebase/delete-likert-question";

export const useLikertQuestionsStore = defineStore("likertQuestions", () => {
	const questions = ref([]);
	const loading = ref(false);

	// ── Fetch questions for ONE category ───────────────────────
	const fetchQuestionsByCategory = async (likertId, categoryId) => {
		questions.value = await fetchQuestions(likertId, categoryId);
		return questions.value;
	};

	// ── Fetch ALL questions across every category ─────────────
	const fetchAll = async (categoriesData) => {
		loading.value = true;
		try {
			questions.value = await fetchAllQuestions(categoriesData);
		} finally {
			loading.value = false;
		}
		return questions.value;
	};

	// ── Add question ──────────────────────────────────────────
	const add = async (likertId, categoryId, { question, favorable }) => {
		const newQuestion = await addQuestion(likertId, categoryId, {
			question,
			favorable,
		});
		questions.value.push(newQuestion);
		return newQuestion.id;
	};

	// ── Update question ───────────────────────────────────────
	const update = async (
		likertId,
		categoryId,
		questionId,
		{ question, favorable, newCategoryId },
	) => {
		const updated = await updateQuestion(likertId, categoryId, questionId, {
			question,
			favorable,
			newCategoryId,
		});

		// Sinkronisasi state lokal
		const idx = questions.value.findIndex(
			(q) => q.id === questionId && q.categoryId === categoryId,
		);
		if (idx !== -1) {
			questions.value[idx] = updated;
		}
	};

	// ── Delete question ───────────────────────────────────────
	const remove = async (likertId, categoryId, questionId) => {
		await deleteQuestion(likertId, categoryId, questionId);
		questions.value = questions.value.filter((q) => q.id !== questionId);
	};

	return {
		questions,
		loading,
		fetchQuestions: fetchQuestionsByCategory,
		fetchAllQuestions: fetchAll,
		addQuestion: add,
		updateQuestion: update,
		deleteQuestion: remove,
	};
});
```

### Poin Penting Refactor

1. **Helper `generateId`** dipindah ke `src/firebase/add-likert-question.js` (tidak lagi di store).
2. **Helper `getQuestionsArray`** dipindah ke `src/firebase/update-likert-question.js` (internal, tidak di-export).
3. **Alias method dipertahankan** (`fetchQuestions`, `fetchAllQuestions`, `addQuestion`, `updateQuestion`, `deleteQuestion`) agar komponen yang sudah ada tidak perlu diubah.
4. **Error handling** dipindah ke file `src/firebase/*` (console.error + throw), store cukup `await` dan biarkan error mengalir ke pemanggil.
5. **State `questions` & `loading`** tetap di store, di-update setelah operasi CRUD selesai.

## Dokumentasi & Komentar

Seluruh file yang dibuat/diubah dilengkapi dengan:

- **JSDoc lengkap** pada setiap fungsi:
  - Deskripsi fungsi.
  - `@param` untuk setiap parameter (dengan penjelasan singkat).
  - `@returns` yang menjelaskan bentuk data yang dikembalikan.
- **Komentar inline** (`//`) untuk menjelaskan alur logika penting, seperti:
  - Transformasi data (misal menambah `categoryId` ke setiap item).
  - Alasan penggunaan `arrayUnion`, `writeBatch`, dll.
  - Sinkronisasi state setelah operasi CRUD.
- **Komentar bagian** (`// ──`) untuk memisahkan blok logika (fetch, add, update, delete).

File yang sudah didokumentasi:

| File                                     | Dokumentasi                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `src/firebase/fetch-likert-questions.js` | JSDoc `fetchQuestions` & `fetchAllQuestions`, komentar transformasi data       |
| `src/firebase/add-likert-question.js`    | JSDoc `generateId` & `addQuestion`, komentar `arrayUnion`                      |
| `src/firebase/update-likert-question.js` | JSDoc `getQuestionsArray` & `updateQuestion`, komentar batch & pindah kategori |
| `src/firebase/delete-likert-question.js` | JSDoc `deleteQuestion`, komentar filter & overwrite array                      |
| `src/stores/likert/likert-questions.js`  | JSDoc store & setiap method, komentar sinkronisasi state                       |

## File yang Tidak Berubah

- `src/firebase/firebase-config.js` — tetap sebagai konfigurasi.
- Komponen `.vue` yang memakai store — API store dipertahankan, tidak perlu perubahan.
- Store lain (`likert-categories.js`, `likert.js`, dll) — tidak terpengaruh.

## Langkah Implementasi

1. Buat `src/firebase/fetch-likert-questions.js`
2. Buat `src/firebase/add-likert-question.js`
3. Buat `src/firebase/update-likert-question.js`
4. Buat `src/firebase/delete-likert-question.js`
5. Refactor `src/stores/likert/likert-questions.js` (hapus semua logika Firestore, import dari `@/firebase/*`)
6. Verifikasi tidak ada import Firestore langsung di store (kecuali `firebase-config` jika masih diperlukan)
7. Test manual: fetch, add, update (termasuk pindah kategori), delete question
