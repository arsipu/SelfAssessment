<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="router.push({ name: 'admin-likert' })"
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="h-4 w-4 shrink-0" />
        Likert Scale
      </button>
      <span class="text-gray-300">/</span>
      <span class="text-sm text-gray-800 font-medium truncate max-w-[200px] md:max-w-none">{{ currentLikert?.name ?? '...' }}</span>
    </div>

    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 class="text-lg md:text-xl font-semibold text-gray-900 mb-1">{{ currentLikert?.name ?? 'Memuat...' }}</h1>
          <p class="text-sm text-gray-500 max-w-3xl">{{ currentLikert?.description }}</p>
        </div>
        <button
          @click="router.push({ name: 'admin-likert-submissions', params: { id: likertId } })"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-right-to-bracket" class="w-4 h-4 shrink-0" />

          Lihat Submissions
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-gray-400">Memuat pertanyaan...</p>
    </div>

    <!-- Blocks per Category -->
    <div v-else class="space-y-4 md:space-y-6">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <!-- Category Header -->
        <div class="px-4 md:px-5 py-3 md:py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 class="text-sm font-medium text-gray-800">{{ cat.name }}</h2>
          <span class="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
            {{ questionsByCategory(cat.id).length }} Soal
          </span>
        </div>

        <!-- Tabel -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white border-b border-gray-100">
                <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">No</th>
                <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Pertanyaan</th>
                <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Jenis</th>
                <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(q, index) in questionsByCategory(cat.id)"
                :key="q.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 md:px-5 py-3 text-sm text-gray-600">{{ index + 1 }}</td>
                <td class="px-4 md:px-5 py-3 text-sm text-gray-800">{{ q.question }}</td>
                <td class="px-4 md:px-5 py-3">
                  <span
                    class="text-xs px-2 py-1 rounded-full font-medium"
                    :class="q.favorable === 'favorable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ q.favorable === 'favorable' ? 'Favorable' : 'Unfavorable' }}
                  </span>
                </td>
                <td class="px-4 md:px-5 py-3">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openEditModal(q)"
                      class="p-2.5 md:p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                      title="Edit"
                    >
                      <font-awesome-icon icon="fa-solid fa-pen" class="w-5 h-5 shrink-0" />
                    </button>
                    <button
                      @click="openDeleteModal(q.id)"
                      class="p-2.5 md:p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                      title="Hapus"
                    >
                      <font-awesome-icon icon="fa-solid fa-trash" class="w-5 h-5 shrink-0" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="questionsByCategory(cat.id).length === 0">
                <td colspan="4" class="px-4 md:px-5 py-6 text-center text-sm text-gray-400">
                  Belum ada pertanyaan untuk kategori ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Inline Add Form -->
        <div class="border-t border-gray-100">
          <!-- Form aktif -->
          <div v-if="activeAddCategoryId === cat.id" class="px-4 md:px-5 py-4 bg-gray-50">
            <div class="flex flex-col sm:flex-row items-start gap-3">
              <textarea
                v-model="inlineForm.question"
                rows="2"
                class="w-full sm:flex-1 px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
                placeholder="Masukkan teks pertanyaan..."
                autofocus
              ></textarea>

              <div class="flex flex-row sm:flex-col gap-3 sm:gap-2 pt-1 shrink-0 flex-wrap">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="inlineForm.favorable" value="favorable" class="h-4 w-4 shrink-0" />
                  <span class="text-sm text-gray-700 whitespace-nowrap">Favorable</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="inlineForm.favorable" value="unfavorable" class="h-4 w-4 shrink-0" />
                  <span class="text-sm text-gray-700 whitespace-nowrap">Unfavorable</span>
                </label>
              </div>

              <div class="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button
                  @click="saveInline(cat.id)"
                  :disabled="!inlineForm.question.trim() || saving"
                  class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap h-10 cursor-pointer"
                >
                  {{ saving ? 'Menyimpan...' : 'Simpan' }}
                </button>
                <button
                  @click="cancelInline"
                  class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors h-10 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>

          <!-- Tombol tambah -->
          <button
            v-else
            @click="openInlineAdd(cat.id)"
            class="w-full px-4 md:px-5 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 h-10 cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
            Tambah Soal
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Soal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        <div class="px-4 md:px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 class="text-base font-semibold text-gray-900">Edit Soal</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-4 md:p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input
              :value="categories.find(c => c.id === editForm.categoryId)?.name ?? '-'"
              disabled
              class="w-full px-3 py-2.5 md:py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
            <textarea
              v-model="editForm.question"
              rows="3"
              class="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
              placeholder="Masukkan teks pertanyaan..."
            ></textarea>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="editForm.favorable" value="favorable" class="h-4 w-4 shrink-0" />
              <span class="text-sm text-gray-700">Favorable</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="editForm.favorable" value="unfavorable" class="h-4 w-4 shrink-0" />
              <span class="text-sm text-gray-700">Unfavorable</span>
            </label>
          </div>
        </div>

        <div class="px-4 md:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            @click="closeEditModal"
            class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveEdit"
            :disabled="!editForm.question.trim() || saving"
            class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed h-10 cursor-pointer"
          >
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hapus -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">
        <div class="p-4 md:p-6 overflow-y-auto">
          <h3 class="text-lg font-semibold text-gray-900">Hapus Soal</h3>
          <p class="mt-2 text-sm text-gray-500">Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div class="px-4 md:px-6 py-4 border-t flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button @click="showDeleteModal = false" class="w-full sm:w-auto px-4 py-2.5 md:py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm h-10 cursor-pointer">Batal</button>
          <button @click="confirmDelete" :disabled="saving" class="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-60 h-10 cursor-pointer">
            {{ saving ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert/likert'
import { useLikertQuestionsStore } from '@/stores/likert/likert-questions'
import { useLikertCategoryStore } from '@/stores/likert/likert-category'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const likertId = route.params.id

const likertStore = useLikertStore()
const likertQuestionsStore = useLikertQuestionsStore()
const categoryStore = useLikertCategoryStore()

const { currentLikert } = storeToRefs(likertStore)
const { questions, loading } = storeToRefs(likertQuestionsStore)
const { categories } = storeToRefs(categoryStore)

// ── State ──────────────────────────────────────────────────

const saving = ref(false)

// Inline add
const activeAddCategoryId = ref(null)
const inlineForm = ref({ question: '', favorable: 'favorable' })

// Edit modal
const showEditModal = ref(false)
const editingId = ref(null)
const editForm = ref({ question: '', favorable: 'favorable', categoryId: '' })

// Delete modal
const showDeleteModal = ref(false)
const deletingId = ref(null)

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([
    likertStore.getLikertById(likertId),
    likertQuestionsStore.fetchQuestions(likertId),
    categoryStore.fetchCategories(),
  ])
})

// ── Helpers ────────────────────────────────────────────────

const questionsByCategory = (categoryId) =>
  questions.value.filter((q) => q.categoryId === categoryId)

// ── Inline Add ─────────────────────────────────────────────

const openInlineAdd = (categoryId) => {
  activeAddCategoryId.value = categoryId
  inlineForm.value = { question: '', favorable: 'favorable' }
}

const cancelInline = () => {
  activeAddCategoryId.value = null
  inlineForm.value = { question: '', favorable: 'favorable' }
}

const saveInline = async (categoryId) => {
  if (!inlineForm.value.question.trim()) return
  saving.value = true
  try {
    await likertQuestionsStore.addQuestion(likertId, {
      question: inlineForm.value.question.trim(),
      favorable: inlineForm.value.favorable,
      categoryId,
    })
    cancelInline()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

// ── Edit Modal ─────────────────────────────────────────────

const openEditModal = (q) => {
  editingId.value = q.id
  editForm.value = { question: q.question, favorable: q.favorable, categoryId: q.categoryId }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingId.value = null
  editForm.value = { question: '', favorable: 'favorable', categoryId: '' }
}

const saveEdit = async () => {
  if (!editForm.value.question.trim()) return
  saving.value = true
  try {
    await likertQuestionsStore.updateQuestion(likertId, editingId.value, {
      question: editForm.value.question.trim(),
      favorable: editForm.value.favorable,
      categoryId: editForm.value.categoryId,
    })
    closeEditModal()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

// ── Delete Modal ───────────────────────────────────────────

const openDeleteModal = (id) => {
  deletingId.value = id
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  saving.value = true
  try {
    await likertQuestionsStore.deleteQuestion(likertId, deletingId.value)
    showDeleteModal.value = false
    deletingId.value = null
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>