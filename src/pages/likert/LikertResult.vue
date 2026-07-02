<template>
  <div class="min-h-screen">
    <AppTopBar />

    <div class="max-w-2xl mx-auto px-4 py-10">
      <div v-if="!result" class="text-center text-sm text-gray-400 py-20">
        Memuat hasil...
      </div>

      <div v-else class="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div class="text-center mb-8">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            Hasil {{ likertStore.currentLikert?.name || 'Kuesioner' }}
          </p>
          <h1 class="text-lg font-semibold text-gray-900">{{ respondentName }}</h1>
        </div>

        <div class="flex flex-col items-center mb-8">
          <div class="text-5xl font-bold text-gray-900 mb-1">{{ result.totalScore }}</div>
          <div class="text-xs text-gray-400 mb-4">dari 256 poin maksimal</div>

          <span
            class="px-4 py-1.5 rounded-full text-sm font-semibold"
            :class="category.badgeClass"
          >
            {{ category.label }}
          </span>
        </div>

        <div class="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6">
          <p class="text-sm text-gray-600 leading-relaxed">{{ category.description }}</p>
        </div>

        <div class="mb-8">
          <p class="text-xs font-medium text-gray-400 mb-2">Skala interpretasi</p>
          <div class="space-y-1.5">
            <div
              v-for="cat in categories"
              :key="cat.label"
              class="flex items-center justify-between text-xs px-3 py-2 rounded-lg"
              :class="cat.label === category.label ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500'"
            >
              <span class="font-medium">{{ cat.label }}</span>
              <span>{{ cat.min }} – {{ cat.max }}</span>
            </div>
          </div>
        </div>

        <router-link
          :to="{ name: 'likert' }"
          class="block w-full text-center py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition"
        >
          Selesai
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert'
import { useLikertSessionStore } from '@/stores/likert-session'

import AppTopBar from '@/components/AppTopBar.vue'

const route = useRoute()
const router = useRouter()
const likertId = route.params.id

const likertStore = useLikertStore()
const likertSessionStore = useLikertSessionStore()

// Norma hipotetik Work Readiness Scale (Caballero), 64 aitem, skor 1-4
const categories = [
  {
    label: 'Sangat Tinggi',
    min: 209,
    max: 256,
    badgeClass: 'bg-emerald-100 text-emerald-700',
    description:
      'Individu memiliki kesiapan kerja yang sangat baik pada hampir seluruh aspek.',
  },
  {
    label: 'Tinggi',
    min: 177,
    max: 208,
    badgeClass: 'bg-teal-100 text-teal-700',
    description:
      'Individu menunjukkan kesiapan kerja yang baik dan mampu beradaptasi dengan tuntutan dunia kerja.',
  },
  {
    label: 'Sedang',
    min: 145,
    max: 176,
    badgeClass: 'bg-amber-100 text-amber-700',
    description:
      'Individu memiliki kesiapan kerja yang cukup, namun masih memerlukan pengembangan pada beberapa aspek.',
  },
  {
    label: 'Rendah',
    min: 113,
    max: 144,
    badgeClass: 'bg-orange-100 text-orange-700',
    description:
      'Individu menunjukkan kesiapan kerja yang masih terbatas dan membutuhkan intervensi pengembangan.',
  },
  {
    label: 'Sangat Rendah',
    min: 64,
    max: 112,
    badgeClass: 'bg-rose-100 text-rose-700',
    description:
      'Individu memiliki kesiapan kerja yang sangat rendah dan memerlukan pengembangan yang lebih intensif.',
  },
]

const result = computed(() => likertSessionStore.getResult(likertId))
const respondentName = computed(() => result.value?.respondentName || '-')

const category = computed(() => {
  const score = result.value?.totalScore ?? 0
  return (
    categories.find((c) => score >= c.min && score <= c.max) ||
    categories[categories.length - 1]
  )
})

onMounted(async () => {
  if (!result.value) {
    router.replace({ name: 'likert-form', params: { id: likertId } })
    return
  }
  if (!likertStore.currentLikert) {
    await likertStore.getLikertById(likertId)
  }
})
</script>