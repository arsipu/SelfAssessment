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
export const useLikertSubmissionsStore = defineStore('likert-submissions', () => {
  const submissions = ref([])
  const currentSubmission = ref(null)
  const loading = ref(false)

  // ── List semua submission untuk 1 likert ──────────────────

  const fetchSubmissions = async (likertId) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'likert', likertId, 'submissions'),
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

  const fetchSubmissionById = async (likertId, submissionId) => {
    loading.value = true
    try {
      const snap = await getDoc(doc(db, 'likert', likertId, 'submissions', submissionId))
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

  const fetchSubmissionBySlug = async (likertId, submissionSlug) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'likert', likertId, 'submissions'),
        where('slug', '==', submissionSlug)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const docSnap = snap.docs[0]
        currentSubmission.value = { id: docSnap.id, ...docSnap.data() }
      } else {
        currentSubmission.value = null
      }
    } catch (error) {
      console.error('Error fetching submission detail by slug:', error)
      currentSubmission.value = null
    } finally {
      loading.value = false
    }
    return currentSubmission.value
  }

  
  // Dipanggil begitu form responden disubmit (belum ngerjain soal)
  const createSubmission = async (likertId, respondentData) => {
    console.log('Creating submission (in_progress) for likert:', likertId)
    try {
      const code = generateSessionCode()
      const ref = await addDoc(collection(db, 'likert', likertId, 'submissions'), {
        name: respondentData.nama,
        class: respondentData.kelas,
        school: respondentData.sekolah,
        major: respondentData.jurusan,
        age: respondentData.usia,
        gender: respondentData.jenisKelamin,
        internship: respondentData.pkl,
        submission: [],
        code: code,
        status: SUBMISSION_IN_PROGRESS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        slug: slugify(respondentData.nama), // untuk URL friendly, mis. "john-doe"
      })
      console.log('Submission created:', ref.id)
      // return ref.id
      return { id: ref.id, code }
    } catch (error) {
      console.error('Error creating submission:', error)
      throw error
    }
  }

  // Dipanggil pas user submit jawaban kuesioner
  // totalScore TIDAK disimpan ke Firestore — dihitung ulang dari `submission` via likert-scoring.js
  const completeSubmission = async (likertId, submissionId, submissionResult) => {
    console.log('Completing submission:', submissionId)
    try {
      await updateDoc(doc(db, 'likert', likertId, 'submissions', submissionId), {
        submission: submissionResult,
        status: SUBMISSION_COMPLETED,
        updatedAt: serverTimestamp(),
      })
      console.log('Submission completed:', submissionId)
    } catch (error) {
      console.error('Error completing submission:', error)
      throw error
    }
  }

  const findSubmissionByCode = async (code, likertId) => {
    const q = query(collection(db, 'likert', likertId, 'submissions'), where('code', '==', code))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const docSnap = snap.docs[0]
    return {
      id: docSnap.id,
      likertId: docSnap.ref.parent.parent.id, // ambil parent likert id
      ...docSnap.data(),
    }
  }

  const updateSubmissionAnswers = async (likertId, submissionId, submissionResult) => {
    try {
      await updateDoc(doc(db, 'likert', likertId, 'submissions', submissionId), {
        submission: submissionResult,
        updatedAt: serverTimestamp(),
      })
      console.log('Answers synced to Firestore:', submissionId)
    } catch (error) {
      console.error('Error syncing answers:', error)
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
    completeSubmission,
    updateSubmissionAnswers,
    findSubmissionByCode,
  }
})