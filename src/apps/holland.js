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
 * Label kolom pernyataan sesuai dokumen kuesioner Holland.
 */
export const HOLLAND_COLUMNS = Object.freeze([
  { key: 'adalah', label: 'Saya adalah seseorang yang:' },
  { key: 'mampu', label: 'Saya mampu:' },
  { key: 'menyukai', label: 'Saya menyukai:' },
])

/**
 * Helper: ambil 3 kode teratas dari objek skor { R, I, A, S, E, C }
 * dan gabungkan jadi string kode RIASEC (misal "SAE").
 */
export function getTopRiasecCode(scores, topN = 3) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([code]) => code)
    .join('')
}