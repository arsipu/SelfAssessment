// Util pusat buat konsistensi hitung skor Holland RIASEC.
// Dipakai di: holland-session.js (finishSession), HollandResult.vue,
// AdminHollandSubmissionDetail.vue, holland-pdf-export.js, RiasecHexChart.vue
// (atau wrapper-nya) — biar semua tempat baca angka yang sama persis.
//
// Prinsip: Firestore cuma nyimpen `answers` (semua soal + isChecked).
// `scores` dan `topCode` TIDAK disimpan sama sekali — selalu dihitung
// ulang dari `answers` tiap kali dibutuhkan.

/**
 * Bangun array `answers` awal (semua soal, isChecked: false) dari daftar
 * soal lengkap. Dipanggil sekali pas sesi pengisian dimulai.
 *
 * @param {Array} allQuestions - flat array dari useHollandQuestionsStore().allQuestions
 *   masing-masing item: { id, riasecId, columnId, question, ... }
 * @returns {Array} [{ questionId, riasecId, columnId, isChecked }]
 */
export function buildInitialAnswers(allQuestions) {
  return allQuestions.map((q) => ({
    questionId: q.id,
    riasecId: q.riasecId,
    columnId: q.columnId,
    isChecked: false,
  }))
}

/**
 * Hitung breakdown skor per kategori RIASEC dari array `answers`.
 * Bentuk hasil per kategori: { count, total, percentage } —
 * `total` = jumlah soal yang tersedia di kategori itu (dari `answers`,
 * karena `answers` sekarang selalu berisi SEMUA soal), `count` = jumlah
 * yang isChecked === true, `percentage` = count/total * 100 (dibulatkan).
 *
 * Pakai `percentage` (bukan `count` mentah) buat perbandingan antar
 * kategori / nentuin topCode, karena jumlah soal per kategori sekarang
 * bisa beda-beda (kolom per kategori fleksibel jumlahnya).
 *
 * @param {Array} answers - [{ questionId, riasecId, columnId, isChecked }]
 * @param {Array<string>} riasecIds - mis. ['R','I','A','S','E','C'], dipakai
 *   biar kategori yang belum punya jawaban tetap muncul di hasil (count/total: 0)
 * @returns {Object} { R: {count, total, percentage}, I: {...}, ... }
 */
export function computeScoreBreakdownFromAnswers(answers, riasecIds) {
  const breakdown = {}
  riasecIds.forEach((id) => {
    breakdown[id] = { count: 0, total: 0, percentage: 0 }
  })

  ;(answers || []).forEach((a) => {
    if (!breakdown[a.riasecId]) breakdown[a.riasecId] = { count: 0, total: 0, percentage: 0 }
    breakdown[a.riasecId].total += 1
    if (a.isChecked) breakdown[a.riasecId].count += 1
  })

  Object.values(breakdown).forEach((row) => {
    row.percentage = row.total > 0 ? Math.round((row.count / row.total) * 100) : 0
  })

  return breakdown
}

/**
 * Versi ringkas: cuma angka count per kategori (bukan count/total/percentage).
 * Dipakai kalau butuh cepat tanpa breakdown lengkap, mis. buat badge count.
 *
 * @param {Array} answers
 * @param {Array<string>} riasecIds
 * @returns {Object} { R: number, I: number, ... }
 */
export function computeScoreCountsFromAnswers(answers, riasecIds) {
  const breakdown = computeScoreBreakdownFromAnswers(answers, riasecIds)
  const counts = {}
  Object.entries(breakdown).forEach(([id, row]) => {
    counts[id] = row.count
  })
  return counts
}

/**
 * Tentukan topCode (kategori dominan) dari hasil computeScoreBreakdownFromAnswers,
 * diurutkan berdasarkan `percentage` (bukan count mentah).
 *
 * @param {Object} breakdown - hasil dari computeScoreBreakdownFromAnswers
 * @param {number} topN - jumlah kode teratas yang digabung, default 1
 * @returns {string} mis. "S" atau "SAE" kalau topN=3
 */
export function computeTopCode(breakdown, topN = 1) {
  const sorted = Object.entries(breakdown).sort(
    (a, b) => (b[1]?.percentage ?? 0) - (a[1]?.percentage ?? 0)
  )
  return sorted
    .slice(0, topN)
    .map(([id]) => id)
    .join('')
}