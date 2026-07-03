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
          <span
            class="text-xs px-2.5 py-1 rounded-full font-medium"
            :class="submission.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
          >
            {{ submission.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan' }}
          </span>
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
        </div>
      </div>

      <!-- Jawaban -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 class="text-sm font-medium text-gray-800">Detail Jawaban</h2>
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
              <tr v-for="(item, index) in submission.submission" :key="item.questionId">
                <td class="px-5 py-3 text-sm text-gray-600">{{ index + 1 }}</td>
                <td class="px-5 py-3 text-sm text-gray-800">{{ questionText(item.questionId) }}</td>
                <td class="px-5 py-3 text-sm text-gray-600">{{ answerLabel(item.answer) }}</td>
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
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLikertSubmissionsStore } from '@/stores/likert-submissions'
import { useLikertQuestionsStore } from '@/stores/likert-questions'
import { LIKERT_SCALE_OPTIONS } from '@/apps/likert'

const route = useRoute()
const router = useRouter()
const likertId = route.params.id
const submissionId = route.params.submissionId

const submissionsStore = useLikertSubmissionsStore()
const questionsStore = useLikertQuestionsStore()

const { currentSubmission: submission, loading } = storeToRefs(submissionsStore)
const { questions } = storeToRefs(questionsStore)

onMounted(async () => {
  await Promise.all([
    submissionsStore.fetchSubmissionById(likertId, submissionId),
    questionsStore.fetchQuestions(likertId),
  ])
})

// code untuk override jawaban dengan label dari LIKERT_SCALE_OPTIONS (SS => Sangat Setuju)
const answerLabel = (value) => {
  const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === value)
  return opt?.label ?? value
}

const questionText = (questionId) => {
  const q = questions.value.find((q) => q.id === questionId)
  return q?.question ?? '(soal tidak ditemukan)'
}
</script>