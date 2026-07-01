<template>
  <div class="max-w-2xl mx-auto px-4 py-10 pb-20">
    <div class="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ likertStore.currentLikert?.name }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ likertStore.currentLikert?.description }}</p>
      </div>

      <!-- <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 leading-relaxed mb-8">
        <strong>Petunjuk:</strong> Berikan tanda pada kolom yang paling sesuai dengan diri Anda.<br/>
        SS = Sangat Sesuai &nbsp;│&nbsp; S = Sesuai &nbsp;│&nbsp; TS = Tidak Sesuai &nbsp;│&nbsp; STS = Sangat Tidak Sesuai<br/>
        <em>Tidak ada jawaban benar atau salah. Jawablah jujur sesuai kondisi Anda.</em>
      </div> -->

      <form @submit.prevent="goToKuesioner" class="space-y-5">
        <div class="grid grid-cols-2 gap-4">

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Nama <span class="text-red-500">*</span></label>
            <input v-model="responden.nama" type="text" placeholder="Nama lengkap" required
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Kelas <span class="text-red-500">*</span></label>
            <input v-model="responden.kelas" type="text" placeholder="Contoh: XII RPL 1" required
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="col-span-2 flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Sekolah <span class="text-red-500">*</span></label>
            <input v-model="responden.sekolah" type="text" placeholder="Nama sekolah" required
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="col-span-2 flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Jurusan / Kompetensi Keahlian <span class="text-red-500">*</span></label>
            <input v-model="responden.jurusan" type="text" placeholder="Contoh: Rekayasa Perangkat Lunak" required
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Usia <span class="text-red-500">*</span></label>
            <input v-model="responden.usia" type="number" min="10" max="30" placeholder="Usia (tahun)" required
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Jenis Kelamin <span class="text-red-500">*</span></label>
            <div class="flex gap-5 items-center py-2">
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.jenisKelamin" type="radio" value="L" required /> Laki-laki
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.jenisKelamin" type="radio" value="P" /> Perempuan
              </label>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Pernah PKL <span class="text-red-500">*</span></label>
            <div class="flex gap-5 items-center py-2">
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.pkl" type="radio" value="Ya" required /> Ya
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input v-model="responden.pkl" type="radio" value="Belum" /> Belum
              </label>
            </div>
          </div>

        </div>

        <button type="submit"
          class="w-full mt-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition">
          Lanjut ke Kuesioner →
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert'
import { useLikertSessionStore } from '@/stores/likert-session'

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