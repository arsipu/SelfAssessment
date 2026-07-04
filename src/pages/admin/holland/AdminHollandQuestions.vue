<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="router.push({ name: 'admin-holland' })"
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Holland RIASEC
      </button>
      <span class="text-gray-300">/</span>
      <span class="text-sm text-gray-800 font-medium">Pertanyaan</span>
    </div>

    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h1 class="text-lg font-semibold text-gray-900 mb-1">Kelola Pertanyaan RIASEC</h1>
      <p class="text-sm text-gray-500 max-w-3xl">
        Setiap kategori punya 3 kolom pernyataan: Saya adalah, Saya mampu, dan Saya menyukai.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <p class="text-sm text-gray-400">Memuat pertanyaan...</p>
    </div>

    <!-- Blocks per Category -->
    <div v-else class="space-y-6">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <!-- Category Header -->
        <div class="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 class="text-sm font-medium text-gray-800">{{ cat.name }} <span class="text-gray-400">({{ cat.id }})</span></h2>
          <span class="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
            {{ questionsByCategory(cat.id).length }} Soal
          </span>
        </div>

        <!-- Sub-block per Column -->
        <div v-for="col in columns" :key="col.id" class="border-b border-gray-100 last:border-b-0">
          <div class="px-5 py-2.5 bg-gray-50/50">
            <span class="text-xs font-medium text-gray-600 uppercase tracking-wider">{{ col.label }}</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(q, index) in questionsByCategoryAndColumn(cat.id, col.id)"
                  :key="q.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-5 py-3 text-sm text-gray-600 w-12">{{ index + 1 }}</td>
                  <td class="px-5 py-3 text-sm text-gray-800">{{ q.question }}</td>
                  <td class="px-5 py-3 w-24">
                    <div class="flex items-center gap-2 justify-end">
                      <button
                        @click="openEditModal(q)"
                        class="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2.5 2.5 0 113.536 3.536L12.536 14.536A4 4 0 019.707 15.707L8 16l.293-1.707A4 4 0 019 11z" />
                        </svg>
                      </button>
                      <button
                        @click="openDeleteModal(q.id)"
                        class="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7L18.132 18.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.994-1.858L5 7m5-3h4m-6 3V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="questionsByCategoryAndColumn(cat.id, col.id).length === 0">
                  <td colspan="3" class="px-5 py-4 text-center text-xs text-gray-400">
                    Belum ada pernyataan di kolom ini.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Inline Add Form -->
          <div v-if="activeAddKey === keyOf(cat.id, col.id)" class="px-5 py-3 bg-gray-50">
            <div class="flex items-start gap-3">
              <input
                v-model="inlineForm.question"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                placeholder="Masukkan teks pernyataan..."
                autofocus
                @keyup.enter="saveInline(cat.id, col.id)"
              />
              <button
                @click="saveInline(cat.id, col.id)"
                :disabled="!inlineForm.question.trim() || saving"
                class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
              <button
                @click="cancelInline"
                class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>

          <button
            v-else
            @click="openInlineAdd(cat.id, col.id)"
            class="w-full px-5 py-2.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pernyataan
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Soal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-base font-semibold text-gray-900">Edit Pernyataan</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input
              :value="categories.find(c => c.id === editForm.category)?.name ?? '-'"
              disabled
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kolom</label>
            <select
              v-model="editForm.column"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            >
              <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teks Pernyataan</label>
            <textarea
              v-model="editForm.question"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            @click="closeEditModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveEdit"
            :disabled="!editForm.question.trim() || saving"
            class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hapus -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900">Hapus Pernyataan</h3>
          <p class="mt-2 text-sm text-gray-500">Apakah Anda yakin ingin menghapus pernyataan ini? Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div class="px-6 py-4 border-t flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm cursor-pointer">Batal</button>
          <button @click="confirmDelete" :disabled="saving" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-60 cursor-pointer">
            {{ saving ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  useHollandQuestionsStore,
  RIASEC_CATEGORIES,
  RIASEC_COLUMNS,
} from '@/stores/holland/holland-questions'

const router = useRouter()
const questionsStore = useHollandQuestionsStore()
const { questions, loading } = storeToRefs(questionsStore)

const categories = RIASEC_CATEGORIES
const columns = RIASEC_COLUMNS

// ── State ──────────────────────────────────────────────────

const saving = ref(false)

// Inline add — key gabungan category+column biar cuma 1 form aktif dalam satu waktu
const activeAddKey = ref(null)
const inlineForm = ref({ question: '' })
const keyOf = (categoryId, columnId) => `${categoryId}__${columnId}`

// Edit modal
const showEditModal = ref(false)
const editingId = ref(null)
const editForm = ref({ question: '', category: '', column: '' })

// Delete modal
const showDeleteModal = ref(false)
const deletingId = ref(null)

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {
  await questionsStore.fetchQuestions()
})

// ── Helpers ────────────────────────────────────────────────

const questionsByCategory = (categoryId) =>
  questions.value.filter((q) => q.category === categoryId)

const questionsByCategoryAndColumn = (categoryId, columnId) =>
  questions.value.filter((q) => q.category === categoryId && q.column === columnId)

// ── Inline Add ─────────────────────────────────────────────

const openInlineAdd = (categoryId, columnId) => {
  activeAddKey.value = keyOf(categoryId, columnId)
  inlineForm.value = { question: '' }
}

const cancelInline = () => {
  activeAddKey.value = null
  inlineForm.value = { question: '' }
}

const saveInline = async (categoryId, columnId) => {
  if (!inlineForm.value.question.trim()) return
  saving.value = true
  try {
    await questionsStore.addQuestion({
      category: categoryId,
      column: columnId,
      question: inlineForm.value.question,
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
  editForm.value = { question: q.question, category: q.category, column: q.column }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingId.value = null
  editForm.value = { question: '', category: '', column: '' }
}

const saveEdit = async () => {
  if (!editForm.value.question.trim()) return
  saving.value = true
  try {
    await questionsStore.updateQuestion(editingId.value, {
      question: editForm.value.question.trim(),
      column: editForm.value.column,
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
    await questionsStore.deleteQuestion(deletingId.value)
    showDeleteModal.value = false
    deletingId.value = null
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>