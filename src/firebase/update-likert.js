import { db } from "@/firebase/firebase-config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { slugify } from "@/utils/slug";

/**
 * Mengupdate dokumen likert di collection `likert`.
 *
 * @param {string} likertId
 * @param {{ name: string, description: string }} param1
 * @returns {Promise<{ id: string, name: string, slug: string, description: string, updatedAt: Date }>}
 *   Data yang diupdate (lengkap dengan `slug`), agar store bisa mengubah state langsung tanpa fetch ulang.
 */
export const updateLikert = async (likertId, { name, description }) => {
	console.log("Updating likert:", likertId);
	const slug = slugify(name);
	await updateDoc(doc(db, "likert", likertId), {
		name,
		slug,
		description,
		updatedAt: serverTimestamp(),
	});
	console.log("Likert updated:", likertId);
	return { id: likertId, name, slug, description, updatedAt: new Date() };
};
