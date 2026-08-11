import { db } from "@/firebase/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Menghapus pertanyaan dari array `questions` di dalam dokumen
 * `likert/{likertId}/categories/{categoryId}`.
 *
 * @param {string} likertId
 * @param {string} categoryId
 * @param {string} questionId
 * @returns {Promise<string>} Id pertanyaan yang dihapus (agar store bisa hapus dari state).
 */
export const deleteQuestion = async (likertId, categoryId, questionId) => {
	try {
		const categoryRef = doc(db, "likert", likertId, "categories", categoryId);
		const snap = await getDoc(categoryRef);
		if (!snap.exists()) throw new Error("Category not found");
		const currentQuestions = snap.data().questions || [];
		const updatedQuestions = currentQuestions.filter(
			(q) => q.id !== questionId,
		);
		await updateDoc(categoryRef, { questions: updatedQuestions });

		console.log("Question deleted:", questionId);
		return questionId;
	} catch (error) {
		console.error("Error deleting question:", error);
		throw error;
	}
};
