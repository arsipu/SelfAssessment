import { RIASEC_CATEGORY_ORDER } from '@/apps/holland'

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