<template>
  <div class="min-h-screen bg-gray-50">
    <AppTopBar />

    <div class="max-w-2xl mx-auto px-4 py-10">
      <div v-if="!result || loading" class="text-center text-sm text-gray-400 py-20">
        Memuat hasil...
      </div>

      <div v-else class="space-y-6">
        <!-- Kartu skor -->
        <div class="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div class="text-center mb-8">
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Hasil {{ likertStore.currentLikert?.name || 'Kuesioner' }}
            </p>
            <h1 class="text-lg font-semibold text-gray-900">{{ respondentName }}</h1>
            <p class="text-xs text-gray-400 mt-1 font-mono">
              Kode: <span class="font-semibold text-gray-600">{{ result.code }}</span>
            </p>
          </div>

          <div class="flex flex-col items-center mb-8">
            <div class="text-5xl font-bold text-gray-900 mb-1">{{ result.totalScore }}</div>

            <span
              class="px-4 py-1.5 rounded-full text-sm font-semibold"
              :class="category?.badgeClass"
            >
              {{ category?.label || '-' }}
            </span>
          </div>

          <div class="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <p class="text-sm text-gray-600 leading-relaxed">{{ category?.description }}</p>
          </div>
        </div>

        <!-- Rincian jawaban per soal -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p class="text-xs font-medium text-gray-400 mb-4">Rincian jawaban</p>

          <div v-for="section in sections" :key="section.key" class="mb-5 last:mb-0">
            <div class="flex items-center gap-2 mb-2.5">
              <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              <span class="text-xs font-medium text-gray-500">{{ section.label }}</span>
            </div>

            <div class="space-y-2">
              <div
                v-for="(item, i) in section.items"
                :key="item.questionId"
                class="flex items-start justify-between gap-4 py-2.5 px-3 rounded-lg bg-gray-50"
              >
                <p class="text-sm text-gray-700 leading-relaxed flex-1">
                  <span class="text-gray-400 mr-1">{{ i + 1 }}.</span>{{ item.questionText }}
                </p>
                <span class="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700">
                  {{ item.answerLabel }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <router-link
          :to="{ name: 'likert' }"
          class="block w-full text-center py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition"
        >
          Selesai
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert'
import { useLikertSessionStore } from '@/stores/likert-session'
import { useLikertQuestionsStore } from '@/stores/likert-questions'
import { useLikertCategoryStore } from '@/stores/likert-category'
import { LIKERT_SCALE_OPTIONS } from '@/apps/likert'

import AppTopBar from '@/components/AppTopBar.vue'

const route = useRoute()
const router = useRouter()
const likertId = route.params.id

const likertStore = useLikertStore()
const likertSessionStore = useLikertSessionStore()
const likertQuestionsStore = useLikertQuestionsStore()
const categoryStore = useLikertCategoryStore()

const categories = ref([])
const loading = ref(true)

const badgeClassMap = {
  'Sangat Tinggi': 'bg-emerald-100 text-emerald-700',
  'Tinggi': 'bg-teal-100 text-teal-700',
  'Sedang': 'bg-amber-100 text-amber-700',
  'Rendah': 'bg-orange-100 text-orange-700',
  'Sangat Rendah': 'bg-rose-100 text-rose-700',
}

// map value jawaban (SS/S/TS/STS) -> label tampilan
const answerLabelMap = Object.fromEntries(
  LIKERT_SCALE_OPTIONS.map((opt) => [opt.value, opt.label])
)

const result = computed(() => likertSessionStore.getResult(likertId))
const respondentName = computed(() => result.value?.respondentName || '-')
const maxScore = computed(() => categories.value[0]?.max ?? categories.value[0]?.min ?? '-')

const category = computed(() => {
  const score = result.value?.totalScore ?? 0
  return (
    categories.value.find((c) => score >= c.min && score <= c.max) ||
    categories.value[categories.value.length - 1] ||
    null
  )
})

// gabungkan submissionResult (jawaban) dengan teks soal & nama kategori,
// dikelompokkan per kategori — sama kayak tampilan LikertQuestions.vue
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
    router.replace({ name: 'likert-form', params: { id: likertId } })
    return
  }

  loading.value = true
  try {
    await Promise.all([
      likertStore.currentLikert ? Promise.resolve() : likertStore.getLikertById(likertId),
      likertQuestionsStore.fetchQuestions(likertId),
      categoryStore.fetchCategories(),
    ])

    const scales = await likertStore.fetchLikertScales(likertId)
    categories.value = scales.map((s) => ({
      ...s,
      badgeClass: badgeClassMap[s.label] || 'bg-gray-100 text-gray-700',
    }))
  } finally {
    loading.value = false
  }
})
</script>