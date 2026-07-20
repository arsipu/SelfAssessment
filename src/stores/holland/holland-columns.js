import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase/firebase-config'
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'

export const useHollandColumnsStore = defineStore('hollandColumns', () => {
  // { [riasecId]: [{ id, name, order }] }
  const columnsByRiasec = ref({})
  const loading = ref(false)

  const columnsPath = (hollandId, riasecId) =>
    collection(db, 'holland', hollandId, 'riasec', riasecId, 'columns')

  // ── Fetch columns for ONE riasec category ─────────────────

  const fetchColumns = async (hollandId, riasecId) => {
    try {
      const q = query(columnsPath(hollandId, riasecId), orderBy('order', 'asc'))
      const snap = await getDocs(q)
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      columnsByRiasec.value[riasecId] = items
      return items
    } catch (error) {
      console.error('Error fetching columns:', error)
      columnsByRiasec.value[riasecId] = []
      return []
    }
  }

  // ── Fetch columns for ALL riasec categories ───────────────

  const fetchAllColumns = async (hollandId, riasecIds) => {
    loading.value = true
    try {
      await Promise.all(riasecIds.map((id) => fetchColumns(hollandId, id)))
    } catch (error) {
      console.error('Error fetching all columns:', error)
    } finally {
      loading.value = false
    }
    return columnsByRiasec.value
  }

  // ── Add column ─────────────────────────────────────────────

  const addColumn = async (hollandId, riasecId, { name, order }) => {
    const payload = { name: name.trim(), order, createdAt: serverTimestamp() }
    try {
      const ref = await addDoc(columnsPath(hollandId, riasecId), payload)
      columnsByRiasec.value[riasecId] = [
        ...(columnsByRiasec.value[riasecId] || []),
        { id: ref.id, ...payload },
      ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      console.log('Column added with ID:', ref.id)
      return ref.id
    } catch (error) {
      console.error('Error adding column:', error)
      throw error
    }
  }

  // ── Update column ──────────────────────────────────────────

  const updateColumn = async (hollandId, riasecId, columnId, payload) => {
    try {
      const ref = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId)
      await updateDoc(ref, payload)
      const list = columnsByRiasec.value[riasecId] || []
      const idx = list.findIndex((c) => c.id === columnId)
      if (idx !== -1) list[idx] = { ...list[idx], ...payload }
      columnsByRiasec.value[riasecId] = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      console.log('Column updated:', columnId)
    } catch (error) {
      console.error('Error updating column:', error)
      throw error
    }
  }

  // ── Delete column ──────────────────────────────────────────
  // NOTE: ini cuma hapus doc column-nya. Subcollection `questions`
  // di dalamnya HARUS dihapus manual dulu (lihat holland-questions.js
  // -> deleteAllQuestionsInColumn), karena Firestore gak cascade-delete.

  const deleteColumn = async (hollandId, riasecId, columnId) => {
    try {
      const ref = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId)
      await deleteDoc(ref)
      columnsByRiasec.value[riasecId] = (columnsByRiasec.value[riasecId] || []).filter(
        (c) => c.id !== columnId
      )
      console.log('Column deleted:', columnId)
    } catch (error) {
      console.error('Error deleting column:', error)
      throw error
    }
  }

  return {
    columnsByRiasec,
    loading,
    fetchColumns,
    fetchAllColumns,
    addColumn,
    updateColumn,
    deleteColumn,
  }
})