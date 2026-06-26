<template>
  <div class="min-h-screen bg-gray-50">
    <AppTopBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-8">
        <span class="inline-block text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full mb-3">
          Instrumen
        </span>
        <h1 class="text-2xl font-medium text-gray-900 mb-2">Work Readiness Scale</h1>
        <p class="text-sm text-gray-500 leading-relaxed">
          Instrumen untuk mengukur sejauh mana kesiapan seseorang dalam memasuki dunia kerja,
          mencakup aspek pengetahuan, sikap, dan keterampilan yang dibutuhkan.
        </p>
      </div>

      <!-- Info cards -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-medium text-gray-900">28</p>
          <p class="text-xs text-gray-400 mt-1">Butir soal</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-medium text-gray-900">±20</p>
          <p class="text-xs text-gray-400 mt-1">Menit</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-medium text-gray-900">4</p>
          <p class="text-xs text-gray-400 mt-1">Dimensi</p>
        </div>
      </div>

      <!-- Dimensi -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 class="text-sm font-medium text-gray-800 mb-4">Dimensi yang diukur</h2>
        <div class="space-y-4">
          <div v-for="dim in dimensions" :key="dim.title" class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="dim.color">
              <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path :d="dim.icon" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <p class="text-sm font-medium text-gray-800">{{ dim.title }}</p>
                <span class="text-xs text-gray-400">{{ dim.items }} soal</span>
              </div>
              <p class="text-xs text-gray-400 leading-relaxed">{{ dim.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Skala penilaian -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h2 class="text-sm font-medium text-gray-800 mb-4">Skala penilaian</h2>
        <div class="grid grid-cols-5 gap-2">
          <div
            v-for="scale in scales"
            :key="scale.val"
            class="flex flex-col items-center gap-1.5"
          >
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium" :class="scale.color">
              {{ scale.val }}
            </div>
            <p class="text-xs text-gray-400 text-center leading-tight">{{ scale.label }}</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="flex items-center gap-3">
        <router-link
          to="/workreadiness/mulai"
          class="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Mulai asesmen
        </router-link>
        <router-link
          to="/"
          class="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Kembali
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppTopBar from '@/components/AppTopBar.vue'

const dimensions = [
  {
    title: 'Pengetahuan kerja',
    desc: 'Pemahaman tentang dunia kerja, peran, tanggung jawab, dan budaya profesional.',
    items: 7,
    color: 'bg-blue-100 text-blue-600',
    icon: 'M8 2v4M4 6h8M3 10h10M5 14h6',
  },
  {
    title: 'Keterampilan sosial',
    desc: 'Kemampuan berkomunikasi, bekerja sama dalam tim, dan membangun relasi kerja.',
    items: 8,
    color: 'bg-teal-100 text-teal-600',
    icon: 'M5 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0M2 14c0-2.5 2-4 4-4h4c2 0 4 1.5 4 4',
  },
  {
    title: 'Sikap profesional',
    desc: 'Etos kerja, disiplin, tanggung jawab, dan komitmen terhadap pekerjaan.',
    items: 7,
    color: 'bg-purple-100 text-purple-600',
    icon: 'M8 2l1.5 4.5H14l-3.5 2.5 1.5 4.5L8 11l-4 2.5 1.5-4.5L2 6.5h4.5z',
  },
  {
    title: 'Kesiapan adaptasi',
    desc: 'Kemampuan menyesuaikan diri dengan perubahan dan situasi kerja yang baru.',
    items: 6,
    color: 'bg-amber-100 text-amber-600',
    icon: 'M4 8h8M9 5l3 3-3 3',
  },
]

const scales = [
  { val: 1, label: 'Sangat tidak setuju', color: 'bg-red-50 text-red-600' },
  { val: 2, label: 'Tidak setuju', color: 'bg-orange-50 text-orange-600' },
  { val: 3, label: 'Netral', color: 'bg-gray-100 text-gray-600' },
  { val: 4, label: 'Setuju', color: 'bg-blue-50 text-blue-600' },
  { val: 5, label: 'Sangat setuju', color: 'bg-green-50 text-green-600' },
]
</script>