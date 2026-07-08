<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="router.push({ name: 'admin-holland' })"
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="h-4 w-4" />
        Holland RIASEC
      </button>
      <span class="text-gray-300">/</span>
      <span class="text-sm text-gray-800 font-medium">Pertanyaan</span>
    </div>

    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
        <h1 class="text-lg font-semibold text-gray-900 mb-1">Kelola Pertanyaan RIASEC</h1>
        <p class="text-sm text-gray-500 max-w-3xl">
          Setiap kategori punya 3 kolom pernyataan: Saya adalah, Saya mampu, dan Saya menyukai.
        </p>
      </div>
        <button
          @click="router.push({ name: 'admin-holland-submissions', params: { id: hollandId }})"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-right-to-bracket" class="w-4 h-4 shrink-0" />

          Lihat Submissions
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <p class="text-sm text-gray-400">Memuat pertanyaan...</p>
    </div>

    <!-- Blocks per Category (riasec) — from Firestore, not constants -->
    <div v-else class="space-y-6">
      <div
        v-for="cat in riasecList"
        :key="cat.id"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <!-- Category Header — label from Firestore -->
        <div class="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center gap-3">
          <h2 class="text-sm font-medium text-gray-800 truncate">
            {{ cat.label || cat.id }} <span class="text-gray-400">({{ cat.id }})</span>
          </h2>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
              {{ questionsByRiasec(cat.id).length }} Soal
            </span>
            <button
              @click="openRiasecEditModal(cat)"
              class="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white transition-colors cursor-pointer"
              title="Edit deskripsi & rekomendasi kategori"
            >
              <font-awesome-icon icon="fa-solid fa-pen" class="w-4 h-4" />
            </button>
          </div>
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
                  v-for="(q, index) in questionsByRiasecAndColumn(cat.id, col.id)"
                  :key="q.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-5 py-3 text-sm text-gray-600 w-12">{{ index + 1 }}</td>
                  <td class="px-5 py-3 text-sm text-gray-800">{{ q.question }}</td>
                  <td class="px-5 py-3 w-24">
                    <div class="flex items-center gap-2 justify-end">
                      <button
                        @click="openEditModal(q, cat.id)"
                        class="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <font-awesome-icon icon="fa-solid fa-pen" class="w-5 h-5" />
                      </button>
                      <button
                        @click="openDeleteModal(q.id, cat.id)"
                        class="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <font-awesome-icon icon="fa-solid fa-trash" class="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="questionsByRiasecAndColumn(cat.id, col.id).length === 0">
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
            <font-awesome-icon icon="fa-solid fa-plus" class="h-3.5 w-3.5" />
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
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input
              :value="riasecList.find(c => c.id === editRiasecId)?.label || editRiasecId"
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

    <!-- Modal Edit Deskripsi & Rekomendasi Kategori -->
    <div v-if="showRiasecEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-xl mx-auto flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h3 class="text-base font-semibold text-gray-900">Edit Kategori {{ riasecEditForm.label }}</h3>
            <p class="text-xs text-gray-400 mt-0.5">Kode & label kategori baku, tidak bisa diubah.</p>
          </div>
          <button @click="closeRiasecEditModal" class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Kode</label>
              <input
                :value="riasecEditForm.code"
                disabled
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                :value="riasecEditForm.label"
                disabled
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi bidang minat</label>
            <textarea
              v-model="riasecEditForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
              placeholder="Deskripsi karakteristik kategori ini..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Keterampilan kunci <span class="text-gray-400 font-normal">(1 baris = 1 item)</span>
            </label>
            <textarea
              v-model="riasecEditForm.skillsText"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-mono resize-none"
              placeholder="Menggunakan dan mengoperasikan alat&#10;Merancang, membangun, memperbaiki"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Contoh pekerjaan relevan <span class="text-gray-400 font-normal">(1 baris = 1 item)</span>
            </label>
            <textarea
              v-model="riasecEditForm.careersText"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-mono resize-none"
              placeholder="Pilot&#10;Petani&#10;Insinyur"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Mata pelajaran pendukung <span class="text-gray-400 font-normal">(1 baris = 1 item)</span>
            </label>
            <textarea
              v-model="riasecEditForm.subjectsText"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-mono resize-none"
              placeholder="Matematika&#10;Sains&#10;Teknologi"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            @click="closeRiasecEditModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveRiasecEdit"
            :disabled="savingRiasec"
            class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ savingRiasec ? 'Menyimpan...' : 'Simpan' }}
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
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHollandQuestionsStore } from '@/stores/holland/holland-questions'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { useHollandStore } from '@/stores/holland/holland'
import { RIASEC_COLUMNS } from '@/apps/holland'

const route = useRoute()
const router = useRouter()
const hollandId = route.params.id

const questionsStore = useHollandQuestionsStore()
const { allQuestions, loading } = storeToRefs(questionsStore)

const riasecStore = useHollandRiasecStore()
const { riasecList } = storeToRefs(riasecStore)

const hollandStore = useHollandStore()

const columns = RIASEC_COLUMNS

// ── State ──────────────────────────────────────────────────

const saving = ref(false)

// Inline add — key gabungan riasecId+column biar cuma 1 form aktif dalam satu waktu
const activeAddKey = ref(null)
const inlineForm = ref({ question: '' })
const keyOf = (riasecId, columnId) => `${riasecId}__${columnId}`

// Edit modal — store riasecId separately
const showEditModal = ref(false)
const editingId = ref(null)
const editRiasecId = ref(null)
const editForm = ref({ question: '', column: '' })

// Delete modal — store riasecId separately
const showDeleteModal = ref(false)
const deletingId = ref(null)
const deleteRiasecId = ref(null)

// Edit deskripsi & rekomendasi kategori riasec
const showRiasecEditModal = ref(false)
const savingRiasec = ref(false)
const riasecEditForm = ref({
  id: null,
  code: '',
  label: '',
  description: '',
  skillsText: '',
  careersText: '',
  subjectsText: '',
})

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {
  // Fetch both riasec list (for labels/order) and all questions
  await Promise.all([
    riasecStore.fetchRiasecList(hollandId),
    questionsStore.fetchAllQuestions(hollandId),
  ])
})

// ── Helpers ────────────────────────────────────────────────

const questionsByRiasec = (riasecId) =>
  allQuestions.value.filter((q) => q.riasecId === riasecId)

const questionsByRiasecAndColumn = (riasecId, columnId) =>
  allQuestions.value.filter((q) => q.riasecId === riasecId && q.column === columnId)

// array <-> textarea (1 baris = 1 item), buang baris kosong
const arrayToText = (arr) => (arr || []).join('\n')
const textToArray = (text) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

// ── Inline Add ─────────────────────────────────────────────

const openInlineAdd = (riasecId, columnId) => {
  activeAddKey.value = keyOf(riasecId, columnId)
  inlineForm.value = { question: '' }
}

const cancelInline = () => {
  activeAddKey.value = null
  inlineForm.value = { question: '' }
}

const saveInline = async (riasecId, columnId) => {
  if (!inlineForm.value.question.trim()) return
  saving.value = true
  try {
    await questionsStore.addQuestion(hollandId, riasecId, {
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

// ── Edit Modal Soal ────────────────────────────────────────

const openEditModal = (q, riasecId) => {
  editingId.value = q.id
  editRiasecId.value = riasecId
  editForm.value = { question: q.question, column: q.column }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingId.value = null
  editRiasecId.value = null
  editForm.value = { question: '', column: '' }
}

const saveEdit = async () => {
  if (!editForm.value.question.trim()) return
  saving.value = true
  try {
    await questionsStore.updateQuestion(hollandId, editRiasecId.value, editingId.value, {
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

// ── Edit Modal Kategori (deskripsi & rekomendasi) ─────────────

const openRiasecEditModal = (cat) => {
  riasecEditForm.value = {
    id: cat.id,
    code: cat.code || cat.id,
    label: cat.label || cat.id,
    description: cat.description || '',
    skillsText: arrayToText(cat.skills),
    careersText: arrayToText(cat.careers),
    subjectsText: arrayToText(cat.subjects),
  }
  showRiasecEditModal.value = true
}

const closeRiasecEditModal = () => {
  showRiasecEditModal.value = false
  riasecEditForm.value = {
    id: null,
    code: '',
    label: '',
    description: '',
    skillsText: '',
    careersText: '',
    subjectsText: '',
  }
}

const saveRiasecEdit = async () => {
  savingRiasec.value = true
  try {
    await hollandStore.updateRiasecContent(hollandId, riasecEditForm.value.id, {
      description: riasecEditForm.value.description.trim(),
      skills: textToArray(riasecEditForm.value.skillsText),
      careers: textToArray(riasecEditForm.value.careersText),
      subjects: textToArray(riasecEditForm.value.subjectsText),
    })
    // refresh biar label/deskripsi di kartu kategori langsung ke-update
    await riasecStore.fetchRiasecList(hollandId)
    closeRiasecEditModal()
  } catch (e) {
    console.error(e)
  } finally {
    savingRiasec.value = false
  }
}

// ── Delete Modal Soal ──────────────────────────────────────

const openDeleteModal = (id, riasecId) => {
  deletingId.value = id
  deleteRiasecId.value = riasecId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  saving.value = true
  try {
    await questionsStore.deleteQuestion(hollandId, deleteRiasecId.value, deletingId.value)
    showDeleteModal.value = false
    deletingId.value = null
    deleteRiasecId.value = null
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>