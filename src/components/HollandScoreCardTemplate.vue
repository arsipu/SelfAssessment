<template>
  <div
    ref="cardRef"
    class="w-[794px] bg-surface px-14 py-12"
    style="font-family: Arial, sans-serif; box-sizing: border-box;"
  >
    <div class="flex items-center justify-between border-b-2 border-primary pb-5 mb-8">
      <div>
        <p class="text-[11px] font-semibold text-text-muted uppercase tracking-widest">Hasil Asesmen</p>
        <h1 class="text-3xl font-bold text-text-primary mt-1">{{ hollandName }}</h1>
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
          <p class="text-text-primary font-medium">{{ respondent.name || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Sekolah</p>
          <p class="text-text-primary font-medium">{{ respondent.school || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Jurusan</p>
          <p class="text-text-primary font-medium">{{ respondent.major || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Tanggal Lahir/Usia</p>
          <p class="text-text-primary font-medium">{{ respondent.birthDateAge || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Jenis Kelamin</p>
          <p class="text-text-primary font-medium">{{ genderLabel }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Pekerjaan</p>
          <p class="text-text-primary font-medium">{{ respondent.occupation || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Tujuan Tes</p>
          <p class="text-text-primary font-medium">{{ respondent.testPurpose || '-' }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs mb-1">Tanggal Tes</p>
          <p class="text-text-primary font-medium">{{ respondent.testDate || '-' }}</p>
        </div>
      </div>
    </div>

    <div
      class="border border-border rounded-xl px-8 py-8 mb-8 text-center"
      style="page-break-inside: avoid; break-inside: avoid;"
    >
      <p class="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-3">
        Kode RIASEC Dominan
      </p>
      <p class="text-5xl font-extrabold text-text-primary tracking-[0.25em] mb-4">
        {{ topCode }}
      </p>
      <p class="text-sm font-bold text-text-secondary uppercase tracking-wide mb-4">
        {{ scalesLabel }}
      </p>
      <p class="text-sm text-text-secondary leading-relaxed text-left max-w-[560px] mx-auto">
        {{ scalesDescription }}
      </p>
    </div>

    <div
        v-if="scores"
        class="border border-border rounded-xl px-8 py-8 mb-8"
        style="page-break-inside: avoid; break-inside: avoid;"
      >
      <p class="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-5 text-center">
        Grafik Profil RIASEC
      </p>

      <div class="grid grid-cols-2 gap-8 items-center">
        <div style="width: 260px; margin: 0 auto;">
          <RiasecHexChart :scores="scores" :size="260" :label-font-size="13" />
        </div>

        <div class="space-y-3">
          <div
            v-for="row in sortedScoreRows"
            :key="row.code"
            style="display: table; width: 100%;"
          >
            <div style="display: table-cell; width: 70%; vertical-align: middle;">
              <p class="text-xs font-semibold text-text-secondary">
                {{ row.label }} ({{ row.code }})
              </p>
            </div>
            <div style="display: table-cell; width: 30%; vertical-align: middle; text-align: right;">
              <p class="text-xs font-bold text-text-primary">{{ row.percentage }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-border pt-6 mt-10 flex justify-between items-center">
      <p class="text-[11px] text-text-muted">Dokumen ini digenerate otomatis oleh sistem SelfAssessment</p>
      <p class="text-[11px] font-medium text-text-muted">{{ generatedDate }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RiasecHexChart from '@/components/RiasecHexChart.vue'

const props = defineProps({
  hollandName: String,
  code: String,
  respondent: { type: Object, default: () => ({}) },
  topCode: String,
  scalesLabel: String,
  scalesDescription: String,
  scores: { type: Object, default: null },
  riasecLabels: { type: Object, default: () => ({}) },
})

const cardRef = ref(null)
defineExpose({ cardRef })

const generatedDate = new Date().toLocaleDateString('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric',
})

const genderLabel = computed(() => {
  return props.respondent.gender || '-'
})

const sortedScoreRows = computed(() => {
  if (!props.scores) return []
  return Object.entries(props.scores)
    .map(([code, percentage]) => ({
      code,
      percentage,
      label: props.riasecLabels[code] || code,
    }))
    .sort((a, b) => b.percentage - a.percentage)
})
</script>