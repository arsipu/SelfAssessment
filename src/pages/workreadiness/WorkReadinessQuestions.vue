<template>
  <div class="min-h-screen bg-gray-50">
    <AppTopBar />

    <div class="max-w-2xl mx-auto px-4 py-10">

      <!-- Header -->
      <div class="mb-6">
        <router-link to="/workreadiness-form" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Kembali
        </router-link>
        <!-- <button @click="goBack" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Kembali
        </button> -->
        <h1 class="text-xl font-medium text-gray-900 mt-3">Work Readiness Scale</h1>
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

      <!-- Dimensi sections -->
      <div v-for="section in sections" :key="section.key" class="mb-6">
        <!-- Section header -->
        <div class="flex items-center gap-3 mb-3">
          <div class="h-px flex-1 bg-gray-200"></div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="w-2 h-2 rounded-full" :class="section.dot"></span>
            <span class="text-xs font-medium text-gray-500">{{ section.label }}</span>
          </div>
          <div class="h-px flex-1 bg-gray-200"></div>
        </div>

        <!-- Question cards -->
        <div class="space-y-3">
          <div
            v-for="q in section.questions"
            :key="q.id"
            class="bg-white border rounded-xl p-4 transition-colors"
            :class="answers[q.id] ? 'border-gray-200' : 'border-gray-200'"
          >
            <div class="flex items-start gap-3 mb-3">
              <span class="text-xs font-medium text-gray-400 mt-0.5 w-6 shrink-0">{{ q.id }}.</span>
              <p class="text-sm text-gray-800 leading-relaxed">{{ q.text }}</p>
            </div>

            <!-- Scale buttons -->
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
import { ref, computed } from 'vue'
import AppTopBar from '@/components/AppTopBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

// ─── Scale options ───────────────────────────────────────────────
const scaleOptions = [
  { value: 'SS', label: 'SS' },
  { value: 'S',  label: 'S'  },
  { value: 'TS', label: 'TS' },
  { value: 'STS', label: 'STS' },
]

// ─── Questions (nanti diganti fetch dari Firestore) ───────────────
// Struktur tiap soal: { id, text, dimension, favorable }
const questions = [
  // Personal Characteristics (1-22) — mostly Unfavorable
  { id: 1,  text: 'Saya mudah memasukkan perasaan pribadi ketika menghadapi masalah.', dimension: 'personal', favorable: false },
  { id: 2,  text: 'Saya tidak tahan terhadap kritik dari orang lain.', dimension: 'personal', favorable: false },
  { id: 3,  text: 'Saya mudah stres ketika harus mengerjakan banyak hal.', dimension: 'personal', favorable: false },
  { id: 4,  text: 'Saya tidak menyukai kritik yang diberikan kepada saya.', dimension: 'personal', favorable: false },
  { id: 5,  text: 'Saya merasa nyaman berbicara dengan guru, pembimbing, atau atasan.', dimension: 'personal', favorable: true },
  { id: 6,  text: 'Saya kesulitan memulai tugas yang harus saya kerjakan.', dimension: 'personal', favorable: false },
  { id: 7,  text: 'Saya kesulitan menghadapi banyak tuntutan dalam waktu yang sama.', dimension: 'personal', favorable: false },
  { id: 8,  text: 'Saya mudah tersinggung.', dimension: 'personal', favorable: false },
  { id: 9,  text: 'Saya tidak yakin kapan harus berbicara atau diam.', dimension: 'personal', favorable: false },
  { id: 10, text: 'Saya tidak nyaman bertanya ketika tidak memahami sesuatu.', dimension: 'personal', favorable: false },
  { id: 11, text: 'Saya mudah kewalahan ketika menghadapi tantangan.', dimension: 'personal', favorable: false },
  { id: 12, text: 'Saya tidak suka jika cara kerja saya diubah.', dimension: 'personal', favorable: false },
  { id: 13, text: 'Saya merasa kesal jika orang lain mengubah cara yang sudah saya atur.', dimension: 'personal', favorable: false },
  { id: 14, text: 'Saya kesulitan menghadapi situasi sosial yang baru.', dimension: 'personal', favorable: false },
  { id: 15, text: 'Saya kesulitan memahami ide atau konsep yang abstrak.', dimension: 'personal', favorable: false },
  { id: 16, text: 'Saya ragu dapat mencapai tujuan yang telah saya tetapkan.', dimension: 'personal', favorable: false },
  { id: 17, text: 'Saya cenderung menghakimi orang lain.', dimension: 'personal', favorable: false },
  { id: 18, text: 'Saya merasa lebih unggul dibandingkan orang lain.', dimension: 'personal', favorable: false },
  { id: 19, text: 'Saya kesulitan membangun kepercayaan dengan orang lain.', dimension: 'personal', favorable: false },
  { id: 20, text: 'Saya kesulitan mengerjakan banyak hal sekaligus.', dimension: 'personal', favorable: false },
  { id: 21, text: 'Saya tidak menyukai perubahan.', dimension: 'personal', favorable: false },
  { id: 22, text: 'Saya tidak suka mempelajari hal-hal baru.', dimension: 'personal', favorable: false },

  // Organisational Acumen (23-41) — all Favorable
  { id: 23, text: 'Saya belajar dari teman atau rekan yang bekerja bersama saya.', dimension: 'organisational', favorable: true },
  { id: 24, text: 'Saya belajar dari orang yang lebih berpengalaman.', dimension: 'organisational', favorable: true },
  { id: 25, text: 'Saya menghargai pengalaman orang yang telah lama bekerja.', dimension: 'organisational', favorable: true },
  { id: 26, text: 'Saya berusaha memahami aturan dan proses di sekolah maupun tempat kerja.', dimension: 'organisational', favorable: true },
  { id: 27, text: 'Saya berusaha mempelajari sebanyak mungkin tentang organisasi atau tempat kerja.', dimension: 'organisational', favorable: true },
  { id: 28, text: 'Saya menghormati teman dan rekan kerja.', dimension: 'organisational', favorable: true },
  { id: 29, text: 'Saya mengikuti perkembangan dunia usaha dan industri.', dimension: 'organisational', favorable: true },
  { id: 30, text: 'Saya bertanggung jawab atas keputusan dan tindakan saya.', dimension: 'organisational', favorable: true },
  { id: 31, text: 'Saya menghormati guru, pembimbing, dan atasan.', dimension: 'organisational', favorable: true },
  { id: 32, text: 'Saya memahami bahwa isu dunia dapat memengaruhi pekerjaan.', dimension: 'organisational', favorable: true },
  { id: 33, text: 'Saya terbuka untuk belajar dan berkembang.', dimension: 'organisational', favorable: true },
  { id: 34, text: 'Saya antusias mengerjakan pekerjaan yang diberikan.', dimension: 'organisational', favorable: true },
  { id: 35, text: 'Saya selalu berusaha memperbaiki diri.', dimension: 'organisational', favorable: true },
  { id: 36, text: 'Saya memahami bahwa nilai dan budaya memengaruhi organisasi.', dimension: 'organisational', favorable: true },
  { id: 37, text: 'Saya menganggap umpan balik sebagai kesempatan belajar.', dimension: 'organisational', favorable: true },
  { id: 38, text: 'Saya senang menyelesaikan tugas dan mencapai hasil.', dimension: 'organisational', favorable: true },
  { id: 39, text: 'Saya tidak sabar untuk mulai bekerja dan mencoba hal baru.', dimension: 'organisational', favorable: true },
  { id: 40, text: 'Saya bersedia memulai karier dari posisi awal.', dimension: 'organisational', favorable: true },
  { id: 41, text: 'Saya percaya bahwa mendengarkan dan belajar lebih penting daripada menunjukkan kemampuan.', dimension: 'organisational', favorable: true },

  // Work Competence (42-56) — all Favorable
  { id: 42, text: 'Saya percaya pada pengetahuan yang telah saya pelajari.', dimension: 'competence', favorable: true },
  { id: 43, text: 'Saya memiliki pemahaman teori yang baik mengenai bidang saya.', dimension: 'competence', favorable: true },
  { id: 44, text: 'Orang lain sering meminta ide atau saran dari saya.', dimension: 'competence', favorable: true },
  { id: 45, text: 'Saya percaya diri dengan kemampuan teknis yang saya miliki.', dimension: 'competence', favorable: true },
  { id: 46, text: 'Saya memahami kelebihan dan kekurangan diri saya.', dimension: 'competence', favorable: true },
  { id: 47, text: 'Saya tetap tenang ketika berada di bawah tekanan.', dimension: 'competence', favorable: true },
  { id: 48, text: 'Keberhasilan dalam pekerjaan sangat penting bagi saya.', dimension: 'competence', favorable: true },
  { id: 49, text: 'Saya mampu menerapkan pengetahuan yang saya pelajari ke dunia kerja.', dimension: 'competence', favorable: true },
  { id: 50, text: 'Saya mampu menghadapi banyak tuntutan pekerjaan.', dimension: 'competence', favorable: true },
  { id: 51, text: 'Saya menetapkan standar yang tinggi untuk diri saya.', dimension: 'competence', favorable: true },
  { id: 52, text: 'Saya mampu menganalisis dan memecahkan masalah yang rumit.', dimension: 'competence', favorable: true },
  { id: 53, text: 'Saya memiliki minat dan semangat yang tinggi pada bidang yang saya pelajari.', dimension: 'competence', favorable: true },
  { id: 54, text: 'Menjadi yang terbaik dalam bidang saya merupakan hal yang penting.', dimension: 'competence', favorable: true },
  { id: 55, text: 'Saya teliti dan memperhatikan detail.', dimension: 'competence', favorable: true },
  { id: 56, text: 'Saya memiliki pandangan hidup yang matang.', dimension: 'competence', favorable: true },

  // Social Intelligence (57-64) — all Favorable
  { id: 57, text: 'Saya mudah beradaptasi dengan situasi sosial yang berbeda.', dimension: 'social', favorable: true },
  { id: 58, text: 'Saya mudah menjalin hubungan dengan orang lain.', dimension: 'social', favorable: true },
  { id: 59, text: 'Saya memiliki sikap terbuka dan ramah.', dimension: 'social', favorable: true },
  { id: 60, text: 'Saya dapat mengekspresikan diri dengan mudah.', dimension: 'social', favorable: true },
  { id: 61, text: 'Saya mampu berbicara secara spontan di depan orang lain.', dimension: 'social', favorable: true },
  { id: 62, text: 'Saya mudah menyesuaikan diri dengan situasi baru.', dimension: 'social', favorable: true },
  { id: 63, text: 'Saya mampu memahami bahasa tubuh atau ekspresi orang lain.', dimension: 'social', favorable: true },
  { id: 64, text: 'Saya mampu bekerja sama dalam kelompok.', dimension: 'social', favorable: true },
]

// ─── Sections config ──────────────────────────────────────────────
const sections = [
  {
    key: 'personal',
    label: 'Personal Characteristics',
    dot: 'bg-rose-400',
    questions: questions.filter(q => q.dimension === 'personal'),
  },
  {
    key: 'organisational',
    label: 'Organisational Acumen',
    dot: 'bg-blue-400',
    questions: questions.filter(q => q.dimension === 'organisational'),
  },
  {
    key: 'competence',
    label: 'Work Competence',
    dot: 'bg-purple-400',
    questions: questions.filter(q => q.dimension === 'competence'),
  },
  {
    key: 'social',
    label: 'Social Intelligence',
    dot: 'bg-teal-400',
    questions: questions.filter(q => q.dimension === 'social'),
  },
]

// ─── Answers state ────────────────────────────────────────────────
// { [questionId]: 'SS' | 'S' | 'TS' | 'STS' }
const answers = ref({})

// ─── Computed ─────────────────────────────────────────────────────
const answeredCount = computed(() => Object.keys(answers.value).length)
const unansweredCount = computed(() => questions.length - answeredCount.value)
const progressPct = computed(() => (answeredCount.value / questions.length) * 100)

// ─── Submit ───────────────────────────────────────────────────────
// Skor: SS=4, S=3, TS=2, STS=1
// Untuk unfavorable: SS=1, S=2, TS=3, STS=4 (reverse)
const scoreMap     = { SS: 4, S: 3, TS: 2, STS: 1 }
const scoreMapRev  = { SS: 1, S: 2, TS: 3, STS: 4 }

const handleSubmit = () => {
  const result = questions.map(q => {
    const raw = answers.value[q.id]
    const score = q.favorable ? scoreMap[raw] : scoreMapRev[raw]
    return { id: q.id, dimension: q.dimension, favorable: q.favorable, raw, score }
  })

  const totalScore = result.reduce((sum, r) => sum + r.score, 0)

  // TODO: kirim ke Firestore
  console.log('Hasil:', result)
  console.log('Total skor:', totalScore)

  alert(`Jawaban terkirim!\nTotal skor: ${totalScore}`)
}


</script>