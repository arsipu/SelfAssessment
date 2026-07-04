import { defineStore } from 'pinia'
import { db } from '@/firebase/firebase-config'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

// holland/config/questions
const questionsCol = () => collection(db, 'holland', 'config', 'questions')

export const useHollandQuestionsStore = defineStore('hollandQuestions', {
  state: () => ({
    questions: [],
    loading: false,
  }),

  actions: {
    async fetchQuestions() {
      this.loading = true
      try {
        // Nggak pake orderBy — urutan tampil ikutan urutan hasil getDocs() aja
        const snap = await getDocs(questionsCol())
        this.questions = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } finally {
        this.loading = false
      }
    },

    async addQuestion({ category, column, question }) {
      const payload = {
        category,
        column,
        question: question.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const ref = await addDoc(questionsCol(), payload)
      this.questions.push({ id: ref.id, ...payload })
    },

    async updateQuestion(id, payload) {
      const ref = doc(db, 'holland', 'config', 'questions', id)
      await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() })
      const idx = this.questions.findIndex((q) => q.id === id)
      if (idx !== -1) this.questions[idx] = { ...this.questions[idx], ...payload }
    },

    async deleteQuestion(id) {
      const ref = doc(db, 'holland', 'config', 'questions', id)
      await deleteDoc(ref)
      this.questions = this.questions.filter((q) => q.id !== id)
    },
  },
})