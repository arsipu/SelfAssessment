import { db } from "@/firebase/firebase-config";
import { doc, updateDoc } from "firebase/firestore";

/**
 * Mengupdate dokumen scale di subcollection `likert/{likertId}/scale`.
 *
 * @param {string} likertId
 * @param {string} scaleId
 * @param {{ score: string, range: string, description: string }} param2
 * @returns {Promise<{ id: string, label: string, description: string, min: number, max: number }>}
 *   Dokumen scale yang sudah diupdate, dengan format sama seperti fetchLikertScales.
 */
export const updateScale = async (
	likertId,
	scaleId,
	{ score, range, description },
) => {
	await updateDoc(doc(db, "likert", likertId, "scale", scaleId), {
		score,
		range,
		description,
	});

	// Pecah range ("min – max") menggunakan regex yang sama seperti fetchLikertScales
	const parts = range.split(/\s*[-–—]\s*/).map((s) => s.trim());

	const updated = {
		id: scaleId,
		label: score,
		description,
		min: Number(parts[0]),
		max: Number(parts[1]),
	};

	console.log("Scale updated:", scaleId);
	return updated;
};
