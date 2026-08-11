import { db } from "@/firebase/firebase-config";
import { doc, getDoc } from "firebase/firestore";

/**
 * Mengambil semua pertanyaan dari satu kategori.
 *
 * Pertanyaan disimpan sebagai array field `questions` di dalam dokumen
 * `likert/{likertId}/categories/{categoryId}`. Fungsi ini membaca dokumen
 * kategori tersebut dan mengekstrak array `questions` menjadi format flat
 * yang siap dipakai oleh store.
 *
 * @param {string} likertId - ID instrumen Likert.
 * @param {string} categoryId - ID kategori yang pertanyaannya ingin diambil.
 * @returns {Promise<Array<{ id: string, categoryId: string, question: string, favorable: boolean }>>}
 *   Array pertanyaan dalam format `{ id, categoryId, question, favorable }`.
 *   Jika dokumen kategori tidak ada atau tidak punya field `questions`,
 *   mengembalikan array kosong `[]`.
 */
export const fetchQuestions = async (likertId, categoryId) => {
	try {
		// Referensi dokumen kategori di subcollection categories
		const categoryRef = doc(db, "likert", likertId, "categories", categoryId);
		const snap = await getDoc(categoryRef);

		// Jika dokumen tidak ada, tidak ada pertanyaan untuk kategori ini
		if (!snap.exists()) {
			return [];
		}

		const data = snap.data();
		const items = data.questions || [];

		// Transformasi: tambahkan categoryId ke setiap item agar store bisa
		// melacak asal kategori dari setiap pertanyaan (flat array).
		return items.map((q) => ({
			id: q.id,
			categoryId,
			question: q.question,
			favorable: q.favorable,
		}));
	} catch (error) {
		console.error("Error fetching questions:", error);
		return [];
	}
};

/**
 * Mengambil semua pertanyaan dari seluruh kategori.
 *
 * Fungsi ini TIDAK melakukan query Firestore tambahan — data sudah tersedia
 * di `categoriesData` (hasil `fetchCategories` yang sudah include field
 * `questions`). Fungsi ini murni transformasi data: mengekstrak semua
 * pertanyaan dari setiap kategori menjadi satu flat array.
 *
 * @param {Array<{ id: string, questions?: Array<{ id: string, question: string, favorable: boolean }> }>} categoriesData
 *   Array kategori yang sudah dimuat di store (termasuk field `questions`).
 * @returns {Promise<Array<{ id: string, categoryId: string, question: string, favorable: boolean }>>}
 *   Flat array semua pertanyaan dari seluruh kategori.
 */
export const fetchAllQuestions = async (categoriesData) => {
	try {
		const result = [];

		// Iterasi setiap kategori, extract semua pertanyaan di dalamnya
		for (const cat of categoriesData || []) {
			const items = (cat.questions || []).map((q) => ({
				id: q.id,
				categoryId: cat.id,
				question: q.question,
				favorable: q.favorable,
			}));
			result.push(...items);
		}

		console.log("All questions fetched:", result.length);
		return result;
	} catch (error) {
		console.error("Error fetching all questions:", error);
		return [];
	}
};
