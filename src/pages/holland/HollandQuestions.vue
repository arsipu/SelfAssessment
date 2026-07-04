<template>
  <div class="min-h-screen">
    <AppTopBar />

    <div class="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-lg md:text-xl font-medium text-gray-900 mt-3">Holland RIASEC</h1>
        <p class="text-sm text-gray-400 mt-1">
          Centang satu atau lebih pernyataan yang paling mencerminkan diri Anda pada setiap kolom.
        </p>
      </div>

      <!-- Progress -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-gray-400">Pernyataan dipilih</span>
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
      <div v-for="section in sections" :key="section.key" class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="h-px flex-1 bg-gray-200"></div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="w-2 h-2 rounded-full" :class="section.dot"></span>
            <span class="text-xs font-medium text-gray-500">{{ section.label }} ({{ section.code }})</span>
          </div>
          <div class="h-px flex-1 bg-gray-200"></div>
        </div>

        <div class="space-y-5">
          <div v-for="col in section.columns" :key="col.key">
            <p class="text-xs font-semibold text-gray-600 mb-2">{{ col.label }}</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                v-for="q in col.questions"
                :key="q.id"
                class="flex items-start gap-2.5 bg-white border rounded-lg p-2.5 cursor-pointer transition-colors"
                :class="isChecked(q.id) ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <input
                  type="checkbox"
                  class="mt-0.5 w-4 h-4 shrink-0 accent-gray-900"
                  :checked="isChecked(q.id)"
                  @change="toggleAnswer(q)"
                />
                <span class="text-sm text-gray-800 leading-relaxed">{{ q.question }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p class="text-xs text-gray-400 text-center sm:text-left">
          {{ answeredCount === 0 ? 'Belum ada pernyataan yang dipilih' : `${answeredCount} pernyataan dipilih` }}
        </p>
        <button
          @click="showConfirmModal = true"
          :disabled="answeredCount === 0"
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
            Pastikan pilihan Anda sudah sesuai. Jawaban tidak bisa diubah lagi setelah dikirim.
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { useHollandSessionStore } from '@/stores/holland/holland-session'
import { RIASEC_CATEGORY_ORDER, HOLLAND_COLUMNS, RIASEC_GUIDE, getTopRiasecCode, computeRiasecScores } from '@/apps/holland'

const router = useRouter()

const questionsStore = useHollandQuestionsStore()
const { questions } = storeToRefs(questionsStore)

const sessionStore = useHollandSessionStore()

// checkedMap[questionId] = true  -> lookup cepat buat isChecked()
const checkedMap = reactive({})
let session = null

onMounted(async () => {
  session = sessionStore.getSession()

  if (!session) {
    // ga ada sesi -> balik ke form
    router.push({ name: 'holland-form' })
    return
  }

  // restore jawaban dari sesi (array of { questionId, category, column })
  for (const a of session.answers || []) {
    checkedMap[a.questionId] = true
  }

  await questionsStore.fetchQuestions()
})

function isChecked(questionId) {
  return !!checkedMap[questionId]
}

function toggleAnswer(question) {
  if (checkedMap[question.id]) {
    delete checkedMap[question.id]
  } else {
    checkedMap[question.id] = true
  }
}

function buildAnswers() {
  return questions.value
    .filter((q) => checkedMap[q.id])
    .map((q) => ({ questionId: q.id, category: q.category, column: q.column }))
}

let debounceTimer = null

watch(
  checkedMap,
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      sessionStore.updateAnswers(buildAnswers())
    }, 800) // sesuaikan delay-nya sesuai selera
  },
  { deep: true }
)

onUnmounted(() => clearTimeout(debounceTimer))

const dotColors = ['bg-rose-400', 'bg-blue-400', 'bg-purple-400', 'bg-teal-400', 'bg-amber-400', 'bg-emerald-400']

// Kelompokkan questions per kategori, lalu per kolom di dalamnya.
// Tidak ada field `order` di Firestore, jadi urutan ikut RIASEC_CATEGORY_ORDER
// (kategori) dan HOLLAND_COLUMNS (kolom); urutan soal dalam 1 kolom ikut
// urutan hasil fetchQuestions() apa adanya.
const sections = computed(() => {
  return RIASEC_CATEGORY_ORDER
    .map((code, index) => {
      const categoryQuestions = questions.value.filter((q) => q.category === code)
      if (categoryQuestions.length === 0) return null

      const columns = HOLLAND_COLUMNS
        .map((col) => ({
          key: col.key,
          label: col.label,
          questions: categoryQuestions.filter((q) => q.column === col.key),
        }))
        .filter((col) => col.questions.length > 0)

      return {
        key: code,
        code,
        label: RIASEC_GUIDE[code]?.label || code,
        dot: dotColors[index % dotColors.length],
        columns,
      }
    })
    .filter(Boolean)
})

const answeredCount = computed(() => Object.keys(checkedMap).length)
const progressPct = computed(() =>
  questions.value.length ? (answeredCount.value / questions.value.length) * 100 : 0
)

function buildScores() {
  return computeRiasecScores(questions.value, checkedMap)
}

const handleSubmit = async () => {
  const answers = buildAnswers()
  const scores = buildScores()
  const topCode = getTopRiasecCode(scores)

  try {
    await sessionStore.finishSession(answers, scores, topCode)
    router.push({ name: 'holland-result' })
  } catch (error) {
    alert('Gagal menyimpan jawaban, coba lagi.')
    console.error(error)
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