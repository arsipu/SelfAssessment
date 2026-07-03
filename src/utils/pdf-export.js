import jsPDF from 'jspdf'

export function exportLikertResultToPDF({
  likertName,
  respondentName,
  code,
  totalScore,
  categoryLabel,
  categoryDescription,
  sections, // sama kayak computed `sections` di LikertResult.vue
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 15
  const marginBottom = 18
  let y = 20

  // Lebar kolom jawaban dibuat tetap & cukup lega untuk teks terpanjang
  // (mis. "Sangat Tidak Setuju"), sisanya baru dipakai buat teks pertanyaan.
  const answerColWidth = 38
  const gapBetweenCols = 4
  const questionColWidth = pageWidth - marginX * 2 - answerColWidth - gapBetweenCols

  function checkPageBreak(extraHeight = 10) {
    if (y + extraHeight > pageHeight - marginBottom) {
      addFooter()
      doc.addPage()
      y = 20
    }
  }

  function addFooter() {
    const pageCount = doc.internal.getNumberOfPages()
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(150)
    doc.text(`Halaman ${pageCount}`, pageWidth - marginX, pageHeight - 10, { align: 'right' })
    doc.setTextColor(0)
  }

  // Header
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text(`Hasil ${likertName}`, marginX, y)
  y += 8

  doc.setDrawColor(220)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  doc.text(`Nama`, marginX, y)
  doc.text(`: ${respondentName}`, marginX + 22, y)
  y += 6
  doc.text(`Kode`, marginX, y)
  doc.text(`: ${code}`, marginX + 22, y)
  y += 10

  // Skor & kategori
  doc.setFontSize(24)
  doc.setFont(undefined, 'bold')
  doc.text(`${totalScore}`, marginX, y)
  y += 8

  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text(`Kategori: ${categoryLabel}`, marginX, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  const descLines = doc.splitTextToSize(categoryDescription || '-', pageWidth - marginX * 2)
  doc.text(descLines, marginX, y)
  y += descLines.length * 5 + 8

  // Garis pemisah
  doc.setDrawColor(200)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 8

  // Rincian jawaban per kategori
  checkPageBreak(10)
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.text('Rincian Jawaban', marginX, y)
  y += 8

  sections.forEach((section) => {
    checkPageBreak(12)
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(40, 40, 40)
    doc.text(section.label, marginX, y)
    doc.setTextColor(0)
    y += 6

    section.items.forEach((item, i) => {
      const textLines = doc.splitTextToSize(
        `${i + 1}. ${item.questionText}`,
        questionColWidth
      )
      const answerLines = doc.splitTextToSize(item.answerLabel, answerColWidth)
      const rowHeight = Math.max(textLines.length, answerLines.length) * 5 + 3

      checkPageBreak(rowHeight)

      doc.setFontSize(9.5)
      doc.setFont(undefined, 'normal')
      doc.text(textLines, marginX, y)

      // Jawaban rata kanan, dalam kolom sendiri biar gak kepotong
      doc.setFont(undefined, 'bold')
      doc.text(answerLines, pageWidth - marginX, y, { align: 'right' })

      y += rowHeight
    })

    y += 4
  })

  addFooter()
  doc.save(`hasil-${likertName}-${respondentName}.pdf`.replace(/\s+/g, '_'))
}