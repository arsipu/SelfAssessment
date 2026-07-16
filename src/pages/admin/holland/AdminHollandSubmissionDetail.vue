<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <button @click="router.push({ name: 'admin-holland' })" class="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap cursor-pointer">
        Holland RIASEC
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <button
        @click="router.push({ name: 'admin-holland-questions', params: { slug: hollandSlug } })"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap cursor-pointer"
      >
        Pertanyaan
      </button>
      <span class="text-text-muted shrink-0">/</span>
      <button
        @click="router.push({ name: 'admin-holland-submissions', params: { slug: hollandSlug } })"
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
      <!-- Alert untuk submission yang belum selesai -->
      <div
        v-if="!isCompleted"
        class="bg-warning-soft border border-warning/30 rounded-xl p-4 md:p-5 mb-4 md:mb-6"
      >
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p class="text-sm font-medium text-warning">Responden belum menyelesaikan tes</p>
            <p class="text-xs text-warning/80 mt-1">
              Data skor, kode RIASEC, dan rincian jawaban belum tersedia karena responden masih dalam tahap mengerjakan kuesioner.
            </p>
          </div>
        </div>
      </div>

      <!-- Info Responden -->
      <div class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h1 class="text-lg md:text-xl font-semibold text-text-primary">{{ submission.name }}</h1>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              v-if="isCompleted"
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
            <p class="text-text-muted text-xs mb-1">Sekolah / Universitas</p>
            <p class="text-text-primary">{{ submission.school }}</p>
          </div>
          <div>
            <p class="text-text-muted text-xs mb-1">Jurusan</p>
            <p class="text-text-primary">{{ submission.major }}</p>
          </div>
          <div>
            <p class="text-text-muted text-xs mb-1">Tanggal Lahir/Usia / Gender</p>
            <p class="text-text-primary">{{ submission.age }} tahun, {{ submission.gender === 'L' ? 'Laki-laki' : 'Perempuan' }}</p>
          </div>
          <div>
            <p class="text-text-muted text-xs mb-1">Kode Tracking</p>
            <p class="text-text-primary font-mono">{{ submission.code }}</p>
          </div>
          <div v-if="submission.occupation">
            <p class="text-text-muted text-xs mb-1">Pekerjaan</p>
            <p class="text-text-primary">{{ submission.occupation }}</p>
          </div>
          <div v-if="submission.testPurpose">
            <p class="text-text-muted text-xs mb-1">Tujuan Tes</p>
            <p class="text-text-primary">{{ submission.testPurpose }}</p>
          </div>
          <div v-if="submission.topCode">
            <p class="text-text-muted text-xs mb-1">Kode RIASEC</p>
            <p class="text-text-primary font-semibold tracking-wide">{{ submission.topCode }}</p>
          </div>
        </div>
      </div>

      <!-- Breakdown skor per kategori -->
      <div v-if="scoreBreakdown.length" class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
        <p class="text-xs font-medium text-text-muted mb-4">Rincian skor per kategori</p>

        <div class="space-y-4">
          <div v-for="row in scoreBreakdown" :key="row.code">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm font-medium text-text-primary">
                {{ riasecMap[row.code]?.label || RIASEC_GUIDE_FALLBACK[row.code]?.label }} ({{ row.code }})
              </span>
              <span class="text-xs text-text-muted">
                {{ row.count }}/{{ row.total }} · {{ row.percentage }}%
              </span>
            </div>
            <div class="h-1.5 bg-surface-muted rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="row.isTop ? 'bg-instrument' : 'bg-border'"
                :style="{ width: row.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <p class="text-[11px] text-text-muted mt-4 leading-relaxed">
          Persentase dihitung dari jumlah pernyataan yang dipilih dibagi total pernyataan pada
          kategori tersebut, karena jumlah pernyataan tiap kategori tidak sama.
        </p>
      </div>

      <!-- Detail keterampilan, pekerjaan, dan mata pelajaran untuk kode dominan -->
      <div v-if="topCodeChars.length" class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
        <p class="text-xs font-medium text-text-muted mb-4">Detail minat dominan</p>

        <div class="space-y-3">
          <div
            v-for="code in topCodeChars"
            :key="code"
            class="bg-surface-muted border border-border rounded-xl p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-semibold text-text-primary">
                {{ riasecMap[code]?.label || RIASEC_GUIDE_FALLBACK[code]?.label }} ({{ code }})
              </p>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed mb-3">
              {{ riasecMap[code]?.description || RIASEC_GUIDE_FALLBACK[code]?.description }}
            </p>

            <button
              @click="toggleExpandedCode(code)"
              class="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              {{ expandedCodes.includes(code) ? 'Sembunyikan detail' : 'Lihat keterampilan & rekomendasi' }}
              <svg
                class="w-3.5 h-3.5 transition-transform duration-200"
                :class="{ 'rotate-180': expandedCodes.includes(code) }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <Transition name="expand">
              <div v-if="expandedCodes.includes(code)" class="mt-3 pt-3 border-t border-border space-y-3">
                <div v-if="(riasecMap[code]?.skills || RIASEC_GUIDE_FALLBACK[code]?.skills)?.length">
                  <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                    Keterampilan kunci
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="skill in (riasecMap[code]?.skills || RIASEC_GUIDE_FALLBACK[code]?.skills)"
                      :key="skill"
                      class="text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-primary"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </div>

                <div v-if="(riasecMap[code]?.careers || RIASEC_GUIDE_FALLBACK[code]?.careers)?.length">
                  <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                    Contoh pekerjaan relevan
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="career in (riasecMap[code]?.careers || RIASEC_GUIDE_FALLBACK[code]?.careers)"
                      :key="career"
                      class="text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-primary"
                    >
                      {{ career }}
                    </span>
                  </div>
                </div>

                <div v-if="(riasecMap[code]?.subjects || RIASEC_GUIDE_FALLBACK[code]?.subjects)?.length">
                  <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                    Mata pelajaran pendukung
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="subject in (riasecMap[code]?.subjects || RIASEC_GUIDE_FALLBACK[code]?.subjects)"
                      :key="subject"
                      class="text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-primary"
                    >
                      {{ subject }}
                    </span>
                  </div>
                </div>
              </div>
            </Transition>
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
          <h2 class="text-sm font-medium text-text-primary">{{ riasecMap[section.key]?.label || RIASEC_GUIDE_FALLBACK[section.key]?.label }} ({{ section.key }})</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse table-fixed">
            <thead>
              <tr class="bg-surface border-b border-border">
                <th class="w-[8%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">No</th>
                <th class="w-[60%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Pernyataan</th>
                <th class="w-[32%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Kolom</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="(item, index) in section.items" :key="item.questionId">
                <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ index + 1 }}</td>
                <td class="px-4 md:px-5 py-3 text-sm text-text-primary">{{ item.questionText }}</td>
                <td class="px-4 md:px-5 py-3 text-sm text-text-secondary whitespace-nowrap">{{ columnLabel(item.column) }}</td>
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
          Rekap hasil {{ submission?.name }} akan diunduh dalam format .pdf.
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
    <HollandScoreCardTemplate
      ref="scoreCardRef"
      holland-name="Holland RIASEC"
      :code="submission?.code"
      :respondent="{
        name: submission?.name,
        school: submission?.school,
        major: submission?.major,
        birthDateAge: formattedBirthDateAge,
        gender: submission?.gender,
        occupation: submission?.occupation,
        testPurpose: submission?.testPurpose,
        testDate: submission?.testDate,
      }"
      :top-code="submission?.topCode"
      :scales-label="topCodeChars.map((c) => (riasecMap[c]?.label || RIASEC_GUIDE_FALLBACK[c]?.label)).join(' · ')"
      :scales-description="topCodeChars.map((c) => (riasecMap[c]?.description || RIASEC_GUIDE_FALLBACK[c]?.description)).join(' ')"
      :scores="scorePercentMap"
      :riasec-labels="riasecLabelMap"
    />
  </div>
</template>

<script setup>
import HollandScoreCardTemplate from '@/components/HollandScoreCardTemplate.vue'
import { exportHollandResultToPDF } from '@/utils/holland-pdf-export'
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { RIASEC_GUIDE as RIASEC_GUIDE_FALLBACK, HOLLAND_COLUMNS } from '@/apps/holland'
import { formatBirthDateAge, buildScoreBreakdown, buildAnswerSections } from '@/utils/holland-result'

const route = useRoute()
const router = useRouter()
const hollandSlug = route.params.slug
const hollandId = ref(null)
const submissionSlug = route.params.submissionSlug

const hollandStore = useHollandStore()
const submissionsStore = useHollandSubmissionsStore()
const questionsStore = useHollandQuestionsStore()
const riasecStore = useHollandRiasecStore()

const { currentSubmission: submission, loading } = storeToRefs(submissionsStore)
const { allQuestions } = storeToRefs(questionsStore)

const showExportPDFModal = ref(false)
const exportingPDF = ref(false)
const scoreCardRef = ref(null)

const isCompleted = computed(() =>
  submission.value?.status === 'completed'
)

// urutan huruf topCode ("SAE" -> ["S", "A", "E"])
const topCodeChars = computed(() => (submission.value?.topCode || '').split(''))

// riasecMap[code] -> { label, description, skills, careers } dari Firestore
const riasecMap = computed(() => {
  const map = {}
  for (const item of riasecStore.riasecList) {
    map[item.id] = item
  }
  return map
})

const formattedBirthDateAge = computed(() =>
  formatBirthDateAge(submission.value)
)

// breakdown semua 6 kategori buat progress bar, diurutkan dari persentase tertinggi
const scoreBreakdown = computed(() => {
  return buildScoreBreakdown(submission.value?.scores, submission.value?.topCode)
})

const expandedCodes = ref([])

function toggleExpandedCode(code) {
  const idx = expandedCodes.value.indexOf(code)
  if (idx === -1) {
    expandedCodes.value.push(code)
  } else {
    expandedCodes.value.splice(idx, 1)
  }
}

const columnLabel = (columnKey) => HOLLAND_COLUMNS.find((c) => c.key === columnKey)?.label || columnKey

// kelompokkan answers submission per kategori
// rincian jawaban per kategori, pakai teks soal dari questions store
const sections = computed(() =>
  buildAnswerSections({
    answers: submission.value?.answers,
    questions: allQuestions.value,
    riasecInfo: (code) =>
      riasecMap.value[code] || RIASEC_GUIDE_FALLBACK[code],
  })
)

// map kode -> persentase, dipakai buat hexagon chart di PDF
const scorePercentMap = computed(() => {
  const map = {}
  for (const row of scoreBreakdown.value) {
    map[row.code] = row.percentage
  }
  return map
})

// map kode -> label, fallback ke RIASEC_GUIDE kalau riasecMap Firestore belum ada
const riasecLabelMap = computed(() => {
  const map = {}
  for (const code of Object.keys(RIASEC_GUIDE_FALLBACK)) {
    map[code] = riasecMap.value[code]?.label || RIASEC_GUIDE_FALLBACK[code]?.label
  }
  return map
})

async function confirmExportPDF() {
  if (exportingPDF.value) return
  exportingPDF.value = true
  try {
    await exportHollandResultToPDF({
      scoreCardElement: scoreCardRef.value.cardRef,
      sections: sections.value,
      filename: `hasil-holland-${submission.value?.name}.pdf`.replace(/\s+/g, '_'),
    })
    showExportPDFModal.value = false
  } finally {
    exportingPDF.value = false
  }
}

onMounted(async () => {
  const holland = await hollandStore.getHollandBySlug(hollandSlug)
  
  if (!holland) {
    router.push({ name: 'admin-holland' })
    return
  }
  
  hollandId.value = holland.id
  await Promise.all([
    // submissionsStore.fetchSubmissionById(hollandId.value, submissionId),
    submissionsStore.fetchSubmissionBySlug(hollandId.value, submissionSlug),
    riasecStore.fetchRiasecList(hollandId.value),
    questionsStore.fetchAllQuestions(hollandId.value),
  ])
})
</script>