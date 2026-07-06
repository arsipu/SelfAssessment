<template>
  <div class="min-h-screen bg-gray-50">

    <div class="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div v-if="!result || loading" class="text-center text-sm text-gray-400 py-20">
        Memuat hasil...
      </div>

      <div v-else class="space-y-6">
        <!-- Kartu kode dominan -->
        <div class="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-sm">
          <div class="text-center mb-8">
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Hasil Holland RIASEC
            </p>
            <h1 class="text-base md:text-lg font-semibold text-gray-900">{{ respondentName }}</h1>
            <p class="text-xs text-gray-400 mt-1 font-mono">
              Kode: <span class="font-semibold text-gray-600">{{ result.code }}</span>
            </p>
          </div>

          <div class="flex flex-col items-center mb-8">
            <div class="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-1">
              {{ result.topCode }}
            </div>
            <p class="text-xs text-gray-400">Kode minat dominan (3 kategori tertinggi)</p>
          </div>

          <!-- Deskripsi tiap kategori dalam topCode -->
          <div class="space-y-3">
            <div
              v-for="code in topCodeChars"
              :key="code"
              class="bg-gray-50 border border-gray-100 rounded-xl p-4"
            >
              <p class="text-sm font-semibold text-gray-800 mb-1">
                {{ RIASEC_GUIDE[code]?.label }} ({{ code }})
              </p>
              <p class="text-xs text-gray-500 leading-relaxed">{{ RIASEC_GUIDE[code]?.description }}</p>
            </div>
          </div>
        </div>

        <!-- Breakdown persentase per kategori -->
        <div class="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm">
          <p class="text-xs font-medium text-gray-400 mb-4">Rincian skor per kategori</p>

          <div class="space-y-4">
            <div v-for="row in scoreBreakdown" :key="row.code">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-medium text-gray-700">
                  {{ RIASEC_GUIDE[row.code]?.label }} ({{ row.code }})
                </span>
                <span class="text-xs text-gray-400">
                  {{ row.count }}/{{ row.total }} · {{ row.percentage }}%
                </span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="row.isTop ? 'bg-gray-900' : 'bg-gray-300'"
                  :style="{ width: row.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-gray-400 mt-4 leading-relaxed">
            Persentase dihitung dari jumlah pernyataan yang dipilih dibagi total pernyataan pada
            kategori tersebut, karena jumlah pernyataan tiap kategori tidak sama.
          </p>
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
            :to="{ name: 'holland-form' }"
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
              <div v-for="section in answerSections" :key="section.key" class="mb-5 last:mb-0">
                <div class="flex items-center gap-2 mb-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span class="text-xs font-medium text-gray-500">
                    {{ RIASEC_GUIDE[section.key]?.label }} ({{ section.key }})
                  </span>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="item in section.items"
                    :key="item.questionId"
                    class="py-2.5 px-3 rounded-lg bg-gray-50"
                  >
                    <p class="text-sm text-gray-700 leading-relaxed">{{ item.questionText }}</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
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
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-base font-semibold text-gray-900 mb-2">Unduh hasil PDF?</h2>
        <p class="text-sm text-gray-500 leading-relaxed mb-6">
          Rekap hasil akan diunduh dalam format .pdf.
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
      likert-name="Holland RIASEC"
      :code="result?.code"
      :respondent="result?.respondent || {}"
      :total-score="result?.topCode"
      :scales-label="topCodeChars.map((c) => RIASEC_GUIDE[c]?.label).join(' · ')"
      :scales-description="topCodeChars.map((c) => RIASEC_GUIDE[c]?.description).join(' ')"
    />
  </div>
</template>

<script setup>
import ScoreCardTemplate from '@/components/ScoreCardTemplate.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHollandSessionStore } from '@/stores/holland/holland-session'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { RIASEC_CATEGORY_ORDER, RIASEC_GUIDE } from '@/apps/holland'
import { exportResultToPDFHybrid } from '@/utils/pdf-export'

const router = useRouter()

const sessionStore = useHollandSessionStore()
const questionsStore = useHollandQuestionsStore()

const loading = ref(true)

const showExportPDFModal = ref(false)
const showDetails = ref(false)

const result = computed(() => sessionStore.getResult())
const respondentName = computed(() => result.value?.respondentName || '-')

// urutan huruf topCode ("SAE" -> ["S", "A", "E"]), dipakai buat nampilin
// deskripsi kategori dominan sesuai urutan skor tertinggi
const topCodeChars = computed(() => (result.value?.topCode || '').split(''))

// breakdown semua 6 kategori buat progress bar, diurutkan dari persentase tertinggi
const scoreBreakdown = computed(() => {
  const scores = result.value?.scores || {}
  return RIASEC_CATEGORY_ORDER
    .map((code) => ({
      code,
      count: scores[code]?.count ?? 0,
      total: scores[code]?.total ?? 0,
      percentage: scores[code]?.percentage ?? 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .map((row) => ({ ...row, isTop: topCodeChars.value.includes(row.code) }))
})

// rincian jawaban per kategori, pakai teks soal dari questions store
const answerSections = computed(() => {
  const answers = result.value?.answers || []
  const grouped = {}

  for (const a of answers) {
    const question = questionsStore.questions.find((q) => q.id === a.questionId)
    if (!grouped[a.category]) grouped[a.category] = []
    grouped[a.category].push({
      questionId: a.questionId,
      questionText: question?.question || '(soal tidak ditemukan)',
    })
  }

  return RIASEC_CATEGORY_ORDER
    .filter((code) => grouped[code]?.length)
    .map((code) => ({ key: code, items: grouped[code] }))
})

onMounted(async () => {
  if (!result.value) {
    router.replace({ name: 'holland-form' })
    return
  }

  loading.value = true
  try {
    await questionsStore.fetchQuestions()
  } finally {
    loading.value = false
  }
})

const scoreCardRef = ref(null)
const exportingPDF = ref(false)

async function handleExportPDF() {
  await exportResultToPDFHybrid({
    scoreCardElement: scoreCardRef.value.cardRef,
    sections: answerSections.value,
    filename: `hasil-holland-${respondentName.value}.pdf`.replace(/\s+/g, '_'),
  })
}

async function confirmExportPDF() {
  if (exportingPDF.value) return
  exportingPDF.value = true
  try {
    await handleExportPDF()
    showExportPDFModal.value = false
  } finally {
    exportingPDF.value = false
  }
}
</script>