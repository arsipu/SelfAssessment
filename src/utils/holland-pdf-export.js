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
      <div style="margin-bottom: 28px;">
        <h3 style="display: flex; align-items: center; font-size: 15px; font-weight: bold; color: #111827; margin-top: 0; margin-bottom: 14px;">
          ${section.label}
        </h3>
        <div style="display: flex; flex-direction: column; gap: 6px;">
    `

    // Loop butir soal
    section.items.forEach((item, i) => {
      // PERBAIKAN 2: Memberikan efek zebra (warna background selang-seling) agar tidak polos
      const isEven = i % 2 === 0;
      const bgColor = isEven ? '#f9fafb' : '#ffffff'; // abu-abu sangat muda vs putih
      const borderColor = isEven ? '#f3f4f6' : 'transparent';

      detailsHtml += `
          <div style="display: flex; align-items: flex-start; padding: 10px 12px; background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 6px; page-break-inside: avoid;">
            <span style="font-size: 12px; font-weight: 700; color: #6b7280; min-width: 28px; line-height: 1.5; flex-shrink: 0;">
              ${i + 1}.
            </span>
            <p style="font-size: 12px; color: #374151; line-height: 1.5; margin: 0; text-align: left;">
              ${item.questionText}
            </p>
          </div>
      `
    })

    detailsHtml += `
        </div>
      </div>
    `
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
      scrollX: 0,
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