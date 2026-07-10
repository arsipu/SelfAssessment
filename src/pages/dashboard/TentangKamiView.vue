<template>
  <div class="min-h-screen">
    <AppTopBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-10">
        <span class="inline-block text-xs font-medium text-text-secondary bg-surface-muted px-2.5 py-1 rounded-full mb-3">
          Tentang kami
        </span>
        <h1 class="text-2xl font-medium text-text-primary mb-2">Tentang SelfAssessment</h1>
        <p class="text-sm text-text-secondary leading-relaxed max-w-xl">
          Platform asesmen diri berbasis web yang membantu individu memahami minat karier
          dan kesiapan kerja mereka melalui instrumen psikologi yang terstandar.
        </p>
      </div>

      <!-- Misi -->
      <div class="bg-surface border border-border rounded-xl p-6 mb-5">
        <h2 class="text-sm font-medium text-text-primary mb-3">Misi kami</h2>
        <p class="text-sm text-text-secondary leading-relaxed">
          Kami percaya setiap orang berhak mendapatkan akses terhadap alat bantu pengembangan diri
          yang berkualitas. SelfAssessment hadir untuk menjembatani kebutuhan individu, institusi
          pendidikan, dan dunia kerja melalui data asesmen yang terukur dan mudah dipahami.
        </p>
      </div>

      <!-- Instrumen -->
      <div class="bg-surface border border-border rounded-xl p-6 mb-5">
        <h2 class="text-sm font-medium text-text-primary mb-4">Instrumen yang digunakan</h2>
        <div class="space-y-4">
          <div v-for="ins in instruments" :key="ins.name" class="flex items-start gap-4">
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              :style="{ backgroundColor: ins.bg, color: ins.text }"
            >
              <span class="text-xs font-medium">{{ ins.code }}</span>
            </div>
            <div>
              <p class="text-sm font-medium text-text-primary">{{ ins.name }}</p>
              <p class="text-xs text-text-muted leading-relaxed mt-0.5">{{ ins.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tim -->
      <div class="bg-surface border border-border rounded-xl p-6 mb-5">
        <h2 class="text-sm font-medium text-text-primary mb-4">Tim pengembang</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="member in team" :key="member.name" class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
              :style="{ backgroundColor: member.bg, color: member.text }"
            >
              {{ member.initials }}
            </div>
            <div>
              <p class="text-sm font-medium text-text-primary">{{ member.name }}</p>
              <p class="text-xs text-text-muted">{{ member.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppTopBar from '@/components/AppTopBar.vue'

const instruments = [
  {
    code: 'RIASEC',
    name: 'Holland RIASEC',
    desc: 'Dikembangkan oleh John L. Holland (1959). Mengklasifikasikan minat individu ke dalam 6 tipe kepribadian karier untuk membantu pemilihan karier yang sesuai.',
    bg: 'var(--color-instrument-soft)',
    text: 'var(--color-instrument)',
  },
  {
    code: 'WRS',
    name: 'Likert Scale',
    desc: 'Instrumen terstandar untuk mengukur kesiapan memasuki dunia kerja dari aspek pengetahuan, sikap, keterampilan, dan kemampuan adaptasi.',
    bg: 'var(--color-instrument-soft)',
    text: 'var(--color-instrument)',
  },
]

const team = [
  { name: 'Maulana A.', role: 'Lead Developer', initials: 'MA', bg: 'var(--color-primary)', text: 'var(--color-text-on-primary)' },
  { name: 'Anggota Tim', role: 'UI/UX Designer', initials: 'AT', bg: 'var(--color-surface-muted)', text: 'var(--color-text-secondary)' },
  { name: 'Anggota Tim', role: 'Data Analyst', initials: 'AT', bg: 'var(--color-surface-muted)', text: 'var(--color-text-secondary)' },
  { name: 'Anggota Tim', role: 'Content Writer', initials: 'AT', bg: 'var(--color-surface-muted)', text: 'var(--color-text-secondary)' },
]
</script>