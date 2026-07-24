<template>
  <div v-if="variant === 'center'" class="text-center">
    <div class="text-4xl md:text-5xl font-bold text-text-primary mb-2">{{ totalScore }}</div>
    <span
      v-if="scaleLabel"
      class="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
      :style="{ backgroundColor: badgeBg, color: badgeText }"
    >
      {{ scaleLabel }}
    </span>
    <div v-if="scaleDescription" class="border border-border rounded-xl p-5 mt-5 text-left">
      <p class="text-sm text-text-secondary leading-relaxed">{{ scaleDescription }}</p>
    </div>
  </div>

  <div v-else class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
    <div>
      <p class="text-xs text-text-muted mb-1">Total skor</p>
      <p class="text-3xl font-semibold text-text-primary">{{ totalScore }}</p>
    </div>
    <div v-if="scaleLabel" class="sm:border-l sm:border-border sm:pl-8">
      <p class="text-xs text-text-muted mb-1">Nilai</p>
      <p class="text-lg font-semibold text-text-primary">{{ scaleLabel }}</p>
      <p v-if="scaleDescription" class="text-xs text-text-secondary mt-1 leading-relaxed max-w-md">
        {{ scaleDescription }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalScore: { type: [Number, String], required: true },
  scaleLabel: { type: String, default: '' },
  scaleDescription: { type: String, default: '' },
  variant: { type: String, default: 'center' }, // 'center' | 'inline'
  badgeBg: { type: String, default: 'var(--color-surface-muted)' },
  badgeText: { type: String, default: 'var(--color-text-secondary)' },
})
</script>