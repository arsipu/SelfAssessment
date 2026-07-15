<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <button @click="router.push({ name: 'admin-likert' })" class="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap cursor-pointer">
        Survei
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <button
        @click="router.push({ name: 'admin-likert-submissions', params: { id: likertId } })"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors truncate max-w-[120px] md:max-w-none cursor-pointer"
      >
        Submissions
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <span class="text-sm text-text-primary font-medium truncate max-w-[150px] md:max-w-none">{{ submission?.name ?? '...' }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-text-muted">Memuat data...</p>
    </div>

    <template v-else-if="submission">
      <!-- Info Responden -->
      <div class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h1 class="text-lg md:text-xl font-semibold text-text-primary">{{ submission.name }}</h1>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              @click="showExportPDFModal = true"
              class="text-xs px-3 py-2.5 md:py-1.5 rounded-md border border-border text-text-secondary hover:bg-surface-muted transition-colors h-10 flex-1 sm:flex-none cursor-pointer"
            >
              Unduh PDF
            </button>
            <span
              class="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
              :class="submission.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
            >
              {{ submission.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan' }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
          <div>
            <p class="text-text-muted text-xs mb-1">Sekolah</p>
            <p class="text-text-primary">{{ submission.school }}</p>
          </div>
          <div>
            <p class="text-text-muted text-xs mb-1">Kelas / Jurusan</p>
            <p class="text-text-primary">{{ submission.class }} - {{ submission.major }}</p>
          </div>
          <div>
            <p class="text-text-muted text-xs mb-1">Usia / Gender</p>
            <p class="text-text-primary">{{ submission.age }} tahun, {{ submission.gender }}</p>
          </div>
          <div>
            <p class="text-text-muted text-xs mb-1">Kode Tracking</p>
            <p class="text-text-primary font-mono">{{ submission.code }}</p>
          </div>
          <div v-if="submission.totalScore != null">
            <p class="text-text-muted text-xs mb-1">Total Skor</p>
            <p class="text-text-primary font-semibold">{{ submission.totalScore }}</p>
          </div>
          <div v-if="scalesLabel !== '-'">
            <p class="text-text-muted text-xs mb-1">Nilai</p>
            <p class="text-text-primary font-semibold">{{ scalesLabel }}</p>
          </div>
        </div>
      </div>

      <!-- Jawaban per kategori -->
      <div
        v-for="section in sections"
        :key="section.key"
        class="bg-surface border border-border rounded-xl overflow-hidden mb-4 md:mb-6 last:mb-0"
      >
        <div class="px-4 md:px-5 py-3 md:py-4 border-b border-border bg-surface-muted flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0"></span>
          <h2 class="text-sm font-medium text-text-primary">{{ section.label }}</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse table-fixed">
            <thead>
              <tr class="bg-surface border-b border-border">
                <th class="w-[8%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">No</th>
                <th class="w-[54%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Pertanyaan</th>
                <th class="w-[26%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Jawaban</th>
                <th class="w-[12%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Poin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="(item, index) in section.items" :key="item.questionId">
                <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ index + 1 }}</td>
                <td class="px-4 md:px-5 py-3 text-sm text-text-primary">{{ item.questionText }}</td>
                <td class="px-4 md:px-5 py-3 text-sm text-text-secondary whitespace-nowrap">{{ item.answerLabel }}</td>
                <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ item.point }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-text-muted">Data submission tidak ditemukan.</p>
    </div>
  </div>

  <!-- Modal konfirmasi export PDF -->
   <Transition name="fade">
    <div
      v-if="showExportPDFModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
      @click.self="showExportPDFModal = false"
    >
      <div class="bg-surface rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-lg flex flex-col max-h-[90vh]">
        <h2 class="text-base font-semibold text-text-primary mb-2">Unduh hasil PDF?</h2>
        <p class="text-sm text-text-secondary leading-relaxed mb-6">
          Rekap jawaban {{ submission?.name }} akan diunduh dalam format .pdf.
        </p>

        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <button
            @click="showExportPDFModal = false"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-instrument-soft transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="confirmExportPDF"
            :disabled="exportingPDF"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-instrument hover:bg-instrument-hover disabled:opacity-50 transition-colors h-10 cursor-pointer"
          >
            {{ exportingPDF ? 'Mengunduh...' : 'Ya, unduh' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
  <div style="position: fixed; left: -9999px; top: 0;">
    <ScoreCardTemplate
      ref="scoreCardRef"
      :likert-name="currentLikert?.name"
      :code="submission?.code"
      :respondent="{
        nama: submission?.name,
        kelas: submission?.class,
        sekolah: submission?.school,
        jurusan: submission?.major,
        usia: submission?.age,
        jenisKelamin: submission?.gender,
        pkl: submission?.internship,
      }"
      :total-score="submission?.totalScore"
      :scales-label="scalesLabel"
      :scales-description="scalesDescription"
    />
  </div>
</template>

<script setup>
import ScoreCardTemplate from '@/components/LikertScoreCardTemplate.vue'
import { exportResultToPDF } from '@/utils/likert-pdf-export'
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertCategoryStore } from '@/stores/likert/likert-category'
import { useLikertSubmissionsStore } from '@/stores/likert/likert-submissions'
import { useLikertQuestionsStore } from '@/stores/likert/likert-questions'
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
const scoreCardRef = ref(null)

const scalesLabel = computed(() => {
  const score = submission.value?.totalScore ?? 0
  const found = scales.value.find((s) => score >= s.min && score <= s.max)
  return found?.label || '-'
})

const scalesDescription = computed(() => {
  const score = submission.value?.totalScore ?? 0
  const found = scales.value.find((s) => score >= s.min && score <= s.max)
  return found?.description || ''
})

async function confirmExportPDF() {
  if (exportingPDF.value) return
  exportingPDF.value = true
  try {
    await exportResultToPDF({
      scoreCardElement: scoreCardRef.value.cardRef,
      sections: sections.value,
      filename: `hasil-${currentLikert.value?.name}-${submission.value?.name}.pdf`.replace(/\s+/g, '_'),
    })
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

onMounted(async () => {
  await Promise.all([
    submissionsStore.fetchSubmissionById(likertId, submissionId),
    questionsStore.fetchQuestions(likertId),
    categoryStore.fetchCategories(),
    likertStore.currentLikert ? Promise.resolve() : likertStore.getLikertById(likertId),
  ])
  
  scales.value = await likertStore.fetchLikertScales(likertId)
  console.log(scales.value)
})
</script>