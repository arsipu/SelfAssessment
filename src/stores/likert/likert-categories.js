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
      const q = query(categoriesPath(likertId), orderBy('name', 'asc'))
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
  // Field `questions` diinisialisasi sebagai array kosong.

  const addCategory = async (likertId, { name }) => {
    const payload = { name: name.trim(), questions: [], createdAt: serverTimestamp() }
    try {
      const ref = await addDoc(categoriesPath(likertId), payload)
      categories.value.push({ id: ref.id, ...payload })
      console.log('Category added with ID:', ref.id)
      return ref.id
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  // ── Update category (name only) ───────────────────────────

  const updateCategory = async (likertId, categoryId, { name }) => {
    try {
      const ref = doc(db, 'likert', likertId, 'categories', categoryId)
      await updateDoc(ref, { name: name.trim() })
      const idx = categories.value.findIndex((c) => c.id === categoryId)
      if (idx !== -1) categories.value[idx].name = name.trim()
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