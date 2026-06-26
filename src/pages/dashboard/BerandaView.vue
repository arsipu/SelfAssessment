<template>
  <AppTopBar />
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <div v-for="stat in stats" :key="stat.label" class="bg-gray-100 rounded-lg p-4">
        <p class="text-xs text-gray-400 mb-1.5">{{ stat.label }}</p>
        <p class="text-3xl font-medium text-gray-900 leading-none">{{ stat.value }}</p>
        <p class="text-xs mt-1.5" :class="stat.positive ? 'text-green-600' : 'text-yellow-600'">
          {{ stat.sub }}
        </p>
      </div>
    </div>

    <!-- Mid Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
      <!-- RIASEC Bars -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <h2 class="text-sm font-medium text-gray-800 mb-4">Distribusi tipe RIASEC</h2>
        <div class="space-y-2">
          <div v-for="item in riasec" :key="item.label" class="flex items-center gap-2 text-xs">
            <span class="w-5 text-gray-400 font-medium shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :style="{ width: item.pct + '%', background: item.color }"
              ></div>
            </div>
            <span class="w-7 text-right text-gray-400 shrink-0">{{ item.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- Aktivitas -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <h2 class="text-sm font-medium text-gray-800 mb-4">Aktivitas terbaru</h2>
        <div class="space-y-3">
          <div v-for="act in activities" :key="act.text" class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm" :class="act.color">
              <span class="material-symbols-outlined text-[14px]">{{ act.icon }}</span>
            </div>
            <div>
              <p class="text-sm text-gray-700 leading-snug">{{ act.text }}</p>
              <p class="text-xs text-gray-400">{{ act.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-3">
      <!-- Instrumen -->
      <div class="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-5">
        <h2 class="text-sm font-medium text-gray-800 mb-4">Instrumen aktif</h2>
        <div class="space-y-2">
          <div
            v-for="(ins, i) in instruments"
            :key="ins.name"
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:border-blue-300 border border-transparent cursor-pointer transition-colors"
          >
            <div class="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center justify-center shrink-0">
              {{ i + 1 }}
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-800">{{ ins.name }}</p>
              <p class="text-xs text-gray-400">{{ ins.sub }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded" :class="badgeClass(ins.status)">
              {{ ins.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Ring -->
      <div class="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-3">
        <h2 class="text-sm font-medium text-gray-800 self-start">Tingkat penyelesaian</h2>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="46" fill="none" stroke="#f3f4f6" stroke-width="10"/>
          <circle
            cx="55" cy="55" r="46"
            fill="none" stroke="#378ADD" stroke-width="10"
            stroke-linecap="round"
            stroke-dasharray="289"
            :stroke-dashoffset="289 - (289 * 0.738)"
            transform="rotate(-90 55 55)"
          />
          <text x="55" y="51" text-anchor="middle" font-size="22" font-weight="500" fill="#111827">74%</text>
          <text x="55" y="65" text-anchor="middle" font-size="11" fill="#9ca3af">selesai</text>
        </svg>
        <p class="text-sm text-gray-700">183 dari 248 responden</p>
        <p class="text-xs text-gray-400">telah menyelesaikan seluruh instrumen</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppTopBar from '../../components/AppTopBar.vue'
import { computed } from 'vue'

const today = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
})

const stats = [
  { label: 'Total responden', value: 248, sub: '+12 minggu ini', positive: true },
  { label: 'Asesmen selesai', value: 183, sub: '73.8% dari total', positive: true },
  { label: 'Sedang berjalan', value: 41, sub: 'Belum selesai', positive: false },
  { label: 'Laporan dibuat', value: 167, sub: '+5 hari ini', positive: true },
]

const riasec = [
  { label: 'R', pct: 62, color: '#639922' },
  { label: 'I', pct: 78, color: '#378ADD' },
  { label: 'A', pct: 45, color: '#D4537E' },
  { label: 'S', pct: 85, color: '#1D9E75' },
  { label: 'E', pct: 54, color: '#BA7517' },
  { label: 'C', pct: 70, color: '#7F77DD' },
]

const activities = [
  { icon: 'check_circle', color: 'bg-green-100 text-green-700', text: 'Rizky Ananda menyelesaikan RIASEC', time: '2 menit lalu' },
  { icon: 'person_add', color: 'bg-blue-100 text-blue-700', text: 'Responden baru terdaftar', time: '15 menit lalu' },
  { icon: 'download', color: 'bg-yellow-100 text-yellow-700', text: 'Laporan Work Readiness diekspor', time: '1 jam lalu' },
  { icon: 'check_circle', color: 'bg-green-100 text-green-700', text: 'Siti Rahma menyelesaikan Work Readiness', time: '2 jam lalu' },
]

const instruments = [
  { name: 'Holland RIASEC', sub: '36 butir soal', status: 'Aktif' },
  { name: 'Work Readiness Scale', sub: '28 butir soal', status: 'Aktif' },
  { name: 'Minat Bakat (MBTI)', sub: '40 butir soal', status: 'Draft' },
  { name: 'Kesiapan Kerja Lanjutan', sub: '–', status: 'Baru' },
]

const badgeClass = (status) => ({
  'Aktif': 'bg-green-100 text-green-700',
  'Draft': 'bg-yellow-100 text-yellow-700',
  'Baru': 'bg-blue-100 text-blue-700',
}[status] ?? '')
</script>