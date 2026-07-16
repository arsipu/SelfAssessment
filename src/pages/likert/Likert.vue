<template>
  <div class="min-h-screen">
    <AppTopBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-8">
        <span class="inline-block text-xs font-medium text-instrument bg-instrument-soft px-2.5 py-1 rounded-full mb-3">
          Instrumen
        </span>
        <h1 class="text-2xl font-medium text-text-primary mb-2">Likert Scale</h1>
        <p class="text-sm text-text-secondary leading-relaxed">
          Likert Scale adalah instrumen pengukuran sikap yang digunakan untuk mengetahui
          tingkat persetujuan atau kesiapan seseorang terhadap suatu pernyataan tertentu,
          seperti kesiapan memasuki dunia kerja.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-surface border border-border rounded-xl p-12 text-center">
        <p class="text-sm text-text-muted">Memuat formulir...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="activedLikerts.length === 0" class="bg-surface border border-border rounded-xl p-12 text-center">
        <p class="text-sm text-text-muted">Belum ada formulir yang tersedia saat ini.</p>
      </div>

      <!-- List formulir -->
      <div v-else class="space-y-3">
        <button
          v-for="likert in activedLikerts"
          :key="likert.id"
          @click="selectLikert(likert)"
          class="w-full text-left bg-surface border border-border rounded-xl p-5 hover:border-instrument transition-colors flex items-center justify-between gap-4"
        >
          <div>
            <p class="text-sm font-medium text-text-primary mb-1">{{ likert.name }}</p>
            <p class="text-xs text-text-muted leading-relaxed">{{ likert.description }}</p>
          </div>
          <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-5 h-5 text-text-muted shrink-0" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLikertStore } from '@/stores/likert/likert'
import { ACTIVE } from '@/apps/status'

import AppTopBar from '@/components/AppTopBar.vue'

const router = useRouter()
const likertStore = useLikertStore()
const { likerts, loading } = storeToRefs(likertStore)

const activedLikerts = computed(() =>
  likerts.value.filter((l) => l.status === ACTIVE)
)

onMounted(async () => {
  await likertStore.fetchLikerts()
})

const selectLikert = (likert) => {
  router.push({ name: 'likert-form', params: { slug: likert.slug } })
}
</script>