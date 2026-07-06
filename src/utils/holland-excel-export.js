import * as XLSX from 'xlsx'
import { RIASEC_CATEGORY_ORDER, RIASEC_GUIDE } from '@/apps/holland'

/**
 * Export Holland RIASEC submissions ke file .xlsx.
 *
 * Kolom yang dihasilkan:
 *   No, Nama, Sekolah, Jurusan, Usia, Gender, Pekerjaan, Tujuan Tes,
 *   Tanggal Tes, Kode, Status, Kode RIASEC (topCode),
 *   persentase tiap kategori R / I / A / S / E / C, Tanggal
 *
 * @param {Array} submissions - daftar submission dari Firestore
 * @param {string} hollandName - nama instrumen (default: 'Holland RIASEC')
 */
export function exportSubmissionsToExcel(submissions, hollandName = 'Holland RIASEC') {
  const rows = submissions.map((s, i) => {
    const scores = s.scores || {}
    const scoreRow = {}
    for (const code of RIASEC_CATEGORY_ORDER) {
      const label = RIASEC_GUIDE[code]?.label || code
      scoreRow[`${label} (%)`] = scores[code]?.percentage ?? '-'
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
      Status: s.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan',
      'Kode RIASEC': s.topCode ?? '-',
      ...scoreRow,
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)

  // auto width kasar biar kolom gak kegencet
  worksheet['!cols'] = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? '').length)) + 2,
  }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap')
  XLSX.writeFile(workbook, `rekap-${hollandName}.xlsx`.replace(/\s+/g, '_'))
}