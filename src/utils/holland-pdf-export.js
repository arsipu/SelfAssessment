import html2pdf from 'html2pdf.js'

/**
 * Mengekspor hasil asesmen Holland ke PDF secara penuh menggunakan html2pdf.js
 */
export async function exportHollandResultToPDF({ scoreCardElement, sections, filename }) {
  // 1. Buat wrapper utama (ukuran A4 pixel = 794px)
  const workerWrapper = document.createElement('div')
  workerWrapper.style.width = '794px'
  workerWrapper.style.backgroundColor = '#ffffff'

  // 2. Clone Halaman 1 (Kartu Skor)
  const scoreCardClone = scoreCardElement.cloneNode(true)
  workerWrapper.appendChild(scoreCardClone)

  // 3. Bangun HTML untuk Halaman 2+ (Rincian)
  let detailsHtml = `
    <div style="page-break-before: always; padding: 45px 55px; font-family: Arial, sans-serif; box-sizing: border-box; width: 794px; background-color: #ffffff;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111827; padding-bottom: 20px; margin-bottom: 25px;">
        <div>
          <p style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Rincian Jawaban</p>
          <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin: 4px 0 0 0;">${scoreCardClone.querySelector('h1')?.innerText || 'Holland Assessment'}</h1>
        </div>
      </div>
  `

  // Loop setiap section (kategori RIASEC dll)
  sections.forEach((section) => {
    detailsHtml += `
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 14px; font-weight: bold; color: #1f2937; margin-top: 20px; margin-bottom: 12px; border-left: 4px solid #111827; padding-left: 8px;">
          ${section.label}
        </h3>
    `

    // Loop butir soal (tanpa label jawaban)
    section.items.forEach((item, i) => {
      detailsHtml += `
        <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #f3f4f6; page-break-inside: avoid;">
          <p style="font-size: 12px; color: #374151; line-height: 1.5; margin: 0; text-align: left;">
            ${i + 1}. ${item.questionText}
          </p>
        </div>
      `
    })

    detailsHtml += `</div>`
  })

  detailsHtml += `</div>`

  // Satukan HTML ke Wrapper
  const detailsContainer = document.createElement('div')
  detailsContainer.innerHTML = detailsHtml
  workerWrapper.appendChild(detailsContainer)

  // 4. Konfigurasi PDF
  const options = {
    margin: 0, 
    filename: filename || 'holland-result.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0, // Kunci: Mencegah miring/geser akibat posisi scroll layar
      scrollY: 0,
      windowWidth: 794
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  }

  // 5. Eksekusi Ekspor
  try {
    await html2pdf().set(options).from(workerWrapper).save()
  } catch (error) {
    console.error('Error saat melakukan export PDF Holland:', error)
    throw error
  }
}