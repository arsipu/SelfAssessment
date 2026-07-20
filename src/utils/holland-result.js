import { RIASEC_CATEGORY_ORDER } from '@/apps/holland'

export const RIASEC_DOT_COLORS = [
  'var(--color-viz-1)',
  'var(--color-viz-2)',
  'var(--color-viz-3)',
  'var(--color-viz-4)',
  'var(--color-viz-5)',
  'var(--color-viz-6)',
]

export function formatBirthDateAge(respondent) {
  if (!respondent) return '-'

  if (respondent.birthDate) {
    const date = new Date(respondent.birthDate)

    if (!isNaN(date)) {
      const formatted = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      return respondent.age != null
        ? `${formatted} / ${respondent.age} tahun`
        : formatted
    }
  }

  return respondent.birthDateAge || '-'
}

// `scores` sekarang datang dari computeScoreBreakdownFromAnswers()
// (utils/holland-scoring.js): { [code]: { count, total, percentage } }.
// Fungsi ini TIDAK berubah bentuknya — tetap nunggu shape yang sama
// seperti sebelumnya, cuma sekarang sumber datanya dihitung dari
// `answers`, bukan dibaca dari field `scores` yang tersimpan di Firestore.
export function buildScoreBreakdown(scores, topCode = '') {
  if (!scores) return []

  return RIASEC_CATEGORY_ORDER
    .map((code) => ({
      code,
      count: scores[code]?.count ?? 0,
      total: scores[code]?.total ?? 0,
      percentage: scores[code]?.percentage ?? 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .map((row) => ({
      ...row,
      isTop: topCode ? topCode.includes(row.code) : false,
    }))
}

/**
 * Kelompokkan jawaban (answers) per kategori RIASEC, buat ditampilkan
 * di rincian jawaban. Sekarang cuma nampilin soal yang isChecked === true
 * (karena `answers` sudah berisi SEMUA soal, bukan cuma yang dipilih).
 *
 * @param {Object} params
 * @param {Array} params.answers - [{ questionId, riasecId, columnId, isChecked }]
 * @param {Array} params.questions - allQuestions dari questions store
 * @param {Function} params.riasecInfo - (code) => { label, ... } | undefined
 * @param {Object} params.columnsByRiasec - { [riasecId]: [{ id, name, order }] },
 *   dipakai buat resolve nama kolom dari columnId
 */
export function buildAnswerSections({
  answers = [],
  questions = [],
  riasecInfo,
  columnsByRiasec = {},
}) {
  const grouped = {}

  for (const answer of answers) {
    if (!answer.isChecked) continue

    const category = answer.riasecId

    if (!grouped[category]) {
      grouped[category] = []
    }

    const question = questions.find((q) => q.id === answer.questionId)
    const columnDef = (columnsByRiasec[category] || []).find((c) => c.id === answer.columnId)

    grouped[category].push({
      questionId: answer.questionId,
      questionText: question?.question || '(soal tidak ditemukan)',
      columnId: answer.columnId,
      columnName: columnDef?.name || answer.columnId,
    })
  }

  return RIASEC_CATEGORY_ORDER
    .filter((code) => grouped[code]?.length)
    .map((code) => ({
      key: code,
      label: `${riasecInfo(code)?.label || code} (${code})`,
      items: grouped[code],
    }))
}

/**
 * Build detail sections for answer details display.
 * Mirrors the duplicated computed property in both HollandResult.vue and AdminHollandSubmissionDetail.vue.
 *
 * Kolom sekarang DINAMIS (dari Firestore lewat columnsByRiasec), bukan
 * lagi constant HOLLAND_COLUMNS — dan soal dikelompokkan pakai
 * `q.columnId`, bukan `q.column`.
 *
 * @param {Array} riasecList - list of riasec categories from store
 * @param {Array} allQuestions - all questions from questions store
 * @param {Object} columnsByRiasec - { [riasecId]: [{ id, name, order }]},
 *   dari useHollandColumnsStore().columnsByRiasec (harus sudah di-fetch)
 * @param {Array} dotColors - array of CSS color var strings (defaults to RIASEC_DOT_COLORS)
 * @returns {Array} sections array with { key, code, label, dot, columns }
 */
export function buildDetailSections(riasecList, allQuestions, columnsByRiasec = {}, dotColors = RIASEC_DOT_COLORS) {
  return riasecList
    .map((cat, index) => {
      const categoryQuestions = allQuestions.filter((q) => q.riasecId === cat.id)
      if (categoryQuestions.length === 0) return null

      const cols = columnsByRiasec[cat.id] || []
      const columns = cols
        .map((col) => ({
          key: col.id,
          label: col.name,
          questions: categoryQuestions.filter((q) => q.columnId === col.id),
        }))
        .filter((col) => col.questions.length > 0)

      if (columns.length === 0) return null

      return {
        key: cat.id,
        code: cat.id,
        label: cat.label || cat.id,
        dot: dotColors[index % dotColors.length],
        columns,
      }
    })
    .filter(Boolean)
}