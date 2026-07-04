import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase/firebase-config'
import { generateSessionCode } from '@/utils/code'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import { SUBMISSION_IN_PROGRESS, SUBMISSION_COMPLETED } from '@/apps/status'

// Holland cuma punya 1 instrumen (singleton), jadi doc id-nya fixed.
// Kalau suatu saat perlu multi-instrument lagi, tinggal ganti ini
// jadi parameter seperti semula.
const HOLLAND_DOC_ID = 'config'

export const useHollandSubmissionsStore = defineStore('holland-submissions', () => {
  const submissions = ref([])
  const currentSubmission = ref(null)
  const loading = ref(false)

  const submissionsRef = () => collection(db, 'holland', HOLLAND_DOC_ID, 'submissions')
  const submissionDoc = (submissionId) =>
    doc(db, 'holland', HOLLAND_DOC_ID, 'submissions', submissionId)

  // ── List semua submission ───────────────────────────────────

  const fetchSubmissions = async () => {
    loading.value = true
    try {
      const q = query(submissionsRef(), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      submissions.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (error) {
      console.error('Error fetching submissions:', error)
      submissions.value = []
    } finally {
      loading.value = false
    }
  }

  // ── Detail 1 submission ──────────────────────────────────────

  const fetchSubmissionById = async (submissionId) => {
    loading.value = true
    try {
      const snap = await getDoc(submissionDoc(submissionId))
      currentSubmission.value = snap.exists() ? { id: snap.id, ...snap.data() } : null
    } catch (error) {
      console.error('Error fetching submission detail:', error)
      currentSubmission.value = null
    } finally {
      loading.value = false
    }
    return currentSubmission.value
  }

  // Dipanggil begitu form respondent disubmit (belum ngerjain soal).
  // Field disamakan dengan dokumen sumber Holland:
  // name, major, school, gender, birthDateAge, occupation, testDate, testPurpose
  const createSubmission = async (respondentData) => {
    try {
      const code = generateSessionCode()
      const ref = await addDoc(submissionsRef(), {
        name: respondentData.name,
        major: respondentData.major,
        school: respondentData.school,
        gender: respondentData.gender,
        birthDateAge: respondentData.birthDateAge,
        occupation: respondentData.occupation,
        testDate: respondentData.testDate,
        testPurpose: respondentData.testPurpose,
        answers: [], // array of { questionId, category, column }
        scores: null, // diisi pas completeSubmission: { R, I, A, S, E, C }
        topCode: null, // diisi pas completeSubmission: mis. "SAE"
        code,
        status: SUBMISSION_IN_PROGRESS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return { id: ref.id, code }
    } catch (error) {
      console.error('Error creating submission:', error)
      throw error
    }
  }

  // Sync jawaban tiap kali checkbox di-toggle (dipanggil dengan debounce
  // dari komponen pengisian, mengikuti pola likert-submissions.js)
  const updateSubmissionAnswers = async (submissionId, answers) => {
    try {
      await updateDoc(submissionDoc(submissionId), {
        answers,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error syncing answers:', error)
      throw error
    }
  }

  // Dipanggil pas user submit kuesioner (final)
  const completeSubmission = async (submissionId, answers, scores, topCode) => {
    try {
      await updateDoc(submissionDoc(submissionId), {
        answers,
        scores,
        topCode,
        status: SUBMISSION_COMPLETED,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error completing submission:', error)
      throw error
    }
  }

  const findSubmissionByCode = async (code) => {
    try {
      const q = query(submissionsRef(), where('code', '==', code))
      const snap = await getDocs(q)
      if (snap.empty) return null
      const docSnap = snap.docs[0]
      return { id: docSnap.id, ...docSnap.data() }
    } catch (error) {
      console.error('Error finding submission by code:', error)
      throw error
    }
  }

  return {
    submissions,
    currentSubmission,
    loading,
    fetchSubmissions,
    fetchSubmissionById,
    createSubmission,
    updateSubmissionAnswers,
    completeSubmission,
    findSubmissionByCode,
  }
})