import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase/firebase-config'
import { generateSessionCode } from '@/utils/code'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collectionGroup,
  query,
  where,
} from 'firebase/firestore'

import { DRAFT, SUBMISSION_IN_PROGRESS, SUBMISSION_COMPLETED } from '@/apps/status'

export const useLikertStore = defineStore('likert', () => {
  const likerts = ref([])
  const currentLikert = ref(null)
  const loading = ref(false)

  // ── Likert (surveys) ──────────────────────────────────────

  const fetchLikerts = async () => {
    loading.value = true
    try {
      const snap = await getDocs(collection(db, 'likert'))
      likerts.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (error) {
      console.error('Error fetching likerts:', error)
    } finally {
      loading.value = false
    }
  }

  const getLikertById = async (likertId) => {
    console.log('Fetching likert:', likertId)
    try {
      const snap = await getDoc(doc(db, 'likert', likertId))
      if (snap.exists()) {
        currentLikert.value = { id: snap.id, ...snap.data() }
        console.log('Likert fetched:', currentLikert.value.name)
      } else {
        console.log('No such likert document!')
        currentLikert.value = null
      }
    } catch (error) {
      console.error('Error fetching likert:', error)
    }
    return currentLikert.value
  }

  const addLikert = async ({ name, description }) => {
    console.log('Adding likert:', name)
    try {
      const ref = await addDoc(collection(db, 'likert'), { 
        name,
        description,
        status: DRAFT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      console.log('Likert added with ID:', ref.id)
      await fetchLikerts()
      return ref.id
    } catch (error) {
      console.error('Error adding likert:', error)
      throw error
    }
  }

  const updateLikert = async (likertId, { name, description }) => {
    console.log('Updating likert:', likertId)
    try {
      await updateDoc(doc(db, 'likert', likertId), { 
        name, 
        description,
        updatedAt: serverTimestamp(),
      })
      console.log('Likert updated:', likertId)
      await fetchLikerts()
    } catch (error) {
      console.error('Error updating likert:', error)
      throw error
    }
  }

  const deleteLikert = async (likertId) => {
    console.log('Deleting likert:', likertId)
    try {
      await deleteDoc(doc(db, 'likert', likertId))
      console.log('Likert deleted:', likertId)
      await fetchLikerts()
    } catch (error) {
      console.error('Error deleting likert:', error)
      throw error
    }
  }

  const updateLikertStatus = async (id, status) => {
    await updateDoc(doc(db, 'likert', id), {
      status,
      updatedAt: serverTimestamp(),
    })

    await fetchLikerts()
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

  
  // ── Submissions ────────────────────────────────────────────

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
        totalScore: null,
        code: code,
        status: SUBMISSION_IN_PROGRESS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
  const completeSubmission = async (likertId, submissionId, submissionResult, totalScore) => {
    console.log('Completing submission:', submissionId)
    try {
      await updateDoc(doc(db, 'likert', likertId, 'submissions', submissionId), {
        submission: submissionResult,
        totalScore,
        status: SUBMISSION_COMPLETED,
        updatedAt: serverTimestamp(),
      })
      console.log('Submission completed:', submissionId)
    } catch (error) {
      console.error('Error completing submission:', error)
      throw error
    }
  }

  const findSubmissionByCode = async (code) => {
    const q = query(collectionGroup(db, 'submissions'), where('code', '==', code))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const docSnap = snap.docs[0]
    return {
      id: docSnap.id,
      likertId: docSnap.ref.parent.parent.id, // ambil parent likert id
      ...docSnap.data(),
    }
  }

  return {
    likerts,
    currentLikert,
    loading,
    fetchLikerts,
    getLikertById,
    addLikert,
    updateLikert,
    deleteLikert,
    updateLikertStatus,
    createSubmission,
    completeSubmission,
    updateSubmissionAnswers,
  }
})