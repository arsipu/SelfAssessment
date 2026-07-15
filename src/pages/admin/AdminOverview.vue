<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-xl p-12 text-center mb-6">
      <p class="text-sm text-text-muted">Memuat ringkasan...</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div v-for="stat in stats" :key="stat.label" class="bg-surface-muted rounded-xl p-4">
          <p class="text-xs text-text-muted mb-1.5">{{ stat.label }}</p>
          <p class="text-3xl font-medium text-text-primary leading-none">{{ stat.value }}</p>
          <p class="text-xs mt-1.5" :class="stat.positive ? 'text-success' : 'text-warning'">{{ stat.sub }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Responden terbaru -->
        <div class="bg-surface border border-border rounded-xl p-5">
          <h2 class="text-sm font-medium text-text-primary mb-4">Responden terbaru</h2>

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
          <h2 class="text-sm font-medium text-text-primary mb-4">Progress per instrumen</h2>

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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertSubmissionsStore } from '@/stores/likert/likert-submissions'
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'
import { ACTIVE } from '@/apps/status'

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
const PALETTE = [
  'var(--color-viz-1)',
  'var(--color-viz-2)',
  'var(--color-viz-3)',
  'var(--color-viz-4)',
  'var(--color-viz-5)',
  'var(--color-viz-6)',
]

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

    const activedLikers = (likertStore.likerts || []).filter((l) => l.status === ACTIVE)
    const activedLikerts = (hollandStore.hollands || []).filter((h) => h.status === ACTIVE)

    // Fetch submissions tiap instrumen secara paralel
    const [likertResults, hollandResults] = await Promise.all([
      Promise.all(
        activedLikers.map(async (l) => {
          await likertSubmissionsStore.fetchSubmissions(l.id)
          return { instrument: l, submissions: [...likertSubmissionsStore.submissions] }
        })
      ),
      Promise.all(
        activedLikerts.map(async (h) => {
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