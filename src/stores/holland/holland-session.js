import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useHollandSubmissionsStore } from './holland-submissions'

export const useHollandSessionStore = defineStore(
  'hollandSession',
  () => {
    // sessions.value[hollandId] = { submissionId, code, respondent, answers }
    const sessions = ref({})
    // results.value[hollandId] = { scores, topCode, submissionId, code, respondentName, respondent, answers }
    const results = ref({})

    // Mulai sesi baru: bikin submission di Firestore, simpan sessionId (= submissionId) lokal
    const startSession = async (hollandId, respondentData) => {
      const submissionsStore = useHollandSubmissionsStore()
      const { id: submissionId, code } = await submissionsStore.createSubmission(hollandId, respondentData)

      sessions.value[hollandId] = {
        submissionId,
        code,
        respondent: respondentData,
        answers: [], // array of { questionId, category, column }
      }

      // lazy clear: hasil lama buat hollandId ini dianggap basi begitu sesi baru mulai
      delete results.value[hollandId]

      return sessions.value[hollandId]
    }

    const getSession = (hollandId) => sessions.value[hollandId] || null

    // dipanggil tiap checkbox di-toggle (auto-save LOKAL aja, gak nulis ke Firestore tiap klik)
    const updateAnswers = async (hollandId, answers) => {
      const session = sessions.value[hollandId]
      if (!session) return

      session.answers = answers // instan, buat UX & restore pas refresh

      try {
        const submissionsStore = useHollandSubmissionsStore()
        await submissionsStore.updateSubmissionAnswers(hollandId, session.submissionId, answers)
      } catch (error) {
        // gagal sync ke Firestore -> jawaban tetap aman di local state,
        // nanti bisa di-retry pas ada perubahan berikutnya
        console.error('Gagal sync jawaban, tersimpan lokal dulu:', error)
      }
    }

    // dipanggil pas submit kuesioner: tulis final ke Firestore, simpan hasil, bersihkan sesi
    const finishSession = async (hollandId, answers, scores, topCode) => {
      const session = sessions.value[hollandId]
      if (!session) throw new Error('Sesi tidak ditemukan')

      const submissionsStore = useHollandSubmissionsStore()
      await submissionsStore.completeSubmission(hollandId, session.submissionId, answers, scores, topCode)

      results.value[hollandId] = {
        scores,
        topCode,
        submissionId: session.submissionId,
        code: session.code,
        respondentName: session.respondent?.name || '-',
        respondent: session.respondent,
        answers,
      }

      delete sessions.value[hollandId]
    }

    const clearSession = (hollandId) => {
      delete sessions.value[hollandId]
    }

    const getResult = (hollandId) => results.value[hollandId] || null

    // opsional: dipanggil manual dari tombol "Selesai" kalau mau clear lebih cepat
    const clearResult = (hollandId) => {
      delete results.value[hollandId]
    }

    return {
      sessions,
      results,
      startSession,
      getSession,
      updateAnswers,
      finishSession,
      clearSession,
      getResult,
      clearResult,
    }
  },
  {
    persist: true,
  }
)