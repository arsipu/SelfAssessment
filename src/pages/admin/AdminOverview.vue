<template>
  <div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-gray-100 rounded-xl p-4">
        <p class="text-xs text-gray-400 mb-1.5">{{ stat.label }}</p>
        <p class="text-3xl font-medium text-gray-900 leading-none">{{ stat.value }}</p>
        <p class="text-xs mt-1.5" :class="stat.positive ? 'text-green-600' : 'text-yellow-600'">{{ stat.sub }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <h2 class="text-sm font-medium text-gray-800 mb-4">Responden terbaru</h2>
        <div class="space-y-3">
          <div v-for="r in recentRespondents" :key="r.name" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
              {{ r.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-800 truncate">{{ r.name }}</p>
              <p class="text-xs text-gray-400">{{ r.instrument }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full shrink-0" :class="r.done ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
              {{ r.done ? 'Selesai' : 'Proses' }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <h2 class="text-sm font-medium text-gray-800 mb-4">Progress per instrumen</h2>
        <div class="space-y-4">
          <div v-for="ins in instrumentProgress" :key="ins.name">
            <div class="flex items-center justify-between mb-1.5">
              <p class="text-sm text-gray-700">{{ ins.name }}</p>
              <p class="text-xs text-gray-400">{{ ins.done }}/{{ ins.total }}</p>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :style="{ width: Math.round((ins.done / ins.total) * 100) + '%', background: ins.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const stats = [
  { label: 'Total responden', value: 248, sub: '+12 minggu ini', positive: true },
  { label: 'Asesmen selesai', value: 183, sub: '73.8% dari total', positive: true },
  { label: 'Sedang berjalan', value: 41, sub: 'Belum selesai', positive: false },
  { label: 'Laporan dibuat', value: 167, sub: '+5 hari ini', positive: true },
]

const recentRespondents = [
  { name: 'Rizky Ananda', initials: 'RA', instrument: 'Holland RIASEC', done: true },
  { name: 'Siti Rahma', initials: 'SR', instrument: 'Work Readiness', done: true },
  { name: 'Budi Santoso', initials: 'BS', instrument: 'Holland RIASEC', done: false },
  { name: 'Dewi Lestari', initials: 'DL', instrument: 'Work Readiness', done: false },
  { name: 'Agus Firmansyah', initials: 'AF', instrument: 'Holland RIASEC', done: true },
]

const instrumentProgress = [
  { name: 'Holland RIASEC', done: 112, total: 150, color: '#7F77DD' },
  { name: 'Work Readiness Scale', done: 71, total: 98, color: '#378ADD' },
]
</script>