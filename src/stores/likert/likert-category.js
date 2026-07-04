import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase/firebase-config'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

export const useLikertCategoryStore = defineStore('likertCategory', () => {
  const categories = ref([])

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'likert_category'))
      categories.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const addCategory = async (name) => {
    try {
      const payload = { name }
      const docRef = await addDoc(collection(db, 'likert_category'), payload)
      categories.value.push({ id: docRef.id, ...payload })
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  const updateCategory = async (id, name) => {
    try {
      await updateDoc(doc(db, 'likert_category', id), { name })
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx !== -1) categories.value[idx].name = name
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, 'likert_category', id))
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  return { categories, fetchCategories, addCategory, updateCategory, deleteCategory }
})