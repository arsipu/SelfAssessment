import * as XLSX from 'xlsx'

export function exportSubmissionsToExcel(submissions, likertName = 'Likert') {
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
    Tanggal: s.createdAt?.toDate
      ? s.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '-',
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)

  // biar kolom gak kegencet, auto width kasar
  worksheet['!cols'] = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? '').length)) + 2,
  }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap')
  XLSX.writeFile(workbook, `rekap-${likertName}.xlsx`.replace(/\s+/g, '_'))
}