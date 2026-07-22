import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase/firebase-config'
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore'

export const useLikertQuestionsStore = defineStore('likertQuestions', () => {
  // Flat array across ALL categories:
  // { id, categoryId, question, favorable }
  const questions = ref([])
  const loading = ref(false)

  // ── Helper: generate unique ID for each question ──────────
  function generateId() {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  // ── Fetch questions for ONE category ───────────────────────
  // Questions sekarang adalah array field di dalam document categories/{categoryId}.

  const fetchQuestions = async (likertId, categoryId) => {
    try {
      const categoryRef = doc(db, 'likert', likertId, 'categories', categoryId)
      const snap = await getDoc(categoryRef)
      if (!snap.exists()) return []
      const data = snap.data()
      const items = data.questions || []
      return items.map((q) => ({
        id: q.id,
        categoryId,
        question: q.question,
        favorable: q.favorable,
      }))
    } catch (error) {
      console.error('Error fetching questions:', error)
      return []
    }
  }

  // ── Fetch ALL questions across every category ─────────────
  // categoriesData: array dari category doc (sudah include field questions)
  const fetchAllQuestions = async (categoriesData) => {
    loading.value = true
    try {
      const result = []
      for (const cat of categoriesData || []) {
        const items = (cat.questions || []).map((q) => ({
          id: q.id,
          categoryId: cat.id,
          question: q.question,
          favorable: q.favorable,
        }))
        result.push(...items)
      }
      questions.value = result
      console.log('All questions fetched:', questions.value.length)
    } catch (error) {
      console.error('Error fetching all questions:', error)
      questions.value = []
    } finally {
      loading.value = false
    }
    return questions.value
  }

  // ── Add question to a specific category ───────────────────
  // Gunakan arrayUnion untuk append item baru ke array `questions`.

  const addQuestion = async (likertId, categoryId, { question, favorable }) => {
    const newQuestion = {
      id: generateId(),
      question: question.trim(),
      favorable,
    }

    try {
      const categoryRef = doc(db, 'likert', likertId, 'categories', categoryId)
      await updateDoc(categoryRef, {
        questions: arrayUnion(newQuestion),
      })
      questions.value.push({ id: newQuestion.id, categoryId, question: newQuestion.question, favorable: newQuestion.favorable })
      console.log('Question added with ID:', newQuestion.id)
      return newQuestion.id
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  // ── Update question ────────────────────────────────────────
  // Baca current array, modify item, lalu overwrite seluruh array.

  const updateQuestion = async (likertId, categoryId, questionId, { question, favorable, newCategoryId }) => {
    try {
      const targetCategoryId = newCategoryId || categoryId

      if (newCategoryId && newCategoryId !== categoryId) {
        // ── Move to different category ──
        const sourceRef = doc(db, 'likert', likertId, 'categories', categoryId)
        const sourceSnap = await getDoc(sourceRef)
        if (!sourceSnap.exists()) throw new Error('Source category not found')
        const sourceQuestions = sourceSnap.data().questions || []
        const movedItem = sourceQuestions.find((q) => q.id === questionId)
        if (!movedItem) throw new Error('Question not found in source category')

        const updatedSource = sourceQuestions.filter((q) => q.id !== questionId)
        const updatedTarget = [
          ...(await getQuestionsArray(likertId, targetCategoryId)),
          { ...movedItem, question: question.trim(), favorable },
        ]

        const batch = writeBatch(db)
        batch.update(sourceRef, { questions: updatedSource })
        batch.update(doc(db, 'likert', likertId, 'categories', targetCategoryId), { questions: updatedTarget })
        await batch.commit()

        const idx = questions.value.findIndex((q) => q.id === questionId && q.categoryId === categoryId)
        if (idx !== -1) {
          questions.value[idx] = { id: questionId, categoryId: targetCategoryId, question: question.trim(), favorable }
        }
        console.log('Question moved to new category:', questionId)
        return
      }

      // ── Update in same category ──
      const categoryRef = doc(db, 'likert', likertId, 'categories', targetCategoryId)
      const snap = await getDoc(categoryRef)
      if (!snap.exists()) throw new Error('Category not found')
      const currentQuestions = snap.data().questions || []
      const updatedQuestions = currentQuestions.map((q) =>
        q.id === questionId ? { ...q, question: question.trim(), favorable } : q
      )
      await updateDoc(categoryRef, { questions: updatedQuestions })

      const idx = questions.value.findIndex((q) => q.id === questionId && q.categoryId === targetCategoryId)
      if (idx !== -1) {
        questions.value[idx] = { ...questions.value[idx], question: question.trim(), favorable }
      }
      console.log('Question updated:', questionId)
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  }

  // ── Helper: get questions array from a category doc ───────
  async function getQuestionsArray(likertId, categoryId) {
    const ref = doc(db, 'likert', likertId, 'categories', categoryId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return []
    return snap.data().questions || []
  }

  // ── Delete question ────────────────────────────────────────
  const deleteQuestion = async (likertId, categoryId, questionId) => {
    try {
      const categoryRef = doc(db, 'likert', likertId, 'categories', categoryId)
      const snap = await getDoc(categoryRef)
      if (!snap.exists()) throw new Error('Category not found')
      const currentQuestions = snap.data().questions || []
      const updatedQuestions = currentQuestions.filter((q) => q.id !== questionId)
      await updateDoc(categoryRef, { questions: updatedQuestions })

      questions.value = questions.value.filter((q) => q.id !== questionId)
      console.log('Question deleted:', questionId)
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  return {
    questions,
    loading,
    fetchQuestions,
    fetchAllQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  }
})