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
} from 'firebase/firestore'

export const useHollandQuestionsStore = defineStore('hollandQuestions', () => {
  // Flat array across ALL riasec categories & columns:
  // { id, riasecId, columnId, question, ... }
  const allQuestions = ref([])
  const loading = ref(false)

  const questionsPath = (hollandId, riasecId, columnId) =>
    collection(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId, 'questions')

  // ── Fetch questions for ONE column ─────────────────────────

  const fetchQuestions = async (hollandId, riasecId, columnId) => {
    try {
      const snap = await getDocs(questionsPath(hollandId, riasecId, columnId))
      return snap.docs.map((d) => ({ id: d.id, riasecId, columnId, ...d.data() }))
    } catch (error) {
      console.error('Error fetching questions:', error)
      return []
    }
  }

  // ── Fetch ALL questions across every riasec category & column ──
  // riasecColumnsMap: { [riasecId]: [{ id, name, order }, ...] }
  // (ambil ini dari useHollandColumnsStore().columnsByRiasec setelah
  // fetchAllColumns dipanggil)

  const fetchAllQuestions = async (hollandId, riasecColumnsMap) => {
    loading.value = true
    try {
      const tasks = []
      for (const [riasecId, cols] of Object.entries(riasecColumnsMap || {})) {
        for (const col of cols) {
          tasks.push(fetchQuestions(hollandId, riasecId, col.id))
        }
      }
      const results = await Promise.all(tasks)
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

  // ── Add question to a specific column ──────────────────────

  const addQuestion = async (hollandId, riasecId, columnId, { question }) => {
    const payload = {
      question: question.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    try {
      const ref = await addDoc(questionsPath(hollandId, riasecId, columnId), payload)
      allQuestions.value.push({ id: ref.id, riasecId, columnId, ...payload })
      console.log('Question added with ID:', ref.id)
      return ref.id
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  // ── Update question ─────────────────────────────────────────
  // Kalau `newColumnId` dikasih (beda dari columnId asal), pertanyaan
  // dipindah ke kolom baru: karena Firestore gak punya "move" antar
  // subcollection, ini dilakukan dengan create di path baru + delete
  // di path lama.

  const updateQuestion = async (hollandId, riasecId, columnId, questionId, { question, newColumnId }) => {
    try {
      const targetColumnId = newColumnId || columnId

      if (newColumnId && newColumnId !== columnId) {
        const oldRef = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId, 'questions', questionId)
        const newPayload = {
          question: question.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        const newRef = await addDoc(questionsPath(hollandId, riasecId, newColumnId), newPayload)
        await deleteDoc(oldRef)

        const idx = allQuestions.value.findIndex((q) => q.id === questionId && q.columnId === columnId)
        if (idx !== -1) {
          allQuestions.value[idx] = { id: newRef.id, riasecId, columnId: newColumnId, ...newPayload }
        }
        console.log('Question moved to new column:', newRef.id)
        return
      }

      const ref = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', targetColumnId, 'questions', questionId)
      await updateDoc(ref, { question: question.trim(), updatedAt: serverTimestamp() })
      const idx = allQuestions.value.findIndex((q) => q.id === questionId && q.columnId === targetColumnId)
      if (idx !== -1) {
        allQuestions.value[idx] = { ...allQuestions.value[idx], question: question.trim() }
      }
      console.log('Question updated:', questionId)
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  }

  // ── Delete question ─────────────────────────────────────────

  const deleteQuestion = async (hollandId, riasecId, columnId, questionId) => {
    try {
      const ref = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId, 'questions', questionId)
      await deleteDoc(ref)
      allQuestions.value = allQuestions.value.filter((q) => q.id !== questionId)
      console.log('Question deleted:', questionId)
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  // ── Delete ALL questions in a column ────────────────────────
  // Dipakai saat kolom mau dihapus, karena Firestore gak cascade-delete
  // subcollection. Pakai writeBatch biar 1 round-trip.

  const deleteAllQuestionsInColumn = async (hollandId, riasecId, columnId) => {
    try {
      const snap = await getDocs(questionsPath(hollandId, riasecId, columnId))
      if (snap.empty) return

      const batch = writeBatch(db)
      snap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()

      allQuestions.value = allQuestions.value.filter(
        (q) => !(q.riasecId === riasecId && q.columnId === columnId)
      )
      console.log(`Deleted ${snap.docs.length} questions in column:`, columnId)
    } catch (error) {
      console.error('Error deleting questions in column:', error)
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
    deleteAllQuestionsInColumn,
  }
})