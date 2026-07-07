<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-12 text-center mb-6">
      <p class="text-sm text-gray-400">Memuat ringkasan...</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div v-for="stat in stats" :key="stat.label" class="bg-gray-100 rounded-xl p-4">
          <p class="text-xs text-gray-400 mb-1.5">{{ stat.label }}</p>
          <p class="text-3xl font-medium text-gray-900 leading-none">{{ stat.value }}</p>
          <p class="text-xs mt-1.5" :class="stat.positive ? 'text-green-600' : 'text-yellow-600'">{{ stat.sub }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Responden terbaru -->
        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <h2 class="text-sm font-medium text-gray-800 mb-4">Responden terbaru</h2>

          <div v-if="recentRespondents.length === 0" class="text-xs text-gray-400 py-6 text-center">
            Belum ada responden yang mengerjakan.
          </div>

          <div v-else class="space-y-3">
            <div v-for="r in recentRespondents" :key="r.key" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                {{ initialsOf(r.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-800 truncate">{{ r.name || '-' }}</p>
                <p class="text-xs text-gray-400 truncate">{{ r.instrumentName }}</p>
              </div>
              <span
                class="text-xs px-2 py-0.5 rounded-full shrink-0"
                :class="r.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              >
                {{ r.status === 'completed' ? 'Selesai' : 'Proses' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Progress per instrumen -->
        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <h2 class="text-sm font-medium text-gray-800 mb-4">Progress per instrumen</h2>

          <div v-if="instrumentProgress.length === 0" class="text-xs text-gray-400 py-6 text-center">
            Belum ada instrumen yang dipublikasikan.
          </div>

          <div v-else class="space-y-4">
            <div v-for="ins in instrumentProgress" :key="ins.key">
              <div class="flex items-center justify-between mb-1.5">
                <p class="text-sm text-gray-700 truncate">{{ ins.name }}</p>
                <p class="text-xs text-gray-400 shrink-0 ml-2">{{ ins.done }}/{{ ins.total }}</p>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :style="{ width: (ins.total ? Math.round((ins.done / ins.total) * 100) : 0) + '%', background: ins.color }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertSubmissionsStore } from '@/stores/likert/likert-submissions'
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'
import { PUBLISHED } from '@/apps/status'

const likertStore = useLikertStore()
const likertSubmissionsStore = useLikertSubmissionsStore()
const hollandStore = useHollandStore()
const hollandSubmissionsStore = useHollandSubmissionsStore()

const loading = ref(true)

// Gabungan flat semua submission dari semua instrumen (likert + holland),
// masing-masing ditandai type & instrumentName biar bisa diproses bareng.
const allSubmissions = ref([])

// Warna dipakai bergantian buat progress bar tiap instrumen, biar beda-beda
// tanpa perlu nyimpen warna manual di Firestore per instrumen.
const PALETTE = ['#378ADD', '#7F77DD', '#1D9E75', '#D4537E', '#BA7517', '#639922']

const instrumentProgress = ref([])

function initialsOf(name) {
  if (!name) return '-'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

function toMillis(timestamp) {
  return timestamp?.toMillis ? timestamp.toMillis() : 0
}

const recentRespondents = computed(() =>
  [...allSubmissions.value]
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
    .slice(0, 5)
    .map((s) => ({
      key: `${s.instrumentType}-${s.id}`,
      name: s.name,
      instrumentName: s.instrumentName,
      status: s.status,
    }))
)

const totalRespondents = computed(() => allSubmissions.value.length)
const completedCount = computed(
  () => allSubmissions.value.filter((s) => s.status === 'completed').length
)
const inProgressCount = computed(() => totalRespondents.value - completedCount.value)
const completedPct = computed(() =>
  totalRespondents.value ? Math.round((completedCount.value / totalRespondents.value) * 1000) / 10 : 0
)
const activeInstrumentCount = computed(() => instrumentProgress.value.length)

const stats = computed(() => [
  { label: 'Total responden', value: totalRespondents.value, sub: 'Seluruh instrumen', positive: true },
  { label: 'Asesmen selesai', value: completedCount.value, sub: `${completedPct.value}% dari total`, positive: true },
  { label: 'Sedang berjalan', value: inProgressCount.value, sub: 'Belum selesai', positive: false },
  { label: 'Instrumen aktif', value: activeInstrumentCount.value, sub: 'Sedang dipublikasikan', positive: true },
])

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([likertStore.fetchLikerts(), hollandStore.fetchHollands()])

    const publishedLikerts = (likertStore.likerts || []).filter((l) => l.status === PUBLISHED)
    const publishedHollands = (hollandStore.hollands || []).filter((h) => h.status === PUBLISHED)

    // Fetch submissions tiap instrumen secara paralel
    const [likertResults, hollandResults] = await Promise.all([
      Promise.all(
        publishedLikerts.map(async (l) => {
          await likertSubmissionsStore.fetchSubmissions(l.id)
          return { instrument: l, submissions: [...likertSubmissionsStore.submissions] }
        })
      ),
      Promise.all(
        publishedHollands.map(async (h) => {
          await hollandSubmissionsStore.fetchSubmissions(h.id)
          return { instrument: h, submissions: [...hollandSubmissionsStore.submissions] }
        })
      ),
    ])

    const flatSubs = []
    const progress = []

    likertResults.forEach(({ instrument, submissions }, i) => {
      submissions.forEach((s) =>
        flatSubs.push({
          ...s,
          instrumentType: 'likert',
          instrumentName: instrument.name,
        })
      )
      progress.push({
        key: `likert-${instrument.id}`,
        name: instrument.name,
        done: submissions.filter((s) => s.status === 'completed').length,
        total: submissions.length,
        color: PALETTE[i % PALETTE.length],
      })
    })

    hollandResults.forEach(({ instrument, submissions }, i) => {
      submissions.forEach((s) =>
        flatSubs.push({
          ...s,
          instrumentType: 'holland',
          instrumentName: instrument.name,
        })
      )
      progress.push({
        key: `holland-${instrument.id}`,
        name: instrument.name,
        done: submissions.filter((s) => s.status === 'completed').length,
        total: submissions.length,
        color: PALETTE[(i + likertResults.length) % PALETTE.length],
      })
    })

    allSubmissions.value = flatSubs
    instrumentProgress.value = progress
  } finally {
    loading.value = false
  }
})
</script>