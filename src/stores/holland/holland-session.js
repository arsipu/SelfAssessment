import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useHollandSubmissionsStore } from './holland-submissions'

// Beda dari likert-session: Holland cuma 1 instrumen (singleton),
// jadi state-nya nggak perlu di-keyed by id. Cukup 1 session & 1 result aktif.
export const useHollandSessionStore = defineStore(
  'hollandSession',
  () => {
    // { submissionId, code, respondent, answers }
    const session = ref(null)
    // { scores, topCode, submissionId, code, respondentName, respondent, answers }
    const result = ref(null)

    // Mulai sesi baru: bikin submission di Firestore, simpan sessionId (= submissionId) lokal
    const startSession = async (respondentData) => {
      const submissionsStore = useHollandSubmissionsStore()
      const { id: submissionId, code } = await submissionsStore.createSubmission(respondentData)

      session.value = {
        submissionId,
        code,
        respondent: respondentData,
        answers: [], // array of { questionId, category, column }
      }

      // lazy clear: hasil lama dianggap basi begitu sesi baru mulai
      result.value = null

      return session.value
    }

    const getSession = () => session.value

    // dipanggil tiap checkbox di-toggle (auto-save LOKAL aja, gak nulis ke Firestore tiap klik)
    const updateAnswers = async (answers) => {
      if (!session.value) return

      session.value.answers = answers // instan, buat UX & restore pas refresh

      try {
        const submissionsStore = useHollandSubmissionsStore()
        await submissionsStore.updateSubmissionAnswers(session.value.submissionId, answers)
      } catch (error) {
        // gagal sync ke Firestore -> jawaban tetap aman di local state,
        // nanti bisa di-retry pas ada perubahan berikutnya
        console.error('Gagal sync jawaban, tersimpan lokal dulu:', error)
      }
    }

    // dipanggil pas submit kuesioner: tulis final ke Firestore, simpan hasil, bersihkan sesi
    const finishSession = async (answers, scores, topCode) => {
      if (!session.value) throw new Error('Sesi tidak ditemukan')

      const submissionsStore = useHollandSubmissionsStore()
      await submissionsStore.completeSubmission(session.value.submissionId, answers, scores, topCode)

      result.value = {
        scores,
        topCode,
        submissionId: session.value.submissionId,
        code: session.value.code,
        respondentName: session.value.respondent?.name || '-',
        respondent: session.value.respondent,
        answers,
      }

      session.value = null
    }

    const clearSession = () => {
      session.value = null
    }

    const getResult = () => result.value

    // opsional: dipanggil manual dari tombol "Selesai" kalau mau clear lebih cepat
    const clearResult = () => {
      result.value = null
    }

    return {
      session,
      result,
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