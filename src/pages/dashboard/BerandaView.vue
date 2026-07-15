<template>
  <div class="min-h-screen bg-bg">
    <AppTopBar />

    <!-- ─── Hero ─────────────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16">
      <div class="flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12">
        <div class="flex-1 text-center md:text-left">
          <p class="text-xs font-semibold tracking-wide uppercase text-primary mb-3">
            Self Assessment
          </p>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary leading-tight mb-4">
            Kenali arah minat<br class="hidden sm:block" />
            dan kesiapan kerjamu.
          </h1>
          <p class="text-sm md:text-base text-text-secondary leading-relaxed mb-6 max-w-md mx-auto md:mx-0">
            Kumpulan instrumen asesmen diri untuk membantu kamu memahami minat
            karier dan tingkat kesiapan kerja — diisi online, hasil langsung
            terlihat begitu selesai.
          </p>
          <a
            href="#instrumen"
            class="inline-block px-6 py-3 bg-primary text-text-on-primary text-sm font-semibold rounded-xl hover:bg-primary-hover transition active:scale-[0.98]"
          >
            Mulai asesmen
          </a>
        </div>
      </div>
    </section>

    <!-- ─── Instrumen tersedia ───────────────────────────── -->
    <section id="instrumen" class="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14 scroll-mt-16">
      <p class="text-xs font-semibold tracking-wide uppercase text-primary mb-2">
        Instrumen tersedia
      </p>
      <h2 class="text-lg md:text-xl font-semibold text-text-primary mb-6">
        Pilih yang ingin kamu kerjakan
      </h2>

      <div v-if="loading" class="text-center text-sm text-text-muted py-12">
        Memuat instrumen...
      </div>

      <div v-else-if="allInstruments.length === 0" class="text-center text-sm text-text-muted py-12">
        Belum ada instrumen yang dipublikasikan saat ini.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <router-link
          v-for="item in allInstruments"
          :key="item.key"
          :to="item.to"
          class="block bg-surface border border-border rounded-2xl p-5 hover:border-primary hover:shadow-sm transition-all"
        >
          <span
            class="inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3 bg-instrument-soft text-instrument"
          >
            {{ item.type === 'holland' ? 'RIASEC' : 'Likert' }}
          </span>
          <h3 class="text-sm font-semibold text-text-primary mb-1.5">{{ item.name }}</h3>
          <p class="text-xs text-text-secondary leading-relaxed mb-4 min-h-[2.5em]">
            {{ item.description || 'Belum ada deskripsi untuk instrumen ini.' }}
          </p>
          <span class="text-xs font-medium text-text-secondary">Mulai isi →</span>
        </router-link>
      </div>
    </section>

    <!-- ─── Cara kerja ───────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <p class="text-xs font-semibold tracking-wide uppercase text-primary mb-2">
        Cara kerja
      </p>
      <h2 class="text-lg md:text-xl font-semibold text-text-primary mb-6">
        Tiga langkah, selesai
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
        <div>
          <span class="block text-2xl font-bold text-border mb-2">01</span>
          <h3 class="text-sm font-semibold text-text-primary mb-1">Isi data diri</h3>
          <p class="text-xs text-text-secondary leading-relaxed">
            Nama, sekolah/universitas, dan beberapa data singkat lain sebelum mulai.
          </p>
        </div>
        <div>
          <span class="block text-2xl font-bold text-border mb-2">02</span>
          <h3 class="text-sm font-semibold text-text-primary mb-1">Jawab pernyataan</h3>
          <p class="text-xs text-text-secondary leading-relaxed">
            Jawab sesuai kondisi dirimu yang sebenarnya — tidak ada jawaban benar atau salah.
          </p>
        </div>
        <div>
          <span class="block text-2xl font-bold text-border mb-2">03</span>
          <h3 class="text-sm font-semibold text-text-primary mb-1">Lihat hasil</h3>
          <p class="text-xs text-text-secondary leading-relaxed">
            Hasil dan penjelasannya langsung tampil begitu kamu selesai mengisi.
          </p>
        </div>
      </div>
    </section>

    <footer class="text-center py-8 px-4 text-xs text-text-muted border-t border-border">
      Self Assessment — dibuat untuk membantu proses eksplorasi karier.
    </footer>
  </div>
</template>

<script setup>
import AppTopBar from '@/components/AppTopBar.vue'
import { ref, computed, onMounted } from 'vue'
import { useLikertStore } from '@/stores/likert/likert'
import { useHollandStore } from '@/stores/holland/holland'
import { ACTIVE } from '@/apps/status'

const likertStore = useLikertStore()
const hollandStore = useHollandStore()

const loading = ref(true)

const activedLikerts = computed(() =>
  (likertStore.likerts || []).filter((l) => l.status === ACTIVE)
)
const activedHollands = computed(() =>
  (hollandStore.hollands || []).filter((h) => h.status === ACTIVE)
)

// Gabungkan kedua jenis instrumen jadi 1 grid, ditandai `type` biar
// tag & route tujuannya beda tanpa perlu 2 blok terpisah di template.
const allInstruments = computed(() => [
  ...activedLikerts.value.map((l) => ({
    key: `likert-${l.id}`,
    type: 'likert',
    name: l.name,
    description: l.description,
    to: { name: 'likert-form', params: { id: l.id } },
  })),
  ...activedHollands.value.map((h) => ({
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