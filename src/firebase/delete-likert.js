import { db } from "@/firebase/firebase-config";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";

/**
 * Menghapus likert beserta seluruh data terkait (cascading delete):
 *   - Semua submission
 *   - Semua kategori (pertanyaan di dalamnya otomatis karena array field)
 *   - Semua skala penilaian
 *   - Document utama
 *
 * @param {string} likertId
 * @returns {Promise<void>}
 */
export const deleteLikert = async (likertId) => {
	console.log("Deleting likert with cascading:", likertId);

	// 1. Hapus submissions
	const submissionsSnap = await getDocs(
		collection(db, "likert", likertId, "submissions"),
	);

	// 2. Hapus categories
	const categoriesSnap = await getDocs(
		collection(db, "likert", likertId, "categories"),
	);

	// 3. Hapus scales
	const scalesSnap = await getDocs(collection(db, "likert", likertId, "scale"));

	// Kumpulkan semua operasi delete dalam batch
	const batch = writeBatch(db);
	let operationCount = 0;

	submissionsSnap.docs.forEach((doc) => {
		batch.delete(doc.ref);
		operationCount++;
	});
	categoriesSnap.docs.forEach((doc) => {
		batch.delete(doc.ref);
		operationCount++;
	});
	scalesSnap.docs.forEach((doc) => {
		batch.delete(doc.ref);
		operationCount++;
	});

	// Hapus document utama
	batch.delete(doc(db, "likert", likertId));
	operationCount++;

	if (operationCount > 0) {
		await batch.commit();
	}

	console.log("Likert cascading deleted:", likertId);
};
