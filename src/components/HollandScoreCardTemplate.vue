<template>
  <div
    ref="cardRef"
    class="w-[794px] bg-[#ffffff] px-14 py-12"
    style="font-family: Arial, sans-serif; box-sizing: border-box;"
  >
    <div class="flex items-center justify-between border-b-2 border-[#111827] pb-5 mb-8">
      <div>
        <p class="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">Hasil Asesmen</p>
        <h1 class="text-3xl font-bold text-[#111827] mt-1">{{ hollandName }}</h1>
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
          <p class="text-[#1f2937] font-medium">{{ respondent.name || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Sekolah</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.school || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Jurusan</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.major || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Tanggal Lahir/Usia</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.birthDateAge || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Jenis Kelamin</p>
          <p class="text-[#1f2937] font-medium">{{ genderLabel }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Pekerjaan</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.occupation || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Tujuan Tes</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.testPurpose || '-' }}</p>
        </div>
        <div>
          <p class="text-[#9ca3af] text-xs mb-1">Tanggal Tes</p>
          <p class="text-[#1f2937] font-medium">{{ respondent.testDate || '-' }}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-8 mb-8">
      <div class="shrink-0 w-32 h-32 rounded-full border-[5px] border-[#111827] flex items-center justify-center bg-[#ffffff]">
        <span class="text-4xl font-extrabold text-[#111827] text-center">{{ topCode }}</span>
      </div>
      <div class="flex-1">
        <span
          class="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3 tracking-wide text-center"
          style="background-color: #e5e7eb; color: #374151;"
        >
          {{ scalesLabel }}
        </span>
        <p class="text-base text-[#4b5563] leading-relaxed pr-4">{{ scalesDescription }}</p>
      </div>
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