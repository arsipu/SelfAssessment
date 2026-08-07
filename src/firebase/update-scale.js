import { db } from "@/firebase/firebase-config";
import { doc, updateDoc } from "firebase/firestore";

/**
 * Mengupdate dokumen scale di subcollection `likert/{likertId}/scale`.
 *
 * @param {string} likertId
 * @param {string} scaleId
 * @param {{ score: string, range: string, description: string }} param2
 * @returns {Promise<void>}
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
	console.log("Scale updated:", scaleId);
};
