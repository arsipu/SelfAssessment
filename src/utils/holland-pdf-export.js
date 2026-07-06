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

// ── Halaman 2+: rincian jawaban per kategori (tanpa kolom jawaban) ─

function renderAnswerDetailPages(doc, sections) {
  doc.addPage()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 15
  const textColWidth = pageWidth - marginX * 2
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
      const textLines = doc.splitTextToSize(`${i + 1}. ${item.questionText}`, textColWidth)
      const rowHeight = Math.max(textLines.length * 5, 6) + 5
      checkPageBreak(rowHeight)

      doc.setFontSize(9.5)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(textLines, marginX, y)

      y += rowHeight
    })

    y += 5 // jarak antar section
  })
}

// ── Fungsi utama: gabung halaman 1 (screenshot) + halaman 2+ (teks) ─

export async function exportHollandResultToPDF({ scoreCardElement, sections, filename }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  await renderScoreCardPage(doc, scoreCardElement)
  renderAnswerDetailPages(doc, sections)

  doc.save(filename)
}