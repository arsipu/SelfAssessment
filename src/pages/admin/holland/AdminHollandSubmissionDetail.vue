<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <button @click="router.push({ name: 'admin-holland' })" class="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer">
        Holland RIASEC
      </button>
      <span class="text-gray-300 shrink-0">/</span>
      <button
        @click="router.push({ name: 'admin-holland-questions', params: { id: hollandId } })"
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer"
      >
        Pertanyaan
      </button>
      <span class="text-gray-300 shrink-0">/</span>
      <button
        @click="router.push({ name: 'admin-holland-submissions', params: { id: hollandId } })"
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors truncate max-w-[120px] md:max-w-none cursor-pointer"
      >
        Submissions
      </button>
      <span class="text-gray-300 shrink-0">/</span>
      <span class="text-sm text-gray-800 font-medium truncate max-w-[150px] md:max-w-none">{{ submission?.name ?? '...' }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-gray-400">Memuat data...</p>
    </div>

    <template v-else-if="submission">
      <!-- Info Responden -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h1 class="text-lg md:text-xl font-semibold text-gray-900">{{ submission.name }}</h1>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              @click="showExportPDFModal = true"
              class="text-xs px-3 py-2.5 md:py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors h-10 flex-1 sm:flex-none cursor-pointer"
            >
              Unduh PDF
            </button>
            <span
              class="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
              :class="submission.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
            >
              {{ submission.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan' }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
          <div>
            <p class="text-gray-400 text-xs mb-1">Sekolah / Universitas</p>
            <p class="text-gray-800">{{ submission.school }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Jurusan</p>
            <p class="text-gray-800">{{ submission.major }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Tanggal Lahir/Usia / Gender</p>
            <p class="text-gray-800">{{ formattedBirthDateAge }}, {{ submission.gender }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Kode Tracking</p>
            <p class="text-gray-800 font-mono">{{ submission.code }}</p>
          </div>
          <div v-if="submission.occupation">
            <p class="text-gray-400 text-xs mb-1">Pekerjaan</p>
            <p class="text-gray-800">{{ submission.occupation }}</p>
          </div>
          <div v-if="submission.testPurpose">
            <p class="text-gray-400 text-xs mb-1">Tujuan Tes</p>
            <p class="text-gray-800">{{ submission.testPurpose }}</p>
          </div>
          <div v-if="submission.topCode">
            <p class="text-gray-400 text-xs mb-1">Kode RIASEC</p>
            <p class="text-gray-800 font-semibold tracking-wide">{{ submission.topCode }}</p>
          </div>
        </div>
      </div>

      <!-- Breakdown skor per kategori -->
      <div v-if="scoreBreakdown.length" class="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
        <p class="text-xs font-medium text-gray-400 mb-4">Rincian skor per kategori</p>

        <div class="space-y-4">
          <div v-for="row in scoreBreakdown" :key="row.code">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm font-medium text-gray-700">
                {{ riasecMap[row.code]?.label || RIASEC_GUIDE_FALLBACK[row.code]?.label }} ({{ row.code }})
              </span>
              <span class="text-xs text-gray-400">
                {{ row.count }}/{{ row.total }} · {{ row.percentage }}%
              </span>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="row.isTop ? 'bg-gray-900' : 'bg-gray-300'"
                :style="{ width: row.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <p class="text-[11px] text-gray-400 mt-4 leading-relaxed">
          Persentase dihitung dari jumlah pernyataan yang dipilih dibagi total pernyataan pada
          kategori tersebut, karena jumlah pernyataan tiap kategori tidak sama.
        </p>
      </div>

      <!-- Jawaban per kategori -->
      <div
        v-for="section in sections"
        :key="section.key"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4 md:mb-6 last:mb-0"
      >
        <div class="px-4 md:px-5 py-3 md:py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
          <h2 class="text-sm font-medium text-gray-800">{{ riasecMap[section.key]?.label || RIASEC_GUIDE_FALLBACK[section.key]?.label }} ({{ section.key }})</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse table-fixed">
            <thead>
              <tr class="bg-white border-b border-gray-100">
                <th class="w-[8%] px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">No</th>
                <th class="w-[60%] px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Pernyataan</th>
                <th class="w-[32%] px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Kolom</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, index) in section.items" :key="item.questionId">
                <td class="px-4 md:px-5 py-3 text-sm text-gray-600">{{ index + 1 }}</td>
                <td class="px-4 md:px-5 py-3 text-sm text-gray-800">{{ item.questionText }}</td>
                <td class="px-4 md:px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{{ columnLabel(item.column) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="bg-white border border-gray-200 rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-gray-400">Data submission tidak ditemukan.</p>
    </div>
  </div>

  <!-- Modal konfirmasi export PDF -->
  <Transition name="fade">
    <div
      v-if="showExportPDFModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
      @click.self="showExportPDFModal = false"
    >
      <div class="bg-white rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-lg flex flex-col max-h-[90vh]">
        <h2 class="text-base font-semibold text-gray-900 mb-2">Unduh hasil PDF?</h2>
        <p class="text-sm text-gray-500 leading-relaxed mb-6">
          Rekap hasil {{ submission?.name }} akan diunduh dalam format .pdf.
        </p>

        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <button
            @click="showExportPDFModal = false"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="confirmExportPDF"
            :disabled="exportingPDF"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-50 transition-colors h-10 cursor-pointer"
          >
            {{ exportingPDF ? 'Mengunduh...' : 'Ya, unduh' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <div style="position: fixed; left: -9999px; top: 0;">
    <ScoreCardTemplate
      ref="scoreCardRef"
      holland-name="Holland RIASEC"
      :code="submission?.code"
      :respondent="{
        name: submission?.name,
        school: submission?.school,
        major: submission?.major,
        birthDateAge: formattedBirthDateAge,
        gender: submission?.gender,
        occupation: submission?.occupation,
        testPurpose: submission?.testPurpose,
        testDate: submission?.testDate,
      }"
      :top-code="submission?.topCode"
      :scales-label="topCodeChars.map((c) => (riasecMap[c]?.label || RIASEC_GUIDE_FALLBACK[c]?.label)).join(' · ')"
      :scales-description="topCodeChars.map((c) => (riasecMap[c]?.description || RIASEC_GUIDE_FALLBACK[c]?.description)).join(' ')"
    />
  </div>
</template>

<script setup>
import ScoreCardTemplate from '@/components/HollandScoreCardTemplate.vue'
import { exportHollandResultToPDF } from '@/utils/holland-pdf-export'
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { RIASEC_CATEGORY_ORDER, RIASEC_GUIDE as RIASEC_GUIDE_FALLBACK, HOLLAND_COLUMNS } from '@/apps/holland'

const route = useRoute()
const router = useRouter()
const hollandId = route.params.id
const submissionId = route.params.submissionId

const submissionsStore = useHollandSubmissionsStore()
const questionsStore = useHollandQuestionsStore()
const riasecStore = useHollandRiasecStore()

const { currentSubmission: submission, loading } = storeToRefs(submissionsStore)
const { allQuestions } = storeToRefs(questionsStore)

const showExportPDFModal = ref(false)
const exportingPDF = ref(false)
const scoreCardRef = ref(null)

// urutan huruf topCode ("SAE" -> ["S", "A", "E"])
const topCodeChars = computed(() => (submission.value?.topCode || '').split(''))

// riasecMap[code] -> { label, description, skills, careers } dari Firestore
const riasecMap = computed(() => {
  const map = {}
  for (const item of riasecStore.riasecList) {
    map[item.id] = item
  }
  return map
})

// Gabungan tampilan "Tanggal Lahir/Usia" dari birthDate + age tersimpan,
// biar tetap sesuai gaya dokumen kertas aslinya meski datanya sudah terstruktur.
// Fallback ke birthDateAge lama untuk submission yang dibuat sebelum migrasi field ini.
const formattedBirthDateAge = computed(() => {
  const s = submission.value
  if (!s) return '-'

  if (s.birthDate) {
    const d = new Date(s.birthDate)
    if (!isNaN(d)) {
      const formatted = d.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
      return s.age !== undefined && s.age !== null ? `${formatted} / ${s.age} tahun` : formatted
    }
  }

  // data lama sebelum ada birthDate + age
  return s.birthDateAge || '-'
})

// breakdown 6 kategori, diurutkan dari persentase tertinggi
const scoreBreakdown = computed(() => {
  const scores = submission.value?.scores || null
  if (!scores) return []
  return RIASEC_CATEGORY_ORDER
    .map((code) => ({
      code,
      count: scores[code]?.count ?? 0,
      total: scores[code]?.total ?? 0,
      percentage: scores[code]?.percentage ?? 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .map((row) => ({ ...row, isTop: topCodeChars.value.includes(row.code) }))
})

const columnLabel = (columnKey) => HOLLAND_COLUMNS.find((c) => c.key === columnKey)?.label || columnKey

const questionText = (questionId) => {
  const q = allQuestions.value.find((q) => q.id === questionId)
  return q?.question ?? '(soal tidak ditemukan)'
}

// kelompokkan answers submission per kategori
const sections = computed(() => {
  if (!submission.value) return []
  const answers = submission.value.answers || []
  const grouped = {}

  for (const a of answers) {
    // Use riasecId (new) or category (old) for grouping
    const category = a.riasecId || a.category
    if (!grouped[category]) grouped[category] = []
    grouped[category].push({
      questionId: a.questionId,
      questionText: questionText(a.questionId),
      column: a.column,
    })
  }

  return RIASEC_CATEGORY_ORDER
    .filter((code) => grouped[code]?.length)
    .map((code) => ({ 
      key: code, 
      label: `${riasecMap.value[code]?.label || RIASEC_GUIDE_FALLBACK[code]?.label} (${code})`,
      items: grouped[code] 
    }))
})

async function confirmExportPDF() {
  if (exportingPDF.value) return
  exportingPDF.value = true
  try {
    await exportHollandResultToPDF({
      scoreCardElement: scoreCardRef.value.cardRef,
      sections: sections.value,
      filename: `hasil-holland-${submission.value?.name}.pdf`.replace(/\s+/g, '_'),
    })
    showExportPDFModal.value = false
  } finally {
    exportingPDF.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    submissionsStore.fetchSubmissionById(hollandId, submissionId),
    riasecStore.fetchRiasecList(hollandId),
    questionsStore.fetchAllQuestions(hollandId),
  ])
})
</script>