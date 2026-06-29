import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase/firebase-config'
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

export const useLikertStore = defineStore('likert', () => {
  const likerts = ref([])
  const currentLikert = ref(null)
  const questions = ref([])
  const loading = ref(false)

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
      const ref = await addDoc(collection(db, 'likert'), { name, description })
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
      await updateDoc(doc(db, 'likert', likertId), { name, description })
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

  // ── Questions (subcollection) ─────────────────────────────

  const fetchQuestions = async (likertId) => {
    console.log('Fetching questions for likert:', likertId)
    loading.value = true
    try {
      const snap = await getDocs(collection(db, 'likert', likertId, 'questions'))
      questions.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      console.log('Questions fetched:', questions.value.length)
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      loading.value = false
    }
    return questions.value
  }

  const addQuestion = async (likertId, { question, category, favorable }) => {
    console.log('Adding question to likert:', likertId)
    try {
      const ref = await addDoc(collection(db, 'likert', likertId, 'questions'), {
        question,
        category,
        favorable,
        updatedAt: serverTimestamp(),
      })
      console.log('Question added with ID:', ref.id)
      await fetchQuestions(likertId)
      return ref.id
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  const updateQuestion = async (likertId, questionId, { question, category, favorable }) => {
    console.log('Updating question:', questionId)
    try {
      await updateDoc(doc(db, 'likert', likertId, 'questions', questionId), {
        question,
        category,
        favorable,
        updatedAt: serverTimestamp(),
      })
      console.log('Question updated:', questionId)
      await fetchQuestions(likertId)
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  }

  const deleteQuestion = async (likertId, questionId) => {
    console.log('Deleting question:', questionId)
    try {
      await deleteDoc(doc(db, 'likert', likertId, 'questions', questionId))
      console.log('Question deleted:', questionId)
      await fetchQuestions(likertId)
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  return {
    likerts,
    currentLikert,
    questions,
    loading,
    fetchLikerts,
    getLikertById,
    addLikert,
    updateLikert,
    deleteLikert,
    fetchQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  }
})