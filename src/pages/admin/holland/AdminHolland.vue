<template>
  <div>
    <!-- Header -->
    <div class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">
            Instrumen Holland RIASEC
          </h1>
          <p class="text-sm text-text-secondary max-w-3xl mb-3">
            Kelola daftar instrumen Holland. Klik instrumen untuk mengelola pertanyaan di dalamnya.
          </p>
          <span class="text-xs font-medium text-text-secondary bg-surface-muted px-3 py-1.5 rounded-md border border-border whitespace-nowrap">
            {{ hollands.length }} Instrumen
          </span>
        </div>
        <button
          @click="showAddModal = true"
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-text-on-primary px-4 py-2.5 md:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
          Tambah Instrumen
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-text-muted">Memuat data...</p>
    </div>

    <!-- Tabel Data Responden -->
    <div v-else class="bg-surface border border-border rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="app-table w-full text-left border-collapse">
          <thead>
            <tr>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">No</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Nama Instrumen</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Deskripsi</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Status</th>
              <th class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="(h, index) in hollands"
              :key="h.id"
              class="cursor-pointer"
            >
              <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ index + 1 }}</td>
              <td class="px-4 md:px-5 py-3 text-sm">
                <button
                  @click="goToQuestions(h)"
                  class="text-sm font-medium hover:text-primary hover:underline transition-colors text-left cursor-pointer"
                >
                  {{ h.name }}
                </button>
              </td>
              <td class="px-4 md:px-5 py-3 text-sm max-w-xs truncate">{{ h.description }}</td>
              <td class="px-4 md:px-5 py-3 text-sm">
                <div class="relative inline-block">
                  <button
                    :ref="(el) => setStatusButtonRef(h.id, el)"
                    @click="toggleStatusMenu(h.id, $event)"
                    :class="statusBadgeClass(h.status)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 md:py-1 rounded-full text-xs font-medium transition-colors h-10 md:h-auto cursor-pointer"
                  >
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDotClass(h.status)"></span>
                    {{ statusLabel(h.status) }}
                    <font-awesome-icon icon="fa-solid fa-chevron-down" class="w-3.5 h-3.5 shrink-0" />
                  </button>

                  <!-- Dropdown, di-teleport ke body supaya tidak terjebak di overflow wrapper tabel -->
                  <Teleport to="body">
                    <div
                      v-if="openStatusMenuId === h.id"
                      v-click-outside="closeStatusMenu"
                      class="fixed z-50 w-36 bg-surface border border-border rounded-lg shadow-lg overflow-hidden"
                      :style="dropdownPosition"
                    >
                      <button
                        v-for="s in statusOptions"
                        :key="s.value"
                        @click="changeStatus(h.id, s.value)"
                        class="w-full text-left px-3 py-2.5 md:py-2 text-sm hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
                        :class="{ 'bg-surface-muted font-medium': h.status === s.value }"
                      >
                        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="s.dot"></span>
                        {{ s.label }}
                      </button>
                    </div>
                  </Teleport>
                </div>
              </td>
              <td class="px-4 md:px-5 py-3 text-sm">
                <div class="flex items-center gap-2">
                  <button
                    @click="goToQuestions(h)"
                    class="p-2.5 md:p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Kelola Pertanyaan"
                  >
                    <font-awesome-icon icon="fa-solid fa-clipboard-list" class="w-5 h-5 shrink-0" />
                  </button>
                  <button
                    @click="openEditModal(h)"
                    class="p-2.5 md:p-2 rounded-lg text-warning hover:bg-warning-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Edit"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="w-5 h-5 shrink-0" />
                  </button>
                  <button
                    @click="openDeleteModal(h.id)"
                    class="p-2.5 md:p-2 rounded-lg text-danger hover:bg-danger-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Hapus"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="w-5 h-5 shrink-0" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="hollands.length === 0">
              <td colspan="5" class="px-4 md:px-5 py-8 text-sm text-center text-text-muted">
                Belum ada instrumen Holland.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah / Edit Instrumen -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
          <div>
            <h3 class="text-base font-semibold text-text-primary">
              {{ isEditing ? 'Edit Instrumen' : 'Tambah Instrumen' }}
            </h3>
            <p class="text-xs text-text-muted mt-0.5">
              {{ isEditing ? 'Ubah nama, deskripsi, atau petunjuk instrumen.' : 'Buat instrumen Holland RIASEC baru.' }}
            </p>
          </div>
          <button @click="closeModal" class="text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Nama Instrumen <span class="text-danger">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Misal: Tes Minat Holland"
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
              placeholder="Deskripsi singkat tentang instrumen ini..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Petunjuk Pengerjaan</label>
            <textarea
              v-model="form.direction"
              rows="4"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
              placeholder="Teks petunjuk yang akan ditampilkan di awal tes..."
            ></textarea>
            <p class="text-xs text-text-muted mt-1">Ditampilkan di halaman instrumen sebelum tes dimulai.</p>
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

    <!-- Modal Hapus Instrumen -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-text-primary">Hapus Instrumen</h3>
          <p class="mt-2 text-sm text-text-secondary">
            Apakah Anda yakin ingin menghapus instrumen ini? Semua data terkait — termasuk kategori RIASEC, pertanyaan, dan submission —
            <strong class="text-text-primary">tidak akan terhapus otomatis</strong> dan perlu dibersihkan secara terpisah.
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useHollandStore } from '@/stores/holland/holland'
import { storeToRefs } from 'pinia'
import { ACTIVE, INACTIVE, statusText } from '@/apps/status'

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

// ==== Status dropdown (teleported) ====
const openStatusMenuId = ref(null)
const dropdownPosition = ref({ top: '0px', left: '0px' })
const statusButtonRefs = ref({})

const statusOptions = [
  { value: ACTIVE, label: statusText(ACTIVE), dot: 'bg-success' },
  { value: INACTIVE, label: statusText(INACTIVE), dot: 'bg-text-muted' },
]

const setStatusButtonRef = (id, el) => {
  if (el) statusButtonRefs.value[id] = el
}

const computeDropdownPosition = (btnEl) => {
  const rect = btnEl.getBoundingClientRect()
  const menuWidth = 144 // w-36 = 9rem = 144px
  const left = Math.min(rect.left, window.innerWidth - menuWidth - 8)
  dropdownPosition.value = {
    top: `${rect.bottom + 4}px`,
    left: `${Math.max(left, 8)}px`,
  }
}

const toggleStatusMenu = (id, event) => {
  if (openStatusMenuId.value === id) {
    closeStatusMenu()
    return
  }
  computeDropdownPosition(event.currentTarget)
  openStatusMenuId.value = id
}

const closeStatusMenu = () => {
  openStatusMenuId.value = null
}

const handleScrollOrResize = () => {
  if (openStatusMenuId.value !== null) closeStatusMenu()
}

onMounted(async () => {
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
  await hollandStore.fetchHollands()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
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

const changeStatus = async (id, status) => {
  closeStatusMenu()
  try {
    await hollandStore.updateHollandStatus(id, status)
  } catch (e) {
    console.error(e)
  }
}

const goToQuestions = (item) => {
  router.push({ name: 'admin-holland-questions', params: { slug: item.slug } })
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