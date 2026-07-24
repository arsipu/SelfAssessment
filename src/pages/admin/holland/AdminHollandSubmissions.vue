<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <button
        @click="router.push({ name: 'admin-holland' })"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap cursor-pointer"
      >
        Holland RIASEC
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <button
        @click="router.push({ name: 'admin-holland-questions', params: { slug: hollandSlug } })"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap cursor-pointer"
      >
        Pertanyaan
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <span class="text-sm text-text-primary font-medium truncate">Submissions</span>
    </div>

    <!-- Header -->
    <div class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">Submissions</h1>
        <p class="text-sm text-text-secondary mb-3">Daftar responden yang mengerjakan Holland RIASEC</p>
        <span class="text-xs font-medium text-text-secondary bg-surface-muted px-3 py-1.5 rounded-md border border-border whitespace-nowrap">
          {{ submissions.length }} Responden
        </span>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button
          @click="showExportModal = true"
          :disabled="submissions.length === 0"
          class="text-xs font-medium px-3 py-2.5 md:py-2 rounded-md border border-border text-text-secondary hover:bg-surface-muted disabled:opacity-40 transition-colors h-10 flex-1 sm:flex-none cursor-pointer"
        >
          Export Excel
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-text-muted">Memuat data...</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-surface border border-border rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="app-table w-full text-left border-collapse">
          <thead>
            <tr>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Nama</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Sekolah</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Jurusan</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Kode</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Status</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Kode RIASEC</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Tanggal</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="s in submissions"
              :key="s.id"
              @click="router.push({ name: 'admin-holland-submission-detail', params: { slug: hollandSlug, submissionSlug: s.slug } })"
              class="cursor-pointer"
            >
              <td class="px-4 md:px-5 py-3 text-sm font-medium">{{ s.name }}</td>
              <td class="px-4 md:px-5 py-3 text-sm">{{ s.school }}</td>
              <td class="px-4 md:px-5 py-3 text-sm">{{ s.major }}</td>
              <td class="px-4 md:px-5 py-3 text-sm font-mono">{{ s.code }}</td>
              <td class="px-4 md:px-5 py-3 text-sm">
                <span
                  class="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                  :class="s.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
                >
                  {{ s.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan' }}
                </span>
              </td>
              <td class="px-4 md:px-5 py-3 text-sm font-semibold tracking-wide">{{ getTopCode(s) }}</td>
              <td class="px-4 md:px-5 py-3 text-sm whitespace-nowrap">{{ formatDate(s.createdAt) }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-right">
                <font-awesome-icon
                  icon="fa-solid fa-chevron-right"
                  class="w-5 h-5 text-text-muted group-hover:text-text-secondary transition-colors shrink-0"
                />
              </td>
            </tr>

            <tr v-if="submissions.length === 0">
              <td colspan="8" class="px-4 md:px-5 py-6 text-sm text-center text-text-muted">
                Belum ada responden yang mengerjakan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal konfirmasi export -->
  <Transition name="fade">
    <div
      v-if="showExportModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
      @click.self="showExportModal = false"
    >
      <div class="bg-surface rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-lg flex flex-col max-h-[90vh]">
        <h2 class="text-base font-semibold text-text-primary mb-2">Export ke Excel?</h2>
        <p class="text-sm text-text-secondary leading-relaxed mb-6">
          File berisi rekap {{ submissions.length }} responden akan diunduh dalam format .xlsx.
        </p>

        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <button
            @click="showExportModal = false"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-primary-soft transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="confirmExportExcel"
            :disabled="exporting"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors h-10 cursor-pointer"
          >
            {{ exporting ? 'Mengunduh...' : 'Ya, export' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { computeScoreBreakdownFromAnswers, computeTopCode } from '@/utils/holland-scoring'
import { exportSubmissionsToExcel } from '@/utils/holland-excel-export'

const riasecStore = useHollandRiasecStore()
const riasecIds = computed(() => riasecStore.riasecList.map((c) => c.id))

function getTopCode(submission) {
  if (submission.status !== 'completed' || !submission.answers) return '-'
  const breakdown = computeScoreBreakdownFromAnswers(submission.answers, riasecIds.value)
  return computeTopCode(breakdown) || '-'
}

const route = useRoute()
const router = useRouter()
const hollandSlug = route.params.slug
const hollandId = ref(null)

const hollandStore = useHollandStore()
const submissionsStore = useHollandSubmissionsStore()
const { submissions, loading } = storeToRefs(submissionsStore)

const showExportModal = ref(false)
const exporting = ref(false)

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return '-'
  return timestamp.toDate().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function confirmExportExcel() {
  if (exporting.value) return
  exporting.value = true
  try {
    exportSubmissionsToExcel(submissions.value, riasecIds.value, 'Holland RIASEC')
    showExportModal.value = false
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  const holland = await hollandStore.getHollandBySlug(hollandSlug)
  if (!holland) {
    router.push({ name: 'admin-holland' })
    return
  }
  hollandId.value = holland.id
  await submissionsStore.fetchSubmissions(hollandId.value)
  await riasecStore.fetchRiasecList(hollandId.value)
})
</script>