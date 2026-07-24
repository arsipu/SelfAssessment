<template>
  <div class="min-h-screen">
    <AppTopBar />

    <div class="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-lg md:text-xl font-medium text-text-primary mt-3">Likert Scale</h1>
        <p class="text-sm text-text-muted mt-1">
          Berikan tanda pada kolom yang paling sesuai dengan diri Anda.
        </p>
      </div>

      <!-- Progress bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-text-muted">Progress</span>
          <span class="text-xs text-text-secondary font-medium">{{ answeredCount }}/{{ questions.length }}</span>
        </div>
        <div class="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            class="h-full bg-primary rounded-full transition-all duration-300"
            :style="{ width: progressPct + '%' }"
          ></div>
        </div>
      </div>

      <!-- Category sections -->
      <div v-for="section in sections" :key="section.key" class="mb-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="h-px flex-1 bg-border"></div>
          <div class="flex items-center gap-2 shrink-0">
            <span
              class="w-2 h-2 rounded-full"
              :style="{ backgroundColor: section.dot }"
            ></span>
            <span class="text-xs font-medium text-text-secondary">{{ section.label }}</span>
          </div>
          <div class="h-px flex-1 bg-border"></div>
        </div>

        <div class="space-y-3">
          <div
            v-for="(q, i) in section.questions"
            :key="q.id"
            class="bg-surface border border-border rounded-xl p-3 md:p-4 transition-colors"
          >
            <div class="flex items-start gap-3 mb-3">
              <span class="text-xs font-medium text-text-muted mt-0.5 w-6 shrink-0">{{ i + 1 }}.</span>
              <p class="text-sm text-text-primary leading-relaxed">{{ q.question }}</p>
            </div>

            <div class="flex flex-wrap gap-1.5 md:gap-2 pl-9">
              <button
                v-for="opt in scaleOptions"
                :key="opt.value"
                @click="answers[q.id] = opt.value"
                class="flex-1 min-w-[3rem] px-1.5 py-2 rounded-lg text-[11px] md:text-xs font-medium transition-all border leading-tight text-center"
                :class="answers[q.id] === opt.value
                  ? 'bg-primary text-text-on-primary border-primary'
                  : 'bg-surface-muted text-text-secondary border-border hover:border-primary hover:text-text-primary'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p class="text-xs text-text-muted text-center sm:text-left">
          {{ unansweredCount > 0 ? `${unansweredCount} soal belum dijawab` : 'Semua soal sudah dijawab ✓' }}
        </p>
        <button
          @click="showConfirmModal = true"
          :disabled="unansweredCount > 0"
          class="w-full sm:w-auto px-6 py-2.5 h-10 bg-primary text-text-on-primary text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Kirim jawaban
        </button>
      </div>
    </div>
    <!-- Modal konfirmasi -->
    <Transition name="fade">
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
        @click.self="showConfirmModal = false"
      >
        <div class="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-lg max-h-[90vh] overflow-y-auto">
          <h2 class="text-base font-semibold text-text-primary mb-2">Kirim jawaban?</h2>
          <p class="text-sm text-text-secondary leading-relaxed mb-6">
            Pastikan semua jawaban sudah sesuai. Jawaban tidak bisa diubah lagi setelah dikirim.
          </p>

          <div class="flex gap-3">
            <button
              @click="showConfirmModal = false"
              class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-primary-soft transition-colors"
            >
              Batal
            </button>
            <button
              @click="confirmSubmit"
              :disabled="submitting"
              class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {{ submitting ? 'Mengirim...' : 'Ya, kirim' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertQuestionsStore } from '@/stores/likert/likert-questions'
import { useLikertCategoriesStore } from '@/stores/likert/likert-categories'
import { useLikertSessionStore } from '@/stores/likert/likert-session'
import { LikertAnswer, LIKERT_SCALE_OPTIONS, LIKERT_SCORE_MAP, LIKERT_SCORE_MAP_REVERSE } from '@/apps/likert'

const route = useRoute()
const router = useRouter()
const likertSlug = route.params.slug
const likertId = computed(() => likertStore?.currentLikert?.id || null)

const likertStore = useLikertStore()
const likertQuestionsStore = useLikertQuestionsStore()
const likertSessionStore = useLikertSessionStore()
const { questions } = storeToRefs(likertQuestionsStore)

const categoryStore = useLikertCategoriesStore()
const { categories } = storeToRefs(categoryStore)

const answers = ref({})
let session = null

const scaleOptions = LIKERT_SCALE_OPTIONS

onMounted(async () => {
  // Pastikan currentLikert terisi
  if (!likertStore.currentLikert) {
    await likertStore.getLikertBySlug(likertSlug)
  }

  session = likertSessionStore.getSession(likertId.value)

  if (!session) {
    // ga ada sesi -> balik ke form
    router.push({ name: 'likert-form', params: { slug: likertSlug } })
    return
  }

  answers.value = { ...session.answers }

  // Fetch categories (subcollection) — questions ada di array field tiap kategori
  await categoryStore.fetchCategories(likertId.value)
  await likertQuestionsStore.fetchAllQuestions(categories.value)
})


let debounceTimer = null

function buildSubmissionResult() {
  return questions.value.map((q) => {
    const raw = answers.value[q.id]
    const isFavorable = q.favorable === 'favorable'
    const point = raw ? (isFavorable ? scoreMap[raw] : scoreMapRev[raw]) : null

    return {
      questionId: q.id,
      categoryId: q.categoryId,
      favorable: q.favorable,
      answer: raw ?? null,
      point,
    }
  })
}

watch(
  answers,
  (newAnswers) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      likertSessionStore.updateAnswers(likertId.value, newAnswers, buildSubmissionResult())
    }, 800) // sesuaikan delay-nya sesuai selera
  },
  { deep: true }
)

onUnmounted(() => clearTimeout(debounceTimer))

const dotColors = [
  'var(--color-viz-1)',
  'var(--color-viz-2)',
  'var(--color-viz-3)',
  'var(--color-viz-4)',
  'var(--color-viz-5)',
  'var(--color-viz-6)',
]

const sections = computed(() => {
  const grouped = {}
  for (const q of questions.value) {
    if (!grouped[q.categoryId]) grouped[q.categoryId] = []
    grouped[q.categoryId].push(q)
  }
  return Object.keys(grouped).map((categoryId, index) => {
    const cat = categories.value.find((c) => c.id === categoryId)
    return {
      key: categoryId,
      label: cat?.name || 'Tanpa kategori',
      dot: dotColors[index % dotColors.length],
      questions: grouped[categoryId],
    }
  })
})

const answeredCount = computed(() => Object.keys(answers.value).length)
const unansweredCount = computed(() => questions.value.length - answeredCount.value)
const progressPct = computed(() =>
  questions.value.length ? (answeredCount.value / questions.value.length) * 100 : 0
)

const scoreMap = LIKERT_SCORE_MAP
const scoreMapRev = LIKERT_SCORE_MAP_REVERSE

const handleSubmit = async () => {
  const submissionResult = buildSubmissionResult()
  const totalScore = submissionResult.reduce((sum, r) => sum + (r.point ?? 0), 0)

  try {
    const session = likertSessionStore.getSession(likertId.value) // ambil dulu sebelum finishSession hapus dia
    await likertSessionStore.finishSession(likertId.value, submissionResult, totalScore)
    router.push({ name: 'likert-result', params: { slug: likertSlug }, query: { code: session.code } })
  } catch (error) {
    alert('Gagal menyimpan jawaban, coba lagi.')
  }
}

const showConfirmModal = ref(false)
const submitting = ref(false)

async function confirmSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    await handleSubmit()
  } finally {
    submitting.value = false
    showConfirmModal.value = false
  }
}
</script>