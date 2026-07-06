<template>
  <div class="min-h-screen bg-gray-50">

    <div class="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div v-if="!result || loading" class="text-center text-sm text-gray-400 py-20">
        Memuat hasil...
      </div>

      <div v-else class="space-y-6">
        <!-- Kartu skor -->
        <div class="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-sm">
          <div class="text-center mb-8">
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Hasil {{ likertStore.currentLikert?.name || 'Kuesioner' }}
            </p>
            <h1 class="text-base md:text-lg font-semibold text-gray-900">{{ respondentName }}</h1>
            <p class="text-xs text-gray-400 mt-1 font-mono">
              Kode: <span class="font-semibold text-gray-600">{{ result.code }}</span>
            </p>
          </div>

          <div class="flex flex-col items-center mb-8">
            <div class="text-4xl md:text-5xl font-bold text-gray-900 mb-1">{{ result.totalScore }}</div>

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
        
        <!-- Tombol aksi -->
        <div class="flex flex-col md:flex-row gap-3">
          <button
            @click="showExportPDFModal = true"
            class="w-full md:flex-1 py-3 h-10 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Unduh PDF
          </button>
          <router-link
            :to="{ name: 'likert' }"
            class="w-full md:flex-1 text-center py-3 h-10 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition"
          >
            Selesai
          </router-link>
        </div>
        <!-- Rincian jawaban per soal -->
        <div class="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
          <button
            @click="showDetails = !showDetails"
            class="w-full flex items-center justify-between gap-2"
          >
            <p class="text-xs font-medium text-gray-400">Rincian jawaban</p>
            <font-awesome-icon
              icon="fa-solid fa-chevron-down"
              class="w-4 h-4 text-gray-400 transition-transform duration-200"
              :class="{ 'fa-rotate-180': showDetails }"
            />
          </button>

          <Transition name="expand">
            <div v-if="showDetails" class="mt-4">
              <div v-for="section in sections" :key="section.key" class="mb-5 last:mb-0">
                <div class="flex items-center gap-2 mb-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span class="text-xs font-medium text-gray-500">{{ section.label }}</span>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="(item, i) in section.items"
                    :key="item.questionId"
                    class="flex items-start justify-between gap-3 py-2.5 px-3 rounded-lg bg-gray-50"
                  >
                    <p class="text-sm text-gray-700 leading-relaxed flex-1">
                      <span class="text-gray-400 mr-1">{{ i + 1 }}.</span>{{ item.questionText }}
                    </p>
                    <span class="shrink-0 text-[11px] md:text-xs font-semibold px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-700 whitespace-nowrap">
                      {{ item.answerLabel }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        <!-- <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
        </div> -->
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
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-base font-semibold text-gray-900 mb-2">Unduh hasil PDF?</h2>
        <p class="text-sm text-gray-500 leading-relaxed mb-6">
          Rekap jawaban akan diunduh dalam format .pdf.
        </p>

        <div class="flex gap-3">
          <button
            @click="showExportPDFModal = false"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            @click="confirmExportPDF"
            :disabled="exportingPDF"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertSessionStore } from '@/stores/likert/likert-session'
import { useLikertQuestionsStore } from '@/stores/likert/likert-questions'
import { useLikertCategoryStore } from '@/stores/likert/likert-category'
import { LIKERT_SCALE_OPTIONS } from '@/apps/likert'
import { exportResultToPDFHybrid } from '@/utils/likert-pdf-export'

const route = useRoute()
const router = useRouter()
const likertId = route.params.id

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


const scoreCardRef = ref(null)
const exportingPDF = ref(false)

async function handleExportPDF() {
  if (exportingPDF.value) return
  exportingPDF.value = true
  try {
    await exportResultToPDFHybrid({
      scoreCardElement: scoreCardRef.value.cardRef,
      sections: sections.value,
      filename: `hasil-${likertStore.currentLikert?.name}-${respondentName.value}.pdf`.replace(/\s+/g, '_'),
    })
  } finally {
    exportingPDF.value = false
  }
}
</script>