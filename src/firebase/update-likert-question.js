import { db } from "@/firebase/firebase-config";
import { doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";

/**
 * Helper: mengambil array `questions` dari dokumen kategori.
 *
 * @param {string} likertId
 * @param {string} categoryId
 * @returns {Promise<Array<{ id: string, question: string, favorable: boolean }>>}
 */
async function getQuestionsArray(likertId, categoryId) {
	const ref = doc(db, "likert", likertId, "categories", categoryId);
	const snap = await getDoc(ref);
	if (!snap.exists()) return [];
	return snap.data().questions || [];
}

/**
 * Mengupdate pertanyaan di dalam array `questions` pada dokumen kategori.
 *
 * Jika `newCategoryId` diberikan dan berbeda dari `categoryId`, pertanyaan
 * dipindah ke kategori target (menggunakan `writeBatch` agar atomik).
 *
 * @param {string} likertId
 * @param {string} categoryId
 * @param {string} questionId
 * @param {{ question: string, favorable: boolean, newCategoryId?: string }} param3
 * @returns {Promise<{ id: string, categoryId: string, question: string, favorable: boolean }>}
 *   Data pertanyaan hasil update (untuk sinkronisasi state di store).
 */
export const updateQuestion = async (
	likertId,
	categoryId,
	questionId,
	{ question, favorable, newCategoryId },
) => {
	try {
		const targetCategoryId = newCategoryId || categoryId;

		if (newCategoryId && newCategoryId !== categoryId) {
			// ── Move to different category ──
			const sourceRef = doc(db, "likert", likertId, "categories", categoryId);
			const sourceSnap = await getDoc(sourceRef);
			if (!sourceSnap.exists()) throw new Error("Source category not found");
			const sourceQuestions = sourceSnap.data().questions || [];
			const movedItem = sourceQuestions.find((q) => q.id === questionId);
			if (!movedItem) throw new Error("Question not found in source category");

			const updatedSource = sourceQuestions.filter((q) => q.id !== questionId);
			const updatedTarget = [
				...(await getQuestionsArray(likertId, targetCategoryId)),
				{ ...movedItem, question: question.trim(), favorable },
			];

			const batch = writeBatch(db);
			batch.update(sourceRef, { questions: updatedSource });
			batch.update(
				doc(db, "likert", likertId, "categories", targetCategoryId),
				{ questions: updatedTarget },
			);
			await batch.commit();

			console.log("Question moved to new category:", questionId);
			return {
				id: questionId,
				categoryId: targetCategoryId,
				question: question.trim(),
				favorable,
			};
		}

		// ── Update in same category ──
		const categoryRef = doc(
			db,
			"likert",
			likertId,
			"categories",
			targetCategoryId,
		);
		const snap = await getDoc(categoryRef);
		if (!snap.exists()) throw new Error("Category not found");
		const currentQuestions = snap.data().questions || [];
		const updatedQuestions = currentQuestions.map((q) =>
			q.id === questionId ? { ...q, question: question.trim(), favorable } : q,
		);
		await updateDoc(categoryRef, { questions: updatedQuestions });

		console.log("Question updated:", questionId);
		return {
			id: questionId,
			categoryId: targetCategoryId,
			question: question.trim(),
			favorable,
		};
	} catch (error) {
		console.error("Error updating question:", error);
		throw error;
	}
};
