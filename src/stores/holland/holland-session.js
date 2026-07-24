import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useHollandSubmissionsStore } from './holland-submissions'
import { buildInitialAnswers, computeScoreBreakdownFromAnswers, computeTopCode } from '@/utils/holland-scoring'

export const useHollandSessionStore = defineStore(
  'hollandSession',
  () => {
    // sessions.value[hollandId] = { submissionId, code, respondent, answers }
    const sessions = ref({})
    // results.value[hollandId] = { scores, topCode, submissionId, code, respondentName, respondent, answers }
    const results = ref({})

    // Mulai sesi baru: bikin submission di Firestore, simpan sessionId (= submissionId) lokal.
    //
    // `allQuestions` WAJIB dikirim — flat array semua soal (dari
    // useHollandQuestionsStore().allQuestions, harus sudah di-fetch duluan
    // oleh komponen pemanggil). Dipakai buat bangun `answers` awal yang
    // berisi SEMUA soal dengan isChecked: false, biar dari awal sesi
    // strukturnya udah lengkap & konsisten.
    const startSession = async (hollandId, respondentData, allQuestions) => {
      const submissionsStore = useHollandSubmissionsStore()
      const initialAnswers = buildInitialAnswers(allQuestions)
      const { id: submissionId, code } = await submissionsStore.createSubmission(
        hollandId,
        respondentData,
        initialAnswers
      )

      sessions.value[hollandId] = {
        submissionId,
        code,
        respondent: respondentData,
        answers: initialAnswers, // array of { questionId, riasecId, columnId, isChecked }
      }

      // lazy clear: hasil lama buat hollandId ini dianggap basi begitu sesi baru mulai
      delete results.value[hollandId]

      return sessions.value[hollandId]
    }

    const getSession = (hollandId) => sessions.value[hollandId] || null

    // dipanggil tiap checkbox di-toggle (auto-save LOKAL aja, gak nulis ke Firestore tiap klik)
    // `answers` yang dikirim tetap array LENGKAP semua soal (dengan isChecked ter-update)
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

    // Dipanggil pas submit kuesioner: tulis final ke Firestore, hitung
    // scores & topCode DI SINI (bukan diterima sebagai parameter, dan
    // TIDAK dikirim ke Firestore), simpan hasil buat halaman result,
    // baru bersihkan sesi.
    //
    // `riasecIds` — daftar id kategori RIASEC (mis. ['R','I','A','S','E','C']),
    // dipakai buat computeScoresFromAnswers biar kategori dgn skor 0 tetap muncul.
    const finishSession = async (hollandId, answers, riasecIds) => {
      const session = sessions.value[hollandId]
      if (!session) throw new Error('Sesi tidak ditemukan')

      const submissionsStore = useHollandSubmissionsStore()
      await submissionsStore.completeSubmission(hollandId, session.submissionId, answers)

      // `scores` di sini berbentuk { R: {count, total, percentage}, ... } —
      // sesuai yang diharapkan buildScoreBreakdown() di utils/holland-result.js
      const scores = computeScoreBreakdownFromAnswers(answers, riasecIds)
      const topCode = computeTopCode(scores)

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

    // Ambil result dari Firestore pakai tracking code — dipakai sebagai
    // fallback kalau results.value[hollandId] kosong (mis. akses langsung,
    // device beda, atau state persist kehapus).
    const loadResultByCode = async (hollandId, code, riasecIds) => {
      const submissionsStore = useHollandSubmissionsStore()
      const submission = await submissionsStore.findSubmissionByCode(code, hollandId)

      if (!submission || submission.hollandId !== hollandId) {
        return null
      }

      const answers = submission.answers || []
      const scores = computeScoreBreakdownFromAnswers(answers, riasecIds)
      const topCode = computeTopCode(scores)

      results.value[hollandId] = {
        scores,
        topCode,
        submissionId: submission.id,
        code: submission.code,
        respondentName: submission.name || '-',
        respondent: {
          name: submission.name,
          major: submission.major,
          school: submission.school,
          gender: submission.gender,
          birthDate: submission.birthDate,
          age: submission.age,
          occupation: submission.occupation,
          testDate: submission.testDate,
          testPurpose: submission.testPurpose,
        },
        answers,
      }

      return results.value[hollandId]
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