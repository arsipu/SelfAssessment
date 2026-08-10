import { db } from "@/firebase/firebase-config";
import { doc, updateDoc, writeBatch } from "firebase/firestore";

/**
 * Mengupdate kategori di subcollection `likert/{likertId}/categories`.
 *
 * Jika `order` berubah, kategori lain di antara posisi lama & baru ikut digeser
 * 1 langkah (menggunakan batch) agar urutan tetap konsisten.
 *
 * @param {string} likertId
 * @param {string} categoryId
 * @param {{ name: string, order?: number }} param2  `order` = posisi baru (0..N-1)
 * @param {Array<{ id: string, order?: number }>} existingCategories  Daftar kategori
 *   existing yang sudah dimuat di store, dipakai untuk menghitung pergeseran.
 * @returns {Promise<{ id: string, name: string, order: number, shiftedIds: Set<string>, direction: number }>}
 *   Data kategori yang diupdate + info pergeseran agar store bisa sinkron state.
 */
export const updateCategory = async (
	likertId,
	categoryId,
	{ name, order },
	existingCategories = [],
) => {
	console.log("Updating category:", categoryId);
	try {
		const current = existingCategories.find((c) => c.id === categoryId);
		const oldOrder = current?.order ?? 0;
		const ref = doc(db, "likert", likertId, "categories", categoryId);
		const payload = { name: name.trim(), order };

		if (order === undefined || order === oldOrder) {
			await updateDoc(ref, payload);
			console.log("Category updated:", categoryId);
			return {
				id: categoryId,
				name: payload.name,
				order: oldOrder,
				shiftedIds: new Set(),
				direction: 0,
			};
		}

		const toShift =
			order > oldOrder
				? existingCategories.filter(
						(c) =>
							c.id !== categoryId &&
							(c.order ?? 0) > oldOrder &&
							(c.order ?? 0) <= order,
					)
				: existingCategories.filter(
						(c) =>
							c.id !== categoryId &&
							(c.order ?? 0) >= order &&
							(c.order ?? 0) < oldOrder,
					);
		const direction = order > oldOrder ? -1 : 1;

		const batch = writeBatch(db);
		batch.update(ref, payload);
		toShift.forEach((c) => {
			batch.update(doc(db, "likert", likertId, "categories", c.id), {
				order: (c.order ?? 0) + direction,
			});
		});
		await batch.commit();

		const shiftedIds = new Set(toShift.map((c) => c.id));
		console.log("Category updated:", categoryId);
		return {
			id: categoryId,
			name: payload.name,
			order,
			shiftedIds,
			direction,
		};
	} catch (error) {
		console.error("Error updating category:", error);
		throw error;
	}
};
