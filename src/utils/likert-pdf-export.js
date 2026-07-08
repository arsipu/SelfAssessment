import html2pdf from 'html2pdf.js'

/**
 * Mengekspor hasil asesmen ke PDF secara penuh menggunakan html2pdf.js
 * @param {HTMLElement} scoreCardElement - Elemen DOM dari kartu skor (Halaman 1)
 * @param {Array} sections - Data rincian jawaban (Halaman 2+)
 * @param {string} filename - Nama file PDF hasil ekspor
 */
export async function exportResultToPDF({ scoreCardElement, sections, filename }) {
  // 1. Buat wrapper utama di dalam memory (tidak merusak UI di layar)
  const workerWrapper = document.createElement('div')
  workerWrapper.style.width = '794px' // Mengunci lebar standar kertas A4 (96 DPI)
  workerWrapper.style.backgroundColor = '#ffffff'

  // 2. Kloning Elemen Kartu Skor (Halaman 1)
  const scoreCardClone = scoreCardElement.cloneNode(true)
  workerWrapper.appendChild(scoreCardClone)

  // 3. Bangun HTML untuk Rincian Jawaban (Halaman 2+)
  // Menggunakan inline style berbasis HEX murni agar aman dari error oklch
  let detailsHtml = `
    <div style="page-break-before: always; padding: 45px 55px; font-family: Arial, sans-serif; box-sizing: border-box; width: 794px; background-color: #ffffff;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111827; padding-bottom: 20px; margin-bottom: 25px;">
        <div>
          <p style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Rincian Jawaban</p>
          <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin: 4px 0 0 0;">${scoreCardClone.querySelector('h1')?.innerText || 'Hasil Asesmen'}</h1>
        </div>
      </div>
  `

  // Loop untuk setiap kelompok/section pertanyaan
  sections.forEach((section) => {
    detailsHtml += `
      <div style="margin-bottom: 28px;">
        <h3 style="display:flex; align-items:center; font-size:15px; font-weight:bold; color:#111827; margin-top:0; margin-bottom:14px;">
          ${section.label}
        </h3>

      <div style="display:flex; flex-direction:column; gap:6px;">
    `

    // Loop untuk butir item pertanyaan di dalam section
    section.items.forEach((item, i) => {
      const isEven = i % 2 === 0
      const bgColor = isEven ? '#f9fafb' : '#ffffff'
      const borderColor = isEven ? '#f3f4f6' : 'transparent'

      detailsHtml += `
        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            gap:16px;
            padding:10px 12px;
            margin-bottom:6px;
            background-color:${bgColor};
            border:1px solid ${borderColor};
            border-radius:6px;
            page-break-inside:avoid;
          "
        >
          <div
            style="
              display:flex;
              align-items:flex-start;
              flex:1;
              min-width:0;
            "
          >
            <span
              style="
                min-width:28px;
                font-size:12px;
                font-weight:700;
                color:#6b7280;
                line-height:1.5;
                flex-shrink:0;
              "
            >
              ${i + 1}.
            </span>

            <div
              style="
                font-size:12px;
                color:#374151;
                line-height:1.5;
                text-align:left;
                word-break:break-word;
              "
            >
              ${item.questionText}
            </div>
          </div>

          <div
            style="
              min-width:140px;
              max-width:170px;
              text-align:right;
              font-size:12px;
              font-weight:700;
              color:#111827;
              line-height:1.5;
            "
          >
            ${item.answerLabel}
          </div>
        </div>
      `
    })

    detailsHtml += `</div>`
  })

  detailsHtml += `</div>`

  // Inject string HTML rincian jawaban ke dalam kontainer DOM baru, lalu satukan ke wrapper
  const detailsContainer = document.createElement('div')
  detailsContainer.innerHTML = detailsHtml
  workerWrapper.appendChild(detailsContainer)

  // 4. Konfigurasi penuh html2pdf.js
  const options = {
    margin: 0, // Ditentukan 0 karena layout diatur presisi lewat padding wrapper (A4 penuh)
    filename: filename || 'hasil-asesmen.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2, // Resolusi tinggi (bisa dinaikkan ke 3 jika teks dirasa kurang tajam)
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0, // KUNCI UTAMA: Menghilangkan efek geser/miring akibat posisi scroll layar user
      scrollY: 0,
      windowWidth: 794 // Memaksa lebar viewport penangkapan pas dengan lebar elemen kita
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  }

  // 5. Eksekusi pembuatan dan download file PDF
  try {
    await html2pdf().set(options).from(workerWrapper).save()
  } catch (error) {
    console.error('Error saat melakukan export PDF:', error)
    throw error
  }
}