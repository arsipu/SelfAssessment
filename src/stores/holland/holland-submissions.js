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
  collectionGroup,
  where,
} from 'firebase/firestore'

import { SUBMISSION_IN_PROGRESS, SUBMISSION_COMPLETED } from '@/apps/status'
import { slugify } from '@/utils/slug'

export const useHollandSubmissionsStore = defineStore('holland-submissions', () => {
  const submissions = ref([])
  const currentSubmission = ref(null)
  const loading = ref(false)

  // ── List semua submission untuk 1 holland ─────────────────

  const fetchSubmissions = async (hollandId) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'holland', hollandId, 'submissions'),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      submissions.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (error) {
      console.error('Error fetching submissions:', error)
      submissions.value = []
    } finally {
      loading.value = false
    }
  }

  // ── Detail 1 submission ────────────────────────────────────

  const fetchSubmissionById = async (hollandId, submissionId) => {
    loading.value = true
    try {
      const snap = await getDoc(doc(db, 'holland', hollandId, 'submissions', submissionId))
      if (snap.exists()) {
        currentSubmission.value = { id: snap.id, ...snap.data() }
      } else {
        currentSubmission.value = null
      }
    } catch (error) {
      console.error('Error fetching submission detail:', error)
      currentSubmission.value = null
    } finally {
      loading.value = false
    }
    return currentSubmission.value
  }

  const fetchSubmissionBySlug = async (hollandId, slug) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'holland', hollandId, 'submissions'),
        where('slug', '==', slug)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const docSnap = snap.docs[0]
        currentSubmission.value = { id: docSnap.id, ...docSnap.data() }
      } else {
        currentSubmission.value = null
      }
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
  // name, major, school, gender, birthDate, age, occupation, testDate, testPurpose
  const createSubmission = async (hollandId, respondentData) => {
    try {
      const code = generateSessionCode()
      const ref = await addDoc(collection(db, 'holland', hollandId, 'submissions'), {
        name: respondentData.name,
        major: respondentData.major,
        school: respondentData.school,
        gender: respondentData.gender,
        birthDate: respondentData.birthDate,
        age: respondentData.age ?? null,
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
        slug: slugify(respondentData.name), // untuk URL friendly, mis. "john-doe"
      })
      return { id: ref.id, code }
    } catch (error) {
      console.error('Error creating submission:', error)
      throw error
    }
  }

  // Sync jawaban tiap kali checkbox di-toggle (dipanggil dengan debounce
  // dari komponen pengisian, mengikuti pola likert-submissions.js)
  const updateSubmissionAnswers = async (hollandId, submissionId, answers) => {
    try {
      await updateDoc(doc(db, 'holland', hollandId, 'submissions', submissionId), {
        answers,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error syncing answers:', error)
      throw error
    }
  }

  // Dipanggil pas user submit kuesioner (final)
  const completeSubmission = async (hollandId, submissionId, answers, scores, topCode) => {
    try {
      await updateDoc(doc(db, 'holland', hollandId, 'submissions', submissionId), {
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

  // Mencari submission berdasarkan kode tracking — pakai collectionGroup
  // agar bisa cari tanpa tahu hollandId-nya terlebih dahulu.
  const findSubmissionByCode = async (code) => {
    try {
      const q = query(collectionGroup(db, 'submissions'), where('code', '==', code))
      const snap = await getDocs(q)
      if (snap.empty) return null
      const docSnap = snap.docs[0]
      return {
        id: docSnap.id,
        hollandId: docSnap.ref.parent.parent.id, // ambil parent holland id
        ...docSnap.data(),
      }
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
    fetchSubmissionBySlug,
    createSubmission,
    updateSubmissionAnswers,
    completeSubmission,
    findSubmissionByCode,
  }
})