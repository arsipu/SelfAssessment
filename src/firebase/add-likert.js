import { db } from "@/firebase/firebase-config";
import {
	collection,
	addDoc,
	getDoc,
	doc,
	serverTimestamp,
} from "firebase/firestore";
import { INACTIVE } from "@/apps/status";
import { slugify } from "@/utils/slug";

/**
 * Menambahkan instrumen Likert baru ke collection `likert`.
 *
 * @param {{ name: string, description: string }} param0
 * @returns {Promise<object>} Dokumen yang baru dibuat (lengkap dengan `id` dan semua field)
 */
export const addLikert = async ({ name, description }) => {
	console.log("Adding likert:", name);
	try {
		const ref = await addDoc(collection(db, "likert"), {
			name,
			slug: slugify(name),
			description,
			status: INACTIVE,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});

		// Ambil dokumen yang baru dibuat untuk mengembalikan data lengkap
		const snap = await getDoc(doc(db, "likert", ref.id));
		const created = { id: snap.id, ...snap.data() };

		console.log("Likert added with ID:", ref.id);
		return created;
	} catch (error) {
		console.error("Error adding likert:", error);
		throw error;
	}
};
