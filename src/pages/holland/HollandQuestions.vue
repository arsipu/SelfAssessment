<template>
  <div class="min-h-screen">
    <AppTopBar />

    <div class="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-lg md:text-xl font-medium text-text-primary mt-3">Holland RIASEC</h1>
        <p class="text-sm text-text-muted mt-1">
          Centang satu atau lebih pernyataan yang paling mencerminkan diri Anda pada setiap kolom.
        </p>
      </div>

      <!-- Progress -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-text-muted">Pernyataan dipilih</span>
          <span class="text-xs text-text-secondary font-medium">{{ answeredCount }}/{{ allQuestions.length }}</span>
        </div>
        <div class="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            class="h-full bg-instrument rounded-full transition-all duration-300"
            :style="{ width: progressPct + '%' }"
          ></div>
        </div>
      </div>

      <!-- Category sections — grouped by riasecId from riasecList -->
      <div v-for="section in sections" :key="section.key" class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="h-px flex-1 bg-border"></div>
          <div class="flex items-center gap-2 shrink-0">
            <span
              class="w-2 h-2 rounded-full"
              :style="{ backgroundColor: section.dot }"
            ></span>
            <span class="text-xs font-medium text-text-secondary">{{ section.label }} ({{ section.code }})</span>
          </div>
          <div class="h-px flex-1 bg-border"></div>
        </div>

        <div class="space-y-5">
          <div v-for="col in section.columns" :key="col.key">
            <p class="text-xs font-semibold text-text-secondary mb-2">{{ col.label }}</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                v-for="q in col.questions"
                :key="q.id"
                class="flex items-start gap-2.5 bg-surface border rounded-lg p-2.5 cursor-pointer transition-colors"
                :class="isChecked(q.id) ? 'border-instrument bg-instrument-soft' : 'border-border hover:border-instrument'"
              >
                <input
                  type="checkbox"
                  class="mt-0.5 w-4 h-4 shrink-0 accent-instrument"
                  :checked="isChecked(q.id)"
                  @change="toggleAnswer(q)"
                />
                <span class="text-sm text-text-primary leading-relaxed">{{ q.question }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p class="text-xs text-text-muted text-center sm:text-left">
          {{ answeredCount === 0 ? 'Belum ada pernyataan yang dipilih' : `${answeredCount} pernyataan dipilih` }}
        </p>
        <button
          @click="showConfirmModal = true"
          :disabled="answeredCount === 0"
          class="w-full sm:w-auto px-6 py-2.5 h-10 bg-instrument text-text-on-primary text-sm font-medium rounded-lg hover:bg-instrument-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
            Pastikan pilihan Anda sudah sesuai. Jawaban tidak bisa diubah lagi setelah dikirim.
          </p>

          <div class="flex gap-3">
            <button
              @click="showConfirmModal = false"
              class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-instrument-soft transition-colors"
            >
              Batal
            </button>
            <button
              @click="confirmSubmit"
              :disabled="submitting"
              class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-instrument hover:bg-instrument-hover disabled:opacity-50 transition-colors"
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
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { useHollandSessionStore } from '@/stores/holland/holland-session'
import { HOLLAND_COLUMNS, getTopRiasecCode, computeRiasecScores } from '@/apps/holland'

const route = useRoute()
const router = useRouter()
const hollandId = route.params.id

const questionsStore = useHollandQuestionsStore()
const { allQuestions } = storeToRefs(questionsStore)

const riasecStore = useHollandRiasecStore()
const { riasecList } = storeToRefs(riasecStore)

const sessionStore = useHollandSessionStore()

// checkedMap[questionId] = true  -> lookup cepat buat isChecked()
const checkedMap = reactive({})
let session = null

onMounted(async () => {
  session = sessionStore.getSession(hollandId)

  if (!session) {
    // ga ada sesi -> balik ke form
    router.push({ name: 'holland-form', params: { id: hollandId } })
    return
  }

  // restore jawaban dari sesi (array of { questionId, riasecId, column })
  for (const a of session.answers || []) {
    checkedMap[a.questionId] = true
  }

  // Fetch riasec list (labels, descriptions) AND all questions in parallel
  await Promise.all([
    riasecStore.fetchRiasecList(hollandId),
    questionsStore.fetchAllQuestions(hollandId),
  ])
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
  return allQuestions.value
    .filter((q) => checkedMap[q.id])
    .map((q) => ({
      questionId: q.id,
      riasecId: q.riasecId, // replaces old field `category`
      column: q.column,
    }))
}

let debounceTimer = null

watch(
  checkedMap,
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      sessionStore.updateAnswers(hollandId, buildAnswers())
    }, 800)
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

// Kelompokkan questions per riasecId (kategori), lalu per kolom di dalamnya.
// Urutan kategori dari riasecList (field `order` di Firestore).
// Label/deskripsi dari riasecList (Firestore), bukan dari constants.
const sections = computed(() => {
  return riasecList.value
    .map((cat, index) => {
      const categoryQuestions = allQuestions.value.filter((q) => q.riasecId === cat.id)
      if (categoryQuestions.length === 0) return null

      const columns = HOLLAND_COLUMNS
        .map((col) => ({
          key: col.key,
          label: col.label,
          questions: categoryQuestions.filter((q) => q.column === col.key),
        }))
        .filter((col) => col.questions.length > 0)

      return {
        key: cat.id,
        code: cat.id,
        label: cat.label || cat.id,
        dot: dotColors[index % dotColors.length],
        columns,
      }
    })
    .filter(Boolean)
})

const answeredCount = computed(() => Object.keys(checkedMap).length)
const progressPct = computed(() =>
  allQuestions.value.length ? (answeredCount.value / allQuestions.value.length) * 100 : 0
)

function buildScores() {
  return computeRiasecScores(allQuestions.value, checkedMap)
}

const handleSubmit = async () => {
  const answers = buildAnswers()
  const scores = buildScores()
  const topCode = getTopRiasecCode(scores)

  try {
    await sessionStore.finishSession(hollandId, answers, scores, topCode)
    router.push({ name: 'holland-result', params: { id: hollandId } })
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