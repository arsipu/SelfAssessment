import { RIASEC_CATEGORY_ORDER, HOLLAND_COLUMNS } from '@/apps/holland'

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

export function buildAnswerSections({
  answers = [],
  questions = [],
  riasecInfo,
}) {
  const grouped = {}

  for (const answer of answers) {
    const category = answer.riasecId || answer.category

    if (!grouped[category]) {
      grouped[category] = []
    }

    const question = questions.find(
      (q) => q.id === answer.questionId
    )

    grouped[category].push({
      questionId: answer.questionId,
      questionText: question?.question || '(soal tidak ditemukan)',
      column: answer.column,
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
 * @param {Array} riasecList - list of riasec categories from store
 * @param {Array} allQuestions - all questions from questions store
 * @param {Array} dotColors - array of CSS color var strings (defaults to RIASEC_DOT_COLORS)
 * @returns {Array} sections array with { key, code, label, dot, columns }
 */
export function buildDetailSections(riasecList, allQuestions, dotColors = RIASEC_DOT_COLORS) {
  return riasecList
    .map((cat, index) => {
      const categoryQuestions = allQuestions.filter((q) => q.riasecId === cat.id)
      if (categoryQuestions.length === 0) return null

      const columns = HOLLAND_COLUMNS
        .map((col) => ({
          key: col.key,
          label: col.label,
          questions: categoryQuestions.filter((q) => q.column === col.key),
        }))
        .filter((col) => col.questions.length > 0)

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
