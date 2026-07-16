import { createAndDownloadExcel } from './excel-helper'

export function exportSubmissionsToExcel(submissions, likertName = 'Likert', scales = []) {
  const getScaleLabel = (score) => {
    if (score == null) return '-'
    const found = scales.find((s) => score >= s.min && score <= s.max)
    return found?.label || '-'
  }

  const rows = submissions.map((s, i) => ({
    No: i + 1,
    Nama: s.name,
    Sekolah: s.school,
    Kelas: s.class,
    Jurusan: s.major,
    Usia: s.age,
    Gender: s.gender,
    'Pernah PKL': s.internship,
    Kode: s.code,
    Status: s.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan',
    'Total Skor': s.totalScore ?? '-',
    Nilai: getScaleLabel(s.totalScore),
    Tanggal: s.createdAt?.toDate
      ? s.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '-',
  }))

  const fileName = `rekap-${likertName}.xlsx`.replace(/\s+/g, '_')
  return createAndDownloadExcel(rows, 'Rekap', fileName)
}