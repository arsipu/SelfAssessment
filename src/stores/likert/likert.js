import { defineStore } from "pinia";
import { ref } from "vue";
import { db } from "@/firebase/firebase-config";
import {
	collection,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
} from "firebase/firestore";

import { ACTIVE, INACTIVE } from "@/apps/status";
import { slugify } from "@/utils/slug";
import { addLikert as addLikertFirebase } from "@/firebase/add-likert";
import {
	fetchLikerts as fetchLikertsFirebase,
	getLikertById as getLikertByIdFirebase,
	getLikertBySlug as getLikertBySlugFirebase,
	fetchLikertScales as fetchLikertScalesFirebase,
} from "@/firebase/fetch-likert";
import { deleteLikert as deleteLikertFirebase } from "@/firebase/delete-likert";

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
		try {
			currentLikert.value = await getLikertBySlugFirebase(slug);
			return currentLikert.value;
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
		console.log("Updating likert:", likertId);
		try {
			await updateDoc(doc(db, "likert", likertId), {
				name,
				slug: slugify(name),
				description,
				updatedAt: serverTimestamp(),
			});
			console.log("Likert updated:", likertId);
			await fetchLikerts();
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
		if (status === ACTIVE) {
			// cari likert lain yang masih active, turunkan jadi inactive dulu
			const others = likerts.value.filter(
				(l) => l.id !== id && l.status === ACTIVE,
			);
			for (const other of others) {
				await updateDoc(doc(db, "likert", other.id), {
					status: INACTIVE,
					updatedAt: serverTimestamp(),
				});
			}
		}

		await updateDoc(doc(db, "likert", id), {
			status,
			updatedAt: serverTimestamp(),
		});

		await fetchLikerts();
	};

	const fetchLikertScales = async (likertId) => {
		try {
			currentLikertScales.value = await fetchLikertScalesFirebase(likertId);
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
			const ref = await addDoc(collection(db, "likert", likertId, "scale"), {
				score,
				range,
				description,
			});
			console.log("Scale added with ID:", ref.id);
			return ref.id;
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
			await updateDoc(doc(db, "likert", likertId, "scale", scaleId), {
				score,
				range,
				description,
			});
			console.log("Scale updated:", scaleId);
		} catch (error) {
			console.error("Error updating scale:", error);
			throw error;
		}
	};

	const deleteScale = async (likertId, scaleId) => {
		try {
			await deleteDoc(doc(db, "likert", likertId, "scale", scaleId));
			console.log("Scale deleted:", scaleId);
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
