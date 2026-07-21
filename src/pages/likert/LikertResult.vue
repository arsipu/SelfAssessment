<template>
  <div class="min-h-screen bg-bg">

    <div class="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div v-if="!result || loading" class="text-center text-sm text-text-muted py-20">
        Memuat hasil...
      </div>

      <div v-else class="space-y-6">

        <!-- CARD RAPOR -->
        <div class="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">

          <!-- Kop -->
          <div class="p-5 md:p-6 border-b border-border text-center">
            <p class="text-[11px] text-text-muted uppercase tracking-wide mb-1">
              Hasil {{ likertStore.currentLikert?.name || 'Kuesioner' }}
            </p>
            <h1 class="text-base md:text-lg font-semibold text-text-primary">{{ respondentName }}</h1>
            <p class="text-xs text-text-muted mt-1 font-mono">
              Kode: <span class="font-semibold text-text-secondary">{{ result.code }}</span>
            </p>
          </div>

          <!-- Ringkasan: total skor + badge + deskripsi -->
          <div class="p-5 md:p-8 border-b border-border">
            <LikertScoreSummary
              :total-score="result.totalScore"
              :scale-label="category?.label"
              :scale-description="category?.description"
              :badge-bg="category?.bg"
              :badge-text="category?.text"
              variant="center"
            />
          </div>

          <!-- Rincian jawaban (collapsible, nempel di card) -->
          <div class="p-4 md:p-6">
            <button
              @click="showDetails = !showDetails"
              class="w-full flex items-center justify-between gap-2"
            >
              <p class="text-xs font-medium text-text-muted">Rincian jawaban</p>
              <font-awesome-icon
                icon="fa-solid fa-chevron-down"
                class="w-4 h-4 text-text-muted transition-transform duration-200"
                :class="{ 'fa-rotate-180': showDetails }"
              />
            </button>

            <Transition name="expand">
              <div v-if="showDetails" class="mt-4">
                <LikertAnswerSections :sections="sections" variant="list" />
              </div>
            </Transition>
          </div>

        </div>

        <!-- Tombol aksi -->
        <div class="flex flex-col md:flex-row gap-3">
          <button
            @click="showExportPDFModal = true"
            class="w-full md:flex-1 py-3 h-10 border border-border text-text-primary text-sm font-semibold rounded-xl hover:bg-surface-muted transition"
          >
            Unduh PDF
          </button>
          <router-link
            to="/"
            class="w-full md:flex-1 text-center py-3 h-10 bg-primary text-text-on-primary text-sm font-semibold rounded-xl hover:bg-primary-hover transition"
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
      <div class="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-base font-semibold text-text-primary mb-2">Unduh hasil PDF?</h2>
        <p class="text-sm text-text-secondary leading-relaxed mb-6">
          Rekap jawaban akan diunduh dalam format .pdf.
        </p>

        <div class="flex gap-3">
          <button
            @click="showExportPDFModal = false"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-primary-soft transition-colors"
          >
            Batal
          </button>
          <button
            @click="confirmExportPDF"
            :disabled="exportingPDF"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {{ exportingPDF ? 'Mengunduh...' : 'Ya, unduh' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Template tersembunyi khusus buat di-screenshot -->
  <div style="position: fixed; left: -9999px; top: 0;">
    <ScoreCardTemplate
      ref="scoreCardRef"
      :likert-name="likertStore.currentLikert?.name"
      :code="result?.code"
      :respondent="result?.respondent || {}"
      :total-score="result?.totalScore"
      :scales-label="category?.label"
      :scales-description="category?.description"
    />
  </div>
</template>

<script setup>
import ScoreCardTemplate from '@/components/LikertScoreCardTemplate.vue'
import LikertScoreSummary from '@/components/likert/LikertScoreSummary.vue'
import LikertAnswerSections from '@/components/likert/LikertAnswerSections.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertSessionStore } from '@/stores/likert/likert-session'
import { useLikertQuestionsStore } from '@/stores/likert/likert-questions'
import { useLikertCategoryStore } from '@/stores/likert/likert-category'
import { LIKERT_SCALE_OPTIONS } from '@/apps/likert'
import { exportResultToPDF } from '@/utils/likert-pdf-export'

const route = useRoute()
const router = useRouter()
const likertSlug = route.params.slug
const likertId = computed(() => likertStore?.currentLikert?.id || null)

const likertStore = useLikertStore()
const likertSessionStore = useLikertSessionStore()
const likertQuestionsStore = useLikertQuestionsStore()
const categoryStore = useLikertCategoryStore()

const categories = ref([])
const loading = ref(true)

const showExportPDFModal = ref(false)
const showDetails = ref(false)

async function confirmExportPDF() {
  if (exportingPDF.value) return
  exportingPDF.value = true
  try {
    handleExportPDF()
    showExportPDFModal.value = false
  } finally {
    exportingPDF.value = false
  }
}

const badgeStyleMap = {
  'Sangat Tinggi': { bg: 'var(--color-level-5-soft)', text: 'var(--color-level-5)' },
  'Tinggi': { bg: 'var(--color-level-4-soft)', text: 'var(--color-level-4)' },
  'Sedang': { bg: 'var(--color-level-3-soft)', text: 'var(--color-level-3)' },
  'Rendah': { bg: 'var(--color-level-2-soft)', text: 'var(--color-level-2)' },
  'Sangat Rendah': { bg: 'var(--color-level-1-soft)', text: 'var(--color-level-1)' },
}

const answerLabelMap = Object.fromEntries(
  LIKERT_SCALE_OPTIONS.map((opt) => [opt.value, opt.label])
)

const result = computed(() => likertSessionStore.getResult(likertId.value))
const respondentName = computed(() => result.value?.respondentName || '-')
const maxScore = computed(() => categories.value[0]?.max ?? categories.value[0]?.min ?? '-')

const category = computed(() => {
  const score = result.value?.totalScore ?? 0
  const found = (
    categories.value.find((c) => score >= c.min && score <= c.max) ||
    categories.value[categories.value.length - 1] ||
    null
  )
  if (found) {
    const style = badgeStyleMap[found.label] || { bg: 'var(--color-surface-muted)', text: 'var(--color-text-secondary)' }
    return { ...found, bg: style.bg, text: style.text }
  }
  return null
})

const sections = computed(() => {
  const answers = result.value?.answers || []
  const grouped = {}

  for (const a of answers) {
    const question = likertQuestionsStore.questions.find((q) => q.id === a.questionId)
    if (!grouped[a.categoryId]) grouped[a.categoryId] = []
    grouped[a.categoryId].push({
      questionId: a.questionId,
      questionText: question?.question || '(soal tidak ditemukan)',
      answerLabel: answerLabelMap[a.answer] || a.answer || '-',
    })
  }

  return Object.keys(grouped).map((categoryId) => {
    const cat = categoryStore.categories.find((c) => c.id === categoryId)
    return {
      key: categoryId,
      label: cat?.name || 'Tanpa kategori',
      items: grouped[categoryId],
    }
  })
})

onMounted(async () => {
  if (!result.value) {
    router.replace({ name: 'likert-form', params: { slug: likertSlug } })
    return
  }

  loading.value = true
  try {
    await Promise.all([
      likertStore.currentLikert ? Promise.resolve() : likertStore.getLikertBySlug(likertSlug),
      likertQuestionsStore.fetchQuestions(likertId.value),
      categoryStore.fetchCategories(),
    ])

    const scales = await likertStore.fetchLikertScales(likertId.value)
    categories.value = scales.map((s) => ({
      ...s,
      bg: badgeStyleMap[s.label]?.bg || 'var(--color-surface-muted)',
      text: badgeStyleMap[s.label]?.text || 'var(--color-text-secondary)',
    }))
  } finally {
    loading.value = false
  }
})

const scoreCardRef = ref(null)
const exportingPDF = ref(false)

async function handleExportPDF() {
  if (exportingPDF.value) return
  exportingPDF.value = true
  try {
    await exportResultToPDF({
      scoreCardElement: scoreCardRef.value.cardRef,
      sections: sections.value,
      filename: `hasil-${likertStore.currentLikert?.name}-${respondentName.value}.pdf`.replace(/\s+/g, '_'),
    })
  } finally {
    exportingPDF.value = false
  }
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