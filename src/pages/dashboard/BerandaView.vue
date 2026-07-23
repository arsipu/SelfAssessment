<template>
  <div class="min-h-screen bg-bg">
    <AppTopBar />

    <!-- ─── Hero ─────────────────────────────────────────── -->
    <section class="relative overflow-hidden">
      <div class="max-w-5xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-8 md:pb-12">
        <div class="flex flex-col md:flex-row items-center gap-8 md:gap-14">
          <!-- Kiri: Teks -->
          <div class="flex-1 text-center md:text-left">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold tracking-wide mb-4"
            >
              <font-awesome-icon icon="fa-solid fa-sparkles" class="w-3.5 h-3.5" />
              Platform Asesmen Diri
            </span>
            <h1 class="text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-text-primary leading-tight mb-4">
              Temukan arah minat<br class="hidden sm:block" />
              & kesiapan kerjamu
            </h1>
            <p class="text-sm md:text-base text-text-secondary leading-relaxed mb-7 max-w-lg mx-auto md:mx-0">
              Kumpulan instrumen asesmen diri psikologi terstandar — diisi online,
              hasil langsung terlihat begitu selesai. Gratis, tanpa daftar.
            </p>

            <div class="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <a
                href="#instrumen"
                class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-text-on-primary text-sm font-semibold rounded-xl hover:bg-primary-hover transition active:scale-[0.98] shadow-sm"
              >
                Mulai asesmen
                <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
              </a>
            </div>
          </div>

          <!-- Kanan: Stats ringkas -->
          <div class="shrink-0 w-full max-w-xs md:max-w-sm">
            <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <p class="text-2xl font-bold text-primary">{{ stats.totalInstrumen }}</p>
                  <p class="text-xs text-text-muted mt-0.5">Instrumen</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-primary">{{ stats.jenisInstrumen }}</p>
                  <p class="text-xs text-text-muted mt-0.5">Jenis</p>
                </div>
                <div class="text-center col-span-2 pt-2 border-t border-border">
                  <p class="text-xs text-text-secondary leading-relaxed">
                    Instrumen RIASEC & Skala Likert untuk eksplorasi karier dan
                    pengukuran kesiapan kerja.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Instrumen Tersedia ───────────────────────────── -->
    <section
      id="instrumen"
      class="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14 scroll-mt-16"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-xs font-semibold tracking-wide uppercase text-primary mb-1">
            Instrumen tersedia
          </p>
          <h2 class="text-lg md:text-xl font-semibold text-text-primary">
            Pilih yang ingin kamu kerjakan
          </h2>
        </div>
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

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <router-link
          v-for="item in allInstruments"
          :key="item.key"
          :to="item.to"
          class="group relative bg-surface border border-border rounded-2xl p-5 hover:border-primary hover:shadow-sm transition-all active:scale-[0.99]"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-soft group-hover:bg-primary transition-colors"
            >
              <font-awesome-icon
                :icon="item.type === 'holland' ? 'fa-solid fa-chart-bar' : 'fa-solid fa-file-lines'"
                class="w-5 h-5 text-primary group-hover:text-text-on-primary transition-colors"
              />
            </div>
            <span
              class="inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-primary-soft text-primary"
            >
              {{ item.type === 'holland' ? 'RIASEC' : 'Likert' }}
            </span>
          </div>

          <h3 class="text-sm font-semibold text-text-primary mb-1.5 group-hover:text-primary transition-colors">
            {{ item.name }}
          </h3>
          <p class="text-xs text-text-secondary leading-relaxed mb-4 min-h-[2.5em]">
            {{ item.description || 'Belum ada deskripsi untuk instrumen ini.' }}
          </p>

          <span class="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted group-hover:text-primary transition-colors">
            Mulai isi
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </router-link>
      </div>
    </section>

    <!-- ─── Cara Kerja ───────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <div class="text-center mb-8">
        <p class="text-xs font-semibold tracking-wide uppercase text-primary mb-1">
          Cara kerja
        </p>
        <h2 class="text-lg md:text-xl font-semibold text-text-primary">
          Tiga langkah, selesai
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
        <div
          v-for="(step, i) in langkah"
          :key="i"
          class="relative bg-surface border border-border rounded-2xl p-5 text-center"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm"
            :class="[
              i === 0 ? 'bg-primary text-text-on-primary' :
              i === 1 ? 'bg-primary-soft text-primary' :
              'bg-surface-muted text-text-secondary'
            ]"
          >
            {{ String(i + 1).padStart(2, '0') }}
          </div>

          <h3 class="text-sm font-semibold text-text-primary mb-1.5">{{ step.title }}</h3>
          <p class="text-xs text-text-secondary leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ─── Tentang Kami ─────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <div class="text-center mb-8">
        <p class="text-xs font-semibold tracking-wide uppercase text-primary mb-1">
          Tentang platform
        </p>
        <h2 class="text-lg md:text-xl font-semibold text-text-primary">
          SelfAssessment
        </h2>
      </div>

      <!-- Misi -->
      <div class="bg-surface border border-border rounded-2xl p-6 md:p-7 mb-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary-soft">
            <font-awesome-icon icon="fa-solid fa-bullseye" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-text-primary mb-2">Misi kami</h3>
            <p class="text-sm text-text-secondary leading-relaxed">
              Kami percaya setiap orang berhak mendapatkan akses terhadap alat bantu pengembangan diri
              yang berkualitas. SelfAssessment hadir untuk menjembatani kebutuhan individu, institusi
              pendidikan, dan dunia kerja melalui data asesmen yang terukur dan mudah dipahami.
            </p>
          </div>
        </div>
      </div>

      <!-- Instrumen yang digunakan -->
      <div class="bg-surface border border-border rounded-2xl p-6 md:p-7 mb-5">
        <h3 class="text-sm font-semibold text-text-primary mb-5">Instrumen yang digunakan</h3>
        <div class="space-y-5">
          <div v-for="ins in instruments" :key="ins.name" class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :style="{ backgroundColor: ins.bg, color: ins.text }"
            >
              <span class="text-xs font-bold">{{ ins.code }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-text-primary">{{ ins.name }}</p>
              <p class="text-xs text-text-muted leading-relaxed mt-0.5">{{ ins.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tim pengembang -->
      <div class="bg-surface border border-border rounded-2xl p-6 md:p-7">
        <h3 class="text-sm font-semibold text-text-primary mb-5">Tim pengembang</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="member in team" :key="member.name" class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              :style="{ backgroundColor: member.bg, color: member.text }"
            >
              {{ member.initials }}
            </div>
            <div>
              <p class="text-sm font-semibold text-text-primary">{{ member.name }}</p>
              <p class="text-xs text-text-muted">{{ member.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Footer ───────────────────────────────────────── -->
    <footer
      class="text-center py-8 px-4 text-xs text-text-muted border-t border-border bg-surface"
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
    desc: 'Jawab sesuai kondisi dirimu yang sebenarnya — tidak ada jawaban benar atau salah.',
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
    desc: 'Dikembangkan oleh John L. Holland (1959). Mengklasifikasikan minat individu ke dalam 6 tipe kepribadian karier untuk membantu pemilihan karier yang sesuai.',
    bg: 'var(--color-primary-soft)',
    text: 'var(--color-primary)',
  },
  {
    code: 'Likert',
    name: 'Skala Likert',
    desc: 'Instrumen terstandar untuk mengukur kesiapan memasuki dunia kerja dari aspek pengetahuan, sikap, keterampilan, dan kemampuan adaptasi.',
    bg: 'var(--color-primary-soft)',
    text: 'var(--color-primary)',
  },
]

// Tim pengembang
const team = [
  { name: 'Anggota Tim', role: 'Lead Developer', initials: 'AT', bg: 'var(--color-primary)', text: 'var(--color-text-on-primary)' },
  { name: 'Anggota Tim', role: 'UI/UX Designer', initials: 'AT', bg: 'var(--color-surface-muted)', text: 'var(--color-text-secondary)' },
  { name: 'Anggota Tim', role: 'Data Analyst', initials: 'AT', bg: 'var(--color-surface-muted)', text: 'var(--color-text-secondary)' },
  { name: 'Anggota Tim', role: 'Content Writer', initials: 'AT', bg: 'var(--color-surface-muted)', text: 'var(--color-text-secondary)' },
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