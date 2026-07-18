<template>
  <div class="min-h-screen bg-bg">
    <div class="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div v-if="!result || loading" class="text-center text-sm text-text-muted py-20">
        Memuat hasil...
      </div>

      <div v-else class="space-y-6">

        <!-- CARD RAPOR -->
        <div class="print-area bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">

          <!-- Kop -->
          <div class="p-5 md:p-6 border-b border-border">
            <p class="text-[11px] text-text-muted uppercase tracking-wide mb-1">Laporan hasil tes</p>
            <h1 class="text-lg font-semibold text-text-primary mb-4">Minat karier RIASEC</h1>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
              <div>
                <p class="text-text-muted text-xs mb-0.5">Nama</p>
                <p class="text-text-primary font-medium">{{ result?.respondent?.name }}</p>
              </div>
              <div>
                <p class="text-text-muted text-xs mb-0.5">Usia / Gender</p>
                <p class="text-text-primary font-medium">{{ formattedBirthDateAge }}, {{ result?.respondent?.gender }}</p>
              </div>
              <div>
                <p class="text-text-muted text-xs mb-0.5">Sekolah / Universitas</p>
                <p class="text-text-primary font-medium">{{ result?.respondent?.school }}</p>
              </div>
              <div>
                <p class="text-text-muted text-xs mb-0.5">Jurusan</p>
                <p class="text-text-primary font-medium">{{ result?.respondent?.major }}</p>
              </div>
              <div v-if="result?.respondent?.occupation">
                <p class="text-text-muted text-xs mb-0.5">Pekerjaan</p>
                <p class="text-text-primary font-medium">{{ result.respondent.occupation }}</p>
              </div>
              <div v-if="result?.respondent?.testPurpose">
                <p class="text-text-muted text-xs mb-0.5">Tujuan Tes</p>
                <p class="text-text-primary font-medium">{{ result.respondent.testPurpose }}</p>
              </div>
            </div>
          </div>

          <!-- Ringkasan: hex chart + kode dominan -->
          <div class="p-5 md:p-6 border-b border-border">
            <RiasecSummaryHeader
              :top-code="result.topCode"
              :top-code-info="topCodeInfo"
              :score-percent-map="scorePercentMap"
            />
          </div>

          <!-- Tabel skor -->
          <div class="p-5 md:p-6 border-b border-border">
            <RiasecScoreBreakdown
              :score-breakdown="scoreBreakdown"
              :get-label="riasecLabel"
              variant="table"
            />
          </div>

          <!-- Catatan -->
          <div class="p-5 md:p-6 border-b border-border">
            <p class="text-xs font-medium text-text-secondary mb-3">Catatan</p>
            <RiasecNotes :top-code-info="topCodeInfo" />
          </div>

          <!-- Rincian jawaban (collapsible, nempel di card) -->
          <div class="p-4 md:p-5">
            <button @click="showDetails = !showDetails" class="w-full flex items-center justify-between gap-2">
              <p class="text-xs font-medium text-text-muted">Rincian jawaban</p>
              <svg
                class="w-4 h-4 text-text-muted transition-transform duration-200"
                :class="{ 'rotate-180': showDetails }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition name="expand">
              <div v-if="showDetails" class="mt-4">
                <RiasecAnswerDetails
                  :detail-sections="detailSections"
                  :answered-ids="answeredIds"
                  bare
                />
              </div>
            </Transition>
          </div>

        </div>

        <!-- Tombol aksi -->
        <div class="print:hidden flex flex-col md:flex-row gap-3">
          <button
            @click="showExportPDFModal = true"
            class="w-full md:flex-1 py-3 h-10 border border-border text-text-primary text-sm font-semibold rounded-xl hover:bg-surface-muted transition"
          >
            Unduh PDF
          </button>
          <router-link
            to="/"
            class="w-full md:flex-1 text-center py-3 h-10 bg-instrument text-text-on-primary text-sm font-semibold rounded-xl hover:bg-instrument-hover transition"
          >
            Selesai
          </router-link>
        </div>

      </div>
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
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-instrument-soft transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="handlePrint()"
            :disabled="exportingPDF"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-instrument hover:bg-instrument-hover disabled:opacity-50 transition-colors h-10 cursor-pointer"
          >
            {{ exportingPDF ? 'Mengunduh...' : 'Ya, unduh' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSessionStore } from '@/stores/holland/holland-session'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { formatBirthDateAge, buildScoreBreakdown, buildDetailSections } from '@/utils/holland-result'
import RiasecSummaryHeader from '@/components/holland/RiasecSummaryHeader.vue'
import RiasecScoreBreakdown from '@/components/holland/RiasecScoreBreakdown.vue'
import RiasecNotes from '@/components/holland/RiasecNotes.vue'
import RiasecAnswerDetails from '@/components/holland/RiasecAnswerDetails.vue'

const route = useRoute()
const router = useRouter()
const hollandSlug = route.params.slug

const hollandStore = useHollandStore()
const sessionStore = useHollandSessionStore()
const questionsStore = useHollandQuestionsStore()
const riasecStore = useHollandRiasecStore()

const showExportPDFModal = ref(false)
const exportingPDF = ref(false)

const hollandId = computed(() => hollandStore?.currentHolland?.id || null)
const loading = ref(true)
const showDetails = ref(false)

const result = computed(() => sessionStore.getResult(hollandId.value))

const scorePercentMap = computed(() => {
  const map = {}
  for (const row of scoreBreakdown.value) map[row.code] = row.percentage
  return map
})

const topCodeInfo = computed(() => {
  const code = result.value?.topCode
  if (!code) return null
  return riasecStore.riasecList.find((r) => r.id === code) || null
})

function riasecLabel(code) {
  return riasecStore.riasecList.find((r) => r.id === code)?.label || code
}

const formattedBirthDateAge = computed(() => formatBirthDateAge(result.value?.respondent))

const scoreBreakdown = computed(() => {
  const scores = result.value?.scores || {}
  return buildScoreBreakdown(scores, result.value?.topCode)
})

const answeredIds = computed(() => {
  return new Set((result.value?.answers || []).map((a) => a.questionId))
})

const detailSections = computed(() => {
  return buildDetailSections(riasecStore.riasecList, questionsStore.allQuestions)
})

onMounted(async () => {
  if (!result.value) {
    router.replace({ name: 'holland-form', params: { slug: hollandSlug } })
    return
  }
  loading.value = true
  try {
    await Promise.all([
      riasecStore.fetchRiasecList(hollandId.value),
      questionsStore.fetchAllQuestions(hollandId.value),
    ])
  } finally {
    loading.value = false
  }
})

function handleExportPDF() {
  // TODO: Implement PDF export functionality
}

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