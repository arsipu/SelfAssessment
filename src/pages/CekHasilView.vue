<template>
  <div class="min-h-screen bg-bg">
    <AppTopBar />

    <section class="max-w-md mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-16">
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-5">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="w-6 h-6 text-primary" />
        </div>
        <h1 class="text-xl md:text-2xl font-bold text-text-primary mb-2">Cek Hasil Asesmen</h1>
        <p class="text-sm text-text-secondary">
          Masukkan kode yang kamu dapat setelah menyelesaikan tes.
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-3">
        <input
          v-model="code"
          type="text"
          placeholder="Contoh: LK-482910-3F2A"
          class="w-full px-4 py-3 border border-border rounded-xl text-sm text-center tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-primary"
          :class="{ 'border-red-400': errorMsg }"
          @input="errorMsg = ''"
        />

        <p v-if="errorMsg" class="text-xs text-red-500 text-center">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading || !code.trim()"
          class="w-full px-4 py-3 bg-primary text-text-on-primary text-sm font-semibold rounded-xl hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <font-awesome-icon v-if="loading" icon="fa-solid fa-circle-notch" class="w-4 h-4 animate-spin" />
          {{ loading ? 'Mencari...' : 'Cari Hasil' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import AppTopBar from '@/components/AppTopBar.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLikertStore } from '@/stores/likert/likert'
import { useHollandStore } from '@/stores/holland/holland'
import { useLikertSubmissionsStore } from '@/stores/likert/likert-submissions'
import { useHollandSubmissionsStore } from '@/stores/holland/holland-submissions'

const router = useRouter()
const code = ref('')
const loading = ref(false)
const errorMsg = ref('')

const likertStore = useLikertStore()
const hollandStore = useHollandStore()
const likertSubmissionsStore = useLikertSubmissionsStore()
const hollandSubmissionsStore = useHollandSubmissionsStore()

async function handleSubmit() {
  const trimmed = code.value.trim().toUpperCase()
  if (!trimmed) return
  errorMsg.value = ''
  loading.value = true

  try {
    const prefix = trimmed.split('-')[0]

    if (prefix === 'LK') {
      const submission = await likertSubmissionsStore.findSubmissionByCodeGlobal(trimmed)
      if (!submission) { errorMsg.value = 'Kode tidak ditemukan.'; return }

      const likert = await likertStore.getLikertById(submission.likertId)
      if (!likert) { errorMsg.value = 'Instrumen tidak ditemukan.'; return }

      router.push({ name: 'likert-result', params: { slug: likert.slug }, query: { code: trimmed } })
    } else if (prefix === 'HL') {
      const submission = await hollandSubmissionsStore.findSubmissionByCodeGlobal(trimmed)
      if (!submission) { errorMsg.value = 'Kode tidak ditemukan.'; return }

      const holland = await hollandStore.getHollandById(submission.hollandId)
      if (!holland) { errorMsg.value = 'Instrumen tidak ditemukan.'; return }

      router.push({ name: 'holland-result', params: { slug: holland.slug }, query: { code: trimmed } })
    } else {
      errorMsg.value = 'Format kode tidak dikenali.'
    }
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Terjadi kesalahan. Coba lagi.'
  } finally {
    loading.value = false
  }
}

async function lookupLikert(codeVal) {
  // query submission by code -> dapetin likertSlug + submissionSlug
  // router.push({ name: 'likert-result', params: { slug, submissionSlug } })
}

async function lookupHolland(codeVal) {
  // query submission by code -> dapetin hollandSlug + submissionSlug
  // router.push({ name: 'holland-result', params: { slug, submissionSlug } })
}
</script>