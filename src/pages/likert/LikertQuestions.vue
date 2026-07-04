<template>
  <div class="min-h-screen">
    <AppTopBar />

    <div class="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">

      <!-- Header -->
      <div class="mb-6">
        <!-- <router-link to="/likert-form" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Kembali
        </router-link> -->
        <h1 class="text-lg md:text-xl font-medium text-gray-900 mt-3">Likert Scale</h1>
        <p class="text-sm text-gray-400 mt-1">
          Berikan tanda pada kolom yang paling sesuai dengan diri Anda.
        </p>
      </div>

      <!-- Progress bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-gray-400">Progress</span>
          <span class="text-xs text-gray-500 font-medium">{{ answeredCount }}/{{ questions.length }}</span>
        </div>
        <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gray-900 rounded-full transition-all duration-300"
            :style="{ width: progressPct + '%' }"
          ></div>
        </div>
      </div>

      <!-- Category sections -->
      <div v-for="section in sections" :key="section.key" class="mb-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="h-px flex-1 bg-gray-200"></div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="w-2 h-2 rounded-full" :class="section.dot"></span>
            <span class="text-xs font-medium text-gray-500">{{ section.label }}</span>
          </div>
          <div class="h-px flex-1 bg-gray-200"></div>
        </div>

        <div class="space-y-3">
          <div
            v-for="(q, i) in section.questions"
            :key="q.id"
            class="bg-white border rounded-xl p-3 md:p-4 transition-colors border-gray-200"
          >
            <div class="flex items-start gap-3 mb-3">
              <span class="text-xs font-medium text-gray-400 mt-0.5 w-6 shrink-0">{{ i + 1 }}.</span>
              <p class="text-sm text-gray-800 leading-relaxed">{{ q.question }}</p>
            </div>

            <div class="flex flex-wrap gap-1.5 md:gap-2 pl-9">
              <button
                v-for="opt in scaleOptions"
                :key="opt.value"
                @click="answers[q.id] = opt.value"
                class="flex-1 min-w-[3rem] px-1.5 py-2 rounded-lg text-[11px] md:text-xs font-medium transition-all border leading-tight text-center"
                :class="answers[q.id] === opt.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300 hover:text-gray-700'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p class="text-xs text-gray-400 text-center sm:text-left">
          {{ unansweredCount > 0 ? `${unansweredCount} soal belum dijawab` : 'Semua soal sudah dijawab ✓' }}
        </p>
        <button
          @click="showConfirmModal = true"
          :disabled="unansweredCount > 0"
          class="w-full sm:w-auto px-6 py-2.5 h-10 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg max-h-[90vh] overflow-y-auto">
          <h2 class="text-base font-semibold text-gray-900 mb-2">Kirim jawaban?</h2>
          <p class="text-sm text-gray-500 leading-relaxed mb-6">
            Pastikan semua jawaban sudah sesuai. Jawaban tidak bisa diubah lagi setelah dikirim.
          </p>

          <div class="flex gap-3">
            <button
              @click="showConfirmModal = false"
              class="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              @click="confirmSubmit"
              :disabled="submitting"
              class="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
import { useLikertCategoryStore } from '@/stores/likert/likert-category'
import { useLikertSessionStore } from '@/stores/likert/likert-session'
import { LikertAnswer, LIKERT_SCALE_OPTIONS, LIKERT_SCORE_MAP, LIKERT_SCORE_MAP_REVERSE } from '@/apps/likert'

const route = useRoute()
const router = useRouter()
const likertId = route.params.id

const likertStore = useLikertStore()
const likertQuestionsStore = useLikertQuestionsStore()
const likertSessionStore = useLikertSessionStore()
const { questions } = storeToRefs(likertQuestionsStore)

const categoryStore = useLikertCategoryStore()
const { categories } = storeToRefs(categoryStore)

const answers = ref({})
let session = null

const scaleOptions = LIKERT_SCALE_OPTIONS

onMounted(async () => {
  session = likertSessionStore.getSession(likertId)

  if (!session) {
    // ga ada sesi -> balik ke form
    router.push({ name: 'likert-form', params: { id: likertId } })
    return
  }

  answers.value = { ...session.answers }

  await likertQuestionsStore.fetchQuestions(likertId)
  await categoryStore.fetchCategories()
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
      likertSessionStore.updateAnswers(likertId, newAnswers, buildSubmissionResult())
    }, 800) // sesuaikan delay-nya sesuai selera
  },
  { deep: true }
)

onUnmounted(() => clearTimeout(debounceTimer))

const dotColors = ['bg-rose-400', 'bg-blue-400', 'bg-purple-400', 'bg-teal-400', 'bg-amber-400', 'bg-emerald-400']

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
    await likertSessionStore.finishSession(likertId, submissionResult, totalScore)
    router.push({ name: 'likert-result', params: { id: likertId } })
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