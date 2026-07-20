<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="router.push({ name: 'admin-holland' })"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
      >
        Holland RIASEC
      </button>
      <span class="text-text-muted">/</span>
      <span class="text-sm text-text-primary font-medium">Pertanyaan</span>
    </div>

    <!-- Header -->
    <div class="bg-surface border border-border rounded-xl p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
        <h1 class="text-lg font-semibold text-text-primary mb-1">Kelola Pertanyaan RIASEC</h1>
        <p class="text-sm text-text-secondary max-w-3xl">
          Setiap kategori punya kolom pernyataan yang bisa disesuaikan sendiri (tambah, ubah nama, atau hapus).
        </p>
      </div>
        <button
          @click="router.push({ name: 'admin-holland-submissions', params: { slug: hollandSlug }})"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-instrument rounded-lg hover:bg-instrument-hover transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-right-to-bracket" class="w-4 h-4 shrink-0" />

          Lihat Submissions
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-xl p-12 text-center">
      <p class="text-sm text-text-muted">Memuat pertanyaan...</p>
    </div>

    <!-- Blocks per Category (riasec) — from Firestore, not constants -->
    <div v-else class="space-y-6">
      <div
        v-for="cat in riasecList"
        :key="cat.id"
        class="bg-surface border border-border rounded-xl overflow-hidden"
      >
        <!-- Category Header — label from Firestore -->
        <div class="px-5 py-4 border-b border-border bg-surface-muted flex justify-between items-center gap-3">
          <h2 class="text-sm font-medium text-text-primary truncate">
            {{ cat.label || cat.id }} <span class="text-text-muted">({{ cat.id }})</span>
          </h2>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs font-medium text-text-secondary bg-surface px-2.5 py-1 rounded-md border border-border">
              {{ questionsByRiasec(cat.id).length }} Soal
            </span>
            <button
              @click="openAddColumnModal(cat.id)"
              class="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
              title="Tambah kolom baru"
            >
              <font-awesome-icon icon="fa-solid fa-table-columns" class="w-4 h-4" />
            </button>
            <button
              @click="openRiasecEditModal(cat)"
              class="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
              title="Edit deskripsi & rekomendasi kategori"
            >
              <font-awesome-icon icon="fa-solid fa-pen" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Grid layout: columns side by side -->
        <div
          v-if="columnsFor(cat.id).length > 0"
          class="grid grid-cols-1 gap-4 p-4 [>*]:w-full"
          :style="{ gridTemplateColumns: `repeat(${columnsFor(cat.id).length}, minmax(0, 1fr))` }"
        >
          <div
            v-for="col in columnsFor(cat.id)"
            :key="col.id"
            class="border border-border rounded-lg overflow-hidden flex flex-col w-full"
          >
            <!-- Column Header -->
            <div class="px-4 py-2.5 bg-surface-muted/50 flex items-center justify-between gap-3 border-b border-border">
              <span class="min-w-0 text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-normal break-words">
                {{ col.name }}
              </span>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  @click="openEditColumnModal(cat.id, col)"
                  class="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                  title="Ubah nama / urutan kolom"
                >
                  <font-awesome-icon icon="fa-solid fa-pen" class="w-3 h-3" />
                </button>
                <button
                  @click="openDeleteColumnModal(cat.id, col)"
                  class="p-1.5 rounded-md text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                  title="Hapus kolom"
                >
                  <font-awesome-icon icon="fa-solid fa-trash" class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- Questions list -->
            <div class="flex-1">
              <div
                v-for="(q, index) in questionsByRiasecAndColumn(cat.id, col.id)"
                :key="q.id"
                class="px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors flex items-start gap-2"
              >
                <span class="text-xs text-text-muted mt-0.5 shrink-0 w-5">{{ index + 1 }}.</span>
                <span class="text-sm text-text-primary flex-1">{{ q.question }}</span>
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    @click="openEditModal(q, cat.id, col.id)"
                    class="p-1.5 rounded-md text-instrument hover:bg-instrument-soft transition-colors cursor-pointer"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="openDeleteModal(q.id, cat.id, col.id)"
                    class="p-1.5 rounded-md text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                v-if="questionsByRiasecAndColumn(cat.id, col.id).length === 0"
                class="px-4 py-6 text-center text-xs text-text-muted"
              >
                Belum ada pernyataan di kolom ini.
              </div>
            </div>

            <!-- Inline Add Form -->
            <div v-if="activeAddKey === keyOf(cat.id, col.id)" class="px-4 py-3 bg-surface-muted border-t border-border">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
                <input
                  v-model="inlineForm.question"
                  type="text"
                  class="w-full sm:flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-instrument focus:border-transparent text-sm"
                  placeholder="Masukkan teks pernyataan..."
                  autofocus
                  @keyup.enter="saveInline(cat.id, col.id)"
                />
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    @click="saveInline(cat.id, col.id)"
                    :disabled="!inlineForm.question.trim() || saving"
                    class="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-text-on-primary bg-instrument rounded-lg hover:bg-instrument-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  >
                    {{ saving ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                  <button
                    @click="cancelInline"
                    class="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>

            <button
              v-else
              @click="openInlineAdd(cat.id, col.id)"
              class="w-full px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2 border-t border-border cursor-pointer"
            >
              <font-awesome-icon icon="fa-solid fa-plus" class="h-3.5 w-3.5" />
              Tambah Pernyataan
            </button>
          </div>
        </div>

        <!-- Empty state: kategori belum punya kolom sama sekali -->
        <div v-if="columnsFor(cat.id).length === 0" class="px-5 py-6 text-center">
          <p class="text-xs text-text-muted mb-3">Kategori ini belum punya kolom pernyataan.</p>
          <button
            @click="openAddColumnModal(cat.id)"
            class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-on-primary bg-instrument rounded-lg hover:bg-instrument-hover transition-colors cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
            Tambah Kolom Pertama
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Soal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 class="text-base font-semibold text-text-primary">Edit Pernyataan</h3>
          <button @click="closeEditModal" class="text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Kategori</label>
            <input
              :value="riasecList.find(c => c.id === editRiasecId)?.label || editRiasecId"
              disabled
              class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface-muted text-text-muted cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Kolom</label>
            <select
              v-model="editForm.columnId"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-instrument focus:border-transparent text-sm"
            >
              <option v-for="col in columnsFor(editRiasecId)" :key="col.id" :value="col.id">{{ col.name }}</option>
            </select>
            <p class="text-xs text-text-muted mt-1">Pindahin pernyataan ini ke kolom lain kalau perlu.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Teks Pernyataan</label>
            <textarea
              v-model="editForm.question"
              rows="2"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-instrument focus:border-transparent text-sm"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-border bg-surface-muted flex justify-end gap-3">
          <button
            @click="closeEditModal"
            class="px-4 py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveEdit"
            :disabled="!editForm.question.trim() || saving"
            class="px-4 py-2 text-sm font-medium text-text-on-primary bg-instrument rounded-lg hover:bg-instrument-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed cursor-pointer"
          >
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Deskripsi & Rekomendasi Kategori -->
    <div v-if="showRiasecEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-xl mx-auto flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
          <div>
            <h3 class="text-base font-semibold text-text-primary">Edit Kategori {{ riasecEditForm.label }}</h3>
            <p class="text-xs text-text-muted mt-0.5">Kode & label kategori baku, tidak bisa diubah.</p>
          </div>
          <button @click="closeRiasecEditModal" class="text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">Kode</label>
              <input
                :value="riasecEditForm.code"
                disabled
                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface-muted text-text-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">Label</label>
              <input
                :value="riasecEditForm.label"
                disabled
                class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface-muted text-text-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Deskripsi bidang minat</label>
            <textarea
              v-model="riasecEditForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-instrument focus:border-transparent text-sm resize-none"
              placeholder="Deskripsi karakteristik kategori ini..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              Keterampilan kunci <span class="text-text-muted font-normal">(1 baris = 1 item)</span>
            </label>
            <textarea
              v-model="riasecEditForm.skillsText"
              rows="4"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-instrument focus:border-transparent text-sm font-mono resize-none"
              placeholder="Menggunakan dan mengoperasikan alat&#10;Merancang, membangun, memperbaiki"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              Contoh pekerjaan relevan <span class="text-text-muted font-normal">(1 baris = 1 item)</span>
            </label>
            <textarea
              v-model="riasecEditForm.careersText"
              rows="4"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-instrument focus:border-transparent text-sm font-mono resize-none"
              placeholder="Pilot&#10;Petani&#10;Insinyur"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              Mata pelajaran pendukung <span class="text-text-muted font-normal">(1 baris = 1 item)</span>
            </label>
            <textarea
              v-model="riasecEditForm.subjectsText"
              rows="3"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-instrument focus:border-transparent text-sm font-mono resize-none"
              placeholder="Matematika&#10;Sains&#10;Teknologi"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-border bg-surface-muted flex justify-end gap-3 shrink-0">
          <button
            @click="closeRiasecEditModal"
            class="px-4 py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveRiasecEdit"
            :disabled="savingRiasec"
            class="px-4 py-2 text-sm font-medium text-text-on-primary bg-instrument rounded-lg hover:bg-instrument-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed cursor-pointer"
          >
            {{ savingRiasec ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah / Edit Kolom -->
    <div v-if="showColumnModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-sm mx-auto">
        <div class="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 class="text-base font-semibold text-text-primary">
            {{ columnForm.id ? 'Ubah Kolom' : 'Tambah Kolom' }}
          </h3>
          <button @click="closeColumnModal" class="text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Nama Kolom</label>
            <input
              v-model="columnForm.name"
              type="text"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-instrument focus:border-transparent text-sm"
              placeholder="Misal: Saya adalah"
              autofocus
              @keyup.enter="saveColumn"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Urutan</label>
            <input
              v-model.number="columnForm.order"
              type="number"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-instrument focus:border-transparent text-sm"
            />
            <p class="text-xs text-text-muted mt-1">Angka lebih kecil tampil lebih atas.</p>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-border bg-surface-muted flex justify-end gap-3">
          <button
            @click="closeColumnModal"
            class="px-4 py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveColumn"
            :disabled="!columnForm.name.trim() || savingColumn"
            class="px-4 py-2 text-sm font-medium text-text-on-primary bg-instrument rounded-lg hover:bg-instrument-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed cursor-pointer"
          >
            {{ savingColumn ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hapus Soal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-text-primary">Hapus Pernyataan</h3>
          <p class="mt-2 text-sm text-text-secondary">Apakah Anda yakin ingin menghapus pernyataan ini? Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div class="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm cursor-pointer">Batal</button>
          <button @click="confirmDelete" :disabled="saving" class="px-4 py-2 bg-danger text-text-on-primary rounded-lg hover:bg-danger-soft text-sm disabled:opacity-60 cursor-pointer">
            {{ saving ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hapus Kolom -->
    <div v-if="showDeleteColumnModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-text-primary">Hapus Kolom "{{ deletingColumn?.name }}"</h3>
          <p class="mt-2 text-sm text-text-secondary">
            Semua pernyataan di dalam kolom ini ({{ questionsByRiasecAndColumn(deleteColumnRiasecId, deletingColumn?.id).length }} soal) akan ikut terhapus permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div class="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button @click="closeDeleteColumnModal" class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm cursor-pointer">Batal</button>
          <button @click="confirmDeleteColumn" :disabled="savingColumn" class="px-4 py-2 bg-danger text-text-on-primary rounded-lg hover:bg-danger-soft text-sm disabled:opacity-60 cursor-pointer">
            {{ savingColumn ? 'Menghapus...' : 'Hapus Kolom & Isinya' }}
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
import { useHollandColumnsStore } from '@/stores/holland/holland-columns'
import { useHollandRiasecStore } from '@/stores/holland/holland-riasec'
import { useHollandStore } from '@/stores/holland/holland'

const route = useRoute()
const router = useRouter()
const hollandSlug = route.params.slug
const hollandId = ref(null)

const questionsStore = useHollandQuestionsStore()
const { allQuestions, loading } = storeToRefs(questionsStore)

const columnsStore = useHollandColumnsStore()
const { columnsByRiasec } = storeToRefs(columnsStore)

const riasecStore = useHollandRiasecStore()
const { riasecList } = storeToRefs(riasecStore)

const hollandStore = useHollandStore()

// ── State ──────────────────────────────────────────────────

const saving = ref(false)

// Inline add — key gabungan riasecId+columnId biar cuma 1 form aktif dalam satu waktu
const activeAddKey = ref(null)
const inlineForm = ref({ question: '' })
const keyOf = (riasecId, columnId) => `${riasecId}__${columnId}`

// Edit modal soal — store riasecId separately
const showEditModal = ref(false)
const editingId = ref(null)
const editRiasecId = ref(null)
const editOriginalColumnId = ref(null)
const editForm = ref({ question: '', columnId: '' })

// Delete modal soal
const showDeleteModal = ref(false)
const deletingId = ref(null)
const deleteRiasecId = ref(null)
const deleteColumnIdForQuestion = ref(null)

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

// Modal tambah / edit kolom
const showColumnModal = ref(false)
const savingColumn = ref(false)
const columnModalRiasecId = ref(null)
const columnForm = ref({ id: null, name: '', order: 0 })

// Modal hapus kolom
const showDeleteColumnModal = ref(false)
const deleteColumnRiasecId = ref(null)
const deletingColumn = ref(null)

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {
  // Resolve slug to document ID
  const holland = await hollandStore.getHollandBySlug(hollandSlug)
  if (!holland) {
    router.push({ name: 'admin-holland' })
    return
  }
  hollandId.value = holland.id

  // Fetch riasec list dulu, baru columns per riasec, baru semua questions
  await riasecStore.fetchRiasecList(hollandId.value)
  const riasecIds = riasecList.value.map((c) => c.id)
  await columnsStore.fetchAllColumns(hollandId.value, riasecIds)
  await questionsStore.fetchAllQuestions(hollandId.value, columnsByRiasec.value)
})

// ── Helpers ────────────────────────────────────────────────

const columnsFor = (riasecId) => columnsByRiasec.value[riasecId] || []

const questionsByRiasec = (riasecId) =>
  allQuestions.value.filter((q) => q.riasecId === riasecId)

const questionsByRiasecAndColumn = (riasecId, columnId) =>
  allQuestions.value.filter((q) => q.riasecId === riasecId && q.columnId === columnId)

// array <-> textarea (1 baris = 1 item), buang baris kosong
const arrayToText = (arr) => (arr || []).join('\n')
const textToArray = (text) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

// ── Inline Add Soal ────────────────────────────────────────

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
    await questionsStore.addQuestion(hollandId.value, riasecId, columnId, {
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

const openEditModal = (q, riasecId, columnId) => {
  editingId.value = q.id
  editRiasecId.value = riasecId
  editOriginalColumnId.value = columnId
  editForm.value = { question: q.question, columnId }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingId.value = null
  editRiasecId.value = null
  editOriginalColumnId.value = null
  editForm.value = { question: '', columnId: '' }
}

const saveEdit = async () => {
  if (!editForm.value.question.trim()) return
  saving.value = true
  try {
    await questionsStore.updateQuestion(
      hollandId.value,
      editRiasecId.value,
      editOriginalColumnId.value,
      editingId.value,
      {
        question: editForm.value.question.trim(),
        newColumnId: editForm.value.columnId !== editOriginalColumnId.value ? editForm.value.columnId : null,
      }
    )
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
    await hollandStore.updateRiasecContent(hollandId.value, riasecEditForm.value.id, {
      description: riasecEditForm.value.description.trim(),
      skills: textToArray(riasecEditForm.value.skillsText),
      careers: textToArray(riasecEditForm.value.careersText),
      subjects: textToArray(riasecEditForm.value.subjectsText),
    })
    // refresh biar label/deskripsi di kartu kategori langsung ke-update
    await riasecStore.fetchRiasecList(hollandId.value)
    closeRiasecEditModal()
  } catch (e) {
    console.error(e)
  } finally {
    savingRiasec.value = false
  }
}

// ── Delete Modal Soal ──────────────────────────────────────

const openDeleteModal = (id, riasecId, columnId) => {
  deletingId.value = id
  deleteRiasecId.value = riasecId
  deleteColumnIdForQuestion.value = columnId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  saving.value = true
  try {
    await questionsStore.deleteQuestion(
      hollandId.value,
      deleteRiasecId.value,
      deleteColumnIdForQuestion.value,
      deletingId.value
    )
    showDeleteModal.value = false
    deletingId.value = null
    deleteRiasecId.value = null
    deleteColumnIdForQuestion.value = null
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

// ── Tambah / Edit Kolom ──────────────────────────────────────

const openAddColumnModal = (riasecId) => {
  columnModalRiasecId.value = riasecId
  const existing = columnsFor(riasecId)
  const nextOrder = existing.length
    ? Math.max(...existing.map((c) => c.order ?? 0)) + 1
    : 0
  columnForm.value = { id: null, name: '', order: nextOrder }
  showColumnModal.value = true
}

const openEditColumnModal = (riasecId, col) => {
  columnModalRiasecId.value = riasecId
  columnForm.value = { id: col.id, name: col.name, order: col.order ?? 0 }
  showColumnModal.value = true
}

const closeColumnModal = () => {
  showColumnModal.value = false
  columnModalRiasecId.value = null
  columnForm.value = { id: null, name: '', order: 0 }
}

const saveColumn = async () => {
  if (!columnForm.value.name.trim()) return
  savingColumn.value = true
  try {
    if (columnForm.value.id) {
      await columnsStore.updateColumn(hollandId.value, columnModalRiasecId.value, columnForm.value.id, {
        name: columnForm.value.name.trim(),
        order: columnForm.value.order,
      })
    } else {
      await columnsStore.addColumn(hollandId.value, columnModalRiasecId.value, {
        name: columnForm.value.name.trim(),
        order: columnForm.value.order,
      })
    }
    closeColumnModal()
  } catch (e) {
    console.error(e)
  } finally {
    savingColumn.value = false
  }
}

// ── Hapus Kolom ──────────────────────────────────────────────

const openDeleteColumnModal = (riasecId, col) => {
  deleteColumnRiasecId.value = riasecId
  deletingColumn.value = col
  showDeleteColumnModal.value = true
}

const closeDeleteColumnModal = () => {
  showDeleteColumnModal.value = false
  deleteColumnRiasecId.value = null
  deletingColumn.value = null
}

const confirmDeleteColumn = async () => {
  savingColumn.value = true
  try {
    // Hapus semua soal di kolom ini dulu (Firestore gak cascade-delete subcollection)
    await questionsStore.deleteAllQuestionsInColumn(
      hollandId.value,
      deleteColumnRiasecId.value,
      deletingColumn.value.id
    )
    await columnsStore.deleteColumn(hollandId.value, deleteColumnRiasecId.value, deletingColumn.value.id)
    closeDeleteColumnModal()
  } catch (e) {
    console.error(e)
  } finally {
    savingColumn.value = false
  }
}
</script>