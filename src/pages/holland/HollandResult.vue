<template>
  <div class="min-h-screen bg-bg">

    <div class="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div v-if="!result || loading" class="text-center text-sm text-text-muted py-20">
        Memuat hasil...
      </div>

      <div v-else class="space-y-6">
        <!-- Kartu kode dominan -->
        <div class="bg-surface border border-border rounded-2xl p-5 md:p-8 shadow-sm">
          <div class="text-center mb-8">
            <p class="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
              Hasil Holland RIASEC
            </p>
            <h1 class="text-base md:text-lg font-semibold text-text-primary">{{ respondentName }}</h1>
            <p class="text-xs text-text-muted mt-1 font-mono">
              Kode: <span class="font-semibold text-text-secondary">{{ result.code }}</span>
            </p>
          </div>

          <!-- Top Code -->
          <div class="flex flex-col items-center mb-8">
            <div class="text-4xl md:text-5xl font-bold tracking-widest text-text-primary mb-1">
              {{ result.topCode }}
            </div>
            <p class="text-xs text-text-muted">Kode minat dominan (3 kategori tertinggi)</p>
          </div>

          <!-- Riasec Hex Chart -->
           <div class="flex flex-col items-center mb-8">
            <div class="w-full max-w-[240px]">
              <RiasecHexChart 
                :scores="scorePercentMap" 
                :size="256"
                :label-font-size="14"
              />
            </div>
            <p class="text-[11px] text-text-muted mt-1 text-center max-w-[220px] leading-relaxed">
              Semakin jauh titik dari pusat, semakin tinggi kecenderungan minat.
            </p>
          </div>

          <!-- Deskripsi tiap kategori dalam topCode -->
          <div class="space-y-3">
            <div
              v-for="code in topCodeChars"
              :key="code"
              class="bg-surface-muted border border-border rounded-xl p-4"
            >
              <p class="text-sm font-semibold text-text-primary mb-1">
                {{ riasecInfo(code)?.label }} ({{ code }})
              </p>
              <p class="text-xs text-text-secondary leading-relaxed mb-3">{{ riasecInfo(code)?.description }}</p>

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
                  <div v-if="riasecInfo(code)?.skills?.length">
                    <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                      Keterampilan kunci
                    </p>
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="skill in riasecInfo(code).skills"
                        :key="skill"
                        class="text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-primary"
                      >
                        {{ skill }}
                      </span>
                    </div>
                  </div>

                  <div v-if="riasecInfo(code)?.careers?.length">
                    <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                      Contoh pekerjaan relevan
                    </p>
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="career in riasecInfo(code).careers"
                        :key="career"
                        class="text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-primary"
                      >
                        {{ career }}
                      </span>
                    </div>
                  </div>

                  <div v-if="riasecInfo(code)?.subjects?.length">
                    <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                      Mata pelajaran pendukung
                    </p>
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="subject in riasecInfo(code).subjects"
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

        <!-- Breakdown persentase per kategori -->
        <div class="bg-surface border border-border rounded-2xl p-5 md:p-6 shadow-sm">
          <p class="text-xs font-medium text-text-muted mb-4">Rincian skor per kategori</p>

          <div class="space-y-4">
            <div v-for="row in scoreBreakdown" :key="row.code">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-medium text-text-primary">
                  {{ riasecInfo(row.code)?.label }} ({{ row.code }})
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

        <!-- Tombol aksi -->
        <div class="flex flex-col md:flex-row gap-3">
          <button
            @click="showExportPDFModal = true"
            class="w-full md:flex-1 py-3 h-10 border border-border text-text-primary text-sm font-semibold rounded-xl hover:bg-surface-muted transition"
          >
            Unduh PDF
          </button>
          <router-link
            to="/"
            class="w-full md:flex-1 text-center py-3 h-10 bg-instrument text-text-on-primary text-sm font-semibold rounded-xl hover:bg-instrument-hover transition"
          >
            Selesai
          </router-link>
        </div>

        <!-- Rincian jawaban per soal -->
        <div class="bg-surface border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <button
            @click="showDetails = !showDetails"
            class="w-full flex items-center justify-between gap-2"
          >
            <p class="text-xs font-medium text-text-muted">Rincian jawaban</p>
            <svg
              class="w-4 h-4 text-text-muted transition-transform duration-200"
              :class="{ 'rotate-180': showDetails }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <Transition name="expand">
            <div v-if="showDetails" class="mt-4">
              <div v-for="section in answerSections" :key="section.key" class="mb-5 last:mb-0">
                <div class="flex items-center gap-2 mb-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                  <span class="text-xs font-medium text-text-secondary">
                    {{ riasecInfo(section.key)?.label }} ({{ section.key }})
                  </span>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="item in section.items"
                    :key="item.questionId"
                    class="py-2.5 px-3 rounded-lg bg-surface-muted"
                  >
                    <p class="text-sm text-text-primary leading-relaxed">{{ item.questionText }}</p>
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
      <div class="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-base font-semibold text-text-primary mb-2">Unduh hasil PDF?</h2>
        <p class="text-sm text-text-secondary leading-relaxed mb-6">
          Rekap hasil akan diunduh dalam format .pdf.
        </p>

        <div class="flex gap-3">
          <button
            @click="showExportPDFModal = false"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-instrument-soft transition-colors"
          >
            Batal
          </button>
          <button
            @click="confirmExportPDF"
            :disabled="exportingPDF"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-instrument hover:bg-instrument-hover disabled:opacity-50 transition-colors"
          >
            {{ exportingPDF ? 'Mengunduh...' : 'Ya, unduh' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Template tersembunyi khusus buat di-screenshot -->
  <div style="position: fixed; left: -9999px; top: 0;">
    <HollandScoreCardTemplate
      ref="scoreCardRef"
      holland-name="Holland RIASEC"
      :code="result?.code"
      :respondent="{
        name: result?.respondent?.name,
        school: result?.respondent?.school,
        major: result?.respondent?.major,
        birthDateAge: formattedBirthDateAge,
        gender: result?.respondent?.gender,
        occupation: result?.respondent?.occupation,
        testPurpose: result?.respondent?.testPurpose,
        testDate: result?.respondent?.testDate,
      }"
      :top-code="result?.topCode"
      :scales-label="topCodeChars.map((c) => riasecInfo(c)?.label).join(' · ')"
      :scales-description="topCodeChars.map((c) => riasecInfo(c)?.description).join(' ')"
      :scores="scorePercentMap"
      :riasec-labels="riasecLabelMap"
    />
  </div>
</template>

<script setup>
import HollandScoreCardTemplate from '@/components/HollandScoreCardTemplate.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHollandSessionStore } from '@/stores/holland/holland-session'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { exportHollandResultToPDF } from '@/utils/holland-pdf-export'
import { formatBirthDateAge, buildScoreBreakdown, buildAnswerSections } from '@/utils/holland-result'
import RiasecHexChart from '@/components/RiasecHexChart.vue'

const route = useRoute()
const router = useRouter()
const hollandSlug = route.params.slug
const hollandId = computed(() => hollandStore?.currentHolland?.id || null)

const hollandStore = useHollandStore()
const sessionStore = useHollandSessionStore()
const questionsStore = useHollandQuestionsStore()
const riasecStore = useHollandRiasecStore()

const loading = ref(true)
const expandedCodes = ref([])

const showExportPDFModal = ref(false)
const showDetails = ref(false)

const result = computed(() => sessionStore.getResult(hollandId.value))
const respondentName = computed(() => result.value?.respondentName || '-')

// map kode -> persentase, dipakai buat kirim ke RiasecHexChart
const scorePercentMap = computed(() => {
  const map = {}
  for (const row of scoreBreakdown.value) {
    map[row.code] = row.percentage
  }
  return map
})

const riasecLabelMap = computed(() => {
  const map = {}
  for (const item of riasecStore.riasecList) {
    map[item.id] = item.label
  }
  return map
})

// urutan huruf topCode ("SAE" -> ["S", "A", "E"]), dipakai buat nampilin
// deskripsi kategori dominan sesuai urutan skor tertinggi
const topCodeChars = computed(() => (result.value?.topCode || '').split(''))

// cari data 1 kategori (label, description, skills, careers, subjects)
// dari riasecList yang sudah di-fetch dari Firestore
function riasecInfo(code) {
  return riasecStore.riasecList.find((r) => r.id === code) || null
}

const formattedBirthDateAge = computed(() =>
  formatBirthDateAge(result.value?.respondent)
)

function toggleExpandedCode(code) {
  const idx = expandedCodes.value.indexOf(code)
  if (idx === -1) {
    expandedCodes.value.push(code)
  } else {
    expandedCodes.value.splice(idx, 1)
  }
}

// breakdown semua 6 kategori buat progress bar, diurutkan dari persentase tertinggi
const scoreBreakdown = computed(() => {
  const scores = result.value?.scores || {}
  return buildScoreBreakdown(scores, result.value?.topCode)
})

// rincian jawaban per kategori, pakai teks soal dari questions store
const answerSections = computed(() =>
  buildAnswerSections({
    answers: result.value?.answers,
    questions: questionsStore.allQuestions,
    riasecInfo,
  })
)

onMounted(async () => {
  if (!result.value) {
    router.replace({ name: 'holland-form', params: { slug: hollandSlug } })
    return
  }

  loading.value = true
  try {
    await Promise.all([
      riasecStore.fetchRiasecList(hollandId.value),
      questionsStore.fetchAllQuestions(hollandId.value),
    ])
  } finally {
    loading.value = false
  }
})

const scoreCardRef = ref(null)
const exportingPDF = ref(false)

async function handleExportPDF() {
  await exportHollandResultToPDF({
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