<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-3">
        <svg class="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p class="text-sm text-text-muted">Memuat dashboard...</p>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p class="text-sm text-text-secondary mt-1">Ringkasan aktivitas asesmen dan responden</p>
        </div>
        <div class="flex gap-3">
          <router-link
            :to="{ name: 'admin-likert' }"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-on-primary bg-primary hover:bg-primary-hover transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Kelola Survei
          </router-link>
          <router-link
            :to="{ name: 'admin-holland' }"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-on-primary bg-primary hover:bg-primary-hover transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Kelola Holland
          </router-link>
        </div>
      </div>

      <!-- Global Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(card, idx) in globalStats"
          :key="idx"
          class="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <div class="flex items-center justify-between mb-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="card.bgColor"
            >
              <component :is="card.icon" class="w-5 h-5" :class="card.iconColor" />
            </div>
          </div>
          <p class="text-sm text-text-secondary">{{ card.label }}</p>
          <p class="text-2xl font-bold text-text-primary mt-0.5">{{ card.value }}</p>
        </div>
      </div>

      <!-- Likert & Holland Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Likert Card -->
        <div class="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
          <div class="p-5 border-b border-border">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-base font-semibold text-text-primary">Survei</h2>
                  <p class="text-xs text-text-muted">Instrumen penilaian sikap & persepsi</p>
                </div>
              </div>
              <router-link
                :to="{ name: 'admin-likert' }"
                class="text-sm font-medium text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
              >
                Detail
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <!-- Likert Mini Stats -->
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center p-3 rounded-xl bg-surface-muted">
                <p class="text-lg font-bold text-text-primary">{{ likertStats[0]?.value ?? 0 }}</p>
                <p class="text-xs text-text-secondary mt-0.5">Total</p>
              </div>
              <div class="text-center p-3 rounded-xl bg-success-soft">
                <p class="text-lg font-bold text-success">{{ likertStats[1]?.value ?? 0 }}</p>
                <p class="text-xs text-success mt-0.5">Selesai</p>
              </div>
              <div class="text-center p-3 rounded-xl bg-warning-soft">
                <p class="text-lg font-bold text-warning">{{ likertStats[2]?.value ?? 0 }}</p>
                <p class="text-xs text-warning mt-0.5">Berjalan</p>
              </div>
            </div>

            <!-- Likert Recent Respondents -->
            <div>
              <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Responden Terbaru</h3>
              <div v-if="likertRecentRespondents.length === 0" class="text-xs text-text-muted py-3 text-center bg-surface-muted rounded-xl">
                Belum ada responden.
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="r in likertRecentRespondents.slice(0, 3)"
                  :key="r.key"
                  class="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-muted transition-colors cursor-pointer"
                  @click="$router.push({ name: 'admin-likert-submissions', params: { slug: r.instrumentName?.toLowerCase().replace(/\s+/g, '-') || r.key } })"
                >
                  <div class="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center text-xs font-bold text-success shrink-0">
                    {{ initialsOf(r.name) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-text-primary truncate">{{ r.name || '-' }}</p>
                    <p class="text-xs text-text-muted truncate">{{ r.instrumentName }}</p>
                  </div>
                  <span
                    class="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                    :class="r.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
                  >
                    {{ r.status === 'completed' ? 'Selesai' : 'Proses' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Likert Progress Bars -->
            <div v-if="likertProgress.length > 0" class="pt-2 border-t border-border">
              <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Progress Instrumen</h3>
              <div class="space-y-3">
                <div v-for="ins in likertProgress" :key="ins.key">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-xs text-text-secondary truncate">{{ ins.name }}</p>
                    <p class="text-xs text-text-muted shrink-0 ml-2">{{ ins.done }}/{{ ins.total }}</p>
                  </div>
                  <div class="h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      :style="{ width: (ins.total ? Math.round((ins.done / ins.total) * 100) : 0) + '%', background: ins.color }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Holland Card -->
        <div class="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
          <div class="p-5 border-b border-border">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-base font-semibold text-text-primary">Holland RIASEC</h2>
                  <p class="text-xs text-text-muted">Instrumen minat karier & kepribadian</p>
                </div>
              </div>
              <router-link
                :to="{ name: 'admin-holland' }"
                class="text-sm font-medium text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
              >
                Detail
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <!-- Holland Mini Stats -->
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center p-3 rounded-xl bg-surface-muted">
                <p class="text-lg font-bold text-text-primary">{{ hollandStats[0]?.value ?? 0 }}</p>
                <p class="text-xs text-text-secondary mt-0.5">Total</p>
              </div>
              <div class="text-center p-3 rounded-xl bg-success-soft">
                <p class="text-lg font-bold text-success">{{ hollandStats[1]?.value ?? 0 }}</p>
                <p class="text-xs text-success mt-0.5">Selesai</p>
              </div>
              <div class="text-center p-3 rounded-xl bg-warning-soft">
                <p class="text-lg font-bold text-warning">{{ hollandStats[2]?.value ?? 0 }}</p>
                <p class="text-xs text-warning mt-0.5">Berjalan</p>
              </div>
            </div>

            <!-- Holland Recent Respondents -->
            <div>
              <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Responden Terbaru</h3>
              <div v-if="hollandRecentRespondents.length === 0" class="text-xs text-text-muted py-3 text-center bg-surface-muted rounded-xl">
                Belum ada responden.
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="r in hollandRecentRespondents.slice(0, 3)"
                  :key="r.key"
                  class="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-muted transition-colors cursor-pointer"
                  @click="$router.push({ name: 'admin-holland-submissions', params: { slug: r.instrumentName?.toLowerCase().replace(/\s+/g, '-') || r.key } })"
                >
                  <div class="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {{ initialsOf(r.name) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-text-primary truncate">{{ r.name || '-' }}</p>
                    <p class="text-xs text-text-muted truncate">{{ r.instrumentName }}</p>
                  </div>
                  <span
                    class="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                    :class="r.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
                  >
                    {{ r.status === 'completed' ? 'Selesai' : 'Proses' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Holland Progress Bars -->
            <div v-if="hollandProgress.length > 0" class="pt-2 border-t border-border">
              <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Progress Instrumen</h3>
              <div class="space-y-3">
                <div v-for="ins in hollandProgress" :key="ins.key">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-xs text-text-secondary truncate">{{ ins.name }}</p>
                    <p class="text-xs text-text-muted shrink-0 ml-2">{{ ins.done }}/{{ ins.total }}</p>
                  </div>
                  <div class="h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      :style="{ width: (ins.total ? Math.round((ins.done / ins.total) * 100) : 0) + '%', background: ins.color }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertSubmissionsStore } from '@/stores/likert/likert-submissions'
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'
import { ACTIVE } from '@/apps/status'

const router = useRouter()

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

// Fallback colors if CSS variables aren't defined
const PALETTE_FALLBACK = [
  '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6'
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

// SVG Icon components for the stat cards
const SvgUsers = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' })
    ])
  }
}

const SvgCheckCircle = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  }
}

const SvgClock = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  }
}

const SvgClipboard = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' })
    ])
  }
}

const globalStats = computed(() => {
  const likert = likertStats.value
  const holland = hollandStats.value

  const totalRespondents = (likert[0]?.value ?? 0) + (holland[0]?.value ?? 0)
  const totalCompleted = (likert[1]?.value ?? 0) + (holland[1]?.value ?? 0)
  const totalInProgress = (likert[2]?.value ?? 0) + (holland[2]?.value ?? 0)
  const totalInstruments = likertProgress.value.length + hollandProgress.value.length

  return [
    {
      label: 'Total Responden',
      value: totalRespondents,
      icon: SvgUsers,
      bgColor: 'bg-primary-soft',
      iconColor: 'text-primary',
    },
    {
      label: 'Asesmen Selesai',
      value: totalCompleted,
      icon: SvgCheckCircle,
      bgColor: 'bg-success-soft',
      iconColor: 'text-success',
    },
    {
      label: 'Sedang Berjalan',
      value: totalInProgress,
      icon: SvgClock,
      bgColor: 'bg-warning-soft',
      iconColor: 'text-warning',
    },
    {
      label: 'Total Instrumen',
      value: totalInstruments,
      icon: SvgClipboard,
      bgColor: 'bg-surface-muted',
      iconColor: 'text-text-secondary',
    },
  ]
})

const likertRecentRespondents = computed(() => buildRecentRespondents(likertSubmissions.value))
const hollandRecentRespondents = computed(() => buildRecentRespondents(hollandSubmissions.value))

const likertStats = computed(() => buildStats(likertSubmissions.value))
const hollandStats = computed(() => buildStats(hollandSubmissions.value))

function getColor(index) {
  const cssVar = PALETTE[index % PALETTE.length]
  // Try to use CSS variable, fallback to hardcoded color
  return PALETTE_FALLBACK[index % PALETTE_FALLBACK.length]
}

function initialsOf(name) {
  if (!name) return '-'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

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
        color: getColor(i),
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
        color: getColor(i),
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