<template>
  <div class="max-w-2xl mx-auto px-4 py-6 pb-20 sm:py-10">
    <div class="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 shadow-sm">

      <div class="mb-5 sm:mb-6">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ likertStore.currentLikert?.name }}</h1>
        <p class="text-xs sm:text-sm text-gray-500 mt-1">{{ likertStore.currentLikert?.description }}</p>
      </div>

      <form @submit.prevent="goToKuesioner" class="space-y-4 sm:space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Nama <span class="text-red-500">*</span></label>
            <input v-model="responden.nama" type="text" placeholder="Nama lengkap" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Kelas <span class="text-red-500">*</span></label>
            <input v-model="responden.kelas" type="text" placeholder="Contoh: XII RPL 1" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="sm:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Sekolah <span class="text-red-500">*</span></label>
            <input v-model="responden.sekolah" type="text" placeholder="Nama sekolah" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="sm:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Jurusan / Kompetensi Keahlian <span class="text-red-500">*</span></label>
            <input v-model="responden.jurusan" type="text" placeholder="Contoh: Rekayasa Perangkat Lunak" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Usia <span class="text-red-500">*</span></label>
            <input v-model="responden.usia" type="number" min="10" max="30" placeholder="Usia (tahun)" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Jenis Kelamin <span class="text-red-500">*</span></label>
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-1 sm:py-2">
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.jenisKelamin" type="radio" value="L" required class="w-4 h-4" /> Laki-laki
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.jenisKelamin" type="radio" value="P" class="w-4 h-4" /> Perempuan
              </label>
            </div>
          </div>

          <div class="sm:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Pernah PKL <span class="text-red-500">*</span></label>
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-1 sm:py-2">
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.pkl" type="radio" value="Ya" required class="w-4 h-4" /> Ya
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.pkl" type="radio" value="Belum" class="w-4 h-4" /> Belum
              </label>
            </div>
          </div>
        </div>

        <button type="submit"
          class="w-full mt-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition active:scale-[0.98]">
          Lanjut ke Kuesioner →
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertSessionStore } from '@/stores/likert/likert-session'

const route = useRoute()
const router = useRouter()
const likertStore = useLikertStore()
const likertSessionStore = useLikertSessionStore()

const likertId = route.params.id

const responden = ref({
  nama: '', kelas: '', sekolah: '', jurusan: '',
  usia: '', jenisKelamin: '', pkl: ''
})

const submitting = ref(false)

onMounted(async () => {
  await likertStore.getLikertById(likertId)

  const saved = likertSessionStore.getSession(likertId)
  if (saved) {
    // udah pernah mulai sesi -> langsung lempar ke kuesioner
    router.push({ name: 'likert-questions', params: { id: likertId } })
  }
})

async function goToKuesioner() {
  if (submitting.value) return
  submitting.value = true
  try {
    await likertSessionStore.startSession(likertId, { ...responden.value })
    router.push({ name: 'likert-questions', params: { id: likertId } })
  } catch (error) {
    alert('Gagal memulai sesi, coba lagi.')
  } finally {
    submitting.value = false
  }
}
</script>