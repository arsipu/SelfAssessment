<template>
  <div class="max-w-2xl mx-auto px-4 py-6 pb-20 sm:py-10">
      <!-- tombol kembali ke beranda view (/) -->
      <button @click="$router.push('/')" class="flex items-center gap-2 text-sm text-text-secondary mb-5 sm:mb-6 cursor-pointer">
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
        Kembali
      </button>
    <div class="bg-surface border border-border rounded-2xl p-5 sm:p-8 shadow-sm">

      <div class="mb-5 sm:mb-6">
        <h1 class="text-xl sm:text-2xl font-bold text-text-primary">{{ hollandStore.currentHolland?.name }}</h1>
        <p class="text-xs sm:text-sm text-text-secondary mt-1">{{ hollandStore.currentHolland?.description }}</p>
      </div>

      <form @submit.prevent="goToKuesioner" class="space-y-4 sm:space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

          <div class="sm:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-semibold text-text-primary">Nama <span class="text-danger">*</span></label>
            <input v-model="responden.name" type="text" placeholder="Nama lengkap" required
              class="px-3 py-2.5 border border-border rounded-lg text-sm bg-surface-muted focus:outline-none focus:border-instrument focus:bg-surface transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-text-primary">Jurusan <span class="text-danger">*</span></label>
            <input v-model="responden.major" type="text" placeholder="Contoh: Sistem Informasi" required
              class="px-3 py-2.5 border border-border rounded-lg text-sm bg-surface-muted focus:outline-none focus:border-instrument focus:bg-surface transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-text-primary">Sekolah/Universitas <span class="text-danger">*</span></label>
            <input v-model="responden.school" type="text" placeholder="Nama sekolah/universitas" required
              class="px-3 py-2.5 border border-border rounded-lg text-sm bg-surface-muted focus:outline-none focus:border-instrument focus:bg-surface transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-text-primary">Jenis Kelamin <span class="text-danger">*</span></label>
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-1 sm:py-2">
              <label class="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                <input v-model="responden.gender" name="jenisKelamin" type="radio" value="Laki-laki" required class="w-4 h-4" /> Laki-laki
              </label>
              <label class="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                <input v-model="responden.gender" name="jenisKelamin" type="radio" value="Perempuan" class="w-4 h-4" /> Perempuan
              </label>
            </div>
          </div>

          <!-- Tanggal Lahir -> usia dihitung otomatis, gak diinput manual -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-text-primary">Tanggal Lahir <span class="text-danger">*</span></label>
            <input v-model="responden.birthDate" type="date" required
              class="px-3 py-2.5 border border-border rounded-lg text-sm bg-surface-muted focus:outline-none focus:border-instrument focus:bg-surface transition" />
            <p v-if="computedAge !== null" class="text-xs text-text-muted mt-0.5">
              Usia saat tes: {{ computedAge }} tahun
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-text-primary">Pekerjaan</label>
            <input v-model="responden.occupation" type="text" placeholder="Contoh: Mahasiswa"
              class="px-3 py-2.5 border border-border rounded-lg text-sm bg-surface-muted focus:outline-none focus:border-instrument focus:bg-surface transition" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-text-primary">Tanggal Tes <span class="text-danger">*</span></label>
            <input v-model="responden.testDate" type="date" required
              class="px-3 py-2.5 border border-border rounded-lg text-sm bg-surface-muted focus:outline-none focus:border-instrument focus:bg-surface transition" />
          </div>

          <div class="sm:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-semibold text-text-primary">Tujuan Tes</label>
            <input v-model="responden.testPurpose" type="text" placeholder="Contoh: Bimbingan karier"
              class="px-3 py-2.5 border border-border rounded-lg text-sm bg-surface-muted focus:outline-none focus:border-instrument focus:bg-surface transition" />
          </div>
        </div>

        <p v-if="loadError" class="text-xs text-danger">{{ loadError }}</p>

        <button type="submit" :disabled="submitting || preparing"
          class="w-full mt-2 py-3 bg-instrument text-text-on-primary text-sm font-semibold rounded-xl hover:bg-instrument-hover transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none">
          {{ submitButtonLabel }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHollandStore } from '@/stores/holland/holland'
import { useHollandSessionStore } from '@/stores/holland/holland-session'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { useHollandColumnsStore } from '@/stores/holland/holland-columns'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'

const route = useRoute()
const router = useRouter()
const hollandStore = useHollandStore()
const hollandSessionStore = useHollandSessionStore()

const riasecStore = useHollandRiasecStore()
const { riasecList } = storeToRefs(riasecStore)

const columnsStore = useHollandColumnsStore()
const { columnsByRiasec } = storeToRefs(columnsStore)

const questionsStore = useHollandQuestionsStore()
const { allQuestions } = storeToRefs(questionsStore)

const hollandSlug = route.params.slug
const hollandId = computed(() => hollandStore.currentHolland?.id || null)

const responden = ref({
  name: '',
  major: '',
  school: '',
  gender: '',
  birthDate: '',
  occupation: '',
  testDate: '',
  testPurpose: '',
})

const submitting = ref(false)
// true selama riasec/columns/questions masih di-fetch di background
// (dimulai pas onMounted, biasanya udah selesai duluan sebelum user
// selesai isi form — tapi tetap dijaga biar gak startSession dgn data kosong)
const preparing = ref(true)
const loadError = ref('')

const submitButtonLabel = computed(() => {
  if (submitting.value) return 'Menyimpan...'
  if (preparing.value) return 'Menyiapkan soal...'
  return 'Lanjut ke Kuesioner →'
})

// Usia dihitung dari birthDate vs testDate (bukan hari ini),
// biar akurat sesuai kapan tesnya beneran dilakukan
const computedAge = computed(() => {
  if (!responden.value.birthDate || !responden.value.testDate) return null

  const birth = new Date(responden.value.birthDate)
  const test = new Date(responden.value.testDate)

  if (isNaN(birth) || isNaN(test) || test < birth) return null

  let age = test.getFullYear() - birth.getFullYear()
  const monthDiff = test.getMonth() - birth.getMonth()
  const dayDiff = test.getDate() - birth.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--
  }

  return age
})

// Helper format tampilan gabungan, dipakai di summary/PDF export
// biar tetap konsisten sama gaya dokumen kertas aslinya
function formatBirthDateAge(birthDate, age) {
  if (!birthDate) return '-'
  const d = new Date(birthDate)
  const formatted = d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  return age !== null ? `${formatted} / ${age} tahun` : formatted
}

// Ambil semua soal (via riasec -> columns -> questions) lebih awal,
// supaya begitu user submit form, `allQuestions` udah siap dipakai
// buat bangun `answers` awal (semua soal, isChecked: false).
async function prepareQuestions() {
  preparing.value = true
  loadError.value = ''
  try {
    await riasecStore.fetchRiasecList(hollandId.value)
    const riasecIds = riasecList.value.map((c) => c.id)
    await columnsStore.fetchAllColumns(hollandId.value, riasecIds)
    await questionsStore.fetchAllQuestions(hollandId.value, columnsByRiasec.value)

    if (allQuestions.value.length === 0) {
      loadError.value = 'Belum ada pertanyaan yang tersedia untuk instrumen ini.'
    }
  } catch (error) {
    console.error('Gagal menyiapkan soal:', error)
    loadError.value = 'Gagal memuat soal, silakan muat ulang halaman.'
  } finally {
    preparing.value = false
  }
}

onMounted(async () => {
  // ambil data instrumen holland berdasarkan slug
  await hollandStore.getHollandBySlug(hollandSlug)

  // jika instrumen tidak ditemukan, lempar ke halaman not-available
  if (hollandStore.currentHolland === null) {
    router.push({
      name: 'not-available',
      query: {
        title: 'Instrumen Tidak Ditemukan',
        message: 'Instrumen yang kamu cari mungkin sudah dihapus atau link tidak valid.'
      }
    })
    return
  }

  const saved = hollandSessionStore.getSession(hollandId.value)
  if (saved) {
    // udah pernah mulai sesi -> langsung lempar ke kuesioner
    router.push({ name: 'holland-questions', params: { slug: hollandSlug } })
    return
  }

  await prepareQuestions()
})

async function goToKuesioner() {
  if (submitting.value) return

  // jaga-jaga kalau user submit form secepat kilat sebelum prepareQuestions selesai
  if (preparing.value || allQuestions.value.length === 0) {
    alert('Soal belum siap, tunggu sebentar lalu coba lagi.')
    return
  }

  submitting.value = true
  try {
    await hollandSessionStore.startSession(
      hollandId.value,
      {
        ...responden.value,
        age: computedAge.value,
      },
      allQuestions.value
    )
    router.push({ name: 'holland-questions', params: { slug: hollandSlug } })
  } catch (error) {
    console.error(error)
    alert('Gagal memulai sesi, coba lagi.')
  } finally {
    submitting.value = false
  }
}
</script>