import { db } from "@/firebase/firebase-config";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

/**
 * Helper: generate ID unik untuk setiap pertanyaan.
 *
 * Menggunakan `crypto.randomUUID()` jika tersedia (browser modern),
 * dengan fallback ke kombinasi timestamp + random string.
 *
 * @returns {string} ID unik untuk pertanyaan baru.
 */
function generateId() {
	return (
		crypto.randomUUID?.() ??
		`${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
	);
}

/**
 * Menambahkan pertanyaan baru ke array `questions` di dalam dokumen
 * `likert/{likertId}/categories/{categoryId}`.
 *
 * Menggunakan Firestore `arrayUnion` untuk append item baru ke array
 * `questions` tanpa perlu membaca & menulis ulang seluruh array.
 *
 * @param {string} likertId - ID instrumen Likert.
 * @param {string} categoryId - ID kategori tujuan pertanyaan baru.
 * @param {{ question: string, favorable: boolean }} param2
 *   - `question`: teks pertanyaan (akan di-trim).
 *   - `favorable`: boolean, apakah pertanyaan favorable (positif).
 * @returns {Promise<{ id: string, categoryId: string, question: string, favorable: boolean }>}
 *   Data pertanyaan yang baru ditambahkan (lengkap dengan `id`),
 *   agar store bisa langsung push ke state tanpa fetch ulang.
 */
export const addQuestion = async (
	likertId,
	categoryId,
	{ question, favorable },
) => {
	// Buat objek pertanyaan baru dengan ID unik
	const newQuestion = {
		id: generateId(),
		question: question.trim(),
		favorable,
	};

	try {
		// Referensi dokumen kategori tujuan
		const categoryRef = doc(db, "likert", likertId, "categories", categoryId);

		// arrayUnion menambahkan item hanya jika belum ada (mencegah duplikat)
		await updateDoc(categoryRef, {
			questions: arrayUnion(newQuestion),
		});

		console.log("Question added with ID:", newQuestion.id);

		// Kembalikan data lengkap agar store bisa sinkronkan state lokal
		return {
			id: newQuestion.id,
			categoryId,
			question: newQuestion.question,
			favorable: newQuestion.favorable,
		};
	} catch (error) {
		console.error("Error adding question:", error);
		throw error; // lempar ulang agar pemanggil bisa menangani & menampilkan pesan
	}
};
