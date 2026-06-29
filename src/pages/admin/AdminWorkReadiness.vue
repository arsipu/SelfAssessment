<template>
  <div>
    <!-- Header / Penjelasan Singkat -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 mb-1">Work Readiness Scale</h1>
          <p class="text-sm text-gray-500 max-w-3xl">
            Instrumen ini digunakan untuk mengukur tingkat kesiapan kerja responden berdasarkan 4 dimensi utama: Personal Characteristics, Organisational Acumen, Work Competence, dan Social Intelligence. Skala diukur menggunakan indikator Favorable dan Unfavorable.
          </p>
        </div>
        <button 
          @click="showAddModal = true"
          class="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Soal
        </button>
      </div>
    </div>

    <!-- Tabel Daftar Soal -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 class="text-sm font-medium text-gray-800">Daftar Pertanyaan</h2>
        <span class="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
          Total: {{ questions.length }} Soal
        </span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white border-b border-gray-100">
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-16">No</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Pertanyaan</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-48">Dimensi</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Jenis</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-40">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(q, index) in questions" :key="q.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-3 text-sm text-gray-600">{{ index + 1 }}</td>
              <td class="px-5 py-3 text-sm text-gray-800">{{ q.text }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ q.dimension }}</td>
              <td class="px-5 py-3">
                <span 
                  class="text-xs px-2 py-1 rounded-full font-medium"
                  :class="q.type === 'Favorable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ q.type }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                    <!-- Edit -->
                    <button
                        @click="editQuestion(q)"
                        class="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Soal"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg"
                            class="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2.5 2.5 0 113.536 3.536L12.536 14.536A4 4 0 019.707 15.707L8 16l.293-1.707A4 4 0 019 11z"
                            />
                        </svg>
                    </button>

                    <!-- Hapus -->
                    <button
                        @click="openDeleteModal(q.id)"
                        class="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7L18.132 18.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.994-1.858L5 7m5-3h4m-6 3V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8" />
                    </svg>
                    </button>
                </div>
            </td>
            </tr>
            <tr v-if="questions.length === 0">
              <td colspan="5" class="px-5 py-8 text-center text-sm text-gray-400">
                Belum ada data soal.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah Soal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-base font-semibold text-gray-900">{{ isEditing ? 'Edit Soal' : 'Tambah Soal Baru' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
            <textarea 
              v-model="newQuestion.text"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              placeholder="Masukkan teks pertanyaan..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dimensi</label>
            <select 
              v-model="newQuestion.dimension"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            >
              <option value="" disabled>Pilih Dimensi</option>
              <option value="Personal Characteristics">Personal Characteristics</option>
              <option value="Organisational Acumen">Organisational Acumen</option>
              <option value="Work Competence">Work Competence</option>
              <option value="Social Intelligence">Social Intelligence</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Aitem</label>
            <div class="flex gap-4 mt-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="newQuestion.type" value="Favorable" class="text-gray-900 focus:ring-gray-900 h-4 w-4">
                <span class="text-sm text-gray-700">Favorable</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="newQuestion.type" value="Unfavorable" class="text-gray-900 focus:ring-gray-900 h-4 w-4">
                <span class="text-sm text-gray-700">Unfavorable</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button 
            @click="saveQuestion"
            :disabled="!isFormValid"
            class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Simpan Soal
          </button>
        </div>
      </div>
    </div>
    <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-900">
                    Hapus Soal
                </h3>

                <p class="mt-2 text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus soal ini?
                    Tindakan ini tidak dapat dibatalkan.
                </p>
            </div>

            <div class="px-6 py-4 border-t flex justify-end gap-3">
                <button
                    @click="showDeleteModal = false"
                    class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Batal
                </button>

                <button
                    @click="deleteQuestion"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Hapus
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isEditing = ref(false)
const editingId = ref(null)

// State untuk menampilkan/menyembunyikan modal
const showAddModal = ref(false)

// State untuk menampilkan/menyembunyikan modal konfirmasi hapus
const showDeleteModal = ref(false)
const deletingId = ref(null)

// Data hardcode awal berdasarkan dokumen
const questions = ref([
  { 
    id: 1, 
    text: 'Saya mudah memasukkan perasaan pribadi ketika menghadapi masalah.', 
    dimension: 'Personal Characteristics', 
    type: 'Unfavorable' 
  },
  { 
    id: 2, 
    text: 'Saya merasa nyaman berbicara dengan guru, pembimbing, atau atasan.', 
    dimension: 'Personal Characteristics', 
    type: 'Favorable' 
  },
  { 
    id: 3, 
    text: 'Saya belajar dari teman atau rekan yang bekerja bersama saya.', 
    dimension: 'Organisational Acumen', 
    type: 'Favorable' 
  },
  { 
    id: 4, 
    text: 'Saya percaya pada pengetahuan yang telah saya pelajari.', 
    dimension: 'Work Competence', 
    type: 'Favorable' 
  },
  { 
    id: 5, 
    text: 'Saya mudah beradaptasi dengan situasi sosial yang berbeda.', 
    dimension: 'Social Intelligence', 
    type: 'Favorable' 
  }
])

// State untuk form tambah soal
const newQuestion = ref({
  text: '',
  dimension: '',
  type: ''
})

// Validasi sederhana: form valid jika semua field terisi
const isFormValid = computed(() => {
  return newQuestion.value.text.trim() !== '' && 
         newQuestion.value.dimension !== '' && 
         newQuestion.value.type !== ''
})

// Fungsi untuk menutup modal dan mereset form
const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  editingId.value = null

  newQuestion.value = {
    text: '',
    dimension: '',
    type: ''
  }
}

const editQuestion = (question) => {
  isEditing.value = true
  editingId.value = question.id

  newQuestion.value = {
    text: question.text,
    dimension: question.dimension,
    type: question.type
  }

  showAddModal.value = true
}

const openDeleteModal = (id) => {
  deletingId.value = id
  showDeleteModal.value = true
}

const deleteQuestion = () => {
  questions.value = questions.value.filter(
    q => q.id !== deletingId.value
  )

  showDeleteModal.value = false
  deletingId.value = null
}

// Fungsi untuk menyimpan soal ke dalam array lokal (hardcode)
const saveQuestion = () => {
  if (!isFormValid.value) return

  if (isEditing.value) {
    const index = questions.value.findIndex(
      q => q.id === editingId.value
    )

    if (index !== -1) {
      questions.value[index] = {
        id: editingId.value,
        ...newQuestion.value
      }
    }
  } else {
    questions.value.push({
      id: Date.now(),
      ...newQuestion.value
    })
  }

  // Setelah integrasi Firebase, Anda bisa mengganti logic di atas 
  // dengan fungsi `await addDoc(collection(db, 'questions'), { ... })`

  closeModal()
}
</script>