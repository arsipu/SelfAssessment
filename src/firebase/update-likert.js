import { db } from "@/firebase/firebase-config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { slugify } from "@/utils/slug";

/**
 * Mengupdate dokumen likert di collection `likert`.
 *
 * @param {string} likertId
 * @param {{ name: string, description: string }} param1
 * @returns {Promise<void>}
 */
export const updateLikert = async (likertId, { name, description }) => {
	console.log("Updating likert:", likertId);
	await updateDoc(doc(db, "likert", likertId), {
		name,
		slug: slugify(name),
		description,
		updatedAt: serverTimestamp(),
	});
	console.log("Likert updated:", likertId);
};
