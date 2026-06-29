<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="router.push({ name: 'admin-likert' })"
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Likert Scale
      </button>
      <span class="text-gray-300">/</span>
      <span class="text-sm text-gray-800 font-medium">{{ currentLikert?.name ?? '...' }}</span>
    </div>

    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 mb-1">{{ currentLikert?.name ?? 'Memuat...' }}</h1>
          <p class="text-sm text-gray-500 max-w-3xl">{{ currentLikert?.description }}</p>
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

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <p class="text-sm text-gray-400">Memuat pertanyaan...</p>
    </div>

    <!-- Tabel -->
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
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
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-48">Kategori</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Jenis</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-40">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(q, index) in questions" :key="q.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-3 text-sm text-gray-600">{{ index + 1 }}</td>
              <td class="px-5 py-3 text-sm text-gray-800">{{ q.question }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ q.category }}</td>
              <td class="px-5 py-3">
                <span
                  class="text-xs px-2 py-1 rounded-full font-medium"
                  :class="q.favorable === 'favorable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ q.favorable === 'favorable' ? 'Favorable' : 'Unfavorable' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <button
                    @click="openEditModal(q)"
                    class="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2.5 2.5 0 113.536 3.536L12.536 14.536A4 4 0 019.707 15.707L8 16l.293-1.707A4 4 0 019 11z" />
                    </svg>
                  </button>
                  <button
                    @click="openDeleteModal(q.id)"
                    class="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7L18.132 18.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.994-1.858L5 7m5-3h4m-6 3V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="questions.length === 0">
              <td colspan="5" class="px-5 py-8 text-center text-sm text-gray-400">
                Belum ada pertanyaan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah/Edit Soal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-base font-semibold text-gray-900">{{ isEditing ? 'Edit Soal' : 'Tambah Soal Baru' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <!-- Kategori -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              v-model="selectedCategory"
              :disabled="isEditing"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Pilih Kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Daftar item soal -->
          <div class="space-y-3">
            <div
              v-for="(item, index) in questionItems"
              :key="index"
              class="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div class="flex justify-between items-center">
                <span class="text-xs font-medium text-gray-500">Soal {{ index + 1 }}</span>
                <button
                  v-if="!isEditing && questionItems.length > 1"
                  @click="removeQuestionField(index)"
                  class="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <textarea
                v-model="item.question"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                placeholder="Masukkan teks pertanyaan..."
              ></textarea>

              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="item.favorable" value="favorable" class="h-4 w-4" />
                  <span class="text-sm text-gray-700">Favorable</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="item.favorable" value="unfavorable" class="h-4 w-4" />
                  <span class="text-sm text-gray-700">Unfavorable</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Tambah soal lagi (hanya mode tambah) -->
          <button
            v-if="!isEditing"
            @click="addQuestionField"
            class="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            + Tambah soal lagi
          </button>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            @click="saveQuestion"
            :disabled="!isFormValid || saving"
            class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Menyimpan...' : 'Simpan Soal' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hapus -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900">Hapus Soal</h3>
          <p class="mt-2 text-sm text-gray-500">Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div class="px-6 py-4 border-t flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Batal</button>
          <button @click="confirmDelete" :disabled="saving" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-60">
            {{ saving ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert'
import { useLikertCategoryStore } from '@/stores/likert-category'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const likertId = route.params.id

const likertStore = useLikertStore()
const categoryStore = useLikertCategoryStore()

const { currentLikert, questions, loading } = storeToRefs(likertStore)
const { categories } = storeToRefs(categoryStore)

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deletingId = ref(null)
const saving = ref(false)

const selectedCategory = ref('')
const questionItems = ref([{ question: '', favorable: 'favorable' }])

onMounted(async () => {
  await Promise.all([
    likertStore.getLikertById(likertId),
    likertStore.fetchQuestions(likertId),
    categoryStore.fetchCategories(),
  ])
})

const isFormValid = computed(() =>
  selectedCategory.value !== '' &&
  questionItems.value.every(item => item.question.trim() !== '')
)

const addQuestionField = () => {
  questionItems.value.push({ question: '', favorable: 'favorable' })
}

const removeQuestionField = (index) => {
  questionItems.value.splice(index, 1)
}

const openEditModal = (q) => {
  isEditing.value = true
  editingId.value = q.id
  selectedCategory.value = q.category
  questionItems.value = [{ question: q.question, favorable: q.favorable }]
  showAddModal.value = true
}

const openDeleteModal = (id) => {
  deletingId.value = id
  showDeleteModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  editingId.value = null
  selectedCategory.value = ''
  questionItems.value = [{ question: '', favorable: 'favorable' }]
}

const saveQuestion = async () => {
  if (!isFormValid.value) return
  saving.value = true
  try {
    if (isEditing.value) {
      await likertStore.updateQuestion(likertId, editingId.value, {
        ...questionItems.value[0],
        category: selectedCategory.value,
      })
    } else {
      for (const item of questionItems.value) {
        await likertStore.addQuestion(likertId, {
          ...item,
          category: selectedCategory.value,
        })
      }
    }
    closeModal()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  saving.value = true
  try {
    await likertStore.deleteQuestion(likertId, deletingId.value)
    showDeleteModal.value = false
    deletingId.value = null
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>