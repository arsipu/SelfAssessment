import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchCategories, getCategoryById } from "@/firebase/fetch-categories";
import { addCategory } from "@/firebase/add-category";
import { updateCategory } from "@/firebase/update-category";
import { deleteCategory } from "@/firebase/delete-category";

export const useLikertCategoriesStore = defineStore("likertCategories", () => {
	const categories = ref([]);
	const loading = ref(false);

	// ── Fetch all categories for a likert ─────────────────────

	const fetchAll = async (likertId) => {
		loading.value = true;
		try {
			categories.value = await fetchCategories(likertId);
		} finally {
			loading.value = false;
		}
		return categories.value;
	};

	// ── Fetch single category ─────────────────────────────────

	const getById = async (likertId, categoryId) => {
		return getCategoryById(likertId, categoryId);
	};

	// ── Add category ──────────────────────────────────────────
	// `order` = posisi sisip (dari dropdown, 0..N). Category existing
	// yang order-nya >= posisi itu digeser +1 dulu.

	const add = async (likertId, { name, order }) => {
		const result = await addCategory(
			likertId,
			{ name, order },
			categories.value,
		);

		const shiftedIds = result.shiftedIds;
		const updatedExisting = categories.value.map((c) =>
			shiftedIds.has(c.id) ? { ...c, order: (c.order ?? 0) + 1 } : c,
		);

		const { shiftedIds: _ignored, ...newCategory } = result;
		categories.value = [...updatedExisting, newCategory].sort(
			(a, b) => (a.order ?? 0) - (b.order ?? 0),
		);
		return newCategory.id;
	};

	// ── Update category ───────────────────────────────────────
	// `order` = posisi baru (0..N-1, dari dropdown). Item di ANTARA
	// posisi lama & baru ikut digeser 1 langkah.

	const update = async (likertId, categoryId, { name, order }) => {
		const result = await updateCategory(
			likertId,
			categoryId,
			{ name, order },
			categories.value,
		);

		const { shiftedIds, direction } = result;
		categories.value = categories.value.map((c) => {
			if (c.id === categoryId) {
				return { ...c, name: result.name, order: result.order };
			}
			if (shiftedIds.has(c.id)) {
				return { ...c, order: (c.order ?? 0) + direction };
			}
			return c;
		});

		categories.value = [...categories.value].sort(
			(a, b) => (a.order ?? 0) - (b.order ?? 0),
		);
	};

	// ── Delete category ───────────────────────────────────────
	// NOTE: questions di dalam array ikut terhapus karena array
	// adalah bagian dari dokumen kategori.

	const remove = async (likertId, categoryId) => {
		await deleteCategory(likertId, categoryId);
		categories.value = categories.value.filter((c) => c.id !== categoryId);
	};

	return {
		categories,
		loading,
		fetchAll,
		getById,
		add,
		update,
		remove,
		fetchCategories: fetchAll,
		getCategoryById: getById,
		addCategory: add,
		updateCategory: update,
		deleteCategory: remove,
	};
});
