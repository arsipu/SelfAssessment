<template>
  <div class="min-h-screen bg-gray-50">
    <AppTopBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-10">
        <span class="inline-block text-xs font-medium text-gray-600 bg-gray-200 px-2.5 py-1 rounded-full mb-3">
          Tentang kami
        </span>
        <h1 class="text-2xl font-medium text-gray-900 mb-2">Tentang SelfAssessment</h1>
        <p class="text-sm text-gray-500 leading-relaxed max-w-xl">
          Platform asesmen diri berbasis web yang membantu individu memahami minat karier
          dan kesiapan kerja mereka melalui instrumen psikologi yang terstandar.
        </p>
      </div>

      <!-- Misi -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-5">
        <h2 class="text-sm font-medium text-gray-800 mb-3">Misi kami</h2>
        <p class="text-sm text-gray-500 leading-relaxed">
          Kami percaya setiap orang berhak mendapatkan akses terhadap alat bantu pengembangan diri
          yang berkualitas. SelfAssessment hadir untuk menjembatani kebutuhan individu, institusi
          pendidikan, dan dunia kerja melalui data asesmen yang terukur dan mudah dipahami.
        </p>
      </div>

      <!-- Instrumen -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-5">
        <h2 class="text-sm font-medium text-gray-800 mb-4">Instrumen yang digunakan</h2>
        <div class="space-y-4">
          <div v-for="ins in instruments" :key="ins.name" class="flex items-start gap-4">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="ins.color">
              <span class="text-xs font-medium">{{ ins.code }}</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800">{{ ins.name }}</p>
              <p class="text-xs text-gray-400 leading-relaxed mt-0.5">{{ ins.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tim -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-5">
        <h2 class="text-sm font-medium text-gray-800 mb-4">Tim pengembang</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="member in team" :key="member.name" class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0" :class="member.color">
              {{ member.initials }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800">{{ member.name }}</p>
              <p class="text-xs text-gray-400">{{ member.role }}</p>
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
    color: 'bg-purple-100 text-purple-700',
  },
  {
    code: 'WRS',
    name: 'Likert Scale',
    desc: 'Instrumen terstandar untuk mengukur kesiapan memasuki dunia kerja dari aspek pengetahuan, sikap, keterampilan, dan kemampuan adaptasi.',
    color: 'bg-blue-100 text-blue-700',
  },
]

const team = [
  { name: 'Maulana A.', role: 'Lead Developer', initials: 'MA', color: 'bg-gray-900 text-white' },
  { name: 'Anggota Tim', role: 'UI/UX Designer', initials: 'AT', color: 'bg-gray-100 text-gray-700' },
  { name: 'Anggota Tim', role: 'Data Analyst', initials: 'AT', color: 'bg-gray-100 text-gray-700' },
  { name: 'Anggota Tim', role: 'Content Writer', initials: 'AT', color: 'bg-gray-100 text-gray-700' },
]
</script>