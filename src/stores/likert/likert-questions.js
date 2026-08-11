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
	// Flat array across ALL categories:
	// { id, categoryId, question, favorable }
	const questions = ref([]);
	const loading = ref(false);

	// ── Fetch questions for ONE category ───────────────────────
	// Questions sekarang adalah array field di dalam document categories/{categoryId}.

	const fetchQuestionsByCategory = async (likertId, categoryId) => {
		questions.value = await fetchQuestions(likertId, categoryId);
		return questions.value;
	};

	// ── Fetch ALL questions across every category ─────────────
	// categoriesData: array dari category doc (sudah include field questions)

	const fetchAll = async (categoriesData) => {
		loading.value = true;
		try {
			questions.value = await fetchAllQuestions(categoriesData);
		} finally {
			loading.value = false;
		}
		return questions.value;
	};

	// ── Add question to a specific category ───────────────────
	// Gunakan arrayUnion untuk append item baru ke array `questions`.

	const add = async (likertId, categoryId, { question, favorable }) => {
		const newQuestion = await addQuestion(likertId, categoryId, {
			question,
			favorable,
		});
		questions.value.push(newQuestion);
		return newQuestion.id;
	};

	// ── Update question ────────────────────────────────────────
	// Baca current array, modify item, lalu overwrite seluruh array.

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

	// ── Delete question ────────────────────────────────────────

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
