import { createAndDownloadExcel } from './excel-helper'
import { RIASEC_CATEGORY_ORDER, RIASEC_GUIDE } from '@/apps/holland'
import { computeScoreBreakdownFromAnswers, computeTopCode } from '@/utils/holland-scoring'

/**
 * Export Holland RIASEC submissions ke file .xlsx.
 *
 * @param {Array} submissions - daftar submission dari Firestore
 * @param {Array<string>} riasecIds - daftar id kategori RIASEC (buat hitung skor dari answers)
 * @param {string} hollandName - nama instrumen (default: 'Holland RIASEC')
 */
export function exportSubmissionsToExcel(submissions, riasecIds, hollandName = 'Holland RIASEC') {
  const rows = submissions.map((s, i) => {
    const isCompleted = s.status === 'completed'
    const breakdown = isCompleted && s.answers
      ? computeScoreBreakdownFromAnswers(s.answers, riasecIds)
      : null
    const topCode = breakdown ? computeTopCode(breakdown) : null

    const scoreRow = {}
    for (const code of RIASEC_CATEGORY_ORDER) {
      const label = RIASEC_GUIDE[code]?.label || code
      scoreRow[`${label} (%)`] = breakdown?.[code]?.percentage ?? '-'
    }

    return {
      No: i + 1,
      Nama: s.name,
      Sekolah: s.school,
      Jurusan: s.major,
      Usia: s.birthDateAge ?? '-',
      Gender: s.gender,
      Pekerjaan: s.occupation ?? '-',
      'Tujuan Tes': s.testPurpose ?? '-',
      'Tanggal Tes': s.testDate ?? '-',
      Kode: s.code,
      Status: isCompleted ? 'Selesai' : 'Sedang Mengerjakan',
      'Kode RIASEC': topCode ?? '-',
      ...scoreRow,
    }
  })

  const fileName = `rekap-${hollandName}.xlsx`.replace(/\s+/g, '_')
  return createAndDownloadExcel(rows, 'Rekap', fileName)
}