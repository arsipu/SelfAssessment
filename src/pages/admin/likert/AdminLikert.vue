<template>
  <div>
    <!-- Header -->
    <div class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">Survei</h1>
          <p class="text-sm text-text-secondary max-w-3xl mb-3">
            Kelola daftar formulir survei. Klik formulir untuk mengelola pertanyaan di dalamnya.
          </p>
          <span class="text-xs font-medium text-text-secondary bg-surface-muted px-3 py-1.5 rounded-md border border-border whitespace-nowrap">
            {{ likerts.length }} Formulir
          </span>
        </div>
        <button
          @click="showAddModal = true"
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-text-on-primary px-4 py-2.5 md:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
          Tambah Formulir
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-text-muted">Memuat data...</p>
    </div>

    <!-- Tabel Data Formulir -->
    <div v-else class="bg-surface border border-border rounded-xl" :class="{ 'overflow-hidden': !isAnyMenuOpen }">
      <div class="overflow-x-auto" :class="{ 'overflow-y-visible': isAnyMenuOpen }">
        <table class="app-table w-full text-left border-collapse">
          <thead>
            <tr>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">No</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Nama Formulir</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Deskripsi</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Status</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="(likert, index) in likerts"
              :key="likert.id"
              class="cursor-pointer"
            >
              <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ index + 1 }}</td>
              <td class="px-4 md:px-5 py-3 text-sm">
                <button
                  @click="goToQuestions(likert)"
                  class="text-sm font-medium hover:text-primary hover:underline transition-colors text-left cursor-pointer"
                >
                  {{ likert.name }}
                </button>
              </td>
              <td class="px-4 md:px-5 py-3 text-sm max-w-xs truncate">{{ likert.description }}</td>
              <td class="px-4 md:px-5 py-3 text-sm">
                <div class="relative inline-block">
                  <button
                    @click="toggleStatusMenu(likert.id)"
                    :class="statusBadgeClass(likert.status)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 md:py-1 rounded-full text-xs font-medium transition-colors h-10 md:h-auto cursor-pointer"
                  >
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDotClass(likert.status)"></span>
                    {{ statusLabel(likert.status) }}
                    <font-awesome-icon icon="fa-solid fa-chevron-down" class="w-3.5 h-3.5 shrink-0" />
                  </button>

                  <!-- Dropdown -->
                  <div
                    v-if="openStatusMenuId === likert.id"
                    v-click-outside="closeStatusMenu"
                    class="absolute z-10 mt-1 w-36 bg-surface border border-border rounded-lg shadow-lg overflow-hidden"
                  >
                    <button
                      v-for="s in statusOptions"
                      :key="s.value"
                      @click="changeStatus(likert.id, s.value)"
                      class="w-full text-left px-3 py-2.5 md:py-2 text-sm hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
                      :class="{ 'bg-surface-muted font-medium': likert.status === s.value }"
                    >
                      <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="s.dot"></span>
                      {{ s.label }}
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-4 md:px-5 py-3 text-sm">
                <div class="flex items-center gap-2">
                  <button
                    @click="goToQuestions(likert)"
                    class="p-2.5 md:p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Kelola Pertanyaan"
                  >
                    <font-awesome-icon icon="fa-solid fa-clipboard-list" class="w-5 h-5 shrink-0" />
                  </button>
                  <button
                    @click="openEditModal(likert)"
                    class="p-2.5 md:p-2 rounded-lg text-warning hover:bg-warning-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Edit"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="w-5 h-5 shrink-0" />
                  </button>
                  <button
                    @click="openDeleteModal(likert.id)"
                    class="p-2.5 md:p-2 rounded-lg text-danger hover:bg-danger-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Hapus"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="w-5 h-5 shrink-0" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="likerts.length === 0">
              <td colspan="5" class="px-4 md:px-5 py-8 text-sm text-center text-text-muted">
                Belum ada formulir survei.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah/Edit -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
          <div>
            <h3 class="text-base font-semibold text-text-primary">
              {{ isEditing ? 'Edit Formulir' : 'Tambah Formulir Baru' }}
            </h3>
            <p class="text-xs text-text-muted mt-0.5">
              {{ isEditing ? 'Ubah nama atau deskripsi formulir.' : 'Buat formulir survei baru.' }}
            </p>
          </div>
          <button @click="closeModal" class="text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Nama Formulir <span class="text-danger">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Contoh: Pemutusan Peraturan Baru"
              autofocus
              @keyup.enter="saveForm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Deskripsi</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
              placeholder="Deskripsi singkat tentang formulir ini..."
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-border bg-surface-muted flex justify-end gap-3 shrink-0">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveForm"
            :disabled="!isFormValid || saving"
            class="px-4 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed cursor-pointer"
          >
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hapus -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-text-primary">Hapus Formulir</h3>
          <p class="mt-2 text-sm text-text-secondary">
            Apakah Anda yakin ingin menghapus formulir ini? Semua data terkait — termasuk pertanyaan di dalamnya — <strong class="text-text-primary">tidak akan terhapus otomatis</strong> dan perlu dibersihkan secara terpisah.
          </p>
          <p class="mt-2 text-xs text-text-muted">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div class="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="confirmDelete"
            :disabled="saving"
            class="px-4 py-2 bg-danger text-text-on-primary rounded-lg hover:bg-danger-soft text-sm disabled:opacity-60 cursor-pointer"
          >
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
import { useLikertStore } from '@/stores/likert/likert'
import { storeToRefs } from 'pinia'
import { ACTIVE, INACTIVE, statusText } from '@/apps/status'

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

// PENAMBAHAN: Digunakan untuk mengatur dynamic class "overflow-hidden" pada pembungkus tabel
const isAnyMenuOpen = computed(() => openStatusMenuId.value !== null)

const statusOptions = [
  { value: ACTIVE, label: statusText(ACTIVE), dot: 'bg-success' },
  { value: INACTIVE, label: statusText(INACTIVE), dot: 'bg-text-muted' },
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
  return statusOptions.find((s) => s.value === status)?.dot || 'bg-text-muted'
}

const statusBadgeClass = (status) => {
  switch (status) {
    case ACTIVE:
      return 'bg-success-soft text-success hover:bg-success'
    default:
      return 'bg-surface-muted text-text-secondary hover:bg-border'
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

const goToQuestions = (item) => {
  router.push({ name: 'admin-likert-questions', params: { slug: item.slug } })
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