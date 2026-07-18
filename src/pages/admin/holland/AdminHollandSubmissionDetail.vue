<template>
  <div>
    <!-- Breadcrumb -->
    <div class="pdf-breadcrumb flex items-center gap-2 mb-4 flex-wrap">
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
      <!-- Tambahkan ref="pdfContent" pada elemen wrapper utamanya -->
      <div ref="pdfContent" class="pdf-export-wrapper print-area">

        <!-- Alert untuk submission yang belum selesai -->
        <div
          v-if="!isCompleted"
          class="pdf-alert-warning bg-warning-soft border border-warning-30 rounded-xl p-4 md:p-5 mb-4 md:mb-6"
        >
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-warning">Responden belum menyelesaikan tes</p>
              <p class="text-xs text-warning-80 mt-1">
                Data skor, kode RIASEC, dan rincian jawaban belum tersedia karena responden masih dalam tahap mengerjakan kuesioner.
              </p>
            </div>
          </div>
        </div>

        <!-- Info Responden -->
        <div class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h1 class="text-lg md:text-xl font-semibold text-text-primary">{{ submission.name }}</h1>
            <div class="pdf-actions flex items-center gap-2 w-full sm:w-auto">
              <button
                v-if="isCompleted"
                @click="showExportPDFModal = true"
                class="print:hidden text-xs px-3 py-2.5 md:py-1.5 rounded-md border border-border text-text-secondary hover:bg-surface-muted transition-colors h-10 flex-1 sm:flex-none cursor-pointer"
              >
                Unduh PDF
              </button>
              <span
                class="print:hidden text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
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

        <!-- Skor & Diagram RIASEC -->
        <div
          v-if="scoreBreakdown.length"
          class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6"
        >
          <div class="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 items-center">
            <!-- Rincian skor -->
            <div class="md:col-span-3">
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

            <!-- Diagram hexagon -->
            <div
              v-if="isCompleted && Object.keys(scorePercentMap).length"
              class="md:col-span-2 flex flex-col items-center border-t border-border pt-6 md:border-t-0 md:pt-0 md:border-l md:pl-8"
            >
              <p class="text-xs font-medium text-text-muted mb-4 text-center">Diagram RIASEC</p>
              <div class="w-full max-w-[220px]">
                <RiasecHexChart
                  :scores="scorePercentMap"
                  :size="220"
                  :label-font-size="13"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Detail keterampilan, pekerjaan, dan mata pelajaran untuk kode dominan (1 kode teratas) -->
        <div v-if="submission.topCode && topCodeInfo" class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <p class="text-xs font-medium text-text-muted mb-4">Detail minat dominan</p>

          <div class="bg-surface-muted border border-border rounded-xl p-4 avoid-break">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-semibold text-text-primary">
                {{ topCodeInfo.label || RIASEC_GUIDE_FALLBACK[submission.topCode]?.label }} ({{ submission.topCode }})
              </p>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed mb-3">
              {{ topCodeInfo.description || RIASEC_GUIDE_FALLBACK[submission.topCode]?.description }}
            </p>

            <div v-if="(topCodeInfo.skills || RIASEC_GUIDE_FALLBACK[submission.topCode]?.skills)?.length" class="mb-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                Keterampilan kunci
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="skill in (topCodeInfo.skills || RIASEC_GUIDE_FALLBACK[submission.topCode]?.skills)"
                  :key="skill"
                  class="inline-flex items-center justify-center text-xs px-2.5 py-1.5 rounded-md bg-surface border border-border text-text-primary"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <div v-if="(topCodeInfo.careers || RIASEC_GUIDE_FALLBACK[submission.topCode]?.careers)?.length" class="mb-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                Contoh pekerjaan relevan
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="career in (topCodeInfo.careers || RIASEC_GUIDE_FALLBACK[submission.topCode]?.careers)"
                  :key="career"
                  class="inline-flex items-center justify-center text-xs px-2.5 py-1.5 rounded-md bg-surface border border-border text-text-primary"
                >
                  {{ career }}
                </span>
              </div>
            </div>

            <div v-if="(topCodeInfo.subjects || RIASEC_GUIDE_FALLBACK[submission.topCode]?.subjects)?.length">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                Mata pelajaran pendukung
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="subject in (topCodeInfo.subjects || RIASEC_GUIDE_FALLBACK[submission.topCode]?.subjects)"
                  :key="subject"
                  class="inline-flex items-center justify-center text-xs px-2.5 py-1.5 rounded-md bg-surface border border-border text-text-primary"
                >
                  {{ subject }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Rincian jawaban per kategori -->
        <div v-if="isCompleted && detailSections.length" class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <p class="text-xs font-medium text-text-muted mb-4">Rincian jawaban per kategori</p>

          <div class="space-y-4">
            <div
              v-for="section in detailSections"
              :key="section.key"
              class="bg-surface-muted border border-border rounded-xl p-4 md:p-6 avoid-break"
            >
              <div class="flex items-center gap-2 mb-4">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: section.dot }"
                ></span>
                <span class="text-sm font-semibold text-text-primary">{{ section.label }}</span>
                <span class="text-xs text-text-muted">({{ section.code }})</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  v-for="col in section.columns"
                  :key="col.key"
                  class="md:border-l md:border-border md:pl-6 md:first:border-l-0 md:first:pl-0"
                >
                  <p class="text-xs font-semibold text-text-secondary mb-2">{{ col.label }}</p>

                  <div class="space-y-2">
                    <div
                      v-for="q in col.questions"
                      :key="q.id"
                      class="flex items-start gap-2.5 rounded-lg p-2.5 border transition-colors avoid-break"
                      :class="answeredIds.has(q.id)
                        ? 'border-instrument bg-instrument-soft'
                        : 'border-border bg-surface-muted-40'"
                    >
                      <span
                        class="mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border"
                        :class="answeredIds.has(q.id) ? 'bg-instrument border-instrument' : 'border-border'"
                      >
                        <svg
                          v-if="answeredIds.has(q.id)"
                          class="w-3 h-3 text-text-on-primary"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span
                        class="text-xs leading-relaxed"
                        :class="answeredIds.has(q.id) ? 'text-text-primary' : 'text-text-muted'"
                      >
                        {{ q.question }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> <!-- Tutup div ref="pdfContent" -->
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
            @click="handlePrint()"
            :disabled="exportingPDF"
            class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-instrument hover:bg-instrument-hover disabled:opacity-50 transition-colors h-10 cursor-pointer"
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
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { RIASEC_GUIDE as RIASEC_GUIDE_FALLBACK, HOLLAND_COLUMNS } from '@/apps/holland'
import { formatBirthDateAge, buildScoreBreakdown, buildAnswerSections } from '@/utils/holland-result'
import { exportToPDF } from '@/utils/holland-pdf-export-v2'
import RiasecHexChart from '@/components/RiasecHexChart.vue'


const pdfContent = ref(null) // ref untuk elemen yang akan diekspor ke PDF

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

const isCompleted = computed(() =>
  submission.value?.status === 'completed'
)

// data 1 kategori dominan (label, description, skills, careers, subjects)
const topCodeInfo = computed(() => {
  const code = submission.value?.topCode
  if (!code) return null
  return riasecMap.value[code] || null
})

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

const answeredIds = computed(() => {
  return new Set((submission.value?.answers || []).map((a) => a.questionId))
})

const dotColors = [
  'var(--color-viz-1)',
  'var(--color-viz-2)',
  'var(--color-viz-3)',
  'var(--color-viz-4)',
  'var(--color-viz-5)',
  'var(--color-viz-6)',
]

// Rincian jawaban buat tampilan layar: SEMUA soal per kategori & kolom
// (bukan cuma yang dipilih), ditandai lewat answeredIds.
const detailSections = computed(() => {
  return riasecStore.riasecList
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

// map kode -> persentase, dipakai buat hexagon chart
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
  if (!pdfContent.value) return;

  exportingPDF.value = true;
  
  try {
    // Tentukan nama file yang dinamis, misal: Hasil_Holland_Budi.pdf
    const fileName = `Hasil_Holland_${submission.value?.name?.replace(/\s+/g, '_') || 'Responden'}.pdf`;
    
    // Tambahkan class untuk styling PDF sebelum export
    pdfContent.value.classList.add('pdf-exporting');
    
    // Beri waktu untuk Vue merender perubahan
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Panggil fungsi ekspor dari file utilitas js tadi
    await exportToPDF(pdfContent.value, fileName);
    
    // Hapus class setelah export
    pdfContent.value.classList.remove('pdf-exporting');
    
    // Tutup modal jika sukses
    showExportPDFModal.value = false;
  } catch (error) {
    console.error('Gagal mengekspor PDF:', error);
    alert('Terjadi kesalahan saat mengekspor PDF.');
    
    // Hapus class jika terjadi error
    if (pdfContent.value) {
      pdfContent.value.classList.remove('pdf-exporting');
    }
  } finally {
    exportingPDF.value = false;
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


function handlePrint() {
  window.print()
  // Tutup modal jika sukses
  showExportPDFModal.value = false;
}


</script>

<style scoped>
/* Tambahkan class ini */
.avoid-break {
  break-inside: avoid;
  page-break-inside: avoid;
}


@media print {
  body * {
    visibility: hidden;
  }
  .print-area, .print-area * {
    visibility: visible;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>