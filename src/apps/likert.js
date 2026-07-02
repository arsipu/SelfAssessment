export const LikertAnswer = Object.freeze({
  SS: 'SS',
  S: 'S',
  TS: 'TS',
  STS: 'STS',
})

// kalau butuh urutan/label buat render tombol, bisa sekalian:
export const LIKERT_SCALE_OPTIONS = Object.freeze([
  { value: LikertAnswer.SS, label: 'Sangat Setuju' },
  { value: LikertAnswer.S, label: 'Setuju' },
  { value: LikertAnswer.TS, label: 'Tidak Setuju' },
  { value: LikertAnswer.STS, label: 'Sangat Tidak Setuju' },
])

// scoring map juga enak sekalian di sini, biar satu sumber kebenaran
export const LIKERT_SCORE_MAP = Object.freeze({
  [LikertAnswer.SS]: 4,
  [LikertAnswer.S]: 3,
  [LikertAnswer.TS]: 2,
  [LikertAnswer.STS]: 1,
})

export const LIKERT_SCORE_MAP_REVERSE = Object.freeze({
  [LikertAnswer.SS]: 1,
  [LikertAnswer.S]: 2,
  [LikertAnswer.TS]: 3,
  [LikertAnswer.STS]: 4,
})