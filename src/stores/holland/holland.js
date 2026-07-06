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
} from 'firebase/firestore'

import { DRAFT, PUBLISHED } from '@/apps/status'

export const useHollandStore = defineStore('holland', () => {
  const hollands = ref([])
  const currentHolland = ref(null)
  const loading = ref(false)

  // ── List semua instrumen Holland ──────────────────────────

  const fetchHollands = async () => {
    loading.value = true
    try {
      const snap = await getDocs(collection(db, 'holland'))
      hollands.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (error) {
      console.error('Error fetching hollands:', error)
    } finally {
      loading.value = false
    }
  }

  // ── Detail 1 instrumen ────────────────────────────────────

  const getHollandById = async (hollandId) => {
    console.log('Fetching holland:', hollandId)
    try {
      const snap = await getDoc(doc(db, 'holland', hollandId))
      if (snap.exists()) {
        currentHolland.value = { id: snap.id, ...snap.data() }
        console.log('Holland fetched:', currentHolland.value.name)
      } else {
        console.log('No such holland document!')
        currentHolland.value = null
      }
    } catch (error) {
      console.error('Error fetching holland:', error)
    }
    return currentHolland.value
  }

  // ── Buat instrumen baru ───────────────────────────────────

  const addHolland = async ({ name, description, direction }) => {
    console.log('Adding holland:', name)
    try {
      const ref = await addDoc(collection(db, 'holland'), {
        name,
        description: description || '',
        direction: direction || '',
        status: DRAFT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      console.log('Holland added with ID:', ref.id)
      await fetchHollands()
      return ref.id
    } catch (error) {
      console.error('Error adding holland:', error)
      throw error
    }
  }

  // ── Update instrumen ──────────────────────────────────────

  const updateHolland = async (hollandId, { name, description, direction }) => {
    console.log('Updating holland:', hollandId)
    try {
      await updateDoc(doc(db, 'holland', hollandId), {
        name,
        description: description || '',
        direction: direction || '',
        updatedAt: serverTimestamp(),
      })
      console.log('Holland updated:', hollandId)
      await fetchHollands()
    } catch (error) {
      console.error('Error updating holland:', error)
      throw error
    }
  }

  // ── Hapus instrumen ───────────────────────────────────────

  const deleteHolland = async (hollandId) => {
    console.log('Deleting holland:', hollandId)
    try {
      await deleteDoc(doc(db, 'holland', hollandId))
      console.log('Holland deleted:', hollandId)
      await fetchHollands()
    } catch (error) {
      console.error('Error deleting holland:', error)
      throw error
    }
  }

  // ── Update status ─────────────────────────────────────────

  const updateHollandStatus = async (id, status) => {
    // Auto-unpublish other published instruments when publishing this one
    if (status === PUBLISHED) {
      const others = hollands.value.filter(
        (h) => h.id !== id && h.status === PUBLISHED
      )
      for (const other of others) {
        await updateDoc(doc(db, 'holland', other.id), {
          status: DRAFT,
          updatedAt: serverTimestamp(),
        })
      }
    }

    await updateDoc(doc(db, 'holland', id), {
      status,
      updatedAt: serverTimestamp(),
    })

    await fetchHollands()
  }

  return {
    hollands,
    currentHolland,
    loading,
    fetchHollands,
    getHollandById,
    addHolland,
    updateHolland,
    deleteHolland,
    updateHollandStatus,
  }
})