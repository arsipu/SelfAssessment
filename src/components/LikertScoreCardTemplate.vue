<template>
  <div
    ref="cardRef"
    class="w-[794px] bg-[#ffffff] px-14 py-12"
    style="font-family: Arial, sans-serif; box-sizing: border-box;"
  >
    <div class="flex items-center justify-between border-b-2 border-[#111827] pb-5 mb-8">
      <div>
        <p class="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">Hasil Asesmen</p>
        <h1 class="text-3xl font-bold text-[#111827] mt-1">{{ likertName }}</h1>
      </div>
      <div class="text-right">
        <p class="text-[11px] text-[#9ca3af]">Kode Tracking</p>
        <p class="text-sm font-mono font-bold text-[#374151]">{{ code }}</p>
      </div>
    </div>

    <div class="bg-[#f9fafb] rounded-xl p-6 mb-8 border border-[#f3f4f6]">
      <p class="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-4">Data Responden</p>
      <div class="grid grid-cols-3 gap-y-5 gap-x-6 text-sm">
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Nama</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.nama || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Kelas</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.kelas || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Sekolah</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.sekolah || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Jurusan</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.jurusan || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Usia</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.usia || '-' }} tahun</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Jenis Kelamin</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Pernah PKL</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.pkl || '-' }}</p>
        </div>
      </div>
    </div>

    <div class="border border-[#e5e7eb] rounded-xl px-8 py-8 mb-8 text-center">
      <p class="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-3">
        Total Skor
      </p>

      <p class="text-5xl font-extrabold text-[#111827] tracking-[0.08em] mb-4">
        {{ totalScore }}
      </p>

      <p class="text-sm font-bold text-[#374151] uppercase tracking-wide mb-4">
        {{ scalesLabel }}
      </p>

      <p class="text-sm text-[#4b5563] leading-relaxed max-w-[560px] mx-auto">
        {{ scalesDescription }}
      </p>
    </div>

    <div class="border-t border-[#e5e7eb] pt-6 mt-10 flex justify-between items-center">
      <p class="text-[11px] text-[#9ca3af]">Dokumen ini digenerate otomatis oleh sistem SelfAssessment</p>
      <p class="text-[11px] font-medium text-[#9ca3af]">{{ generatedDate }}</p>
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