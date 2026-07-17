import html2pdf from 'html2pdf.js'

/**
 * Fungsi untuk mengekspor elemen HTML menjadi PDF
 * @param {HTMLElement} element - Elemen DOM yang akan diubah ke PDF
 * @param {String} filename - Nama file PDF yang akan diunduh
 */
export async function exportToPDF(element, filename = 'Laporan_Data.pdf') {
  if (!element) {
    console.error('Elemen target PDF tidak ditemukan!');
    return;
  }

  const options = {
    margin: 10, // Margin PDF dalam mm
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, // Berguna jika ada gambar/aset dari luar
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'], avoid: '.avoid-break' }
  };

  // Proses ekspor
  try {
    await html2pdf().set(options).from(element).save();
    return true;
  } catch (error) {
    console.error('Gagal mengekspor PDF:', error);
    throw error;
  }
}
