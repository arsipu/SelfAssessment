<template>
  <div
    ref="cardRef"
    class="w-[700px] bg-white p-10"
    style="font-family: Arial, sans-serif;"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-6">
      <div>
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Hasil Asesmen</p>
        <h1 class="text-2xl font-bold text-gray-900 mt-1">{{ likertName }}</h1>
      </div>
      <div class="text-right">
        <p class="text-xs text-gray-400">Kode Tracking</p>
        <p class="text-sm font-mono font-semibold text-gray-700">{{ code }}</p>
      </div>
    </div>

    <!-- Data Responden -->
    <div class="bg-gray-50 rounded-xl p-5 mb-6">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Data Responden</p>
      <div class="grid grid-cols-3 gap-y-3 gap-x-4 text-sm">
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Nama</p>
          <p class="text-gray-800 font-medium">{{ respondent.nama || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Kelas</p>
          <p class="text-gray-800 font-medium">{{ respondent.kelas || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Sekolah</p>
          <p class="text-gray-800 font-medium">{{ respondent.sekolah || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Jurusan</p>
          <p class="text-gray-800 font-medium">{{ respondent.jurusan || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Usia</p>
          <p class="text-gray-800 font-medium">{{ respondent.usia || '-' }} tahun</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Jenis Kelamin</p>
          <p class="text-gray-800 font-medium">{{ respondent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Pernah PKL</p>
          <p class="text-gray-800 font-medium">{{ respondent.pkl || '-' }}</p>
        </div>
      </div>
    </div>

    <!-- Skor & Scale -->
    <div class="flex items-center gap-6 mb-6">
      <div class="shrink-0 w-28 h-28 rounded-full border-4 border-gray-900 flex items-center justify-center">
        <span class="text-3xl font-bold text-gray-900">{{ totalScore }}</span>
      </div>
      <div class="flex-1">
        <span
          class="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
          :style="{ backgroundColor: badgeBg, color: badgeText }"
        >
          {{ scalesLabel }}
        </span>
        <p class="text-sm text-gray-600 leading-relaxed">{{ scalesDescription }}</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-gray-200 pt-4 flex justify-between items-center">
      <p class="text-[10px] text-gray-400">Dokumen ini digenerate otomatis oleh sistem SelfAssessment</p>
      <p class="text-[10px] text-gray-400">{{ generatedDate }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  likertName: String,
  code: String,
  respondent: { type: Object, default: () => ({}) },
  totalScore: [Number, String],
  scalesLabel: String,
  scalesDescription: String,
})

const cardRef = ref(null)
defineExpose({ cardRef })

const generatedDate = new Date().toLocaleDateString('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric',
})

// warna badge kategori — sesuaikan sama badgeClassMap yang uda ada
const colorMap = {
  'Sangat Tinggi': { bg: '#d1fae5', text: '#047857' },
  'Tinggi': { bg: '#ccfbf1', text: '#0f766e' },
  'Sedang': { bg: '#fef3c7', text: '#b45309' },
  'Rendah': { bg: '#ffedd5', text: '#c2410c' },
  'Sangat Rendah': { bg: '#ffe4e6', text: '#be123c' },
}
const badgeBg = computed(() => colorMap[props.scalesLabel]?.bg || '#f3f4f6')
const badgeText = computed(() => colorMap[props.scalesLabel]?.text || '#374151')
</script>