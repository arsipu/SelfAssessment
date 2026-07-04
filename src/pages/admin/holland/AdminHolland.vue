<template>
  <div>
    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 mb-1">{{ config?.name ?? 'Memuat...' }}</h1>
          <p class="text-sm text-gray-500 max-w-3xl">{{ config?.description }}</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Status badge + dropdown, sama pola kayak Likert -->
          <div class="relative inline-block">
            <button
              @click="showStatusMenu = !showStatusMenu"
              :class="statusBadgeClass(config?.status)"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(config?.status)"></span>
              {{ statusLabel(config?.status) }}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="showStatusMenu"
              v-click-outside="() => (showStatusMenu = false)"
              class="absolute right-0 z-10 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            >
              <button
                v-for="s in statusOptions"
                :key="s.value"
                @click="changeStatus(s.value)"
                class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                :class="{ 'bg-gray-50 font-medium': config?.status === s.value }"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="s.dot"></span>
                {{ s.label }}
              </button>
            </div>
          </div>

          <button
            @click="openEditModal"
            class="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2.5 2.5 0 113.536 3.536L12.536 14.536A4 4 0 019.707 15.707L8 16l.293-1.707A4 4 0 019 11z" />
            </svg>
            Edit Info
          </button>
        </div>
      </div>
    </div>

    <!-- Direction preview -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h2 class="text-sm font-medium text-gray-800 mb-2">Petunjuk Pengisian</h2>
      <p class="text-sm text-gray-500 whitespace-pre-line">{{ config?.direction || '-' }}</p>
    </div>

    <!-- CTA ke halaman soal -->
    <button
      @click="router.push({ name: 'admin-holland-questions' })"
      class="w-full bg-white border border-gray-200 rounded-xl p-6 text-left hover:bg-gray-50 transition-colors flex justify-between items-center cursor-pointer"
    >
      <div>
        <h2 class="text-sm font-medium text-gray-900 mb-1">Kelola Pertanyaan</h2>
        <p class="text-sm text-gray-500">Atur pernyataan untuk tiap kategori RIASEC (R, I, A, S, E, C).</p>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Modal Edit Info -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-base font-semibold text-gray-900">Edit Info Instrumen</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Instrumen</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Petunjuk Pengisian</label>
            <textarea
              v-model="form.direction"
              rows="4"
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
            :disabled="!form.name.trim() || saving"
            class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHollandStore } from '@/stores/holland'
import { storeToRefs } from 'pinia'
import { DRAFT, PUBLISHED, ARCHIVED, statusText } from '@/apps/status'

const router = useRouter()
const hollandStore = useHollandStore()
const { config } = storeToRefs(hollandStore)

const showEditModal = ref(false)
const showStatusMenu = ref(false)
const saving = ref(false)
const form = ref({ name: '', description: '', direction: '' })

const statusOptions = [
  { value: DRAFT, label: statusText(DRAFT), dot: 'bg-gray-400' },
  { value: PUBLISHED, label: statusText(PUBLISHED), dot: 'bg-green-500' },
  { value: ARCHIVED, label: statusText(ARCHIVED), dot: 'bg-red-400' },
]

onMounted(async () => {
  await hollandStore.fetchConfig()
})

const statusLabel = (status) => statusOptions.find((s) => s.value === status)?.label || statusText(status)
const statusDotClass = (status) => statusOptions.find((s) => s.value === status)?.dot || 'bg-gray-400'
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

const changeStatus = async (status) => {
  showStatusMenu.value = false
  try {
    await hollandStore.updateStatus(status)
  } catch (e) {
    console.error(e)
  }
}

const openEditModal = () => {
  form.value = {
    name: config.value?.name ?? '',
    description: config.value?.description ?? '',
    direction: config.value?.direction ?? '',
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveEdit = async () => {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    await hollandStore.updateConfig(form.value)
    closeEditModal()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>