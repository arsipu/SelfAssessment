// Util pusat buat konsistensi hitung skor Likert (Work Readiness Scale).
// Dipakai di: likert-session.js, LikertResult.vue, AdminLikertSubmissionDetail.vue,
// AdminLikertSubmissions.vue, likert-excel-export.js — biar semua tempat
// baca angka yang sama persis.
//
// Prinsip: Firestore cuma nyimpen `submission` (array answers).
// `totalScore` TIDAK disimpan sama sekali — selalu dihitung ulang
// dari `submission` tiap kali dibutuhkan.

/**
 * Hitung total skor dari array answers (field `submission` di Firestore).
 * Setiap item sudah memiliki `point` yang pre-computed saat submit.
 *
 * @param {Array} answers - [{ questionId, categoryId, favorable, answer, point }]
 * @returns {number} total skor (0 kalau answers kosong/null)
 */
export function computeTotalScore(answers) {
  if (!answers || !Array.isArray(answers)) return 0
  return answers.reduce((sum, a) => sum + (a.point ?? 0), 0)
}

/**
 * Hitung breakdown skor per kategori dari array answers.
 *
 * @param {Array} answers - [{ questionId, categoryId, favorable, answer, point }]
 * @returns {Object} { [categoryId]: { count, total, score } }
 *   - count: jumlah soal di kategori itu
 *   - total: jumlah soal (sama dengan count, untuk konsistensi)
 *   - score: jumlah poin di kategori itu
 */
export function computeCategoryBreakdown(answers) {
  const breakdown = {}
  if (!answers || !Array.isArray(answers)) return breakdown

  answers.forEach((a) => {
    if (!breakdown[a.categoryId]) {
      breakdown[a.categoryId] = { count: 0, total: 0, score: 0 }
    }
    breakdown[a.categoryId].count += 1
    breakdown[a.categoryId].total += 1
    breakdown[a.categoryId].score += a.point ?? 0
  })

  return breakdown
}