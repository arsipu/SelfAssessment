import { db } from "@/firebase/firebase-config";
import {
	collection,
	doc,
	getDocs,
	getDoc,
	query,
	orderBy,
} from "firebase/firestore";

/**
 * Mengambil semua kategori dari subcollection `likert/{likertId}/categories`,
 * diurutkan berdasarkan field `order` ascending.
 *
 * @param {string} likertId
 * @returns {Promise<Array<{ id: string, ...data }>>}
 */
export const fetchCategories = async (likertId) => {
	console.log("Fetching categories for likert:", likertId);
	try {
		const q = query(
			collection(db, "likert", likertId, "categories"),
			orderBy("order"),
		);
		const snap = await getDocs(q);
		const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
		console.log("Categories fetched:", categories.length);
		return categories;
	} catch (error) {
		console.error("Error fetching categories:", error);
		return [];
	}
};

/**
 * Mengambil 1 kategori berdasarkan id.
 *
 * @param {string} likertId
 * @param {string} categoryId
 * @returns {Promise<{ id: string, ...data } | null>}
 */
export const getCategoryById = async (likertId, categoryId) => {
	console.log("Fetching category:", categoryId);
	try {
		const snap = await getDoc(
			doc(db, "likert", likertId, "categories", categoryId),
		);
		if (snap.exists()) {
			return { id: snap.id, ...snap.data() };
		}
		console.log("No such category document!");
		return null;
	} catch (error) {
		console.error("Error fetching category:", error);
		return null;
	}
};
