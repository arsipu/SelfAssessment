<template>
  <div class="min-h-screen">
    <AppTopBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-8">
        <span class="inline-block text-xs font-medium text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full mb-3">
          Instrumen
        </span>
        <h1 class="text-2xl font-medium text-gray-900 mb-2">Holland RIASEC</h1>
        <p class="text-sm text-gray-500 leading-relaxed">
          Tes minat karier berdasarkan teori Holland yang mengklasifikasikan kepribadian ke dalam
          6 tipe: Realistic, Investigative, Artistic, Social, Enterprising, dan Conventional.
        </p>
      </div>

      <!-- Info cards -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-medium text-gray-900">36</p>
          <p class="text-xs text-gray-400 mt-1">Butir soal</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-medium text-gray-900">±15</p>
          <p class="text-xs text-gray-400 mt-1">Menit</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-medium text-gray-900">6</p>
          <p class="text-xs text-gray-400 mt-1">Tipe kepribadian</p>
        </div>
      </div>

      <!-- Tipe RIASEC -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 class="text-sm font-medium text-gray-800 mb-4">6 tipe kepribadian Holland</h2>
        <div class="space-y-3">
          <div v-for="type in riasecTypes" :key="type.code" class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium"
              :class="type.color"
            >
              {{ type.code }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800">{{ type.name }}</p>
              <p class="text-xs text-gray-400 leading-relaxed">{{ type.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Petunjuk -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h2 class="text-sm font-medium text-gray-800 mb-3">Petunjuk pengisian</h2>
        <ol class="space-y-2">
          <li v-for="(tip, i) in tips" :key="i" class="flex items-start gap-3 text-sm text-gray-600">
            <span class="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
              {{ i + 1 }}
            </span>
            {{ tip }}
          </li>
        </ol>
      </div>

      <!-- CTA — pilih instrumen dari daftar published -->
      <div v-if="publishedHollands.length > 0" class="space-y-3">
        <p class="text-sm font-medium text-gray-700">Pilih instrumen yang tersedia:</p>
        <div class="flex flex-wrap gap-3">
          <router-link
            v-for="h in publishedHollands"
            :key="h.id"
            :to="{ name: 'holland-form', params: { id: h.id } }"
            class="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            {{ h.name || 'Mulai asesmen' }}
          </router-link>
        </div>
      </div>
      <div v-else class="text-sm text-gray-400">
        Belum ada instrumen Holland yang tersedia.
      </div>

      <div class="mt-4">
        <router-link
          to="/"
          class="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Kembali
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppTopBar from '@/components/AppTopBar.vue'
import { useHollandStore } from '@/stores/holland/holland'
import { PUBLISHED } from '@/apps/status'

const hollandStore = useHollandStore()
const { hollands } = storeToRefs(hollandStore)

const publishedHollands = computed(() =>
  hollands.value.filter((h) => h.status === PUBLISHED)
)

onMounted(async () => {
  await hollandStore.fetchHollands()
})

const riasecTypes = [
  {
    code: 'R',
    name: 'Realistic',
    desc: 'Menyukai aktivitas fisik, bekerja dengan alat, mesin, atau di alam terbuka.',
    color: 'bg-green-100 text-green-700',
  },
  {
    code: 'I',
    name: 'Investigative',
    desc: 'Tertarik pada penelitian, analisis, dan pemecahan masalah secara ilmiah.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    code: 'A',
    name: 'Artistic',
    desc: 'Kreatif, ekspresif, dan menyukai seni, musik, serta tulisan.',
    color: 'bg-pink-100 text-pink-700',
  },
  {
    code: 'S',
    name: 'Social',
    desc: 'Senang membantu, mengajar, dan berinteraksi dengan orang lain.',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    code: 'E',
    name: 'Enterprising',
    desc: 'Suka memimpin, meyakinkan orang lain, dan berorientasi pada tujuan.',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    code: 'C',
    name: 'Conventional',
    desc: 'Teliti, teratur, dan nyaman dengan data, angka, serta prosedur.',
    color: 'bg-purple-100 text-purple-700',
  },
]

const tips = [
  'Jawab setiap pernyataan dengan jujur sesuai kondisi dan minat kamu saat ini.',
  'Tidak ada jawaban benar atau salah — semua tipe kepribadian memiliki nilai yang setara.',
  'Centang satu atau lebih pernyataan yang paling mencerminkan diri Anda pada setiap kolom.',
  'Selesaikan seluruh soal dalam satu sesi agar hasil lebih akurat.',
]
</script>