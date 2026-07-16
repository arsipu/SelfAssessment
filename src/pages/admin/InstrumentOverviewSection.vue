<template>
  <section>
    <h2 class="text-sm font-semibold text-text-primary mb-3">{{ title }}</h2>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-surface-muted rounded-xl p-4">
        <p class="text-xs text-text-muted mb-1.5">{{ stat.label }}</p>
        <p class="text-3xl font-medium text-text-primary leading-none">{{ stat.value }}</p>
        <p class="text-xs mt-1.5" :class="stat.positive ? 'text-success' : 'text-warning'">{{ stat.sub }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Responden terbaru -->
      <div class="bg-surface border border-border rounded-xl p-5">
        <h3 class="text-sm font-medium text-text-primary mb-4">Responden terbaru</h3>

        <div v-if="recentRespondents.length === 0" class="text-xs text-text-muted py-6 text-center">
          Belum ada responden yang mengerjakan.
        </div>

        <div v-else class="space-y-3">
          <div v-for="r in recentRespondents" :key="r.key" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-xs font-medium text-text-secondary shrink-0">
              {{ initialsOf(r.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-text-primary truncate">{{ r.name || '-' }}</p>
              <p class="text-xs text-text-muted truncate">{{ r.instrumentName }}</p>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full shrink-0"
              :class="r.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
            >
              {{ r.status === 'completed' ? 'Selesai' : 'Proses' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Progress per instrumen -->
      <div class="bg-surface border border-border rounded-xl p-5">
        <h3 class="text-sm font-medium text-text-primary mb-4">Progress per instrumen</h3>

        <div v-if="instrumentProgress.length === 0" class="text-xs text-text-muted py-6 text-center">
          Belum ada instrumen yang dipublikasikan.
        </div>

        <div v-else class="space-y-4">
          <div v-for="ins in instrumentProgress" :key="ins.key">
            <div class="flex items-center justify-between mb-1.5">
              <p class="text-sm text-text-primary truncate">{{ ins.name }}</p>
              <p class="text-xs text-text-muted shrink-0 ml-2">{{ ins.done }}/{{ ins.total }}</p>
            </div>
            <div class="h-1.5 bg-surface-muted rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :style="{ width: (ins.total ? Math.round((ins.done / ins.total) * 100) : 0) + '%', background: ins.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  stats: { type: Array, required: true },
  recentRespondents: { type: Array, required: true },
  instrumentProgress: { type: Array, required: true },
})

function initialsOf(name) {
  if (!name) return '-'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}
</script>