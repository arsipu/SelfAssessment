<template>
  <div class="max-w-2xl mx-auto px-4 py-6 pb-20 sm:py-10">
      <!-- tombol kembali -->
      <button @click="$router.back()" class="flex items-center gap-2 text-sm text-gray-500 mb-5 sm:mb-6 cursor-pointer">
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
        Kembali
      </button>
    <div class="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 shadow-sm">

      <div class="mb-5 sm:mb-6">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ hollandStore.config?.name }}</h1>
        <p class="text-xs sm:text-sm text-gray-500 mt-1">{{ hollandStore.config?.description }}</p>
      </div>

      <form @submit.prevent="goToKuesioner" class="space-y-4 sm:space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

          <div class="sm:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Nama <span class="text-red-500">*</span></label>
            <input v-model="responden.name" type="text" placeholder="Nama lengkap" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Jurusan <span class="text-red-500">*</span></label>
            <input v-model="responden.major" type="text" placeholder="Contoh: Sistem Informasi" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Sekolah/Universitas <span class="text-red-500">*</span></label>
            <input v-model="responden.school" type="text" placeholder="Nama sekolah/universitas" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Jenis Kelamin <span class="text-red-500">*</span></label>
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-1 sm:py-2">
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.gender" type="radio" value="Laki-laki" required class="w-4 h-4" /> Laki-laki
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.gender" type="radio" value="Perempuan" class="w-4 h-4" /> Perempuan
              </label>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Tanggal Lahir/Usia <span class="text-red-500">*</span></label>
            <input v-model="responden.birthDateAge" type="text" placeholder="Contoh: 12 Mei 2005 / 20 tahun" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Pekerjaan</label>
            <input v-model="responden.occupation" type="text" placeholder="Contoh: Mahasiswa"
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Tanggal Tes <span class="text-red-500">*</span></label>
            <input v-model="responden.testDate" type="date" required
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="sm:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Tujuan Tes</label>
            <input v-model="responden.testPurpose" type="text" placeholder="Contoh: Bimbingan karier"
              class="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>
        </div>

        <button type="submit" :disabled="submitting"
          class="w-full mt-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none">
          {{ submitting ? 'Menyimpan...' : 'Lanjut ke Kuesioner →' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSessionStore } from '@/stores/holland/holland-session'

const router = useRouter()
const hollandStore = useHollandStore()
const hollandSessionStore = useHollandSessionStore()

// Holland singleton -> nggak ada id dari route, langsung fetch config
const responden = ref({
  name: '',
  major: '',
  school: '',
  gender: '',
  birthDateAge: '',
  occupation: '',
  testDate: '',
  testPurpose: '',
})

const submitting = ref(false)

onMounted(async () => {
  await hollandStore.fetchConfig()

  const saved = hollandSessionStore.getSession()
  if (saved) {
    // udah pernah mulai sesi -> langsung lempar ke kuesioner
    router.push({ name: 'holland-questions' })
  }
})

async function goToKuesioner() {
  if (submitting.value) return
  submitting.value = true
  try {
    await hollandSessionStore.startSession({ ...responden.value })
    router.push({ name: 'holland-questions' })
  } catch (error) {
    alert('Gagal memulai sesi, coba lagi.')
  } finally {
    submitting.value = false
  }
}
</script>