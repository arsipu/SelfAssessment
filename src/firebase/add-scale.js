import { db } from "@/firebase/firebase-config";
import { collection, addDoc } from "firebase/firestore";

/**
 * Menambahkan scale baru ke subcollection `likert/{likertId}/scale`.
 *
 * @param {string} likertId
 * @param {{ score: string, range: string, description: string }} param1
 * @returns {Promise<string>} ID dokumen scale yang baru dibuat
 */
export const addScale = async (likertId, { score, range, description }) => {
	const ref = await addDoc(collection(db, "likert", likertId, "scale"), {
		score,
		range,
		description,
	});
	console.log("Scale added with ID:", ref.id);
	return ref.id;
};
