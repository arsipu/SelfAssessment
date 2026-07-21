<template>
  <div>
    <!-- Breadcrumb -->
    <div class="pdf-breadcrumb flex items-center gap-2 mb-4 flex-wrap">
      <button @click="router.push({ name: 'admin-likert' })" class="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap cursor-pointer">
        Survei
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <button
        @click="router.push({ name: 'admin-likert-submissions', params: { slug: likertSlug } })"
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
          class="pdf-alert-warning bg-warning-soft border border-warning/30 rounded-xl p-4 md:p-5 mb-4 md:mb-6"
        >
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-warning">Responden belum menyelesaikan tes</p>
              <p class="text-xs text-warning/80 mt-1">
                Data skor dan rincian jawaban belum tersedia karena responden masih dalam tahap mengerjakan kuesioner.
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
                <p class="text-[11px] text-text-muted uppercase tracking-wide mb-1">Laporan hasil survei</p>
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
                <p class="text-text-muted text-xs mb-0.5">Sekolah</p>
                <p class="text-text-primary font-medium">{{ submission.school }}</p>
              </div>
              <div>
                <p class="text-text-muted text-xs mb-0.5">Kelas / Jurusan</p>
                <p class="text-text-primary font-medium">{{ submission.class }} - {{ submission.major }}</p>
              </div>
              <div>
                <p class="text-text-muted text-xs mb-0.5">Usia / Gender</p>
                <p class="text-text-primary font-medium">{{ submission.age }} tahun, {{ submission.gender === 'L' ? 'Laki-laki' : 'Perempuan' }}</p>
              </div>
              <div>
                <p class="text-text-muted text-xs mb-0.5">Kode Tracking</p>
                <p class="text-text-primary font-medium font-mono">{{ submission.code }}</p>
              </div>
            </div>
          </div>

          <!-- "Ringkasan: total skor + label nilai" -->
          <div
            v-if="isCompleted && submission.totalScore != null"
            class="p-4 md:p-6 border-b border-border"
          >
            <LikertScoreSummary
              :total-score="submission.totalScore"
              :scale-label="scalesLabel !== '-' ? scalesLabel : ''"
              :scale-description="scalesDescription"
              variant="inline"
            />
          </div>

          <!-- "Jawaban per kategori" -->
          <div class="px-4 md:px-6">
            <LikertAnswerSections :sections="sections" variant="table" />
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
          Rekap jawaban {{ submission?.name }} akan diunduh dalam format .pdf.
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
            :disabled="false"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors h-10 cursor-pointer"
          >
            Ya, unduh
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import LikertScoreSummary from '@/components/likert/LikertScoreSummary.vue'
import LikertAnswerSections from '@/components/likert/LikertAnswerSections.vue'
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertCategoryStore } from '@/stores/likert/likert-category'
import { useLikertSubmissionsStore } from '@/stores/likert/likert-submissions'
import { useLikertQuestionsStore } from '@/stores/likert/likert-questions'
import { LIKERT_SCALE_OPTIONS } from '@/apps/likert'

const route = useRoute()
const router = useRouter()
const likertSlug = route.params.slug
const likertId = ref(null)
const submissionSlug = route.params.submissionSlug

const likertStore = useLikertStore()
const categoryStore = useLikertCategoryStore()
const submissionsStore = useLikertSubmissionsStore()
const questionsStore = useLikertQuestionsStore()

const { currentSubmission: submission, loading } = storeToRefs(submissionsStore)
const { questions } = storeToRefs(questionsStore)
const { categories } = storeToRefs(categoryStore)
const { currentLikert } = storeToRefs(likertStore)

const scales = ref([])

const showExportPDFModal = ref(false)
const pdfContent = ref(null)

const isCompleted = computed(() => submission.value?.status === 'completed')

const scalesLabel = computed(() => {
  const score = submission.value?.totalScore ?? 0
  const found = scales.value.find((s) => score >= s.min && score <= s.max)
  return found?.label || '-'
})

const scalesDescription = computed(() => {
  const score = submission.value?.totalScore ?? 0
  const found = scales.value.find((s) => score >= s.min && score <= s.max)
  return found?.description || ''
})

function handlePrint() {
  window.print()
  showExportPDFModal.value = false
}

const answerLabel = (value) => {
  const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === value)
  return opt?.label ?? value
}

const questionText = (questionId) => {
  const q = questions.value.find((q) => q.id === questionId)
  return q?.question ?? '(soal tidak ditemukan)'
}

const sections = computed(() => {
  if (!submission.value) return []
  const grouped = {}
  for (const item of submission.value.submission) {
    if (!grouped[item.categoryId]) grouped[item.categoryId] = []
    grouped[item.categoryId].push({
      questionId: item.questionId,
      questionText: questionText(item.questionId),
      answerLabel: answerLabel(item.answer),
      point: item.point,
    })
  }
  return Object.keys(grouped).map((categoryId) => {
    const cat = categories.value.find((c) => c.id === categoryId)
    return { key: categoryId, label: cat?.name || 'Tanpa kategori', items: grouped[categoryId] }
  })
})

onMounted(async () => {
  const likert = await likertStore.getLikertBySlug(likertSlug)
  if (!likert) {
    router.push({ name: 'admin-likert' })
    return
  }

  likertId.value = likert.id

  await Promise.all([
    submissionsStore.fetchSubmissionBySlug(likertId.value, submissionSlug),
    questionsStore.fetchQuestions(likertId.value),
    categoryStore.fetchCategories(),
    likertStore.currentLikert ? Promise.resolve() : likertStore.getLikertById(likertId.value),
  ])

  scales.value = await likertStore.fetchLikertScales(likertId.value)
})
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