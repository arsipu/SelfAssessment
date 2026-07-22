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

export const useHollandQuestionsStore = defineStore('hollandQuestions', () => {
  // Flat array across ALL riasec categories & columns:
  // { id, riasecId, columnId, question }
  const allQuestions = ref([])
  const loading = ref(false)

  // ── Helper: generate unique ID for each question ──────────
  function generateId() {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  // ── Fetch questions for ONE column ─────────────────────────
  // Questions sekarang adalah array field di dalam document columns/{columnId}.
  // Cukup 1 getDoc per column, bukan getDocs ke subcollection.
  const fetchQuestions = async (hollandId, riasecId, columnId) => {
    try {
      const columnRef = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId)
      const snap = await getDoc(columnRef)
      if (!snap.exists()) return []
      const data = snap.data()
      const questions = data.questions || []
      return questions.map((q) => ({
        id: q.id,
        riasecId,
        columnId,
        question: q.question,
      }))
    } catch (error) {
      console.error('Error fetching questions:', error)
      return []
    }
  }

  // ── Fetch ALL questions across every riasec category & column ──
  // riasecColumnsMap: { [riasecId]: [{ id, name, order }, ...] }
  // (ambil ini dari useHollandColumnsStore().columnsByRiasec setelah
  // fetchAllColumns dipanggil)
  //
  // KEUNTUNGAN: sebelumnya butuh N query (1 per column) untuk ambil
  // questions dari subcollection. Sekarang questions sudah ada di
  // document columns, jadi cukup 1 getDoc per column — tapi karena
  // columns sudah di-fetch oleh columnsStore, kita bisa langsung
  // baca field `questions` dari data columns yang sudah ada tanpa
  // query tambahan sama sekali.
  //
  // CARA BARU: columnsByRiasec sudah berisi data columns termasuk
  // field `questions` (array). Kita tinggal extract dari situ.
  const fetchAllQuestions = async (hollandId, riasecColumnsMap) => {
    loading.value = true
    try {
      const result = []
      for (const [riasecId, cols] of Object.entries(riasecColumnsMap || {})) {
        for (const col of cols) {
          const questions = (col.questions || []).map((q) => ({
            id: q.id,
            riasecId,
            columnId: col.id,
            question: q.question,
          }))
          result.push(...questions)
        }
      }
      allQuestions.value = result
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
  // Gunakan arrayUnion untuk append item baru ke array `questions`
  // di document columns/{columnId}. Tidak perlu createdAt per item.
  const addQuestion = async (hollandId, riasecId, columnId, { question }) => {
    const newQuestion = {
      id: generateId(),
      question: question.trim(),
    }

    try {
      const columnRef = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId)
      await updateDoc(columnRef, {
        questions: arrayUnion(newQuestion),
      })
      allQuestions.value.push({ id: newQuestion.id, riasecId, columnId, question: newQuestion.question })
      console.log('Question added with ID:', newQuestion.id)
      return newQuestion.id
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  // ── Update question ─────────────────────────────────────────
  // Karena arrayUnion/arrayRemove tidak bisa update item di dalam array
  // (hanya bisa add/remove entire item), kita perlu baca current array,
  // modify item yang sesuai, lalu overwrite seluruh array.
  //
  // Kalau `newColumnId` dikasih (beda dari columnId asal), pertanyaan
  // dipindah ke kolom baru: remove dari array asal, add ke array baru.
  const updateQuestion = async (hollandId, riasecId, columnId, questionId, { question, newColumnId }) => {
    try {
      const targetColumnId = newColumnId || columnId

      if (newColumnId && newColumnId !== columnId) {
        // ── Move to different column ──
        // Remove from source column
        const sourceRef = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId)
        const sourceSnap = await getDoc(sourceRef)
        if (!sourceSnap.exists()) throw new Error('Source column not found')
        const sourceQuestions = sourceSnap.data().questions || []
        const movedItem = sourceQuestions.find((q) => q.id === questionId)
        if (!movedItem) throw new Error('Question not found in source column')

        const updatedSource = sourceQuestions.filter((q) => q.id !== questionId)
        const updatedTarget = [
          ...(await getQuestionsArray(hollandId, riasecId, targetColumnId)),
          { ...movedItem, question: question.trim() },
        ]

        const batch = writeBatch(db)
        batch.update(sourceRef, { questions: updatedSource })
        batch.update(doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', targetColumnId), { questions: updatedTarget })
        await batch.commit()

        const idx = allQuestions.value.findIndex((q) => q.id === questionId && q.columnId === columnId)
        if (idx !== -1) {
          allQuestions.value[idx] = { id: questionId, riasecId, columnId: targetColumnId, question: question.trim() }
        }
        console.log('Question moved to new column:', questionId)
        return
      }

      // ── Update in same column ──
      const columnRef = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', targetColumnId)
      const snap = await getDoc(columnRef)
      if (!snap.exists()) throw new Error('Column not found')
      const currentQuestions = snap.data().questions || []
      const updatedQuestions = currentQuestions.map((q) =>
        q.id === questionId ? { ...q, question: question.trim() } : q
      )
      await updateDoc(columnRef, { questions: updatedQuestions })

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

  // ── Helper: get questions array from a column doc ──────────
  async function getQuestionsArray(hollandId, riasecId, columnId) {
    const ref = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return []
    return snap.data().questions || []
  }

  // ── Delete question ─────────────────────────────────────────
  // Baca current array, filter out item yang mau dihapus, overwrite.
  const deleteQuestion = async (hollandId, riasecId, columnId, questionId) => {
    try {
      const columnRef = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId)
      const snap = await getDoc(columnRef)
      if (!snap.exists()) throw new Error('Column not found')
      const currentQuestions = snap.data().questions || []
      const updatedQuestions = currentQuestions.filter((q) => q.id !== questionId)
      await updateDoc(columnRef, { questions: updatedQuestions })

      allQuestions.value = allQuestions.value.filter((q) => q.id !== questionId)
      console.log('Question deleted:', questionId)
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  // ── Delete ALL questions in a column ────────────────────────
  // Sekarang tinggal set array `questions` jadi [] — tidak perlu
  // writeBatch untuk hapus subcollection.
  const deleteAllQuestionsInColumn = async (hollandId, riasecId, columnId) => {
    try {
      const columnRef = doc(db, 'holland', hollandId, 'riasec', riasecId, 'columns', columnId)
      await updateDoc(columnRef, { questions: [] })

      allQuestions.value = allQuestions.value.filter(
        (q) => !(q.riasecId === riasecId && q.columnId === columnId)
      )
      console.log(`Deleted all questions in column:`, columnId)
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