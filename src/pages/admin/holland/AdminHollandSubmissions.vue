<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <button
        @click="router.push({ name: 'admin-holland' })"
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer"
      >
        Holland RIASEC
      </button>
      <span class="text-gray-300 shrink-0">/</span>
      <span class="text-sm text-gray-800 font-medium truncate">Submissions</span>
    </div>

    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-lg md:text-xl font-semibold text-gray-900 mb-1">Submissions</h1>
        <p class="text-sm text-gray-500 mb-3">Daftar responden yang mengerjakan Holland RIASEC</p>
        <span class="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 whitespace-nowrap">
          {{ submissions.length }} Responden
        </span>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button
          @click="showExportModal = true"
          :disabled="submissions.length === 0"
          class="text-xs font-medium px-3 py-2.5 md:py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors h-10 flex-1 sm:flex-none cursor-pointer"
        >
          Export Excel
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-gray-400">Memuat data...</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Nama</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Sekolah</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Jurusan</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Kode</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Kode RIASEC</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal</th>
              <th class="px-4 md:px-5 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="s in submissions"
              :key="s.id"
              @click="router.push({ name: 'admin-holland-submission-detail', params: { submissionId: s.id } })"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td class="px-4 md:px-5 py-3 text-sm text-gray-800 font-medium">{{ s.name }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-gray-600">{{ s.school }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-gray-600">{{ s.major }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-gray-500 font-mono">{{ s.code }}</td>
              <td class="px-4 md:px-5 py-3">
                <span
                  class="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                  :class="s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                >
                  {{ s.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan' }}
                </span>
              </td>
              <td class="px-4 md:px-5 py-3 text-sm text-gray-800 font-semibold tracking-wide">{{ s.topCode ?? '-' }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{{ formatDate(s.createdAt) }}</td>
              <td class="px-4 md:px-5 py-3 text-right">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </td>
            </tr>

            <tr v-if="submissions.length === 0">
              <td colspan="8" class="px-4 md:px-5 py-6 text-center text-sm text-gray-400">
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
      <div class="bg-white rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-lg flex flex-col max-h-[90vh]">
        <h2 class="text-base font-semibold text-gray-900 mb-2">Export ke Excel?</h2>
        <p class="text-sm text-gray-500 leading-relaxed mb-6">
          File berisi rekap {{ submissions.length }} responden akan diunduh dalam format .xlsx.
        </p>

        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <button
            @click="showExportModal = false"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="confirmExportExcel"
            :disabled="exporting"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-50 transition-colors h-10 cursor-pointer"
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
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'
// TODO: sesuaikan/duplikasi util ini buat format kolom Holland (bukan totalScore, tapi topCode + breakdown per kategori)
import { exportSubmissionsToExcel } from '@/utils/excel-export'

const router = useRouter()

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
    // exportSubmissionsToExcel(submissions.value, 'Holland RIASEC')
    showExportModal.value = false
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await submissionsStore.fetchSubmissions()
})
</script>