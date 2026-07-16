import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase/firebase-config'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collectionGroup,
  query,
  where,
} from 'firebase/firestore'

import { ACTIVE, INACTIVE } from '@/apps/status'

export const useLikertStore = defineStore('likert', () => {
  const likerts = ref([])
  const currentLikert = ref(null)
  const loading = ref(false)
  const currentLikertScales = ref([])

  // ── Likert (surveys) ──────────────────────────────────────

  const fetchLikerts = async () => {
    loading.value = true
    try {
      const snap = await getDocs(collection(db, 'likert'))
      likerts.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (error) {
      console.error('Error fetching likerts:', error)
    } finally {
      loading.value = false
    }
  }

  const getLikertById = async (likertId) => {
    console.log('Fetching likert:', likertId)
    try {
      const snap = await getDoc(doc(db, 'likert', likertId))
      if (snap.exists()) {
        currentLikert.value = { id: snap.id, ...snap.data() }
        console.log('Likert fetched:', currentLikert.value.name)
      } else {
        console.log('No such likert document!')
        currentLikert.value = null
      }
    } catch (error) {
      console.error('Error fetching likert:', error)
    }
    return currentLikert.value
  }

  const addLikert = async ({ name, description }) => {
    console.log('Adding likert:', name)
    try {
      const ref = await addDoc(collection(db, 'likert'), { 
        name,
        description,
        status: INACTIVE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      console.log('Likert added with ID:', ref.id)
      await fetchLikerts()
      return ref.id
    } catch (error) {
      console.error('Error adding likert:', error)
      throw error
    }
  }

  const updateLikert = async (likertId, { name, description }) => {
    console.log('Updating likert:', likertId)
    try {
      await updateDoc(doc(db, 'likert', likertId), { 
        name, 
        description,
        updatedAt: serverTimestamp(),
      })
      console.log('Likert updated:', likertId)
      await fetchLikerts()
    } catch (error) {
      console.error('Error updating likert:', error)
      throw error
    }
  }

  const deleteLikert = async (likertId) => {
    console.log('Deleting likert:', likertId)
    try {
      await deleteDoc(doc(db, 'likert', likertId))
      console.log('Likert deleted:', likertId)
      await fetchLikerts()
    } catch (error) {
      console.error('Error deleting likert:', error)
      throw error
    }
  }

  const updateLikertStatus = async (id, status) => {
    if (status === ACTIVE) {
      // cari likert lain yang masih active, turunkan jadi inactive dulu
      const others = likerts.value.filter(
        (l) => l.id !== id && l.status === ACTIVE
      )
      for (const other of others) {
        await updateDoc(doc(db, 'likert', other.id), {
          status: INACTIVE,
          updatedAt: serverTimestamp(),
        })
      }
    }

    await updateDoc(doc(db, 'likert', id), {
      status,
      updatedAt: serverTimestamp(),
    })

    await fetchLikerts()
  }

  const fetchLikertScales = async (likertId) => {
  try {
    const snap = await getDocs(collection(db, 'likert', likertId, 'scale'))
    const scales = snap.docs.map((d) => {
      const data = d.data()
      // regex ini nangkep -, –, — dikelilingi spasi opsional
      const parts = data.range.split(/\s*[-–—]\s*/).map((s) => s.trim())
      const min = Number(parts[0])
      const max = Number(parts[1])

      return {
        id: d.id,
        label: data.score,
        description: data.description,
        min,
        max,
      }
    })

    
    // urutkan dari min terbesar ke terkecil (biar konsisten kayak array hardcode sebelumnya)
    scales.sort((a, b) => b.min - a.min)
    currentLikertScales.value = scales
    return scales
  } catch (error) {
    console.error('Error fetching likert scales:', error)
    currentLikertScales.value = []
    throw error
  }
}

  // ── Scale CRUD ────────────────────────────────────────────

  const addScale = async (likertId, { score, range, description }) => {
    try {
      const ref = await addDoc(collection(db, 'likert', likertId, 'scale'), {
        score,
        range,
        description,
      })
      console.log('Scale added with ID:', ref.id)
      return ref.id
    } catch (error) {
      console.error('Error adding scale:', error)
      throw error
    }
  }

  const updateScale = async (likertId, scaleId, { score, range, description }) => {
    try {
      await updateDoc(doc(db, 'likert', likertId, 'scale', scaleId), {
        score,
        range,
        description,
      })
      console.log('Scale updated:', scaleId)
    } catch (error) {
      console.error('Error updating scale:', error)
      throw error
    }
  }

  const deleteScale = async (likertId, scaleId) => {
    try {
      await deleteDoc(doc(db, 'likert', likertId, 'scale', scaleId))
      console.log('Scale deleted:', scaleId)
    } catch (error) {
      console.error('Error deleting scale:', error)
      throw error
    }
  }

  return {
    likerts,
    currentLikert,
    loading,
    currentLikertScales,
    fetchLikerts,
    getLikertById,
    addLikert,
    updateLikert,
    deleteLikert,
    updateLikertStatus,
    fetchLikertScales,
    addScale,
    updateScale,
    deleteScale,
  }
})