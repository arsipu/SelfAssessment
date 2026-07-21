<template>
  <div class="min-h-screen">
    <AppTopBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-8">
        <span class="inline-block text-xs font-medium text-primary bg-primary-soft px-2.5 py-1 rounded-full mb-3">
          Instrumen
        </span>
        <h1 class="text-2xl font-medium text-text-primary mb-2">Holland RIASEC</h1>
        <p class="text-sm text-text-secondary leading-relaxed">
          Tes minat karier berdasarkan teori Holland yang mengklasifikasikan kepribadian ke dalam
          6 tipe: Realistic, Investigative, Artistic, Social, Enterprising, dan Conventional.
        </p>
      </div>

      <!-- Info cards -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="bg-surface border border-border rounded-xl p-4 text-center">
          <p class="text-2xl font-medium text-text-primary">36</p>
          <p class="text-xs text-text-muted mt-1">Butir soal</p>
        </div>
        <div class="bg-surface border border-border rounded-xl p-4 text-center">
          <p class="text-2xl font-medium text-text-primary">±15</p>
          <p class="text-xs text-text-muted mt-1">Menit</p>
        </div>
        <div class="bg-surface border border-border rounded-xl p-4 text-center">
          <p class="text-2xl font-medium text-text-primary">6</p>
          <p class="text-xs text-text-muted mt-1">Tipe kepribadian</p>
        </div>
      </div>

      <!-- Tipe RIASEC -->
      <div class="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 class="text-sm font-medium text-text-primary mb-4">6 tipe kepribadian Holland</h2>
        <div class="space-y-3">
          <div v-for="type in riasecTypes" :key="type.code" class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium"
              :style="{ backgroundColor: type.bg, color: type.text }"
            >
              {{ type.code }}
            </div>
            <div>
              <p class="text-sm font-medium text-text-primary">{{ type.name }}</p>
              <p class="text-xs text-text-muted leading-relaxed">{{ type.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Petunjuk -->
      <div class="bg-surface border border-border rounded-xl p-5 mb-8">
        <h2 class="text-sm font-medium text-text-primary mb-3">Petunjuk pengisian</h2>
        <ol class="space-y-2">
          <li v-for="(tip, i) in tips" :key="i" class="flex items-start gap-3 text-sm text-text-secondary">
            <span class="w-5 h-5 rounded-full bg-surface-muted text-text-muted text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
              {{ i + 1 }}
            </span>
            {{ tip }}
          </li>
        </ol>
      </div>

      <!-- CTA — pilih instrumen dari daftar actived -->
      <div v-if="activedHollands.length > 0" class="space-y-3">
        <p class="text-sm font-medium text-text-primary">Pilih instrumen yang tersedia:</p>
        <div class="flex flex-wrap gap-3">
          <router-link
            v-for="h in activedHollands"
            :key="h.id"
            :to="{ name: 'holland-form', params: { slug: h.slug } }"
            class="px-5 py-2.5 bg-primary text-text-on-primary text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
          >
            {{ h.name || 'Mulai asesmen' }}
          </router-link>
        </div>
      </div>
      <div v-else class="text-sm text-text-muted">
        Belum ada instrumen Holland yang tersedia.
      </div>

      <div class="mt-4">
        <router-link
          to="/"
          class="text-sm text-text-secondary hover:text-text-primary transition-colors"
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
import { ACTIVE } from '@/apps/status'

const hollandStore = useHollandStore()
const { hollands } = storeToRefs(hollandStore)

const activedHollands = computed(() =>
  hollands.value.filter((h) => h.status === ACTIVE)
)

onMounted(async () => {
  await hollandStore.fetchHollands()
})

const riasecTypes = [
  {
    code: 'R',
    name: 'Realistic',
    desc: 'Menyukai aktivitas fisik, bekerja dengan alat, mesin, atau di alam terbuka.',
    bg: 'var(--color-viz-1)',
    text: 'var(--color-text-on-primary)',
  },
  {
    code: 'I',
    name: 'Investigative',
    desc: 'Tertarik pada penelitian, analisis, dan pemecahan masalah secara ilmiah.',
    bg: 'var(--color-viz-2)',
    text: 'var(--color-text-on-primary)',
  },
  {
    code: 'A',
    name: 'Artistic',
    desc: 'Kreatif, ekspresif, dan menyukai seni, musik, serta tulisan.',
    bg: 'var(--color-viz-3)',
    text: 'var(--color-text-on-primary)',
  },
  {
    code: 'S',
    name: 'Social',
    desc: 'Senang membantu, mengajar, dan berinteraksi dengan orang lain.',
    bg: 'var(--color-viz-4)',
    text: 'var(--color-text-on-primary)',
  },
  {
    code: 'E',
    name: 'Enterprising',
    desc: 'Suka memimpin, meyakinkan orang lain, dan berorientasi pada tujuan.',
    bg: 'var(--color-viz-5)',
    text: 'var(--color-text-on-primary)',
  },
  {
    code: 'C',
    name: 'Conventional',
    desc: 'Teliti, teratur, dan nyaman dengan data, angka, serta prosedur.',
    bg: 'var(--color-viz-6)',
    text: 'var(--color-text-on-primary)',
  },
]

const tips = [
  'Jawab setiap pernyataan dengan jujur sesuai kondisi dan minat kamu saat ini.',
  'Tidak ada jawaban benar atau salah — semua tipe kepribadian memiliki nilai yang setara.',
  'Centang satu atau lebih pernyataan yang paling mencerminkan diri Anda pada setiap kolom.',
  'Selesaikan seluruh soal dalam satu sesi agar hasil lebih akurat.',
]
</script>