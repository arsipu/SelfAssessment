import { db } from "@/firebase/firebase-config";
import {
	collection,
	doc,
	writeBatch,
	serverTimestamp,
} from "firebase/firestore";

/**
 * Menambahkan kategori baru ke subcollection `likert/{likertId}/categories`.
 *
 * Category existing yang order-nya >= `order` akan digeser +1 terlebih dahulu
 * (menggunakan batch), lalu dokumen kategori baru di-`set`.
 *
 * @param {string} likertId
 * @param {{ name: string, order: number }} param1  `order` = posisi sisip (0..N)
 * @param {Array<{ id: string, order?: number }>} existingCategories  Daftar kategori
 *   existing yang sudah dimuat di store, dipakai untuk menghitung pergeseran.
 * @returns {Promise<{ id: string, ...payload, shiftedIds: Set<string> }>}
 *   Objek berisi data kategori baru (`id`, `name`, `order`, `questions`, `createdAt`)
 *   serta `shiftedIds` (id kategori yang ikut digeser) agar store bisa sinkron state.
 */
export const addCategory = async (
	likertId,
	{ name, order },
	existingCategories = [],
) => {
	// Kategori yang posisinya (order) >= posisi sisip harus digeser ke bawah (+1)
	// agar kategori baru bisa disisipkan di posisi `order` tanpa menimpa urutan lama.
	// `c.order ?? 0` dipakai untuk mengantisipasi kategori yang belum punya field `order`.
	const toShift = existingCategories.filter((c) => (c.order ?? 0) >= order);

	// Payload dokumen kategori baru.
	// `questions` diinisialisasi sebagai array kosong, dan `createdAt` diisi
	// serverTimestamp() agar waktu pembuatan ditentukan oleh server Firestore
	// (konsisten & tidak bergantung pada jam perangkat klien).
	const payload = {
		name: name.trim(), // buang spasi di awal/akhir nama kategori
		order,
		questions: [],
		createdAt: serverTimestamp(),
	};

	console.log("Adding category:", name, "at order", order);
	try {
		// writeBatch memungkinkan beberapa operasi (set + update) dieksekusi
		// secara atomik: jika salah satu gagal, semua operasi dibatalkan.
		const batch = writeBatch(db);

		// Buat referensi dokumen baru dengan ID otomatis dari Firestore.
		const newRef = doc(collection(db, "likert", likertId, "categories"));
		batch.set(newRef, payload);

		// Geser order kategori existing yang berada di posisi >= order sisip.
		toShift.forEach((c) => {
			batch.update(doc(db, "likert", likertId, "categories", c.id), {
				order: (c.order ?? 0) + 1,
			});
		});

		// Kirim seluruh operasi batch ke Firestore sekaligus.
		await batch.commit();

		// Kumpulkan id kategori yang ikut digeser, agar store (Pinia) bisa
		// memperbarui state lokal tanpa perlu fetch ulang dari server.
		const shiftedIds = new Set(toShift.map((c) => c.id));
		console.log("Category added with ID:", newRef.id);
		return { id: newRef.id, ...payload, shiftedIds };
	} catch (error) {
		console.error("Error adding category:", error);
		throw error; // lempar ulang error agar pemanggil bisa menangani & menampilkan pesan
	}
};
