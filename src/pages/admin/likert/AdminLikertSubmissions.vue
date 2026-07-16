<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <button
        @click="router.push({ name: 'admin-likert' })"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap cursor-pointer"
      >
        Survei
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <button
        @click="router.push({ name: 'admin-likert-questions', params: { slug: likertSlug } })"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors truncate max-w-[120px] md:max-w-none cursor-pointer"
      >
        {{ currentLikert?.name ?? '...' }}
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <span class="text-sm text-text-primary font-medium truncate">Submissions</span>
    </div>

    <!-- Header -->
    <div class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">Submissions</h1>
        <p class="text-sm text-text-secondary mb-3">Daftar responden yang mengerjakan {{ currentLikert?.name }}</p>
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
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-muted border-b border-border">
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Nama</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Sekolah</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Kelas</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Kode</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Skor</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Tanggal</th>
              <th class="px-4 md:px-5 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="s in submissions"
              :key="s.id"
              @click="router.push({ name: 'admin-likert-submission-detail', params: { slug: likertSlug, submissionSlug: s.slug } })"
              class="hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <td class="px-4 md:px-5 py-3 text-sm text-text-primary font-medium">{{ s.name }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ s.school }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ s.class }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-text-muted font-mono">{{ s.code }}</td>
              <td class="px-4 md:px-5 py-3">
                <span
                  class="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                  :class="s.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
                >
                  {{ s.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan' }}
                </span>
              </td>
              <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ s.totalScore ?? '-' }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-text-muted whitespace-nowrap">{{ formatDate(s.createdAt) }}</td>
              <td class="px-4 md:px-5 py-3 text-right">
                <font-awesome-icon
                  icon="fa-solid fa-chevron-right"
                  class="w-5 h-5 text-text-muted group-hover:text-text-secondary transition-colors shrink-0"
                />
              </td>
            </tr>

            <tr v-if="submissions.length === 0">
              <td colspan="8" class="px-4 md:px-5 py-6 text-center text-sm text-text-muted">
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
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-instrument-soft transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="confirmExportExcel"
            :disabled="exporting"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-instrument hover:bg-instrument-hover disabled:opacity-50 transition-colors h-10 cursor-pointer"
          >
            {{ exporting ? 'Mengunduh...' : 'Ya, export' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertSubmissionsStore } from '@/stores/likert/likert-submissions'
import { exportSubmissionsToExcel } from '@/utils/likert-excel-export'

const route = useRoute()
const router = useRouter()
const likertSlug = route.params.slug
const likertId = ref(null)

const likertStore = useLikertStore()
const submissionsStore = useLikertSubmissionsStore()

const { currentLikert } = storeToRefs(likertStore)
const { submissions, loading } = storeToRefs(submissionsStore)

const showExportModal = ref(false)
const exporting = ref(false)
const scales = ref([])


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
    exportSubmissionsToExcel(submissions.value, currentLikert.value?.name, scales.value)
    showExportModal.value = false
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {

  const likert = await likertStore.getLikertBySlug(likertSlug)
  if (!likert) {
    router.push({ name: 'admin-likert' })
    return
  }
  likertId.value = likert.id

  await Promise.all([
    likertStore.getLikertById(likertId.value),
    submissionsStore.fetchSubmissions(likertId.value),
  ])
  scales.value = await likertStore.fetchLikertScales(likertId.value)
})
</script>