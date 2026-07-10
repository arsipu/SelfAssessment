<template>
  <div
    ref="cardRef"
    class="w-[794px] bg-surface px-14 py-12"
    style="font-family: Arial, sans-serif; box-sizing: border-box;"
  >
    <div class="flex items-center justify-between border-b-2 border-primary pb-5 mb-8">
      <div>
        <p class="text-[11px] font-semibold text-text-muted uppercase tracking-widest">Hasil Asesmen</p>
        <h1 class="text-3xl font-bold text-text-primary mt-1">{{ likertName }}</h1>
      </div>
      <div class="text-right">
        <p class="text-[11px] text-text-muted">Kode Tracking</p>
        <p class="text-sm font-mono font-bold text-text-secondary">{{ code }}</p>
      </div>
    </div>

    <div class="bg-surface-muted rounded-xl p-6 mb-8 border border-border">
      <p class="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Data Responden</p>
      <div class="grid grid-cols-3 gap-y-5 gap-x-6 text-sm">
        <div>
          <p class="text-text-muted text-xs mb-1">Nama</p>
          <p class="text-text-primary font-medium">{{ respondent.nama || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Kelas</p>
          <p class="text-text-primary font-medium">{{ respondent.kelas || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Sekolah</p>
          <p class="text-text-primary font-medium">{{ respondent.sekolah || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Jurusan</p>
          <p class="text-text-primary font-medium">{{ respondent.jurusan || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Usia</p>
          <p class="text-text-primary font-medium">{{ respondent.usia || '-' }} tahun</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Jenis Kelamin</p>
          <p class="text-text-primary font-medium">{{ respondent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Pernah PKL</p>
          <p class="text-text-primary font-medium">{{ respondent.pkl || '-' }}</p>
        </div>
      </div>
    </div>

    <div class="border border-border rounded-xl px-8 py-8 mb-8 text-center">
      <p class="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-3">
        Total Skor
      </p>

      <p class="text-5xl font-extrabold text-text-primary tracking-[0.08em] mb-4">
        {{ totalScore }}
      </p>

      <p class="text-sm font-bold text-text-secondary uppercase tracking-wide mb-4">
        {{ scalesLabel }}
      </p>

      <p class="text-sm text-text-secondary leading-relaxed max-w-[560px] mx-auto">
        {{ scalesDescription }}
      </p>
    </div>

    <div class="border-t border-border pt-6 mt-10 flex justify-between items-center">
      <p class="text-[11px] text-text-muted">Dokumen ini digenerate otomatis oleh sistem SelfAssessment</p>
      <p class="text-[11px] font-medium text-text-muted">{{ generatedDate }}</p>
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
</script>