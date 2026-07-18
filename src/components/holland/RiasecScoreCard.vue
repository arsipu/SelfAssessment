<template>
  <div class="bg-surface border border-border rounded-2xl p-5 md:p-8 shadow-sm">
    <!-- Optional title (admin: "Detail minat dominan", user: none) -->
    <div v-if="title" class="text-center mb-4">
      <p class="text-xs font-medium text-text-muted uppercase tracking-wide">
        {{ title }}
      </p>
    </div>

    <!-- Top Code -->
    <div class="flex flex-col items-center mb-8">
      <div class="text-4xl md:text-5xl font-bold tracking-widest text-text-primary mb-1">
        {{ topCode }}
      </div>
      <p class="text-xs text-text-muted">Kode minat dominan (kategori tertinggi)</p>
    </div>

    <!-- Riasec Hex Chart -->
    <div class="flex flex-col items-center mb-8">
      <div class="w-full" :style="{ maxWidth: size + 'px' }">
        <RiasecHexChart
          :scores="scorePercentMap"
          :size="size"
          :label-font-size="labelFontSize"
        />
      </div>
      <p class="text-[11px] text-text-muted mt-1 text-center max-w-[220px] leading-relaxed">
        Semakin jauh titik dari pusat, semakin tinggi kecenderungan minat.
      </p>
    </div>

    <!-- Deskripsi kategori dominan -->
    <div v-if="topCodeInfo" class="bg-surface-muted border border-border rounded-xl p-4">
      <p class="text-sm font-semibold text-text-primary mb-1">
        {{ topCodeInfo.label }} ({{ topCode }})
      </p>
      <p class="text-xs text-text-secondary leading-relaxed mb-4">
        {{ topCodeInfo.description }}
      </p>

      <div v-if="topCodeInfo.skills?.length" class="mb-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
          Keterampilan kunci
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="skill in topCodeInfo.skills"
            :key="skill"
            class="text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-primary"
          >
            {{ skill }}
          </span>
        </div>
      </div>

      <div v-if="topCodeInfo.careers?.length" class="mb-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
          Contoh pekerjaan relevan
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="career in topCodeInfo.careers"
            :key="career"
            class="text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-primary"
          >
            {{ career }}
          </span>
        </div>
      </div>

      <div v-if="topCodeInfo.subjects?.length">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
          Mata pelajaran pendukung
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="subject in topCodeInfo.subjects"
            :key="subject"
            class="text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-primary"
          >
            {{ subject }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import RiasecHexChart from '@/components/RiasecHexChart.vue'

defineProps({
  topCode: {
    type: String,
    required: true,
  },
  topCodeInfo: {
    type: Object,
    default: null,
  },
  scorePercentMap: {
    type: Object,
    required: true,
  },
  size: {
    type: Number,
    default: 256,
  },
  labelFontSize: {
    type: Number,
    default: 14,
  },
  title: {
    type: String,
    default: '',
  },
})
</script>