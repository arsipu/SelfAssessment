<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <div class="w-16 h-16 sm:w-20 sm:h-20 bg-danger-soft rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="w-8 h-8 sm:w-9 sm:h-9 text-danger" />
      </div>

      <h1 class="text-lg sm:text-xl font-bold text-text-primary mb-2">
        {{ title }}
      </h1>
      <p class="text-sm text-text-secondary mb-6 sm:mb-8 leading-relaxed">
        {{ message }}
      </p>

      <button @click="router.push('/')"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-text-on-primary text-sm font-semibold rounded-xl hover:bg-primary-hover transition active:scale-[0.98]">
        <font-awesome-icon icon="fa-solid fa-house" class="w-4 h-4" />
        Kembali ke Beranda
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  title: {
    type: String,
    default: 'Kuesioner Tidak Ditemukan'
  },
  message: {
    type: String,
    default: 'Kuesioner yang kamu cari mungkin sudah dihapus, dipindahkan, atau link yang kamu buka tidak valid.'
  }
})
</script>