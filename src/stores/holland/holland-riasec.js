import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase/firebase-config'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore'

export const useHollandRiasecStore = defineStore('hollandRiasec', () => {
  const riasecList = ref([])
  const loading = ref(false)

  // ── Fetch all 6 RIASEC category docs, ordered by `order` field ──

  const fetchRiasecList = async (hollandId) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'holland', hollandId, 'riasec'),
        orderBy('order', 'asc')
      )
      const snap = await getDocs(q)
      riasecList.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      console.log('RiasecList fetched:', riasecList.value.length)
    } catch (error) {
      console.error('Error fetching riasec list:', error)
      riasecList.value = []
    } finally {
      loading.value = false
    }
    return riasecList.value
  }

  // ── Fetch single RIASEC category doc ──

  const getRiasecById = async (hollandId, riasecId) => {
    loading.value = true
    try {
      const snap = await getDoc(doc(db, 'holland', hollandId, 'riasec', riasecId))
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() }
      }
      return null
    } catch (error) {
      console.error('Error fetching riasec by id:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    riasecList,
    loading,
    fetchRiasecList,
    getRiasecById,
  }
})