<template>
  <div>
    <!-- Breadcrumb -->
    <div class="pdf-breadcrumb flex items-center gap-2 mb-4 flex-wrap">
      <button @click="router.push({ name: 'admin-holland' })" class="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap cursor-pointer">
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
      <button
        @click="router.push({ name: 'admin-holland-submissions', params: { slug: hollandSlug } })"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors truncate max-w-[120px] md:max-w-none cursor-pointer"
      >
        Submissions
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <span class="text-sm text-text-primary font-medium truncate max-w-[150px] md:max-w-none">{{ submission?.name ?? '...' }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-text-muted">Memuat data...</p>
    </div>

    <template v-else-if="submission">
      <div ref="pdfContent" class="pdf-export-wrapper print-area">

        <!-- Alert untuk submission yang belum selesai -->
        <div
          v-if="!isCompleted"
          class="pdf-alert-warning bg-warning-soft border border-warning-30 rounded-xl p-4 md:p-5 mb-4 md:mb-6"
        >
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-warning">Responden belum menyelesaikan tes</p>
              <p class="text-xs text-warning-80 mt-1">
                Data skor, kode RIASEC, dan rincian jawaban belum tersedia karena responden masih dalam tahap mengerjakan kuesioner.
              </p>
            </div>
          </div>
        </div>

        <!-- CARD RAPOR -->
        <div class="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">

          <!-- Kop -->
          <div class="p-4 md:p-6 border-b border-border">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <p class="text-[11px] text-text-muted uppercase tracking-wide mb-1">Laporan hasil tes</p>
                <h1 class="text-lg md:text-xl font-semibold text-text-primary">{{ submission.name }}</h1>
              </div>
              <div class="pdf-actions flex items-center gap-2 w-full sm:w-auto">
                <button
                  v-if="isCompleted"
                  @click="showExportPDFModal = true"
                  class="print:hidden text-xs px-3 py-2.5 md:py-1.5 rounded-md border border-border text-text-secondary hover:bg-surface-muted transition-colors h-10 flex-1 sm:flex-none cursor-pointer"
                >
                  Unduh PDF
                </button>
                <span
                  class="print:hidden text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
                  :class="submission.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
                >
                  {{ submission.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan' }}
                </span>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
              <div>
                <p class="text-text-muted text-xs mb-0.5">Sekolah / Universitas</p>
                <p class="text-text-primary font-medium">{{ submission.school }}</p>
              </div>
              <div>
                <p class="text-text-muted text-xs mb-0.5">Jurusan</p>
                <p class="text-text-primary font-medium">{{ submission.major }}</p>
              </div>
              <div>
                <p class="text-text-muted text-xs mb-0.5">Usia / Gender</p>
                <p class="text-text-primary font-medium">{{ submission.age }} Tahun, {{ submission.gender }}</p>
              </div>
              <div>
                <p class="text-text-muted text-xs mb-0.5">Kode Tracking</p>
                <p class="text-text-primary font-medium font-mono">{{ submission.code }}</p>
              </div>
              <div v-if="submission.occupation">
                <p class="text-text-muted text-xs mb-0.5">Pekerjaan</p>
                <p class="text-text-primary font-medium">{{ submission.occupation }}</p>
              </div>
              <div v-if="submission.testPurpose">
                <p class="text-text-muted text-xs mb-0.5">Tujuan Tes</p>
                <p class="text-text-primary font-medium">{{ submission.testPurpose }}</p>
              </div>
            </div>
          </div>

          <!-- Ringkasan: hex chart + kode dominan (hanya jika completed) -->
          <div v-if="isCompleted && topCode" class="p-4 md:p-6 border-b border-border">
            <RiasecSummaryHeader
              :top-code="topCode"
              :top-code-info="topCodeInfo"
              :score-percent-map="scorePercentMap"
            />
          </div>

          <!-- Tabel skor -->
          <div v-if="scoreBreakdown.length" class="p-4 md:p-6 border-b border-border">
            <RiasecScoreBreakdown
              :score-breakdown="scoreBreakdown"
              :get-label="riasecLabel"
              variant="table"
            />
          </div>

          <!-- Catatan -->
          <div v-if="topCode && topCodeInfo" class="p-4 md:p-6 border-b border-border avoid-break">
            <p class="text-xs font-medium text-text-secondary mb-3">Catatan</p>
            <RiasecNotes :top-code-info="topCodeInfo" />
          </div>

          <!-- Rincian jawaban per kategori (always expanded di admin) -->
          <div v-if="isCompleted && detailSections.length" class="p-4 md:p-6">
            <p class="text-xs font-medium text-text-muted mb-4">Rincian jawaban per kategori</p>
            <RiasecAnswerDetails
              :detail-sections="detailSections"
              :answered-ids="answeredIds"
              bare
              avoid-break
              unanswered-class="border-border bg-surface-muted-40"
            />
          </div>

        </div>
      </div>
    </template>

    <div v-else class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-text-muted">Data submission tidak ditemukan.</p>
    </div>
  </div>

  <!-- Modal konfirmasi export PDF -->
  <Transition name="fade">
    <div
      v-if="showExportPDFModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
      @click.self="showExportPDFModal = false"
    >
      <div class="bg-surface rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-lg flex flex-col max-h-[90vh]">
        <h2 class="text-base font-semibold text-text-primary mb-2">Unduh hasil PDF?</h2>
        <p class="text-sm text-text-secondary leading-relaxed mb-6">
          Rekap hasil {{ submission?.name }} akan diunduh dalam format .pdf.
        </p>
        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <button
            @click="showExportPDFModal = false"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-primary-soft transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="handlePrint()"
            :disabled="exportingPDF"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors h-10 cursor-pointer"
          >
            {{ exportingPDF ? 'Mengunduh...' : 'Ya, unduh' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { useHollandColumnsStore } from '@/stores/holland/holland-columns'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { RIASEC_GUIDE as RIASEC_GUIDE_FALLBACK } from '@/apps/holland'
import { formatBirthDateAge, buildScoreBreakdown, buildAnswerSections, buildDetailSections } from '@/utils/holland-result'
import { computeScoreBreakdownFromAnswers, computeTopCode } from '@/utils/holland-scoring'
import RiasecSummaryHeader from '@/components/holland/RiasecSummaryHeader.vue'
import RiasecScoreBreakdown from '@/components/holland/RiasecScoreBreakdown.vue'
import RiasecNotes from '@/components/holland/RiasecNotes.vue'
import RiasecAnswerDetails from '@/components/holland/RiasecAnswerDetails.vue'

const pdfContent = ref(null)
const route = useRoute()
const router = useRouter()
const hollandSlug = route.params.slug
const hollandId = ref(null)
const submissionSlug = route.params.submissionSlug

const hollandStore = useHollandStore()
const submissionsStore = useHollandSubmissionsStore()
const questionsStore = useHollandQuestionsStore()
const columnsStore = useHollandColumnsStore()
const { columnsByRiasec } = storeToRefs(columnsStore)
const riasecStore = useHollandRiasecStore()

const { currentSubmission: submission, loading } = storeToRefs(submissionsStore)
const { allQuestions } = storeToRefs(questionsStore)

const showExportPDFModal = ref(false)
const exportingPDF = ref(false)

const isCompleted = computed(() => submission.value?.status === 'completed')

const riasecMap = computed(() => {
  const map = {}
  for (const item of riasecStore.riasecList) map[item.id] = item
  return map
})

// `scores` dan `topCode` TIDAK ADA lagi di dokumen submission (Firestore).
// Dihitung di sini dari submission.answers, cuma kalau statusnya completed
// (submission yang masih in-progress answers-nya belum final/relevan buat
// ditampilkan sebagai skor akhir).
const riasecIds = computed(() => riasecStore.riasecList.map((c) => c.id))

const scoreBreakdownRaw = computed(() => {
  if (!isCompleted.value || !submission.value?.answers) return null
  return computeScoreBreakdownFromAnswers(submission.value.answers, riasecIds.value)
})

const topCode = computed(() => {
  if (!scoreBreakdownRaw.value) return null
  return computeTopCode(scoreBreakdownRaw.value)
})

const topCodeInfo = computed(() => {
  if (!topCode.value) return null
  return riasecMap.value[topCode.value] || null
})

const formattedBirthDateAge = computed(() => formatBirthDateAge(submission.value))

const scoreBreakdown = computed(() => buildScoreBreakdown(scoreBreakdownRaw.value, topCode.value))

// answeredIds difilter isChecked === true, karena submission.answers
// sekarang berisi SEMUA soal (bukan cuma yang dipilih)
const answeredIds = computed(
  () => new Set((submission.value?.answers || []).filter((a) => a.isChecked).map((a) => a.questionId))
)

const detailSections = computed(() =>
  buildDetailSections(riasecStore.riasecList, allQuestions.value, columnsByRiasec.value)
)

const sections = computed(() =>
  buildAnswerSections({
    answers: submission.value?.answers,
    questions: allQuestions.value,
    riasecInfo: (code) => riasecMap.value[code] || RIASEC_GUIDE_FALLBACK[code],
    columnsByRiasec: columnsByRiasec.value,
  })
)

const scorePercentMap = computed(() => {
  const map = {}
  for (const row of scoreBreakdown.value) map[row.code] = row.percentage
  return map
})

const riasecLabel = (code) => riasecMap.value[code]?.label || RIASEC_GUIDE_FALLBACK[code]?.label || code

onMounted(async () => {
  const holland = await hollandStore.getHollandBySlug(hollandSlug)
  if (!holland) {
    router.push({ name: 'admin-holland' })
    return
  }
  hollandId.value = holland.id

  // riasec dulu (buat riasecIds), baru columns, baru questions & submission
  // (submission & riasec sebenarnya independen, tapi columns/questions
  // saling bergantung urutan)
  await Promise.all([
    submissionsStore.fetchSubmissionBySlug(hollandId.value, submissionSlug),
    riasecStore.fetchRiasecList(hollandId.value),
  ])

  await columnsStore.fetchAllColumns(hollandId.value, riasecIds.value)
  await questionsStore.fetchAllQuestions(hollandId.value, columnsByRiasec.value)
})

function handlePrint() {
  window.print()
  showExportPDFModal.value = false
}
</script>

<style scoped>
.avoid-break {
  break-inside: avoid;
  page-break-inside: avoid;
}

@media print {
  @page {
    size: auto;
    margin: 0mm;
  }

  body {
    margin: 1cm;
  }

  body * {
    visibility: hidden;
  }
  .print-area, .print-area * {
    visibility: visible;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>