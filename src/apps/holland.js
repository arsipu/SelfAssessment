// src/constants/holland.js

/**
 * Panduan RIASEC — konten referensi statis dari teori Holland.
 * Digunakan di halaman hasil (result page) untuk menampilkan
 * deskripsi, keterampilan, pekerjaan relevan, dan mata pelajaran
 * berdasarkan kode RIASEC dominan hasil skor peserta.
 */
export const RIASEC_GUIDE = Object.freeze({
  R: {
    code: 'R',
    label: 'Realistic',
    description:
      'Suka bekerja terutama dengan tangan, membuat, memperbaiki, merakit atau membangun sesuatu, menggunakan dan mengoperasikan peralatan, alat atau mesin. Seringkali suka bekerja di luar ruangan.',
    skills: [
      'Menggunakan dan mengoperasikan alat, peralatan dan mesin',
      'Merancang, membangun, memperbaiki, memelihara',
      'Bekerja secara manual, mengukur, bekerja secara detail',
      'Mengemudi, bergerak, merawat hewan, bekerja dengan tanaman',
    ],
    careers: [
      'Pilot',
      'Petani',
      'Hortikultura',
      'Pembangun',
      'Insinyur',
      'Personel angkatan bersenjata',
      'Mekanik',
      'Tukang melapis',
      'Listrik',
      'Teknolog komputer',
      'Penjaga taman',
      'Olahragawan',
    ],
    subjects: [
      'Bahasa Inggris',
      'Matematika',
      'Sains',
      'Workshop',
      'Teknologi',
      'Komputer',
      'Studi Bisnis',
      'Pertanian',
      'Hortikultura',
      'Pendidikan Jasmani',
    ],
  },

  I: {
    code: 'I',
    label: 'Investigative',
    description:
      'Suka menemukan dan meneliti ide, mengamati, menyelidiki, dan bereksperimen, mengajukan pertanyaan, dan menyelesaikan masalah.',
    skills: [
      'Berpikir analitis dan logis, menghitung',
      'Berkomunikasi dengan menulis dan berbicara',
      'Merancang, merumuskan, menghitung',
      'Mendiagnosis, bereksperimen, menyelidiki',
    ],
    careers: [
      'Ilmu pengetahuan',
      'Penelitian',
      'Pekerjaan medis dan kesehatan',
      'Ahli kimia',
      'Ilmuwan kelautan',
      'Teknisi kehutanan',
      'Teknisi laboratorium medis atau pertanian',
      'Ahli zoologi',
      'Dokter gigi',
      'Dokter',
    ],
    subjects: ['Bahasa Inggris', 'Matematika', 'Sains', 'Komputer', 'Teknologi'],
  },

  A: {
    code: 'A',
    label: 'Artistic',
    description:
      'Suka menggunakan kata-kata, seni, musik atau drama untuk berkomunikasi, melakukan, atau mengekspresikan diri, membuat dan merancang sesuatu.',
    skills: [
      'Mengekspresikan secara artistik atau fisik',
      'Berbicara, menulis, menyanyi, tampil',
      'Merancang, menyajikan, merencanakan, menyusun',
      'Bermain, menari',
    ],
    careers: [
      'Artis',
      'Ilustrator',
      'Fotografer',
      'Penulis lagu',
      'Komposer',
      'Penyanyi',
      'Pemain instrumen',
      'Penari',
      'Aktor',
      'Reporter',
      'Penulis',
      'Editor',
      'Pengiklan',
      'Penata rambut',
      'Perancang busana',
    ],
    subjects: [
      'Bahasa Inggris',
      'Ilmu Sosial',
      'Musik',
      'Drama',
      'Seni',
      'Desain Grafis',
      'Komputer',
      'Studi Bisnis',
      'Bahasa',
    ],
  },

  S: {
    code: 'S',
    label: 'Social',
    description:
      'Suka mengajar, melatih dan memberi informasi, membantu, mengobati, menyembuhkan dan melayani dan menyapa, peduli dengan kesejahteraan diri dan kesejahteraan orang lain.',
    skills: [
      'Berkomunikasi secara lisan atau tertulis',
      'Peduli dan mendukung, melatih, bertemu, menyapa',
      'Membantu, mengajar, memberi informasi',
      'Mewawancarai, melatih',
    ],
    careers: [
      'Guru',
      'Perawat',
      'Asisten perawat',
      'Penasihat',
      'Petugas polisi',
      'Pekerja sosial',
      'Tenaga penjualan',
      'Petugas layanan pelanggan',
      'Pelayan',
      'Sekretaris',
    ],
    subjects: [
      'Bahasa Inggris',
      'Ilmu Sosial',
      'Matematika',
      'Sains',
      'Kesehatan',
      'Pendidikan Jasmani',
      'Seni',
      'Komputer',
      'Studi Bisnis',
      'Bahasa',
    ],
  },

  E: {
    code: 'E',
    label: 'Enterprising',
    description:
      'Suka bertemu orang, memimpin, berbicara dan mempengaruhi orang lain, mendorong orang lain, bekerja dalam bisnis.',
    skills: [
      'Menjual, mempromosikan dan membujuk',
      'Mengembangkan ide-ide, berbicara di depan umum',
      'Mengelola, mengatur, memimpin dan menangkap',
      'Menghitung, merencanakan',
    ],
    careers: [
      'Tenaga penjual',
      'Pengacara',
      'Politisi',
      'Akuntan',
      'Pemilik bisnis',
      'Eksekutif atau manajer',
      'Agen perjalanan',
      'Promotor musik atau olahraga',
    ],
    subjects: [
      'Bahasa Inggris',
      'Matematika',
      'Studi Bisnis',
      'Akuntansi',
      'Ekonomi',
      'Ilmu Sosial',
      'Drama',
      'Komputasi',
      'Manajemen Informasi Teks',
      'Bahasa',
    ],
  },

  C: {
    code: 'C',
    label: 'Conventional',
    description:
      'Suka bekerja di dalam ruangan dan pada tugas-tugas yang melibatkan pengorganisasian data, merekam dan menyimpan catatan.',
    skills: [
      'Komputasi dan keyboarding',
      'Merekam dan menyimpan catatan',
      'Bekerja secara teliti dan detail',
      'Mengikuti prosedur dengan akurat',
    ],
    careers: [
      'Sekretaris',
      'Resepsionis',
      'Pekerja kantor',
      'Pustakawan',
      'Petugas bank',
    ],
    subjects: ['Bahasa Inggris', 'Matematika', 'Studi Bisnis', 'Akuntansi', 'Ekonomi'],
  },
})

/**
 * Urutan kategori standar, dipakai untuk render kartu kategori
 * di halaman pengisian maupun untuk iterasi yang konsisten.
 */
export const RIASEC_CATEGORY_ORDER = Object.freeze(['R', 'I', 'A', 'S', 'E', 'C'])

/**
 * Bentuk { id, name } turunan dari RIASEC_GUIDE, dipakai di admin panel
 * (dropdown kategori, header tabel, dsb) supaya label kategori SELALU
 * sinkron dengan yang dipakai di halaman respondent/result — jangan
 * duplikasi daftar kategori di file lain.
 */
export const RIASEC_CATEGORIES = Object.freeze(
  RIASEC_CATEGORY_ORDER.map((id) => ({ id, name: RIASEC_GUIDE[id].label }))
)

/**
 * Label kolom pernyataan sesuai dokumen kuesioner Holland.
 * Dipakai baik di halaman pengisian (respondent) maupun admin panel
 * (dropdown kolom saat tambah/edit soal) — satu sumber untuk keduanya.
 */
export const HOLLAND_COLUMNS = Object.freeze([
  { key: 'adalah', id: 'adalah', label: 'Saya adalah seseorang yang' },
  { key: 'mampu', id: 'mampu', label: 'Saya mampu' },
  { key: 'menyukai', id: 'menyukai', label: 'Saya menyukai' },
])

// Alias biar konsisten sama penamaan yang dipakai di admin panel lama (@/apps/holland)
export const RIASEC_COLUMNS = HOLLAND_COLUMNS

/**
 * Helper: ambil 3 kode teratas dari objek skor { R, I, A, S, E, C }
 * dan gabungkan jadi string kode RIASEC (misal "SAE").
 *
 * PENTING: jumlah pernyataan per kategori TIDAK SAMA (R=17, I=18, A=14,
 * S=18, E=17, C=16), jadi ranking harus berbasis PERSENTASE
 * (checked / total pernyataan kategori itu), bukan angka mentah —
 * kalau pakai angka mentah, kategori dengan pernyataan lebih banyak
 * otomatis diuntungkan meski minatnya belum tentu lebih tinggi.
 *
 * @param {Object} scores - { R: { count, total }, I: { count, total }, ... }
 * @param {number} topN
 * @returns {string} contoh: "SAE"
 */
export function getTopRiasecCode(scores, topN = 3) {
  return Object.entries(scores)
    .map(([code, s]) => [code, s.total ? (s.count / s.total) * 100 : 0])
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([code]) => code)
    .join('')
}

/**
 * Hitung count, total, dan percentage untuk tiap kategori RIASEC
 * berdasarkan daftar questions dan checkedMap (object { [questionId]: true }).
 *
 * @param {Array} questions - daftar soal { id, category, column, ... }
 * @param {Object} checkedMap - { [questionId]: true }
 * @returns {Object} { R: { count, total, percentage }, ... }
 */
export function computeRiasecScores(questions, checkedMap) {
  const scores = Object.fromEntries(
    RIASEC_CATEGORY_ORDER.map((code) => [code, { count: 0, total: 0 }])
  )

  for (const q of questions) {
    if (!scores[q.category]) continue
    scores[q.category].total += 1
    if (checkedMap[q.id]) scores[q.category].count += 1
  }

  for (const code of RIASEC_CATEGORY_ORDER) {
    const s = scores[code]
    s.percentage = s.total ? Math.round((s.count / s.total) * 1000) / 10 : 0
  }

  return scores
}