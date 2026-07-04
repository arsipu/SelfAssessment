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

export const useLikertQuestionsStore = defineStore('likertQuestions', () => {
  const questions = ref([])
  const loading = ref(false)


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

  const addQuestion = async (likertId, { question, categoryId, favorable }) => {
    console.log('Adding question to likert:', likertId)
    try {
      const ref = await addDoc(collection(db, 'likert', likertId, 'questions'), {
        question,
        categoryId,
        favorable,
        updatedAt: serverTimestamp(),
      })

      // update lokal
      questions.value.push({
        id: ref.id,
        question,
        categoryId,
        favorable,
      })

      console.log('Question added with ID:', ref.id)
      await fetchQuestions(likertId)
      return ref.id
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  const updateQuestion = async (likertId, questionId, { question, categoryId, favorable }) => {
    console.log('Updating question:', questionId)
    try {
      await updateDoc(doc(db, 'likert', likertId, 'questions', questionId), {
        question,
        categoryId,
        favorable,
        updatedAt: serverTimestamp(),
      })

      // update lokal
      const idx = questions.value.findIndex(q => q.id === questionId)
      if (idx !== -1) questions.value[idx] = { ...questions.value[idx], question, categoryId, favorable }

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

      // filter lokal
      questions.value = questions.value.filter(q => q.id !== questionId)
      console.log('Question deleted:', questionId)
      await fetchQuestions(likertId)
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  return { questions, fetchQuestions, addQuestion, updateQuestion, deleteQuestion }
}, {
  persist: true
})