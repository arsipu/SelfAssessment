import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useLikertSubmissionsStore } from './likert-submissions'
// import { useLikertStore } from './likert'

export const useLikertSessionStore = defineStore(
  'likertSession',
  () => {
    // sessions[likertId] = { submissionId, respondent, answers }
    const sessions = ref({})
    // results[likertId] = { totalScore, submissionId }
    const results = ref({})

    // Mulai sesi baru: bikin submission di Firestore, simpan sessionId (= submissionId) lokal
    const startSession = async (likertId, respondentData) => {
      const likertSubmissionsStore = useLikertSubmissionsStore()
      const { id: submissionId, code } = await likertSubmissionsStore.createSubmission(likertId, respondentData)

      sessions.value[likertId] = {
        submissionId,
        code, 
        respondent: respondentData,
        answers: {},
      }

      // lazy clear: hasil lama buat likertId ini dianggap basi begitu sesi baru mulai
      delete results.value[likertId]

      return sessions.value[likertId]
    }

    const getSession = (likertId) => sessions.value[likertId] || null

    // dipanggil tiap jawaban berubah (auto-save LOKAL aja, gak nulis ke Firestore tiap ketik)
    const updateAnswers = async (likertId, answers, submissionResult) => {
      const session = sessions.value[likertId]
      if (!session) return

      session.answers = answers // instan, buat UX & restore pas refresh

      try {
        const likertSubmissionsStore = useLikertSubmissionsStore()
        await likertSubmissionsStore.updateSubmissionAnswers(likertId, session.submissionId, submissionResult)
      } catch (error) {
        // gagal sync ke Firestore -> jawaban tetap aman di local state,
        // nanti bisa di-retry pas ada perubahan berikutnya
        console.error('Gagal sync jawaban, tersimpan lokal dulu:', error)
      }
    }

    // dipanggil pas submit kuesioner: tulis final ke Firestore, simpan hasil, bersihkan sesi
    const finishSession = async (likertId, submissionResult, totalScore) => {
      const session = sessions.value[likertId]
      if (!session) throw new Error('Sesi tidak ditemukan')

      const likertSubmissionsStore = useLikertSubmissionsStore()
      await likertSubmissionsStore.completeSubmission(likertId, session.submissionId, submissionResult, totalScore)

      results.value[likertId] = {
        totalScore,
        submissionId: session.submissionId,
        code: session.code,
        respondentName: session.respondent?.nama || '-',
        respondent: session.respondent,
        answers: submissionResult, 
      }

      delete sessions.value[likertId]
    }

    const loadResultByCode = async (likertId, code) => {
      const likertSubmissionsStore = useLikertSubmissionsStore()
      const submission = await likertSubmissionsStore.findSubmissionByCode(code, likertId)

      if (!submission || submission.likertId !== likertId) {
        return null
      }

      results.value[likertId] = {
        totalScore: submission.totalScore,
        submissionId: submission.id,
        code: submission.code,
        respondentName: submission.name || '-',
        respondent: {
          nama: submission.name,
          kelas: submission.class,
          sekolah: submission.school,
          jurusan: submission.major,
          usia: submission.age,
          jenisKelamin: submission.gender,
          pkl: submission.internship,
        },
        answers: submission.submission || [],
      }

      return results.value[likertId]
    }

    const clearSession = (likertId) => {
      delete sessions.value[likertId]
    }

    const getResult = (likertId) => results.value[likertId] || null

    // opsional: dipanggil manual dari tombol "Selesai" kalau mau clear lebih cepat
    const clearResult = (likertId) => {
      delete results.value[likertId]
    }

    return {
      sessions,
      results,
      startSession,
      getSession,
      updateAnswers,
      finishSession,
      loadResultByCode,
      clearSession,
      getResult,
      clearResult,
    }
  },
  {
    persist: true,
  }
)