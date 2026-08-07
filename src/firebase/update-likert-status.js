import { db } from "@/firebase/firebase-config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ACTIVE, INACTIVE } from "@/apps/status";

/**
 * Mengupdate status likert. Jika status = ACTIVE, semua likert lain yang
 * masih active (dalam `activeLikertIds`) akan dinonaktifkan terlebih dahulu.
 *
 * @param {string} id
 * @param {string} status
 * @param {string[]} activeLikertIds — daftar id likert lain yang masih active
 * @returns {Promise<void>}
 */
export const updateLikertStatus = async (id, status, activeLikertIds) => {
	if (status === ACTIVE) {
		// Nonaktifkan likert lain yang masih active
		for (const otherId of activeLikertIds) {
			await updateDoc(doc(db, "likert", otherId), {
				status: INACTIVE,
				updatedAt: serverTimestamp(),
			});
		}
	}

	await updateDoc(doc(db, "likert", id), {
		status,
		updatedAt: serverTimestamp(),
	});
};
