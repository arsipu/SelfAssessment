import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'

// ── Halaman 1: screenshot kartu skor dari elemen HTML ─────────

async function renderScoreCardPage(doc, element) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10
  const imgWidth = pageWidth - margin * 2
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  doc.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight)
}

// ── Halaman 2+: rincian jawaban, teks manual (multi-page aman) ─

function renderAnswerDetailPages(doc, sections) {
  doc.addPage()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 15
  const answerColWidth = 38 // lebar kolom jawaban, cukup buat "Sangat Tidak Setuju"
  const questionColWidth = pageWidth - marginX * 2 - answerColWidth - 6 // 6mm gap antara soal & jawaban
  let y = 20

  function checkPageBreak(extraHeight = 10) {
    if (y + extraHeight > pageHeight - 15) {
      doc.addPage()
      y = 20
    }
  }

  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(20, 20, 20)
  doc.text('Rincian Jawaban', marginX, y)
  y += 4
  doc.setDrawColor(220)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 10

  sections.forEach((section) => {
    checkPageBreak(12)
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(section.label, marginX, y)
    y += 7

    section.items.forEach((item, i) => {
      const textLines = doc.splitTextToSize(`${i + 1}. ${item.questionText}`, questionColWidth)
      const rowHeight = Math.max(textLines.length * 5, 6) + 5
      checkPageBreak(rowHeight)

      doc.setFontSize(9.5)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(textLines, marginX, y)

      // align-right presisi berdasarkan lebar teks asli
      doc.setFontSize(9.5)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(20, 20, 20)
      const answerWidth = doc.getTextWidth(item.answerLabel)
      doc.text(item.answerLabel, pageWidth - marginX - answerWidth, y)

      y += rowHeight
    })

    y += 5 // jarak antar section
  })
}

// ── Fungsi utama: gabung halaman 1 (screenshot) + halaman 2+ (teks) ─

export async function exportResultToPDFHybrid({ scoreCardElement, sections, filename }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  await renderScoreCardPage(doc, scoreCardElement)
  renderAnswerDetailPages(doc, sections)

  doc.save(filename)
}




// import jsPDF from 'jspdf'

// export function exportLikertResultToPDF({
//   likertName,
//   respondentName,
//   code,
//   totalScore,
//   categoryLabel,
//   categoryDescription,
//   sections, // sama kayak computed `sections` di LikertResult.vue
// }) {
//   const doc = new jsPDF({ unit: 'mm', format: 'a4' })
//   const pageWidth = doc.internal.pageSize.getWidth()
//   const pageHeight = doc.internal.pageSize.getHeight()
//   const marginX = 15
//   const marginBottom = 18
//   let y = 20

//   // Lebar kolom jawaban dibuat tetap & cukup lega untuk teks terpanjang
//   // (mis. "Sangat Tidak Setuju"), sisanya baru dipakai buat teks pertanyaan.
//   const answerColWidth = 38
//   const gapBetweenCols = 4
//   const questionColWidth = pageWidth - marginX * 2 - answerColWidth - gapBetweenCols

//   function checkPageBreak(extraHeight = 10) {
//     if (y + extraHeight > pageHeight - marginBottom) {
//       addFooter()
//       doc.addPage()
//       y = 20
//     }
//   }

//   function addFooter() {
//     const pageCount = doc.internal.getNumberOfPages()
//     doc.setFontSize(8)
//     doc.setFont(undefined, 'normal')
//     doc.setTextColor(150)
//     doc.text(`Halaman ${pageCount}`, pageWidth - marginX, pageHeight - 10, { align: 'right' })
//     doc.setTextColor(0)
//   }

//   // Header
//   doc.setFontSize(16)
//   doc.setFont(undefined, 'bold')
//   doc.text(`Hasil ${likertName}`, marginX, y)
//   y += 8

//   doc.setDrawColor(220)
//   doc.line(marginX, y, pageWidth - marginX, y)
//   y += 8

//   doc.setFontSize(11)
//   doc.setFont(undefined, 'normal')
//   doc.text(`Nama`, marginX, y)
//   doc.text(`: ${respondentName}`, marginX + 22, y)
//   y += 6
//   doc.text(`Kode`, marginX, y)
//   doc.text(`: ${code}`, marginX + 22, y)
//   y += 10

//   // Skor & kategori
//   doc.setFontSize(24)
//   doc.setFont(undefined, 'bold')
//   doc.text(`${totalScore}`, marginX, y)
//   y += 8

//   doc.setFontSize(12)
//   doc.setFont(undefined, 'bold')
//   doc.text(`Kategori: ${categoryLabel}`, marginX, y)
//   y += 7

//   doc.setFontSize(10)
//   doc.setFont(undefined, 'normal')
//   const descLines = doc.splitTextToSize(categoryDescription || '-', pageWidth - marginX * 2)
//   doc.text(descLines, marginX, y)
//   y += descLines.length * 5 + 8

//   // Garis pemisah
//   doc.setDrawColor(200)
//   doc.line(marginX, y, pageWidth - marginX, y)
//   y += 8

//   // Rincian jawaban per kategori
//   checkPageBreak(10)
//   doc.setFontSize(13)
//   doc.setFont(undefined, 'bold')
//   doc.text('Rincian Jawaban', marginX, y)
//   y += 8

//   sections.forEach((section) => {
//     checkPageBreak(12)
//     doc.setFontSize(11)
//     doc.setFont(undefined, 'bold')
//     doc.setTextColor(40, 40, 40)
//     doc.text(section.label, marginX, y)
//     doc.setTextColor(0)
//     y += 6

//     section.items.forEach((item, i) => {
//       const textLines = doc.splitTextToSize(
//         `${i + 1}. ${item.questionText}`,
//         questionColWidth
//       )
//       const answerLines = doc.splitTextToSize(item.answerLabel, answerColWidth)
//       const rowHeight = Math.max(textLines.length, answerLines.length) * 5 + 3

//       checkPageBreak(rowHeight)

//       doc.setFontSize(9.5)
//       doc.setFont(undefined, 'normal')
//       doc.text(textLines, marginX, y)

//       // Jawaban rata kanan, dalam kolom sendiri biar gak kepotong
//       doc.setFont(undefined, 'bold')
//       doc.text(answerLines, pageWidth - marginX, y, { align: 'right' })

//       y += rowHeight
//     })

//     y += 4
//   })

//   addFooter()
//   doc.save(`hasil-${likertName}-${respondentName}.pdf`.replace(/\s+/g, '_'))
// }