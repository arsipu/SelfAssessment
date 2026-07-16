import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

/**
 * Create a workbook, build worksheet from rows data, and trigger download.
 *
 * @param {Array<Object>} rows - Array of row objects (keys = column headers)
 * @param {string} sheetName - Nama worksheet
 * @param {string} fileName - Nama file yang akan di-download
 */
export function createAndDownloadExcel(rows, sheetName = 'Rekap', fileName = 'export.xlsx') {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  const keys = Object.keys(rows[0] || {})

  // Define columns with headers and auto width
  worksheet.columns = keys.map((key) => ({
    header: key,
    key: key,
    width: Math.max(key.length, ...rows.map((r) => String(r[key] ?? '').length)) + 2,
  }))

  // Add data rows
  rows.forEach((row) => {
    worksheet.addRow(row)
  })

  // Generate buffer and trigger download via FileSaver
  return workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, fileName)
  })
}