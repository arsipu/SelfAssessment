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
} from 'firebase/firestore'

const RIASEC_IDS = ['R', 'I', 'A', 'S', 'E', 'C']

export const useHollandQuestionsStore = defineStore('hollandQuestions', () => {
  // allQuestions is a flat array with { id, riasecId, column, question, ... }
  const allQuestions = ref([])
  const loading = ref(false)

  // ── Fetch questions for ONE riasec category ───────────────

  const fetchQuestions = async (hollandId, riasecId) => {
    loading.value = true
    try {
      const snap = await getDocs(
        collection(db, 'holland', hollandId, 'riasec', riasecId, 'questions')
      )
      const items = snap.docs.map((d) => ({
        id: d.id,
        riasecId,
        ...d.data(),
      }))
      return items
    } catch (error) {
      console.error('Error fetching questions:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  // ── Fetch ALL questions across 6 RIASEC categories ────────
  // Uses Promise.all for 6 parallel reads; each result is tagged
  // with its riasecId (replaces old field `category`)

  const fetchAllQuestions = async (hollandId) => {
    loading.value = true
    try {
      const results = await Promise.all(
        RIASEC_IDS.map((riasecId) => fetchQuestions(hollandId, riasecId))
      )
      // Flatten into single array; each item has { id, riasecId, column, question, ... }
      allQuestions.value = results.flat()
      console.log('All questions fetched:', allQuestions.value.length)
    } catch (error) {
      console.error('Error fetching all questions:', error)
      allQuestions.value = []
    } finally {
      loading.value = false
    }
    return allQuestions.value
  }

  // ── Add question to a specific riasec category ────────────

  const addQuestion = async (hollandId, riasecId, { column, question }) => {
    const payload = {
      column,
      question: question.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    try {
      const ref = await addDoc(
        collection(db, 'holland', hollandId, 'riasec', riasecId, 'questions'),
        payload
      )
      // Add to local state with riasecId
      allQuestions.value.push({ id: ref.id, riasecId, ...payload })
      console.log('Question added with ID:', ref.id)
      return ref.id
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  // ── Update question ───────────────────────────────────────

  const updateQuestion = async (hollandId, riasecId, questionId, payload) => {
    try {
      const ref = doc(
        db, 'holland', hollandId, 'riasec', riasecId, 'questions', questionId
      )
      await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() })
      const idx = allQuestions.value.findIndex((q) => q.id === questionId)
      if (idx !== -1) {
        allQuestions.value[idx] = { ...allQuestions.value[idx], ...payload }
      }
      console.log('Question updated:', questionId)
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  }

  // ── Delete question ───────────────────────────────────────

  const deleteQuestion = async (hollandId, riasecId, questionId) => {
    try {
      const ref = doc(
        db, 'holland', hollandId, 'riasec', riasecId, 'questions', questionId
      )
      await deleteDoc(ref)
      allQuestions.value = allQuestions.value.filter((q) => q.id !== questionId)
      console.log('Question deleted:', questionId)
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  return {
    allQuestions,
    loading,
    fetchQuestions,
    fetchAllQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  }
})