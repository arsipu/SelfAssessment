<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
  >
    <div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-auto">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
        <!-- Pesan default (string sederhana) atau slot custom kalau butuh markup (bold, angka dinamis, dll) -->
        <p class="mt-2 text-sm text-text-secondary">
          <slot>{{ message }}</slot>
        </p>
      </div>
      <div class="px-6 py-4 border-t border-border flex justify-end gap-3">
        <button
          @click="$emit('cancel')"
          :disabled="loading"
          class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm disabled:opacity-60 cursor-pointer"
        >
          {{ cancelText }}
        </button>
        <button
          @click="$emit('confirm')"
          :disabled="loading"
          class="px-4 py-2 bg-danger text-text-on-primary rounded-lg hover:bg-danger-soft text-sm disabled:opacity-60 cursor-pointer"
        >
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Modal konfirmasi hapus generic — dipakai di semua fitur admin (Holland, Likert, dll)
// yang butuh dialog "yakin mau hapus X?".
//
// Cara pakai:
// <ConfirmDeleteModal
//   :show="showDeleteModal"
//   title="Hapus Instrumen"
//   message="Apakah Anda yakin ingin menghapus instrumen ini? Tindakan ini tidak dapat dibatalkan."
//   :loading="saving"
//   @confirm="confirmDelete"
//   @cancel="showDeleteModal = false"
// />
//
// Kalau pesannya butuh markup (bold, angka dinamis, dll), pakai default slot,
// prop `message` bakal diabaikan:
// <ConfirmDeleteModal :show="showDeleteColumnModal" title="Hapus Kolom" ...>
//   Semua pernyataan di kolom ini (<strong>{{ count }} soal</strong>) akan ikut terhapus.
// </ConfirmDeleteModal>

defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Hapus' },
  loadingText: { type: String, default: 'Menghapus...' },
  cancelText: { type: String, default: 'Batal' },
  loading: { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])
</script>