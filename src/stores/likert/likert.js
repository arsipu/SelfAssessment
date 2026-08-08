import { defineStore } from "pinia";
import { ref } from "vue";

import { ACTIVE, INACTIVE } from "@/apps/status";
import { addLikert as addLikertFirebase } from "@/firebase/add-likert";
import {
	fetchLikerts as fetchLikertsFirebase,
	getLikertById as getLikertByIdFirebase,
	getLikertBySlug as getLikertBySlugFirebase,
	fetchLikertScales as fetchLikertScalesFirebase,
} from "@/firebase/fetch-likert";
import { deleteLikert as deleteLikertFirebase } from "@/firebase/delete-likert";
import { updateLikert as updateLikertFirebase } from "@/firebase/update-likert";
import { updateLikertStatus as updateLikertStatusFirebase } from "@/firebase/update-likert-status";
import { addScale as addScaleFirebase } from "@/firebase/add-scale";
import { updateScale as updateScaleFirebase } from "@/firebase/update-scale";
import { deleteScale as deleteScaleFirebase } from "@/firebase/delete-scale";

export const useLikertStore = defineStore("likert", () => {
	const likerts = ref([]);
	const currentLikert = ref(null);
	const loading = ref(false);
	const currentLikertScales = ref([]);

	// ── Likert (surveys) ──────────────────────────────────────

	const fetchLikerts = async () => {
		loading.value = true;
		try {
			likerts.value = await fetchLikertsFirebase();
		} catch (error) {
			console.error("Error fetching likerts:", error);
		} finally {
			loading.value = false;
		}
	};

	const getLikertById = async (likertId) => {
		try {
			currentLikert.value = await getLikertByIdFirebase(likertId);
			return currentLikert.value;
		} catch (error) {
			console.error("Error fetching likert:", error);
		}
	};

	// ── Detail 1 survei berdasarkan slug ──────────────────────

	const getLikertBySlug = async (slug) => {
		// 1. Cek currentLikert (data yang sedang aktif)
		if (currentLikert.value?.slug === slug) {
			return currentLikert.value;
		}

		// 2. Cek daftar likerts
		const cached = likerts.value.find((l) => l.slug === slug);
		if (cached) {
			currentLikert.value = cached;
			return cached;
		}

		// 3. Fetch dari Firebase
		try {
			const likert = await getLikertBySlugFirebase(slug);
			currentLikert.value = likert;

			// Simpan ke list jika belum ada (untuk caching)
			if (likert && !likerts.value.some((l) => l.id === likert.id)) {
				likerts.value.push(likert);
			}

			return likert;
		} catch (error) {
			console.error("Error fetching likert by slug:", error);
		}
	};

	const addLikert = async ({ name, description }) => {
		try {
			const created = await addLikertFirebase({ name, description });
			// tambahkan ke store list
			likerts.value.push(created);
			// console log list
			console.log("Likert List", likerts.value);
			return created;
		} catch (error) {
			console.error("Error adding likert:", error);
			throw error;
		}
	};

	const updateLikert = async (likertId, { name, description }) => {
		try {
			const updated = await updateLikertFirebase(likertId, {
				name,
				description,
			});

			// Ubah state store langsung — tidak perlu fetch ulang
			const index = likerts.value.findIndex((l) => l.id === likertId);
			if (index !== -1) {
				likerts.value[index] = { ...likerts.value[index], ...updated };
			}
		} catch (error) {
			console.error("Error updating likert:", error);
			throw error;
		}
	};

	// ── Hapus likert (cascading penuh) ──────────────────────────
	// Menghapus seluruh data terkait:
	//   - Semua submission
	//   - Semua kategori (pertanyaan di dalamnya otomatis karena array field)
	//   - Semua skala penilaian
	//   - Document utama
	const deleteLikert = async (likertId) => {
		try {
			await deleteLikertFirebase(likertId);
			// Hapus dari state store berdasarkan id — tidak perlu fetch ulang
			likerts.value = likerts.value.filter((l) => l.id !== likertId);
		} catch (error) {
			console.error("Error deleting likert:", error);
			throw error;
		}
	};

	const updateLikertStatus = async (id, status) => {
		try {
			// Cari likert lain yang masih active (state management di store)
			const activeLikertIds =
				status === ACTIVE
					? likerts.value
							.filter((l) => l.id !== id && l.status === ACTIVE)
							.map((l) => l.id)
					: [];

			await updateLikertStatusFirebase(id, status, activeLikertIds);

			// Ubah state store langsung — tidak perlu fetch ulang
			// 1. Nonaktifkan likert lain yang masih active
			if (status === ACTIVE) {
				likerts.value = likerts.value.map((l) =>
					activeLikertIds.includes(l.id)
						? { ...l, status: INACTIVE, updatedAt: new Date() }
						: l,
				);
			}

			// 2. Update status likert yang dimaksud
			likerts.value = likerts.value.map((l) =>
				l.id === id ? { ...l, status, updatedAt: new Date() } : l,
			);
		} catch (error) {
			console.error("Error updating likert status:", error);
			throw error;
		}
	};

	const fetchLikertScales = async (likertId, cached = false) => {
		// Jika cached = true dan data sudah ada di state untuk likert ini
		if (
			cached &&
			currentLikert.value?.id === likertId &&
			currentLikertScales.value.length > 0
		) {
			return currentLikertScales.value;
		}

		try {
			const data = await fetchLikertScalesFirebase(likertId);
			currentLikertScales.value = data;
			return currentLikertScales.value;
		} catch (error) {
			console.error("Error fetching likert scales:", error);
			currentLikertScales.value = [];
			throw error;
		}
	};

	// ── Scale CRUD ────────────────────────────────────────────

	const addScale = async (likertId, { score, range, description }) => {
		try {
			const created = await addScaleFirebase(likertId, {
				score,
				range,
				description,
			});

			// Update state langsung — tidak perlu fetch ulang
			currentLikertScales.value.push(created);
			currentLikertScales.value.sort((a, b) => b.min - a.min);

			return created;
		} catch (error) {
			console.error("Error adding scale:", error);
			throw error;
		}
	};

	const updateScale = async (
		likertId,
		scaleId,
		{ score, range, description },
	) => {
		try {
			const updated = await updateScaleFirebase(likertId, scaleId, {
				score,
				range,
				description,
			});

			// Update state langsung — tidak perlu fetch ulang
			const index = currentLikertScales.value.findIndex(
				(s) => s.id === scaleId,
			);
			if (index !== -1) {
				currentLikertScales.value[index] = updated;
			}
			currentLikertScales.value.sort((a, b) => b.min - a.min);

			return updated;
		} catch (error) {
			console.error("Error updating scale:", error);
			throw error;
		}
	};

	const deleteScale = async (likertId, scaleId) => {
		try {
			await deleteScaleFirebase(likertId, scaleId);

			// Hapus dari state langsung — tidak perlu fetch ulang
			currentLikertScales.value = currentLikertScales.value.filter(
				(s) => s.id !== scaleId,
			);
		} catch (error) {
			console.error("Error deleting scale:", error);
			throw error;
		}
	};

	return {
		likerts,
		currentLikert,
		loading,
		currentLikertScales,
		fetchLikerts,
		getLikertById,
		getLikertBySlug,
		addLikert,
		updateLikert,
		deleteLikert,
		updateLikertStatus,
		fetchLikertScales,
		addScale,
		updateScale,
		deleteScale,
	};
});
