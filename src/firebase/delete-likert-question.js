import { db } from "@/firebase/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Menghapus pertanyaan dari array `questions` di dalam dokumen
 * `likert/{likertId}/categories/{categoryId}`.
 *
 * Karena `questions` adalah array field di dalam dokumen kategori, penghapusan
 * dilakukan dengan membaca array saat ini, memfilter item yang cocok dengan
 * `questionId`, lalu menulis ulang array tanpa item tersebut.
 *
 * @param {string} likertId - ID instrumen Likert.
 * @param {string} categoryId - ID kategori tempat pertanyaan berada.
 * @param {string} questionId - ID pertanyaan yang akan dihapus.
 * @returns {Promise<string>} Id pertanyaan yang dihapus (agar store bisa hapus dari state).
 */
export const deleteQuestion = async (likertId, categoryId, questionId) => {
	try {
		// Referensi dokumen kategori tempat pertanyaan berada
		const categoryRef = doc(db, "likert", likertId, "categories", categoryId);
		const snap = await getDoc(categoryRef);
		if (!snap.exists()) throw new Error("Category not found");

		const currentQuestions = snap.data().questions || [];

		// Filter: buang item yang cocok dengan questionId
		const updatedQuestions = currentQuestions.filter(
			(q) => q.id !== questionId,
		);

		// Tulis ulang array tanpa pertanyaan yang dihapus
		await updateDoc(categoryRef, { questions: updatedQuestions });

		console.log("Question deleted:", questionId);
		return questionId;
	} catch (error) {
		console.error("Error deleting question:", error);
		throw error; // lempar ulang agar pemanggil bisa menangani & menampilkan pesan
	}
};
