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
  writeBatch,
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
  // `order` di sini artinya "mau disisipkan di posisi ke berapa".
  // Semua column existing yang order-nya >= posisi itu digeser +1 dulu,
  // baru column baru ditulis di posisi tsb. Kalau posisi == jumlah
  // column existing (nyisip di paling akhir), gak ada yang perlu digeser.

  const addColumn = async (hollandId, riasecId, { name, order }) => {
    const existing = columnsByRiasec.value[riasecId] || []
    const toShift = existing.filter((c) => (c.order ?? 0) >= order)

    const payload = { name: name.trim(), order, questions: [], createdAt: serverTimestamp() }

    try {
      const batch = writeBatch(db)
      const newRef = doc(columnsPath(hollandId, riasecId))
      batch.set(newRef, payload)

      toShift.forEach((c) => {
        batch.update(doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', c.id), {
          order: (c.order ?? 0) + 1,
        })
      })

      await batch.commit()

      const shiftedIds = new Set(toShift.map((c) => c.id))
      const updatedExisting = existing.map((c) =>
        shiftedIds.has(c.id) ? { ...c, order: (c.order ?? 0) + 1 } : c
      )

      columnsByRiasec.value[riasecId] = [
        ...updatedExisting,
        { id: newRef.id, ...payload },
      ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      console.log('Column added with ID:', newRef.id)
      return newRef.id
    } catch (error) {
      console.error('Error adding column:', error)
      throw error
    }
  }

  // ── Update column ──────────────────────────────────────────
  // `order` di sini artinya "pindah ke posisi ke berapa" (dari dropdown,
  // jadi udah pasti dalam rentang valid 0..N-1). Item-item di ANTARA
  // posisi lama & posisi baru ikut digeser 1 langkah, konsisten sama
  // semantic "sisip" yang dipakai di addColumn.

  const updateColumn = async (hollandId, riasecId, columnId, { name, order }) => {
    try {
      const list = columnsByRiasec.value[riasecId] || []
      const current = list.find((c) => c.id === columnId)
      const oldOrder = current?.order ?? 0

      const ref = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId)
      const payload = { name: name.trim(), order }

      if (order === undefined || order === oldOrder) {
        // posisi gak berubah, cuma update field lain (nama, dst)
        await updateDoc(ref, payload)
        const idx = list.findIndex((c) => c.id === columnId)
        if (idx !== -1) list[idx] = { ...list[idx], ...payload }
      } else {
        // tentuin siapa aja yang kena geser
        const toShift =
          order > oldOrder
            ? list.filter((c) => c.id !== columnId && (c.order ?? 0) > oldOrder && (c.order ?? 0) <= order)
            : list.filter((c) => c.id !== columnId && (c.order ?? 0) >= order && (c.order ?? 0) < oldOrder)
        const direction = order > oldOrder ? -1 : 1

        const batch = writeBatch(db)
        batch.update(ref, payload)
        toShift.forEach((c) => {
          batch.update(doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', c.id), {
            order: (c.order ?? 0) + direction,
          })
        })
        await batch.commit()

        const shiftedIds = new Set(toShift.map((c) => c.id))
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === columnId) {
            list[i] = { ...list[i], ...payload }
          } else if (shiftedIds.has(list[i].id)) {
            list[i] = { ...list[i], order: (list[i].order ?? 0) + direction }
          }
        }
      }

      columnsByRiasec.value[riasecId] = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      console.log('Column updated:', columnId)
    } catch (error) {
      console.error('Error updating column:', error)
      throw error
    }
  }

  // ── Delete column ──────────────────────────────────────────
  // NOTE: sebelum hapus column, question store deleteAllQuestionsInColumn
  // akan dijalankan dulu oleh komponen. Dengan struktur baru (array field),
  // cukup set questions jadi [] lalu hapus doc — tidak perlu iterasi
  // subcollection.

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