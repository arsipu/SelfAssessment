import { db } from "@/firebase/firebase-config";
import { collection, addDoc } from "firebase/firestore";

/**
 * Menambahkan scale baru ke subcollection `likert/{likertId}/scale`.
 *
 * @param {string} likertId
 * @param {{ score: string, range: string, description: string }} param1
 * @returns {Promise<{ id: string, label: string, description: string, min: number, max: number }>}
 *   Dokumen scale yang baru dibuat, dengan format sama seperti fetchLikertScales.
 */
export const addScale = async (likertId, { score, range, description }) => {
	const ref = await addDoc(collection(db, "likert", likertId, "scale"), {
		score,
		range,
		description,
	});

	// Pecah range ("min – max") menggunakan regex yang sama seperti fetchLikertScales
	const parts = range.split(/\s*[-–—]\s*/).map((s) => s.trim());

	const created = {
		id: ref.id,
		label: score,
		description,
		min: Number(parts[0]),
		max: Number(parts[1]),
	};

	console.log("Scale added with ID:", ref.id);
	return created;
};
