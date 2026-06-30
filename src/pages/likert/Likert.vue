<template>
  <div class="min-h-screen bg-gray-50">
    <AppTopBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-8">
        <span class="inline-block text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full mb-3">
          Instrumen
        </span>
        <h1 class="text-2xl font-medium text-gray-900 mb-2">Likert Scale</h1>
        <p class="text-sm text-gray-500 leading-relaxed">
          Likert Scale adalah instrumen pengukuran sikap yang digunakan untuk mengetahui
          tingkat persetujuan atau kesiapan seseorang terhadap suatu pernyataan tertentu,
          seperti kesiapan memasuki dunia kerja.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p class="text-sm text-gray-400">Memuat formulir...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="publishedLikerts.length === 0" class="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p class="text-sm text-gray-400">Belum ada formulir yang tersedia saat ini.</p>
      </div>

      <!-- List formulir -->
      <div v-else class="space-y-3">
        <button
          v-for="likert in publishedLikerts"
          :key="likert.id"
          @click="selectLikert(likert.id)"
          class="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition-colors flex items-center justify-between gap-4"
        >
          <div>
            <p class="text-sm font-medium text-gray-900 mb-1">{{ likert.name }}</p>
            <p class="text-xs text-gray-400 leading-relaxed">{{ likert.description }}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLikertStore } from '@/stores/likert'

import AppTopBar from '@/components/AppTopBar.vue'

const router = useRouter()
const likertStore = useLikertStore()
const { likerts, loading } = storeToRefs(likertStore)

const publishedLikerts = computed(() =>
  likerts.value.filter((l) => l.status === 'published')
)

onMounted(async () => {
  await likertStore.fetchLikerts()
})

const selectLikert = (id) => {
  router.push({ name: 'likert-form', params: { id } })
}
</script>