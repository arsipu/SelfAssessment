<template>
  <div>
    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 mb-1">Likert Scale</h1>
          <p class="text-sm text-gray-500 max-w-3xl">
            Kelola daftar formulir survei Likert. Klik formulir untuk mengelola pertanyaan di dalamnya.
          </p>
        </div>
        <button
          @click="showAddModal = true"
          class="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Formulir
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <p class="text-sm text-gray-400">Memuat data...</p>
    </div>

    <!-- Tabel -->
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 class="text-sm font-medium text-gray-800">Daftar Formulir Survei</h2>
        <span class="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
          Total: {{ likerts.length }} Formulir
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white border-b border-gray-100">
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-16">No</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Formulir</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Deskripsi</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Status</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-40">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(likert, index) in likerts"
              :key="likert.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-5 py-3 text-sm text-gray-600">{{ index + 1 }}</td>
              <td class="px-5 py-3">
                <button
                  @click="goToQuestions(likert.id)"
                  class="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors text-left"
                >
                  {{ likert.name }}
                </button>
              </td>
              <td class="px-5 py-3 text-sm text-gray-500 max-w-xs truncate">{{ likert.description }}</td>
              <td class="px-5 py-3">
                <div class="relative inline-block">
                  <button
                    @click="toggleStatusMenu(likert.id)"
                    :class="statusBadgeClass(likert.status)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(likert.status)"></span>
                    {{ statusLabel(likert.status) }}
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Dropdown -->
                  <div
                    v-if="openStatusMenuId === likert.id"
                    v-click-outside="closeStatusMenu"
                    class="absolute z-10 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                  >
                    <button
                      v-for="s in statusOptions"
                      :key="s.value"
                      @click="changeStatus(likert.id, s.value)"
                      class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      :class="{ 'bg-gray-50 font-medium': likert.status === s.value }"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="s.dot"></span>
                      {{ s.label }}
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <button
                    @click="goToQuestions(likert.id)"
                    class="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Kelola Pertanyaan"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                  <button
                    @click="openEditModal(likert)"
                    class="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2.5 2.5 0 113.536 3.536L12.536 14.536A4 4 0 019.707 15.707L8 16l.293-1.707A4 4 0 019 11z" />
                    </svg>
                  </button>
                  <button
                    @click="openDeleteModal(likert.id)"
                    class="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7L18.132 18.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.994-1.858L5 7m5-3h4m-6 3V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="likerts.length === 0">
              <td colspan="4" class="px-5 py-8 text-center text-sm text-gray-400">
                Belum ada formulir survei.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah/Edit -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-base font-semibold text-gray-900">{{ isEditing ? 'Edit Formulir' : 'Tambah Formulir Baru' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Formulir</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              placeholder="Contoh: Pemutusan Peraturan Baru"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              placeholder="Deskripsi singkat tentang formulir ini..."
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            @click="saveForm"
            :disabled="!isFormValid || saving"
            class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
          <h3 class="text-lg font-semibold text-gray-900">Hapus Formulir</h3>
          <p class="mt-2 text-sm text-gray-500">Apakah Anda yakin ingin menghapus formulir ini? Semua pertanyaan di dalamnya juga akan terhapus.</p>
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
import { useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert'
import { storeToRefs } from 'pinia'
import { DRAFT, PUBLISHED, ARCHIVED, statusText } from '@/apps/status'

const router = useRouter()
const likertStore = useLikertStore()
const { likerts, loading } = storeToRefs(likertStore)

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deletingId = ref(null)
const saving = ref(false)

const form = ref({ name: '', description: '' })

const isFormValid = computed(() => form.value.name.trim() !== '')

const openStatusMenuId = ref(null)

const statusOptions = [
  { value: DRAFT, label: statusText(DRAFT), dot: 'bg-gray-400' },
  { value: PUBLISHED, label: statusText(PUBLISHED), dot: 'bg-green-500' },
  { value: ARCHIVED, label: statusText(ARCHIVED), dot: 'bg-red-400' },
]

onMounted(async () => {
  console.log('Mounted')
  await likertStore.fetchLikerts()
  console.log('Likerts:', likerts.value)
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
    await likertStore.updateLikertStatus(id, status)
  } catch (e) {
    console.error(e)
  }
}

const goToQuestions = (id) => {
  router.push({ name: 'admin-likert-questions', params: { id } })
}

const openEditModal = (likert) => {
  isEditing.value = true
  editingId.value = likert.id
  form.value = { name: likert.name, description: likert.description || '' }
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
  form.value = { name: '', description: '' }
}

const saveForm = async () => {
  if (!isFormValid.value) return
  saving.value = true
  try {
    if (isEditing.value) {
      await likertStore.updateLikert(editingId.value, form.value)
    } else {
      await likertStore.addLikert(form.value)
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
    await likertStore.deleteLikert(deletingId.value)
    showDeleteModal.value = false
    deletingId.value = null
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>