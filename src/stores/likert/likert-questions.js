import { defineStore } from "pinia";
import { ref } from "vue";
import {
	fetchQuestions,
	fetchAllQuestions,
} from "@/firebase/fetch-likert-questions";
import { addQuestion } from "@/firebase/add-likert-question";
import { updateQuestion } from "@/firebase/update-likert-question";
import { deleteQuestion } from "@/firebase/delete-likert-question";

/**
 * Store Pinia untuk mengelola pertanyaan Likert.
 *
 * Store ini HANYA bertanggung jawab atas state management dan sinkronisasi
 * state lokal. Seluruh operasi database (Firestore) dipindah ke folder
 * `src/firebase/` agar terpisah dari store.
 *
 * State:
 * - `questions`: Flat array semua pertanyaan `{ id, categoryId, question, favorable }`.
 * - `loading`: Indikator proses fetch sedang berlangsung.
 */
export const useLikertQuestionsStore = defineStore("likertQuestions", () => {
	// Flat array across ALL categories:
	// { id, categoryId, question, favorable }
	const questions = ref([]);
	const loading = ref(false);

	/**
	 * Mengambil pertanyaan untuk SATU kategori.
	 *
	 * Questions disimpan sebagai array field di dalam document
	 * `categories/{categoryId}`.
	 *
	 * @param {string} likertId - ID instrumen Likert.
	 * @param {string} categoryId - ID kategori yang pertanyaannya diambil.
	 * @returns {Promise<Array<{ id: string, categoryId: string, question: string, favorable: boolean }>>}
	 *   Array pertanyaan kategori tersebut.
	 */
	const fetchQuestionsByCategory = async (likertId, categoryId) => {
		questions.value = await fetchQuestions(likertId, categoryId);
		return questions.value;
	};

	/**
	 * Mengambil SEMUA pertanyaan dari seluruh kategori.
	 *
	 * categoriesData: array dari category doc (sudah include field questions).
	 *
	 * @param {Array<{ id: string, questions?: Array }>} categoriesData - Array kategori yang sudah dimuat.
	 * @returns {Promise<Array<{ id: string, categoryId: string, question: string, favorable: boolean }>>}
	 *   Flat array semua pertanyaan.
	 */
	const fetchAll = async (categoriesData) => {
		loading.value = true;
		try {
			questions.value = await fetchAllQuestions(categoriesData);
		} finally {
			loading.value = false;
		}
		return questions.value;
	};

	/**
	 * Menambahkan pertanyaan baru ke kategori tertentu.
	 *
	 * Gunakan arrayUnion untuk append item baru ke array `questions`.
	 *
	 * @param {string} likertId - ID instrumen Likert.
	 * @param {string} categoryId - ID kategori tujuan.
	 * @param {{ question: string, favorable: boolean }} param2 - Data pertanyaan baru.
	 * @returns {Promise<string>} ID pertanyaan yang baru ditambahkan.
	 */
	const add = async (likertId, categoryId, { question, favorable }) => {
		const newQuestion = await addQuestion(likertId, categoryId, {
			question,
			favorable,
		});
		questions.value.push(newQuestion);
		return newQuestion.id;
	};

	/**
	 * Mengupdate pertanyaan.
	 *
	 * Baca current array, modify item, lalu overwrite seluruh array.
	 * Mendukung pemindahan pertanyaan ke kategori lain via `newCategoryId`.
	 *
	 * @param {string} likertId - ID instrumen Likert.
	 * @param {string} categoryId - ID kategori asal pertanyaan.
	 * @param {string} questionId - ID pertanyaan yang diupdate.
	 * @param {{ question: string, favorable: boolean, newCategoryId?: string }} param3 - Data update.
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Menghapus pertanyaan.
	 *
	 * @param {string} likertId - ID instrumen Likert.
	 * @param {string} categoryId - ID kategori tempat pertanyaan berada.
	 * @param {string} questionId - ID pertanyaan yang dihapus.
	 * @returns {Promise<void>}
	 */
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
