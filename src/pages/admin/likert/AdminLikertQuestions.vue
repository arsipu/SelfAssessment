<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="router.push({ name: 'admin-likert' })"
        class="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
      >
        Survei
      </button>
      <span class="text-text-muted">/</span>
      <span class="text-sm text-text-primary font-medium truncate max-w-[200px] md:max-w-none">{{ currentLikert?.name ?? '...' }}</span>
    </div>

    <!-- Header -->
    <div class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">{{ currentLikert?.name ?? 'Memuat...' }}</h1>
          <p class="text-sm text-text-secondary max-w-3xl">{{ currentLikert?.description }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            @click="router.push({ name: 'admin-likert-submissions', params: { slug: likertSlug } })"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-right-to-bracket" class="w-4 h-4 shrink-0" />
            Lihat Submissions
          </button>
        </div>
      </div>
    </div>

    <!-- Card Kelola Skala (inline, bukan modal) -->
    <div class="bg-surface border border-border rounded-xl overflow-hidden mb-4 md:mb-6">
      <div class="px-4 md:px-5 py-3 md:py-4 border-b border-border bg-surface-muted">
        <h2 class="text-sm font-medium text-text-primary">Skala Penilaian</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse table-fixed">
          <thead>
            <tr class="bg-surface border-b border-border">
              <th class="w-[18%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Rentang</th>
              <th class="w-[27%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Label</th>
              <th class="w-[35%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Deskripsi</th>
              <th class="w-[20%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="s in scales"
              :key="s.id"
              class="hover:bg-surface-muted transition-colors"
            >
              <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ s.min }} – {{ s.max }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-text-primary">{{ s.label }}</td>
              <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ s.description }}</td>
              <td class="px-4 md:px-5 py-3">
                <div class="flex items-center gap-2">
                  <button
                    @click="editScaleItem(s)"
                    class="p-2.5 md:p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Edit"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="w-5 h-5 shrink-0" />
                  </button>
                  <button
                    @click="deleteScaleItem(s.id)"
                    class="p-2.5 md:p-2 rounded-lg text-danger hover:bg-danger-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                    title="Hapus"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="w-5 h-5 shrink-0" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="scales.length === 0">
              <td colspan="4" class="px-4 md:px-5 py-6 text-center text-sm text-text-muted">
                Belum ada skala penilaian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Inline Add Form -->
      <div class="border-t border-border">
        <div v-if="showAddScaleForm" class="px-4 md:px-5 py-4 bg-surface-muted">
          <div class="flex flex-col sm:flex-row items-start gap-3">
            <input
              v-model="scaleForm.min"
              type="number"
              class="w-full sm:w-24 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Min"
            />
            <input
              v-model="scaleForm.max"
              type="number"
              class="w-full sm:w-24 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Max"
            />
            <input
              v-model="scaleForm.score"
              type="text"
              class="w-full sm:w-48 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Label, cth: Sangat Tinggi"
            />
            <input
              v-model="scaleForm.description"
              type="text"
              class="w-full sm:flex-1 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Deskripsi (opsional)"
            />

            <div class="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
              <button
                @click="saveScale"
                :disabled="!scaleForm.score.trim() || scaleSaving"
                class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed whitespace-nowrap h-10 cursor-pointer"
              >
                {{ scaleSaving ? 'Menyimpan...' : 'Simpan' }}
              </button>
              <button
                @click="cancelAddScale"
                class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>

        <button
          v-else
          @click="openAddScale"
          class="w-full px-4 md:px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2 h-10 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
          Tambah Skala
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center">
      <p class="text-sm text-text-muted">Memuat pertanyaan...</p>
    </div>

    <!-- Blocks per Category -->
    <div v-else class="space-y-4 md:space-y-6">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-surface border border-border rounded-xl overflow-hidden"
      >
        <!-- Category Header -->
        <div class="px-4 md:px-5 py-3 md:py-4 border-b border-border bg-surface-muted flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 class="text-sm font-medium text-text-primary">{{ cat.name }}</h2>
          <span class="text-xs font-medium text-text-secondary bg-surface px-2.5 py-1 rounded-md border border-border">
            {{ questionsByCategory(cat.id).length }} Soal
          </span>
        </div>

        <!-- Tabel -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse table-fixed">
            <thead>
              <tr class="bg-surface border-b border-border">
                <th class="w-[8%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">No</th>
                <th class="w-[48%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Pertanyaan</th>
                <th class="w-[24%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Jenis</th>
                <th class="w-[20%] px-4 md:px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                v-for="(q, index) in questionsByCategory(cat.id)"
                :key="q.id"
                class="hover:bg-surface-muted transition-colors"
              >
                <td class="px-4 md:px-5 py-3 text-sm text-text-secondary">{{ index + 1 }}</td>
                <td class="px-4 md:px-5 py-3 text-sm text-text-primary">{{ q.question }}</td>
                <td class="px-4 md:px-5 py-3">
                  <span
                    class="text-xs px-2 py-1 rounded-full font-medium"
                    :class="q.favorable === 'favorable' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'"
                  >
                    {{ q.favorable === 'favorable' ? 'Favorable' : 'Unfavorable' }}
                  </span>
                </td>
                <td class="px-4 md:px-5 py-3">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openEditModal(q)"
                      class="p-2.5 md:p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                      title="Edit"
                    >
                      <font-awesome-icon icon="fa-solid fa-pen" class="w-5 h-5 shrink-0" />
                    </button>
                    <button
                      @click="openDeleteModal(q.id)"
                      class="p-2.5 md:p-2 rounded-lg text-danger hover:bg-danger-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
                      title="Hapus"
                    >
                      <font-awesome-icon icon="fa-solid fa-trash" class="w-5 h-5 shrink-0" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="questionsByCategory(cat.id).length === 0">
                <td colspan="4" class="px-4 md:px-5 py-6 text-center text-sm text-text-muted">
                  Belum ada pertanyaan untuk kategori ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Inline Add Form -->
        <div class="border-t border-border">
          <!-- Form aktif -->
          <div v-if="activeAddCategoryId === cat.id" class="px-4 md:px-5 py-4 bg-surface-muted">
            <div class="flex flex-col sm:flex-row items-start gap-3">
              <textarea
                v-model="inlineForm.question"
                rows="2"
                class="w-full sm:flex-1 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                placeholder="Masukkan teks pertanyaan..."
                autofocus
              ></textarea>

              <div class="flex flex-row sm:flex-col gap-3 sm:gap-2 pt-1 shrink-0 flex-wrap">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="inlineForm.favorable" value="favorable" class="h-4 w-4 shrink-0" />
                  <span class="text-sm text-text-primary whitespace-nowrap">Favorable</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="inlineForm.favorable" value="unfavorable" class="h-4 w-4 shrink-0" />
                  <span class="text-sm text-text-primary whitespace-nowrap">Unfavorable</span>
                </label>
              </div>

              <div class="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button
                  @click="saveInline(cat.id)"
                  :disabled="!inlineForm.question.trim() || saving"
                  class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed whitespace-nowrap h-10 cursor-pointer"
                >
                  {{ saving ? 'Menyimpan...' : 'Simpan' }}
                </button>
                <button
                  @click="cancelInline"
                  class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
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
            class="w-full px-4 md:px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2 h-10 cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
            Tambah Soal
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Soal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        <div class="px-4 md:px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
          <h3 class="text-base font-semibold text-text-primary">Edit Soal</h3>
          <button @click="closeEditModal" class="text-text-muted hover:text-text-secondary transition-colors p-1 cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-4 md:p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Kategori</label>
            <input
              :value="categories.find(c => c.id === editForm.categoryId)?.name ?? '-'"
              disabled
              class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg text-sm bg-surface-muted text-text-muted cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Pertanyaan</label>
            <textarea
              v-model="editForm.question"
              rows="3"
              class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
              placeholder="Masukkan teks pertanyaan..."
            ></textarea>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="editForm.favorable" value="favorable" class="h-4 w-4 shrink-0" />
              <span class="text-sm text-text-primary">Favorable</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="editForm.favorable" value="unfavorable" class="h-4 w-4 shrink-0" />
              <span class="text-sm text-text-primary">Unfavorable</span>
            </label>
          </div>
        </div>

        <div class="px-4 md:px-6 py-4 border-t border-border bg-surface-muted flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            @click="closeEditModal"
            class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveEdit"
            :disabled="!editForm.question.trim() || saving"
            class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed h-10 cursor-pointer"
          >
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hapus Soal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">
        <div class="p-4 md:p-6 overflow-y-auto">
          <h3 class="text-lg font-semibold text-text-primary">Hapus Soal</h3>
          <p class="mt-2 text-sm text-text-secondary">Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div class="px-4 md:px-6 py-4 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button @click="showDeleteModal = false" class="w-full sm:w-auto px-4 py-2.5 md:py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm h-10 cursor-pointer">Batal</button>
          <button @click="confirmDelete" :disabled="saving" class="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-danger text-text-on-primary rounded-lg hover:bg-danger-soft text-sm disabled:opacity-60 h-10 cursor-pointer">
            {{ saving ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Skala -->
    <div v-if="showEditScaleModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        <div class="px-4 md:px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
          <h3 class="text-base font-semibold text-text-primary">Edit Skala</h3>
          <button @click="cancelScaleEdit" class="text-text-muted hover:text-text-secondary transition-colors p-1 cursor-pointer">
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <div class="p-4 md:p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Label</label>
            <input
              v-model="scaleForm.score"
              type="text"
              class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Contoh: Sangat Tinggi"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">Min</label>
              <input
                v-model.number="scaleForm.min"
                type="number"
                class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">Max</label>
              <input
                v-model.number="scaleForm.max"
                type="number"
                class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">Deskripsi</label>
            <textarea
              v-model="scaleForm.description"
              rows="3"
              class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-y"
              placeholder="Deskripsi (opsional)"
            ></textarea>
          </div>
        </div>

        <div class="px-4 md:px-6 py-4 border-t border-border bg-surface-muted flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            @click="cancelScaleEdit"
            class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveScale"
            :disabled="!scaleForm.score.trim() || scaleSaving"
            class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed h-10 cursor-pointer"
          >
            {{ scaleSaving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Skala -->
    <div v-if="showDeleteScaleModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">
        <div class="p-4 md:p-6 overflow-y-auto">
          <h3 class="text-lg font-semibold text-text-primary">Hapus Skala</h3>
          <p class="mt-2 text-sm text-text-secondary">Apakah Anda yakin ingin menghapus skala ini? Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div class="px-4 md:px-6 py-4 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button @click="showDeleteScaleModal = false" class="w-full sm:w-auto px-4 py-2.5 md:py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm h-10 cursor-pointer">Batal</button>
          <button @click="confirmDeleteScale" :disabled="scaleSaving" class="w-full sm:w-auto px-4 py-2.5 md:py-2 bg-danger text-text-on-primary rounded-lg hover:bg-danger-soft text-sm disabled:opacity-60 h-10 cursor-pointer">
            {{ scaleSaving ? 'Menghapus...' : 'Hapus' }}
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
const likertSlug = route.params.slug
const likertId = ref(null)

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

// ── Scale State ────────────────────────────────────────────

const scales = ref([])
const scaleSaving = ref(false)
const scaleForm = ref({ score: '', min: '', max: '', description: '' })
const editingScaleId = ref(null)

// Inline add scale
const showAddScaleForm = ref(false)

// Edit scale modal
const showEditScaleModal = ref(false)

// Delete scale
const showDeleteScaleModal = ref(false)
const deletingScaleId = ref(null)

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {

  const likert = await likertStore.getLikertBySlug(likertSlug)
  if (!likert) {
    router.push({ name: 'admin-likert' })
    return
  }

  likertId.value = likert.id

  await Promise.all([
    likertStore.getLikertById(likertId.value),
    likertQuestionsStore.fetchQuestions(likertId.value),
    categoryStore.fetchCategories(),
    fetchScales(),
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

// ── Scale Management ───────────────────────────────────────

const resetScaleForm = () => {
  scaleForm.value = { score: '', min: '', max: '', description: '' }
  editingScaleId.value = null
}

const fetchScales = async () => {
  try {
    const data = await likertStore.fetchLikertScales(likertId.value)
    scales.value = data
  } catch (e) {
    console.error(e)
    scales.value = []
  }
}

const openAddScale = () => {
  resetScaleForm()
  showAddScaleForm.value = true
}

const cancelAddScale = () => {
  resetScaleForm()
  showAddScaleForm.value = false
}

const saveScale = async () => {
  if (!scaleForm.value.score.trim() || scaleForm.value.min === '' || scaleForm.value.max === '') return
  scaleSaving.value = true
  try {
    const range = `${scaleForm.value.min} – ${scaleForm.value.max}`
    if (editingScaleId.value) {
      await likertStore.updateScale(likertId, editingScaleId.value, {
        score: scaleForm.value.score.trim(),
        range,
        description: scaleForm.value.description.trim(),
      })
      showEditScaleModal.value = false
    } else {
      await likertStore.addScale(likertId, {
        score: scaleForm.value.score.trim(),
        range,
        description: scaleForm.value.description.trim(),
      })
      showAddScaleForm.value = false
    }
    resetScaleForm()
    await fetchScales()
  } catch (e) {
    console.error(e)
  } finally {
    scaleSaving.value = false
  }
}

const editScaleItem = (s) => {
  editingScaleId.value = s.id
  scaleForm.value = {
    score: s.label,
    min: s.min,
    max: s.max,
    description: s.description || '',
  }
  showEditScaleModal.value = true
}

const cancelScaleEdit = () => {
  resetScaleForm()
  showEditScaleModal.value = false
}

const deleteScaleItem = (scaleId) => {
  deletingScaleId.value = scaleId
  showDeleteScaleModal.value = true
}

const confirmDeleteScale = async () => {
  scaleSaving.value = true
  try {
    await likertStore.deleteScale(likertId, deletingScaleId.value)
    showDeleteScaleModal.value = false
    deletingScaleId.value = null
    await fetchScales()
  } catch (e) {
    console.error(e)
  } finally {
    scaleSaving.value = false
  }
}
</script>