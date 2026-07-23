<template>
  <div class="min-h-screen bg-bg">
    <AppTopBar />

    <!-- ─── Hero ─────────────────────────────────────────── -->
    <section class="relative overflow-hidden">
      <div class="max-w-5xl mx-auto px-4 md:px-6 pt-10 md:pt-20 pb-12 md:pb-16">
        <div class="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          <!-- Kiri: Teks -->
          <div class="flex-1 text-center md:text-left">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold tracking-wide mb-5"
            >
              <font-awesome-icon icon="fa-solid fa-sparkles" class="w-3.5 h-3.5" />
              Platform Asesmen Diri
            </span>
            <h1 class="text-3xl sm:text-4xl md:text-[2.8rem] font-bold text-text-primary leading-tight mb-5">
              Temukan arah minat<br class="hidden sm:block" />
              & kesiapan kerjamu
            </h1>
            <p class="text-sm md:text-base text-text-secondary leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
              Kumpulan instrumen asesmen diri psikologi terstandar — diisi online,
              hasil langsung terlihat begitu selesai. Gratis, tanpa daftar.
            </p>

            <div class="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <a
                href="#instrumen"
                class="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-text-on-primary text-sm font-semibold rounded-xl hover:bg-primary-hover transition active:scale-[0.98] shadow-sm"
              >
                Mulai asesmen
                <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ─── Instrumen Tersedia (Tetap pakai card karena interaktif) ─── -->
    <section
      id="instrumen"
      class="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16 scroll-mt-16 border-t border-border/50"
    >
      <div class="flex flex-col items-center text-center mb-10">
        <p class="text-xs font-semibold tracking-wide uppercase text-primary mb-2">
          Instrumen tersedia
        </p>
        <h2 class="text-xl md:text-2xl font-bold text-text-primary">
          Pilih yang ingin kamu kerjakan
        </h2>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-text-muted">
        <font-awesome-icon icon="fa-solid fa-circle-notch" class="w-7 h-7 animate-spin mb-3" />
        <span class="text-sm">Memuat instrumen...</span>
      </div>

      <div
        v-else-if="allInstruments.length === 0"
        class="flex flex-col items-center justify-center py-16 text-text-muted"
      >
        <font-awesome-icon icon="fa-solid fa-inbox" class="w-10 h-10 mb-3 opacity-50" />
        <p class="text-sm">Belum ada instrumen yang dipublikasikan saat ini.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
        <router-link
          v-for="item in allInstruments"
          :key="item.key"
          :to="item.to"
          class="group relative bg-surface border border-border rounded-2xl p-6 hover:border-primary hover:shadow-md transition-all duration-300 active:scale-[0.99]"
        >
          <div class="flex items-start justify-between mb-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-soft group-hover:bg-primary transition-colors duration-300"
            >
              <font-awesome-icon
                :icon="item.type === 'holland' ? 'fa-solid fa-chart-bar' : 'fa-solid fa-file-lines'"
                class="w-5 h-5 text-primary group-hover:text-text-on-primary transition-colors"
              />
            </div>
            <span
              class="inline-block text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-primary-soft text-primary"
            >
              {{ item.type === 'holland' ? 'RIASEC' : 'Likert' }}
            </span>
          </div>

          <h3 class="text-base font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
            {{ item.name }}
          </h3>
          <p class="text-sm text-text-secondary leading-relaxed mb-6 min-h-[3em]">
            {{ item.description || 'Belum ada deskripsi untuk instrumen ini.' }}
          </p>

          <span class="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Mulai isi
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </router-link>
      </div>
    </section>

    <!-- ─── Cara Kerja (Refactored: Menghapus Card, Menggunakan Whitespace) ─── -->
    <section class="bg-surface-muted py-16 md:py-20">
      <div class="max-w-5xl mx-auto px-4 md:px-6">
        <div class="text-center mb-12">
          <p class="text-xs font-semibold tracking-wide uppercase text-primary mb-2">
            Cara kerja
          </p>
          <h2 class="text-xl md:text-2xl font-bold text-text-primary">
            Tiga langkah, selesai
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-12 relative">
          <!-- Garis penghubung (opsional, hanya muncul di desktop) -->
          <div class="hidden sm:block absolute top-7 left-[15%] right-[15%] h-px bg-border -z-10"></div>

          <div
            v-for="(step, i) in langkah"
            :key="i"
            class="relative flex flex-col items-center text-center"
          >
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 font-bold text-base shadow-sm ring-4 ring-surface-muted"
              :class="[
                i === 0 ? 'bg-primary text-text-on-primary' :
                'bg-white text-text-primary border border-border'
              ]"
            >
              {{ i + 1 }}
            </div>

            <h3 class="text-base font-bold text-text-primary mb-2">{{ step.title }}</h3>
            <p class="text-sm text-text-secondary leading-relaxed max-w-[240px]">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Tentang Kami (Refactored: Menggabungkan konten, Hapus 3 card terpisah) ─── -->
    <section class="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-text-primary mb-4">
          Lebih dekat dengan <span class="text-primary">SelfAssessment</span>
        </h2>
        <p class="text-base md:text-lg text-text-secondary leading-relaxed max-w-3xl mx-auto">
          Kami percaya setiap orang berhak mendapatkan akses terhadap alat bantu pengembangan diri 
          yang berkualitas untuk menjembatani kebutuhan individu dan dunia kerja.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 pt-8">
        
        <!-- Kolom Kiri: Instrumen -->
        <div>
          <h3 class="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-microscope" class="w-5 h-5 text-primary" />
            Instrumen yang digunakan
          </h3>
          <div class="space-y-6">
            <div v-for="ins in instruments" :key="ins.name" class="flex items-start gap-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                :style="{ backgroundColor: ins.bg, color: ins.text }"
              >
                <span class="text-xs font-bold">{{ ins.code }}</span>
              </div>
              <div>
                <p class="text-base font-semibold text-text-primary mb-1">{{ ins.name }}</p>
                <p class="text-sm text-text-secondary leading-relaxed">{{ ins.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Tim pengembang -->
        <div>
          <h3 class="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-users" class="w-5 h-5 text-primary" />
            Tim pengembang
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-for="member in team" :key="member.name" class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm"
                :style="{ backgroundColor: member.bg, color: member.text }"
              >
                {{ member.initials }}
              </div>
              <div>
                <p class="text-sm font-bold text-text-primary">{{ member.name }}</p>
                <p class="text-xs text-text-secondary mt-0.5">{{ member.role }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ─── Footer ───────────────────────────────────────── -->
    <footer
      class="text-center py-10 px-4 text-sm text-text-secondary border-t border-border bg-surface-muted"
    >
      <p>Self Assessment — dibuat untuk membantu proses eksplorasi karier.</p>
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

// Gabungan instrumen
const allInstruments = computed(() => [
  ...activedLikerts.value.map((l) => ({
    key: `likert-${l.id}`,
    type: 'likert',
    name: l.name,
    description: l.description,
    to: { name: 'likert-form', params: { slug: l.slug } },
  })),
  ...activedHollands.value.map((h) => ({
    key: `holland-${h.id}`,
    type: 'holland',
    name: h.name,
    description: h.description,
    to: { name: 'holland-form', params: { slug: h.slug } },
  })),
])

// Statistik hero
const stats = computed(() => ({
  totalInstrumen: allInstruments.value.length,
  jenisInstrumen: new Set(allInstruments.value.map((i) => i.type)).size,
}))

// Langkah cara kerja
const langkah = [
  {
    title: 'Isi data diri',
    desc: 'Nama, sekolah/universitas, dan beberapa data singkat lain sebelum mulai.',
  },
  {
    title: 'Jawab pernyataan',
    desc: 'Jawab sesuai kondisi dirimu yang sebenarnya — tidak ada jawaban yang salah.',
  },
  {
    title: 'Lihat hasil',
    desc: 'Hasil dan penjelasannya langsung tampil begitu kamu selesai mengisi.',
  },
]

// Instrumen yang digunakan (detail)
const instruments = [
  {
    code: 'RIASEC',
    name: 'Holland RIASEC',
    desc: 'Dikembangkan oleh John L. Holland (1959). Mengklasifikasikan minat individu ke dalam 6 tipe kepribadian karier.',
    bg: 'var(--color-primary-soft)',
    text: 'var(--color-primary)',
  },
  {
    code: 'Likert',
    name: 'Skala Likert',
    desc: 'Instrumen terstandar untuk mengukur kesiapan dari aspek pengetahuan, keterampilan, dan adaptabilitas.',
    bg: 'var(--color-primary-soft)',
    text: 'var(--color-primary)',
  },
]

// Tim pengembang
const team = [
  { name: 'Anggota Tim', role: 'Lead Developer', initials: 'AT', bg: 'var(--color-primary)', text: 'var(--color-text-on-primary)' },
  { name: 'Anggota Tim', role: 'UI/UX Designer', initials: 'AT', bg: 'white', text: 'var(--color-text-primary)' },
  { name: 'Anggota Tim', role: 'Data Analyst', initials: 'AT', bg: 'white', text: 'var(--color-text-primary)' },
  { name: 'Anggota Tim', role: 'Content Writer', initials: 'AT', bg: 'white', text: 'var(--color-text-primary)' },
]

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