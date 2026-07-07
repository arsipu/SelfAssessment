<template>
  <div>
    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-lg md:text-xl font-semibold text-gray-900 mb-1">Instrumen Holland RIASEC</h1>
          <p class="text-sm text-gray-500 max-w-3xl">
            Kelola daftar instrumen Holland. Klik instrumen untuk mengelola pertanyaan di dalamnya.
          </p>
        </div>
        <button
          @click="showAddModal = true"
          class="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 md:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
          Tambah Instrumen
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-gray-400">Memuat data...</p>
    </div>

    <!-- Tabel -->
    <div v-else class="bg-white border border-gray-200 rounded-xl">
      <div class="px-4 md:px-5 py-3 md:py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 class="text-sm font-medium text-gray-800">Daftar Instrumen Holland</h2>
        <span class="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
          Total: {{ hollands.length }} Instrumen
        </span>
      </div>

      <div class="overflow-x-auto min-h-60">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white border-b border-gray-100">
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">No</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Instrumen</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Deskripsi</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(h, index) in hollands"
              :key="h.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 md:px-5 py-3 text-sm text-gray-600">{{ index + 1 }}</td>
              <td class="px-4 md:px-5 py-3">
                <button
                  @click="goToQuestions(h.id)"
                  class="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                >
                  {{ h.name }}
                </button>
              </td>
              <td class="px-4 md:px-5 py-3 text-sm text-gray-500 max-w-xs truncate">{{ h.description }}</td>
              <td class="px-4 md:px-5 py-3">
                <div class="relative inline-block">
                  <button
                    @click="toggleStatusMenu(h.id)"
                    :class="statusBadgeClass(h.status)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 md:py-1 rounded-full text-xs font-medium transition-colors h-8 md:h-auto cursor-pointer"
                  >
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDotClass(h.status)"></span>
                    {{ statusLabel(h.status) }}
                    <font-awesome-icon icon="fa-solid fa-chevron-down" class="w-3.5 h-3.5 shrink-0" />
                  </button>

                  <!-- Dropdown -->
                  <div
                    v-if="openStatusMenuId === h.id"
                    v-click-outside="closeStatusMenu"
                    class="absolute z-10 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                  >
                    <button
                      v-for="s in statusOptions"
                      :key="s.value"
                      @click="changeStatus(h.id, s.value)"
                      class="w-full text-left px-3 py-2.5 md:py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      :class="{ 'bg-gray-50 font-medium': h.status === s.value }"
                    >
                      <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="s.dot"></span>
                      {{ s.label }}
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-4 md:px-5 py-3">
                <div class="flex items-center gap-2">
                  <button
                    @click="goToQuestions(h.id)"
                    class="p-2.5 md:p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Kelola Pertanyaan"
                  >
                    <font-awesome-icon icon="fa-solid fa-clipboard-list" class="w-5 h-5 shrink-0" />
                  </button>
                  <button
                    @click="openEditModal(h)"
                    class="p-2.5 md:p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Edit"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="w-5 h-5 shrink-0" />
                  </button>
                  <button
                    @click="openDeleteModal(h.id)"
                    class="p-2.5 md:p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Hapus"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="w-5 h-5 shrink-0" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="hollands.length === 0">
              <td colspan="5" class="px-4 md:px-5 py-8 text-center text-sm text-gray-400">
                Belum ada instrumen Holland.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah/Edit -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        <div class="px-4 md:px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 class="text-base font-semibold text-gray-900">{{ isEditing ? 'Edit Instrumen' : 'Tambah Instrumen Baru' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-4 md:p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Instrumen</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              placeholder="Contoh: Holland RIASEC"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
              placeholder="Deskripsi singkat tentang instrumen ini..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Petunjuk Pengisian</label>
            <textarea
              v-model="form.direction"
              rows="4"
              class="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
              placeholder="Petunjuk pengisian untuk responden..."
            ></textarea>
          </div>
        </div>

        <div class="px-4 md:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            @click="closeModal"
            class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveForm"
            :disabled="!isFormValid || saving"
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
          <h3 class="text-lg font-semibold text-gray-900">Hapus Instrumen</h3>
          <p class="mt-2 text-sm text-gray-500">Apakah Anda yakin ingin menghapus instrumen ini? Semua pertanyaan di dalamnya juga akan terhapus.</p>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHollandStore } from '@/stores/holland/holland'
import { storeToRefs } from 'pinia'
import { DRAFT, PUBLISHED, ARCHIVED, statusText } from '@/apps/status'

const router = useRouter()
const hollandStore = useHollandStore()
const { hollands, loading } = storeToRefs(hollandStore)

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deletingId = ref(null)
const saving = ref(false)

const form = ref({ name: '', description: '', direction: '' })

const isFormValid = computed(() => form.value.name.trim() !== '')

const openStatusMenuId = ref(null)

const statusOptions = [
  { value: DRAFT, label: statusText(DRAFT), dot: 'bg-gray-400' },
  { value: PUBLISHED, label: statusText(PUBLISHED), dot: 'bg-green-500' },
  { value: ARCHIVED, label: statusText(ARCHIVED), dot: 'bg-red-400' },
]

onMounted(async () => {
  console.log('AdminHolland mounted')
  await hollandStore.fetchHollands()
  console.log('Hollands:', hollands.value)
})

const statusLabel = (status) => {
  return statusOptions.find((s) => s.value === status)?.label || statusText(status)
}

const statusDotClass = (status) => {
  return statusOptions.find((s) => s.value === status)?.dot || 'bg-gray-400'
}

const statusBadgeClass = (status) => {
  switch (status) {
    case PUBLISHED:
      return 'bg-green-50 text-green-700 hover:bg-green-100'
    case ARCHIVED:
      return 'bg-red-50 text-red-700 hover:bg-red-100'
    default:
      return 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  }
}

const toggleStatusMenu = (id) => {
  openStatusMenuId.value = openStatusMenuId.value === id ? null : id
}

const closeStatusMenu = () => {
  openStatusMenuId.value = null
}

const changeStatus = async (id, status) => {
  closeStatusMenu()
  try {
    await hollandStore.updateHollandStatus(id, status)
  } catch (e) {
    console.error(e)
  }
}

const goToQuestions = (id) => {
  router.push({ name: 'admin-holland-questions', params: { id } })
}

const openEditModal = (h) => {
  isEditing.value = true
  editingId.value = h.id
  form.value = { name: h.name, description: h.description || '', direction: h.direction || '' }
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
  form.value = { name: '', description: '', direction: '' }
}

const saveForm = async () => {
  if (!isFormValid.value) return
  saving.value = true
  try {
    if (isEditing.value) {
      await hollandStore.updateHolland(editingId.value, form.value)
    } else {
      await hollandStore.addHolland(form.value)
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
    await hollandStore.deleteHolland(deletingId.value)
    showDeleteModal.value = false
    deletingId.value = null
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>