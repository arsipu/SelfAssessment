<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-xl p-12 text-center mb-6">
      <p class="text-sm text-text-muted">Memuat ringkasan...</p>
    </div>

    <template v-else>
      <InstrumentOverviewSection
        title="Likert"
        :stats="likertStats"
        :recent-respondents="likertRecentRespondents"
        :instrument-progress="likertProgress"
        class="mb-8"
      />

      <InstrumentOverviewSection
        title="Holland RIASEC"
        :stats="hollandStats"
        :recent-respondents="hollandRecentRespondents"
        :instrument-progress="hollandProgress"
      />
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
import InstrumentOverviewSection from '@/pages/admin/InstrumentOverviewSection.vue'

const likertStore = useLikertStore()
const likertSubmissionsStore = useLikertSubmissionsStore()
const hollandStore = useHollandStore()
const hollandSubmissionsStore = useHollandSubmissionsStore()

const loading = ref(true)

// Submission per instrumen, dipisah biar Likert & Holland gak ketuker
const likertSubmissions = ref([])
const hollandSubmissions = ref([])

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

const likertProgress = ref([])
const hollandProgress = ref([])

function toMillis(timestamp) {
  return timestamp?.toMillis ? timestamp.toMillis() : 0
}

function buildRecentRespondents(submissions) {
  return [...submissions]
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
    .slice(0, 5)
    .map((s) => ({
      key: s.id,
      name: s.name,
      instrumentName: s.instrumentName,
      status: s.status,
    }))
}

function buildStats(submissions) {
  const total = submissions.length
  const completed = submissions.filter((s) => s.status === 'completed').length
  const inProgress = total - completed
  const completedPct = total ? Math.round((completed / total) * 1000) / 10 : 0

  return [
    { label: 'Total responden', value: total, sub: 'Seluruh instrumen', positive: true },
    { label: 'Asesmen selesai', value: completed, sub: `${completedPct}% dari total`, positive: true },
    { label: 'Sedang berjalan', value: inProgress, sub: 'Belum selesai', positive: false },
  ]
}

const likertRecentRespondents = computed(() => buildRecentRespondents(likertSubmissions.value))
const hollandRecentRespondents = computed(() => buildRecentRespondents(hollandSubmissions.value))

const likertStats = computed(() => buildStats(likertSubmissions.value))
const hollandStats = computed(() => buildStats(hollandSubmissions.value))

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([likertStore.fetchLikerts(), hollandStore.fetchHollands()])

    const activedLikers = (likertStore.likerts || []).filter((l) => l.status === ACTIVE)
    const activedHollands = (hollandStore.hollands || []).filter((h) => h.status === ACTIVE)

    // Fetch submissions tiap instrumen secara paralel
    const [likertResults, hollandResults] = await Promise.all([
      Promise.all(
        activedLikers.map(async (l) => {
          await likertSubmissionsStore.fetchSubmissions(l.id)
          return { instrument: l, submissions: [...likertSubmissionsStore.submissions] }
        })
      ),
      Promise.all(
        activedHollands.map(async (h) => {
          await hollandSubmissionsStore.fetchSubmissions(h.id)
          return { instrument: h, submissions: [...hollandSubmissionsStore.submissions] }
        })
      ),
    ])

    const flatLikertSubs = []
    const flatHollandSubs = []
    const likertProg = []
    const hollandProg = []

    likertResults.forEach(({ instrument, submissions }, i) => {
      submissions.forEach((s) =>
        flatLikertSubs.push({
          ...s,
          instrumentType: 'likert',
          instrumentName: instrument.name,
        })
      )
      likertProg.push({
        key: `likert-${instrument.id}`,
        name: instrument.name,
        done: submissions.filter((s) => s.status === 'completed').length,
        total: submissions.length,
        color: PALETTE[i % PALETTE.length],
      })
    })

    hollandResults.forEach(({ instrument, submissions }, i) => {
      submissions.forEach((s) =>
        flatHollandSubs.push({
          ...s,
          instrumentType: 'holland',
          instrumentName: instrument.name,
        })
      )
      hollandProg.push({
        key: `holland-${instrument.id}`,
        name: instrument.name,
        done: submissions.filter((s) => s.status === 'completed').length,
        total: submissions.length,
        color: PALETTE[i % PALETTE.length],
      })
    })

    likertSubmissions.value = flatLikertSubs
    hollandSubmissions.value = flatHollandSubs
    likertProgress.value = likertProg
    hollandProgress.value = hollandProg
  } finally {
    loading.value = false
  }
})
</script>