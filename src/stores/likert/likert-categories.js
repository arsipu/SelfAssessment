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
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'

export const useLikertCategoriesStore = defineStore('likertCategories', () => {
  const categories = ref([])
  const loading = ref(false)

  const categoriesPath = (likertId) =>
    collection(db, 'likert', likertId, 'categories')

  // ── Fetch all categories for a likert ─────────────────────

  const fetchCategories = async (likertId) => {
    loading.value = true
    try {
      const q = query(categoriesPath(likertId), orderBy('order'))
      const snap = await getDocs(q)
      categories.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      console.log('Categories fetched:', categories.value.length)
    } catch (error) {
      console.error('Error fetching categories:', error)
      categories.value = []
    } finally {
      loading.value = false
    }
    return categories.value
  }

  // ── Fetch single category ─────────────────────────────────

  const getCategoryById = async (likertId, categoryId) => {
    try {
      const snap = await getDoc(doc(db, 'likert', likertId, 'categories', categoryId))
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() }
      }
      return null
    } catch (error) {
      console.error('Error fetching category:', error)
      return null
    }
  }

  // ── Add category ──────────────────────────────────────────
  // `order` = posisi sisip (dari dropdown, 0..N). Category existing
  // yang order-nya >= posisi itu digeser +1 dulu.

  const addCategory = async (likertId, { name, order }) => {
    const toShift = categories.value.filter((c) => (c.order ?? 0) >= order)
    const payload = { name: name.trim(), order, questions: [], createdAt: serverTimestamp() }

    try {
      const batch = writeBatch(db)
      const newRef = doc(categoriesPath(likertId))
      batch.set(newRef, payload)

      toShift.forEach((c) => {
        batch.update(doc(db, 'likert', likertId, 'categories', c.id), {
          order: (c.order ?? 0) + 1,
        })
      })

      await batch.commit()

      const shiftedIds = new Set(toShift.map((c) => c.id))
      const updatedExisting = categories.value.map((c) =>
        shiftedIds.has(c.id) ? { ...c, order: (c.order ?? 0) + 1 } : c
      )

      categories.value = [...updatedExisting, { id: newRef.id, ...payload }].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      )
      console.log('Category added with ID:', newRef.id)
      return newRef.id
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  // ── Update category ───────────────────────────────────────
  // `order` = posisi baru (0..N-1, dari dropdown). Item di ANTARA
  // posisi lama & baru ikut digeser 1 langkah.

  const updateCategory = async (likertId, categoryId, { name, order }) => {
    try {
      const current = categories.value.find((c) => c.id === categoryId)
      const oldOrder = current?.order ?? 0
      const ref = doc(db, 'likert', likertId, 'categories', categoryId)
      const payload = { name: name.trim(), order }

      if (order === undefined || order === oldOrder) {
        await updateDoc(ref, payload)
        const idx = categories.value.findIndex((c) => c.id === categoryId)
        if (idx !== -1) categories.value[idx] = { ...categories.value[idx], ...payload }
      } else {
        const toShift =
          order > oldOrder
            ? categories.value.filter((c) => c.id !== categoryId && (c.order ?? 0) > oldOrder && (c.order ?? 0) <= order)
            : categories.value.filter((c) => c.id !== categoryId && (c.order ?? 0) >= order && (c.order ?? 0) < oldOrder)
        const direction = order > oldOrder ? -1 : 1

        const batch = writeBatch(db)
        batch.update(ref, payload)
        toShift.forEach((c) => {
          batch.update(doc(db, 'likert', likertId, 'categories', c.id), {
            order: (c.order ?? 0) + direction,
          })
        })
        await batch.commit()

        const shiftedIds = new Set(toShift.map((c) => c.id))
        categories.value = categories.value.map((c) => {
          if (c.id === categoryId) return { ...c, ...payload }
          if (shiftedIds.has(c.id)) return { ...c, order: (c.order ?? 0) + direction }
          return c
        })
      }

      categories.value = [...categories.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      console.log('Category updated:', categoryId)
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  // ── Delete category ───────────────────────────────────────
  // NOTE: questions di dalam array ikut terhapus karena array
  // adalah bagian dari dokumen kategori.

  const deleteCategory = async (likertId, categoryId) => {
    try {
      const ref = doc(db, 'likert', likertId, 'categories', categoryId)
      await deleteDoc(ref)
      categories.value = categories.value.filter((c) => c.id !== categoryId)
      console.log('Category deleted:', categoryId)
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  return {
    categories,
    loading,
    fetchCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
  }
})