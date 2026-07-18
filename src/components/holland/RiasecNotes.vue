<template>
  <div v-if="topCodeInfo" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div v-if="topCodeInfo.skills?.length">
      <p class="text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1.5">Keterampilan</p>
      <p class="text-xs text-text-secondary leading-relaxed">{{ topCodeInfo.skills.join(', ') }}</p>
    </div>
    <div v-if="topCodeInfo.careers?.length">
      <p class="text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1.5">Contoh karier</p>
      <p class="text-xs text-text-secondary leading-relaxed">{{ topCodeInfo.careers.join(', ') }}</p>
    </div>
    <div v-if="topCodeInfo.subjects?.length">
      <p class="text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1.5">Mata pelajaran</p>
      <p class="text-xs text-text-secondary leading-relaxed">{{ topCodeInfo.subjects.join(', ') }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  topCodeInfo: { type: Object, default: null },
})
</script>