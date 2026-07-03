<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4">
      <button @click="router.push({ name: 'admin-likert' })" class="text-sm text-gray-500 hover:text-gray-800 transition-colors">
        Likert Scale
      </button>
      <span class="text-gray-300">/</span>
      <button
        @click="router.push({ name: 'admin-likert-submissions', params: { id: likertId } })"
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        Submissions
      </button>
      <span class="text-gray-300">/</span>
      <span class="text-sm text-gray-800 font-medium">{{ submission?.name ?? '...' }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <p class="text-sm text-gray-400">Memuat data...</p>
    </div>

    <template v-else-if="submission">
      <!-- Info Responden -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
          <h1 class="text-lg font-semibold text-gray-900">{{ submission.name }}</h1>
          <div class="flex items-center gap-2">
            <button
              @click="showExportPDFModal = true"
              class="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Unduh PDF
            </button>
            <span
              class="text-xs px-2.5 py-1 rounded-full font-medium"
              :class="submission.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
            >
              {{ submission.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan' }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-gray-400 text-xs mb-1">Sekolah</p>
            <p class="text-gray-800">{{ submission.school }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Kelas / Jurusan</p>
            <p class="text-gray-800">{{ submission.class }} - {{ submission.major }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Usia / Gender</p>
            <p class="text-gray-800">{{ submission.age }} tahun, {{ submission.gender }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Kode Tracking</p>
            <p class="text-gray-800 font-mono">{{ submission.code }}</p>
          </div>
          <div v-if="submission.totalScore != null">
            <p class="text-gray-400 text-xs mb-1">Total Skor</p>
            <p class="text-gray-800 font-semibold">{{ submission.totalScore }}</p>
          </div>
          <div v-if="category">
            <p class="text-gray-400 text-xs mb-1">Kategori Nilai</p>
            <p class="text-gray-800 font-semibold">{{ category.label }}</p>
          </div>
        </div>
      </div>

      <!-- Jawaban per kategori -->
      <div
        v-for="section in sections"
        :key="section.key"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 last:mb-0"
      >
        <div class="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          <h2 class="text-sm font-medium text-gray-800">{{ section.label }}</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white border-b border-gray-100">
                <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-16">No</th>
                <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Pertanyaan</th>
                <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-48">Jawaban</th>
                <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-20">Poin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, index) in section.items" :key="item.questionId">
                <td class="px-5 py-3 text-sm text-gray-600">{{ index + 1 }}</td>
                <td class="px-5 py-3 text-sm text-gray-800">{{ item.questionText }}</td>
                <td class="px-5 py-3 text-sm text-gray-600">{{ item.answerLabel }}</td>
                <td class="px-5 py-3 text-sm text-gray-600">{{ item.point }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <p class="text-sm text-gray-400">Data submission tidak ditemukan.</p>
    </div>
  </div>

  <!-- Modal konfirmasi export PDF -->
   <Transition name="fade">
    <div
      v-if="showExportPDFModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
      @click.self="showExportPDFModal = false"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg">
        <h2 class="text-base font-semibold text-gray-900 mb-2">Unduh hasil PDF?</h2>
        <p class="text-sm text-gray-500 leading-relaxed mb-6">
          Rekap jawaban {{ submission?.name }} akan diunduh dalam format .pdf.
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
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { exportLikertResultToPDF } from '@/utils/pdf-export'
import { useLikertStore } from '@/stores/likert'
import { useLikertCategoryStore } from '@/stores/likert-category'
import { useLikertSubmissionsStore } from '@/stores/likert-submissions'
import { useLikertQuestionsStore } from '@/stores/likert-questions'
import { LIKERT_SCALE_OPTIONS } from '@/apps/likert'


const route = useRoute()
const router = useRouter()
const likertId = route.params.id
const submissionId = route.params.submissionId

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
const exportingPDF = ref(false)

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

// code untuk override jawaban dengan label dari LIKERT_SCALE_OPTIONS (SS => Sangat Setuju)
const answerLabel = (value) => {
  const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === value)
  return opt?.label ?? value
}

const questionText = (questionId) => {
  const q = questions.value.find((q) => q.id === questionId)
  return q?.question ?? '(soal tidak ditemukan)'
}

const category = computed(() => {
  const score = submission.value?.totalScore ?? 0
  return (
    scales.value.find((c) => score >= c.min && score <= c.max) ||
    scales.value[scales.value.length - 1] ||
    null
  )
})

// adapter: ubah submission.submission (flat array) jadi format `sections`
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

function handleExportPDF() {
  exportLikertResultToPDF({
    likertName: currentLikert.value?.name,
    respondentName: submission.value.name,
    code: submission.value.code,
    totalScore: submission.value.totalScore,
    categoryLabel: category.value?.label || '-',
    categoryDescription: category.value?.description || '',
    sections: sections.value,
  })
}

onMounted(async () => {
  await Promise.all([
    submissionsStore.fetchSubmissionById(likertId, submissionId),
    questionsStore.fetchQuestions(likertId),
    categoryStore.fetchCategories(),
    likertStore.currentLikert ? Promise.resolve() : likertStore.getLikertById(likertId),
  ])
  
  scales.value = await likertStore.fetchLikertScales(likertId)
})
</script>