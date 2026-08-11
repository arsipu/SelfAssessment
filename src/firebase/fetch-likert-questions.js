import { db } from "@/firebase/firebase-config";
import { doc, getDoc } from "firebase/firestore";

/**
 * Mengambil semua pertanyaan dari satu kategori.
 *
 * Pertanyaan disimpan sebagai array field `questions` di dalam dokumen
 * `likert/{likertId}/categories/{categoryId}`.
 *
 * @param {string} likertId
 * @param {string} categoryId
 * @returns {Promise<Array<{ id: string, categoryId: string, question: string, favorable: boolean }>>}
 */
export const fetchQuestions = async (likertId, categoryId) => {
	try {
		const categoryRef = doc(db, "likert", likertId, "categories", categoryId);
		const snap = await getDoc(categoryRef);
		if (!snap.exists()) {
			return [];
		}
		const data = snap.data();
		const items = data.questions || [];
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
 * Tidak melakukan query Firestore tambahan — data sudah tersedia di
 * `categoriesData` (hasil `fetchCategories` yang sudah include field `questions`).
 *
 * @param {Array<{ id: string, questions?: Array<{ id: string, question: string, favorable: boolean }> }>} categoriesData
 * @returns {Promise<Array<{ id: string, categoryId: string, question: string, favorable: boolean }>>}
 */
export const fetchAllQuestions = async (categoriesData) => {
	try {
		const result = [];
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
