import { db } from "@/firebase/firebase-config";
import { doc, deleteDoc } from "firebase/firestore";

/**
 * Menghapus kategori dari subcollection `likert/{likertId}/categories`.
 *
 * NOTE: questions di dalam array ikut terhapus karena array adalah bagian
 * dari dokumen kategori.
 *
 * @param {string} likertId
 * @param {string} categoryId
 * @returns {Promise<string>} Id kategori yang dihapus (agar store bisa hapus dari state).
 */
export const deleteCategory = async (likertId, categoryId) => {
	console.log("Deleting category:", categoryId);
	try {
		await deleteDoc(doc(db, "likert", likertId, "categories", categoryId));
		console.log("Category deleted:", categoryId);
		return categoryId;
	} catch (error) {
		console.error("Error deleting category:", error);
		throw error;
	}
};
