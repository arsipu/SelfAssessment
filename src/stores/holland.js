import { defineStore } from 'pinia'
import { db } from '@/firebase/firebase-config'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

// Singleton: cuma ada 1 dokumen config untuk instrumen Holland RIASEC
const CONFIG_DOC_PATH = ['holland', 'config']

export const useHollandStore = defineStore('holland', {
  state: () => ({
    config: null,
    loading: false,
  }),

  actions: {
    async fetchConfig() {
      this.loading = true
      try {
        const ref = doc(db, ...CONFIG_DOC_PATH)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          this.config = { id: snap.id, ...snap.data() }
        } else {
          // Auto-inisialisasi kalau doc belum ada
          const initial = {
            name: 'Holland RIASEC',
            description: '',
            direction:
              'Pada Kuesioner ini terdapat tabel, masing-masing tabel terdiri atas 3 kolom kosong yang harus diisi dengan tanda (√) pada pernyataan yang mencerminkan diri Anda.',
            status: 'draft',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
          await setDoc(ref, initial)
          this.config = { id: 'config', ...initial }
        }
      } finally {
        this.loading = false
      }
    },

    async updateConfig(payload) {
      const ref = doc(db, ...CONFIG_DOC_PATH)
      await updateDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
      })
      this.config = { ...this.config, ...payload }
    },

    async updateStatus(status) {
      await this.updateConfig({ status })
    },
  },
})