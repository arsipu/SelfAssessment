<template>
  <div class="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-center">
    <div class="flex flex-col items-center gap-2">
      <div class="w-full max-w-[160px]">
        <RiasecHexChart :scores="scorePercentMap" :size="160" :label-font-size="11" />
      </div>
      <p class="text-[11px] text-text-muted text-center">Diagram RIASEC</p>
    </div>
    <div>
      <p class="text-xs text-text-muted mb-1">Kode minat dominan</p>
      <p class="text-3xl font-semibold tracking-widest text-text-primary mb-2">{{ topCode }}</p>
      <p v-if="topCodeInfo" class="text-sm text-text-secondary leading-relaxed">
        {{ topCodeInfo.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
import RiasecHexChart from '@/components/RiasecHexChart.vue'

defineProps({
  topCode: { type: String, required: true },
  topCodeInfo: { type: Object, default: null },
  scorePercentMap: { type: Object, required: true },
})
</script>