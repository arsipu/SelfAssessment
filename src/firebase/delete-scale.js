import { db } from "@/firebase/firebase-config";
import { doc, deleteDoc } from "firebase/firestore";

/**
 * Menghapus dokumen scale di subcollection `likert/{likertId}/scale`.
 *
 * @param {string} likertId
 * @param {string} scaleId
 * @returns {Promise<void>}
 */
export const deleteScale = async (likertId, scaleId) => {
	await deleteDoc(doc(db, "likert", likertId, "scale", scaleId));
	console.log("Scale deleted:", scaleId);
};
