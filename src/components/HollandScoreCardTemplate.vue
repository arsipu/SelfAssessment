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
        <h1 class="text-2xl font-bold text-gray-900 mt-1">{{ hollandName }}</h1>
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
          <p class="text-gray-800 font-medium">{{ respondent.name || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Sekolah</p>
          <p class="text-gray-800 font-medium">{{ respondent.school || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Jurusan</p>
          <p class="text-gray-800 font-medium">{{ respondent.major || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Tanggal Lahir/Usia</p>
          <p class="text-gray-800 font-medium">{{ respondent.birthDateAge || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Jenis Kelamin</p>
          <p class="text-gray-800 font-medium">{{ genderLabel }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Pekerjaan</p>
          <p class="text-gray-800 font-medium">{{ respondent.occupation || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Tujuan Tes</p>
          <p class="text-gray-800 font-medium">{{ respondent.testPurpose || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Tanggal Tes</p>
          <p class="text-gray-800 font-medium">{{ respondent.testDate || '-' }}</p>
        </div>
      </div>
    </div>

    <!-- Kode RIASEC Dominan -->
    <div class="flex items-center gap-6 mb-6">
      <div class="shrink-0 w-28 h-28 rounded-full border-4 border-gray-900 flex items-center justify-center">
        <span class="text-3xl font-bold text-gray-900">{{ topCode }}</span>
      </div>
      <div class="flex-1">
        <span
          class="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
          style="background-color: #e5e7eb; color: #374151;"
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
  hollandName: String,
  code: String,
  respondent: { type: Object, default: () => ({}) },
  topCode: String,
  scalesLabel: String,
  scalesDescription: String,
})

const cardRef = ref(null)
defineExpose({ cardRef })

const generatedDate = new Date().toLocaleDateString('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric',
})

const genderLabel = computed(() => {
  if (!props.respondent.gender) return '-'
  return props.respondent.gender === 'L' ? 'Laki-laki' : 'Perempuan'
})
</script>