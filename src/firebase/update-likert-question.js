import { db } from "@/firebase/firebase-config";
import { doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";

/**
 * Helper: mengambil array `questions` dari dokumen kategori.
 *
 * @param {string} likertId - ID instrumen Likert.
 * @param {string} categoryId - ID kategori yang array `questions`-nya diambil.
 * @returns {Promise<Array<{ id: string, question: string, favorable: boolean }>>}
 *   Array pertanyaan dari kategori. Jika dokumen tidak ada, mengembalikan `[]`.
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
 * dipindah ke kategori target:
 *   - Baca array `questions` dari kategori sumber.
 *   - Cari item yang akan dipindah.
 *   - Hapus dari kategori sumber.
 *   - Baca array `questions` dari kategori target.
 *   - Append item (dengan data terbaru) ke kategori target.
 *   - Gunakan `writeBatch` agar kedua operasi update atomik (jika salah satu
 *     gagal, semua dibatalkan).
 *
 * Jika tidak pindah kategori:
 *   - Baca array `questions` dari kategori.
 *   - Map item yang cocok dengan `questionId` → update `question` & `favorable`.
 *   - `updateDoc` dengan array baru.
 *
 * @param {string} likertId - ID instrumen Likert.
 * @param {string} categoryId - ID kategori asal pertanyaan.
 * @param {string} questionId - ID pertanyaan yang akan diupdate.
 * @param {{ question: string, favorable: boolean, newCategoryId?: string }} param3
 *   - `question`: teks pertanyaan baru (akan di-trim).
 *   - `favorable`: boolean, apakah pertanyaan favorable (positif).
 *   - `newCategoryId`: opsional, ID kategori tujuan jika ingin memindah.
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
		// Kategori tujuan = kategori baru jika dipindah, selain itu kategori asal
		const targetCategoryId = newCategoryId || categoryId;

		if (newCategoryId && newCategoryId !== categoryId) {
			// ── Move to different category ──
			const sourceRef = doc(db, "likert", likertId, "categories", categoryId);
			const sourceSnap = await getDoc(sourceRef);
			if (!sourceSnap.exists()) throw new Error("Source category not found");

			const sourceQuestions = sourceSnap.data().questions || [];
			const movedItem = sourceQuestions.find((q) => q.id === questionId);
			if (!movedItem) throw new Error("Question not found in source category");

			// Hapus item dari kategori sumber
			const updatedSource = sourceQuestions.filter((q) => q.id !== questionId);

			// Tambahkan item (dengan data terbaru) ke kategori target
			const updatedTarget = [
				...(await getQuestionsArray(likertId, targetCategoryId)),
				{ ...movedItem, question: question.trim(), favorable },
			];

			// Batch: update kedua kategori secara atomik
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

		// Map: update hanya item yang cocok dengan questionId
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
		throw error; // lempar ulang agar pemanggil bisa menangani & menampilkan pesan
	}
};
