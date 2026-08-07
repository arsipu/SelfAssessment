import { db } from "@/firebase/firebase-config";
import {
	collection,
	doc,
	getDocs,
	getDoc,
	query,
	where,
	limit,
} from "firebase/firestore";

/**
 * Mengambil semua dokumen dari collection `likert`.
 *
 * @returns {Promise<Array<{ id: string, ...data }>>}
 */
export const fetchLikerts = async () => {
	const snap = await getDocs(collection(db, "likert"));
	return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Mengambil 1 dokumen dari `likert/{likertId}`.
 *
 * @param {string} likertId
 * @returns {Promise<{ id: string, ...data } | null>}
 */
export const getLikertById = async (likertId) => {
	console.log("Fetching likert:", likertId);
	const snap = await getDoc(doc(db, "likert", likertId));
	if (snap.exists()) {
		const data = { id: snap.id, ...snap.data() };
		console.log("Likert fetched:", data.name);
		return data;
	}
	console.log("No such likert document!");
	return null;
};

/**
 * Mengambil 1 dokumen dari collection `likert` berdasarkan slug.
 *
 * @param {string} slug
 * @returns {Promise<{ id: string, ...data } | null>}
 */
export const getLikertBySlug = async (slug) => {
	console.log("Fetching likert by slug:", slug);
	const q = query(
		collection(db, "likert"),
		where("slug", "==", slug),
		limit(1),
	);
	const snap = await getDocs(q);
	if (!snap.empty) {
		const d = snap.docs[0];
		const data = { id: d.id, ...d.data() };
		console.log("Likert fetched by slug:", data.name);
		return data;
	}
	console.log("No such likert document for slug:", slug);
	return null;
};

/**
 * Mengambil semua dokumen dari subcollection `likert/{likertId}/scale`,
 * melakukan transformasi data, dan mengurutkan dari min terbesar ke terkecil.
 *
 * @param {string} likertId
 * @returns {Promise<Array<{ id: string, label: string, description: string, min: number, max: number }>>}
 */
export const fetchLikertScales = async (likertId) => {
	const snap = await getDocs(collection(db, "likert", likertId, "scale"));
	const scales = snap.docs.map((d) => {
		const data = d.data();
		// regex ini nangkep -, –, — dikelilingi spasi opsional
		const parts = data.range.split(/\s*[-–—]\s*/).map((s) => s.trim());
		const min = Number(parts[0]);
		const max = Number(parts[1]);

		return {
			id: d.id,
			label: data.score,
			description: data.description,
			min,
			max,
		};
	});

	// urutkan dari min terbesar ke terkecil (biar konsisten kayak array hardcode sebelumnya)
	scales.sort((a, b) => b.min - a.min);
	return scales;
};
