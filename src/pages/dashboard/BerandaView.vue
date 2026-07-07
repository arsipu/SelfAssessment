<template>
  <div class="min-h-screen">
    <AppTopBar />

    <!-- ─── Hero ─────────────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16">
      <div class="flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12">
        <div class="flex-1 text-center md:text-left">
          <p class="text-xs font-semibold tracking-wide uppercase text-blue-600 mb-3">
            Self Assessment
          </p>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Kenali arah minat<br class="hidden sm:block" />
            dan kesiapan kerjamu.
          </h1>
          <p class="text-sm md:text-base text-gray-500 leading-relaxed mb-6 max-w-md mx-auto md:mx-0">
            Kumpulan instrumen asesmen diri untuk membantu kamu memahami minat
            karier dan tingkat kesiapan kerja — diisi online, hasil langsung
            terlihat begitu selesai.
          </p>
          <a
            href="#instrumen"
            class="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition active:scale-[0.98]"
          >
            Mulai asesmen
          </a>
        </div>

        <!-- Signature: hexagon RIASEC, motif asli dari teori Holland -->
        <div class="shrink-0 w-40 sm:w-48 md:w-56" aria-hidden="true">
          <svg viewBox="0 0 320 320" class="w-full h-auto">
            <polygon
              points="160,20 285,92 285,228 160,300 35,228 35,92"
              class="fill-none stroke-gray-300"
              stroke-width="2"
            />
            <polygon
              points="160,70 240,110 240,210 160,250 80,210 80,110"
              class="fill-none stroke-blue-500"
              stroke-width="2"
            />
            <g class="fill-gray-800 text-[15px] font-semibold">
              <text x="160" y="16" text-anchor="middle">R</text>
              <text x="295" y="90" text-anchor="middle">I</text>
              <text x="295" y="232" text-anchor="middle">A</text>
              <text x="160" y="314" text-anchor="middle">S</text>
              <text x="25" y="232" text-anchor="middle">E</text>
              <text x="25" y="90" text-anchor="middle">C</text>
            </g>
          </svg>
        </div>
      </div>
    </section>

    <!-- ─── Instrumen tersedia ───────────────────────────── -->
    <section id="instrumen" class="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14 scroll-mt-16">
      <p class="text-xs font-semibold tracking-wide uppercase text-emerald-600 mb-2">
        Instrumen tersedia
      </p>
      <h2 class="text-lg md:text-xl font-semibold text-gray-900 mb-6">
        Pilih yang ingin kamu kerjakan
      </h2>

      <div v-if="loading" class="text-center text-sm text-gray-400 py-12">
        Memuat instrumen...
      </div>

      <div v-else-if="allInstruments.length === 0" class="text-center text-sm text-gray-400 py-12">
        Belum ada instrumen yang dipublikasikan saat ini.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <router-link
          v-for="item in allInstruments"
          :key="item.key"
          :to="item.to"
          class="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-900 hover:shadow-sm transition-all"
        >
          <span
            class="inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3"
            :class="item.type === 'holland'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'"
          >
            {{ item.type === 'holland' ? 'RIASEC' : 'Likert' }}
          </span>
          <h3 class="text-sm font-semibold text-gray-900 mb-1.5">{{ item.name }}</h3>
          <p class="text-xs text-gray-500 leading-relaxed mb-4 min-h-[2.5em]">
            {{ item.description || 'Belum ada deskripsi untuk instrumen ini.' }}
          </p>
          <span class="text-xs font-medium text-gray-700">Mulai isi →</span>
        </router-link>
      </div>
    </section>

    <!-- ─── Cara kerja ───────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <p class="text-xs font-semibold tracking-wide uppercase text-amber-600 mb-2">
        Cara kerja
      </p>
      <h2 class="text-lg md:text-xl font-semibold text-gray-900 mb-6">
        Tiga langkah, selesai
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
        <div>
          <span class="block text-2xl font-bold text-gray-300 mb-2">01</span>
          <h3 class="text-sm font-semibold text-gray-900 mb-1">Isi data diri</h3>
          <p class="text-xs text-gray-500 leading-relaxed">
            Nama, sekolah/universitas, dan beberapa data singkat lain sebelum mulai.
          </p>
        </div>
        <div>
          <span class="block text-2xl font-bold text-gray-300 mb-2">02</span>
          <h3 class="text-sm font-semibold text-gray-900 mb-1">Jawab pernyataan</h3>
          <p class="text-xs text-gray-500 leading-relaxed">
            Jawab sesuai kondisi dirimu yang sebenarnya — tidak ada jawaban benar atau salah.
          </p>
        </div>
        <div>
          <span class="block text-2xl font-bold text-gray-300 mb-2">03</span>
          <h3 class="text-sm font-semibold text-gray-900 mb-1">Lihat hasil</h3>
          <p class="text-xs text-gray-500 leading-relaxed">
            Hasil dan penjelasannya langsung tampil begitu kamu selesai mengisi.
          </p>
        </div>
      </div>
    </section>

    <footer class="text-center py-8 px-4 text-xs text-gray-400 border-t border-gray-100">
      Self Assessment — dibuat untuk membantu proses eksplorasi karier.
    </footer>
  </div>
</template>

<script setup>
import AppTopBar from '@/components/AppTopBar.vue'
import { ref, computed, onMounted } from 'vue'
import { useLikertStore } from '@/stores/likert/likert'
import { useHollandStore } from '@/stores/holland/holland'
import { PUBLISHED } from '@/apps/status'

const likertStore = useLikertStore()
const hollandStore = useHollandStore()

const loading = ref(true)

const publishedLikerts = computed(() =>
  (likertStore.likerts || []).filter((l) => l.status === PUBLISHED)
)
const publishedHollands = computed(() =>
  (hollandStore.hollands || []).filter((h) => h.status === PUBLISHED)
)

// Gabungkan kedua jenis instrumen jadi 1 grid, ditandai `type` biar
// tag & route tujuannya beda tanpa perlu 2 blok terpisah di template.
const allInstruments = computed(() => [
  ...publishedLikerts.value.map((l) => ({
    key: `likert-${l.id}`,
    type: 'likert',
    name: l.name,
    description: l.description,
    to: { name: 'likert-form', params: { id: l.id } },
  })),
  ...publishedHollands.value.map((h) => ({
    key: `holland-${h.id}`,
    type: 'holland',
    name: h.name,
    description: h.description,
    to: { name: 'holland-form', params: { id: h.id } },
  })),
])

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      likertStore.fetchLikerts(),
      hollandStore.fetchHollands(),
    ])
  } finally {
    loading.value = false
  }
})
</script>