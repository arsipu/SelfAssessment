<template>
  <div class="min-h-screen bg-gray-50">
    <AppTopBar />

    <div class="max-w-2xl mx-auto px-4 py-10">

      <!-- Header -->
      <div class="mb-6">
        <!-- <router-link to="/likert-form" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Kembali
        </router-link> -->
        <h1 class="text-xl font-medium text-gray-900 mt-3">Likert Scale</h1>
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
            class="bg-white border rounded-xl p-4 transition-colors border-gray-200"
          >
            <div class="flex items-start gap-3 mb-3">
              <span class="text-xs font-medium text-gray-400 mt-0.5 w-6 shrink-0">{{ i + 1 }}.</span>
              <p class="text-sm text-gray-800 leading-relaxed">{{ q.question }}</p>
            </div>

            <div class="flex gap-2 pl-9">
              <button
                v-for="opt in scaleOptions"
                :key="opt.value"
                @click="answers[q.id] = opt.value"
                class="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
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
      <div class="mt-8 flex items-center justify-between">
        <p class="text-xs text-gray-400">
          {{ unansweredCount > 0 ? `${unansweredCount} soal belum dijawab` : 'Semua soal sudah dijawab ✓' }}
        </p>
        <button
          @click="handleSubmit"
          :disabled="unansweredCount > 0"
          class="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Kirim jawaban
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLikertStore } from '@/stores/likert'
import { useLikertCategoryStore } from '@/stores/likert-category'

const route = useRoute()
const router = useRouter()
const likertId = route.params.id

const likertStore = useLikertStore()
const { questions } = storeToRefs(likertStore)

const categoryStore = useLikertCategoryStore()
const { categories } = storeToRefs(categoryStore)

const scaleOptions = [
  { value: 'SS', label: 'SS' },
  { value: 'S',  label: 'S'  },
  { value: 'TS', label: 'TS' },
  { value: 'STS', label: 'STS' },
]

onMounted(async () => {
  if (!likertStore.respondent) {
    router.push({ name: 'likert-form', params: { id: likertId } })
    return
  }

  await likertStore.fetchQuestions(likertId)
  await categoryStore.fetchCategories()
})

// Palet warna dot, dipakai bergilir sesuai urutan kategori
const dotColors = ['bg-rose-400', 'bg-blue-400', 'bg-purple-400', 'bg-teal-400', 'bg-amber-400', 'bg-emerald-400']

// Group pertanyaan per categoryId
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

const answers = ref({})
const answeredCount = computed(() => Object.keys(answers.value).length)
const unansweredCount = computed(() => questions.value.length - answeredCount.value)
const progressPct = computed(() =>
  questions.value.length ? (answeredCount.value / questions.value.length) * 100 : 0
)

const scoreMap = { SS: 4, S: 3, TS: 2, STS: 1 }
const scoreMapRev = { SS: 1, S: 2, TS: 3, STS: 4 }

const handleSubmit = async () => {
  const submissionResult = questions.value.map((q) => {
    const raw = answers.value[q.id]
    const point = q.favorable ? scoreMap[raw] : scoreMapRev[raw]
    return {
      questionId: q.id,
      categoryId: q.categoryId,
      favorable: q.favorable ? 'favorable' : 'unfavorable',
      answer: raw,
      point,
    }
  })

  const totalScore = submissionResult.reduce((sum, r) => sum + r.point, 0)

  try {
    await likertStore.submitAnswers(likertId, likertStore.respondent, submissionResult, totalScore)
    likertStore.setLastResult({ totalScore })
    router.push({ name: 'likert-result', params: { id: likertId } })
  } catch (error) {
    alert('Gagal menyimpan jawaban, coba lagi.')
  }
}
</script>