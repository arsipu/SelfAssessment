import { db } from "@/firebase/firebase-config";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

/**
 * Helper: generate ID unik untuk setiap pertanyaan.
 *
 * @returns {string}
 */
function generateId() {
	return (
		crypto.randomUUID?.() ??
		`${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
	);
}

/**
 * Menambahkan pertanyaan baru ke array `questions` di dalam dokumen
 * `likert/{likertId}/categories/{categoryId}`.
 *
 * Menggunakan `arrayUnion` untuk append item baru ke array.
 *
 * @param {string} likertId
 * @param {string} categoryId
 * @param {{ question: string, favorable: boolean }} param2
 * @returns {Promise<{ id: string, categoryId: string, question: string, favorable: boolean }>}
 *   Data pertanyaan yang baru ditambahkan (lengkap dengan `id`).
 */
export const addQuestion = async (
	likertId,
	categoryId,
	{ question, favorable },
) => {
	const newQuestion = {
		id: generateId(),
		question: question.trim(),
		favorable,
	};

	try {
		const categoryRef = doc(db, "likert", likertId, "categories", categoryId);
		await updateDoc(categoryRef, {
			questions: arrayUnion(newQuestion),
		});
		console.log("Question added with ID:", newQuestion.id);
		return {
			id: newQuestion.id,
			categoryId,
			question: newQuestion.question,
			favorable: newQuestion.favorable,
		};
	} catch (error) {
		console.error("Error adding question:", error);
		throw error;
	}
};
