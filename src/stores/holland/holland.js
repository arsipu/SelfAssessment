import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase/firebase-config'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  where,
  limit,
} from 'firebase/firestore'

import { ACTIVE, INACTIVE } from '@/apps/status'
import { RIASEC_GUIDE, RIASEC_CATEGORY_ORDER } from '@/apps/holland'
import { slugify } from '@/utils/slug'

export const useHollandStore = defineStore('holland', () => {
  const hollands = ref([])
  const currentHolland = ref(null)
  const loading = ref(false)

  // ── List semua instrumen Holland ──────────────────────────

  const fetchHollands = async () => {
    loading.value = true
    try {
      const snap = await getDocs(collection(db, 'holland'))
      hollands.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (error) {
      console.error('Error fetching hollands:', error)
    } finally {
      loading.value = false
    }
  }

  // ── Detail 1 instrumen ────────────────────────────────────

  const getHollandById = async (hollandId) => {
    try {
      const snap = await getDoc(doc(db, 'holland', hollandId))
      if (snap.exists()) {
        currentHolland.value = { id: snap.id, ...snap.data() }
      } else {
        currentHolland.value = null
      }
    } catch (error) {
      console.error('Error fetching holland:', error)
    }
    return currentHolland.value
  }

  // ── Seed 6 dokumen riasec (R, I, A, S, E, C) dari template ──
  // Dipanggil sekali pas instrumen baru dibuat. `code` dan `label`
  // diambil apa adanya dari RIASEC_GUIDE dan TIDAK dimaksudkan untuk
  // diubah admin — cuma description/skills/careers/subjects yang
  // boleh disesuaikan lewat updateRiasecContent().

  const seedRiasecCategories = async (hollandId) => {
    const batch = writeBatch(db)

    RIASEC_CATEGORY_ORDER.forEach((code, index) => {
      const template = RIASEC_GUIDE[code]
      const ref = doc(db, 'holland', hollandId, 'riasec', code)
      batch.set(ref, {
        code: template.code,
        label: template.label,
        description: template.description,
        skills: template.skills,
        careers: template.careers,
        subjects: template.subjects,
        order: index + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })

    await batch.commit()
  }

  // ── Detail 1 instrumen berdasarkan slug ───────────────────

  const getHollandBySlug = async (slug) => {
    try {
      const q = query(
        collection(db, 'holland'),
        where('slug', '==', slug),
        limit(1)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const d = snap.docs[0]
        currentHolland.value = { id: d.id, ...d.data() }
      } else {
        currentHolland.value = null
      }
    } catch (error) {
      console.error('Error fetching holland by slug:', error)
    }
    return currentHolland.value
  }

  // ── Buat instrumen baru (+ otomatis seed 6 kategori riasec) ──

  const addHolland = async ({ name, description, direction }) => {
    try {
      const ref = await addDoc(collection(db, 'holland'), {
        name,
        slug: slugify(name),
        description: description || '',
        direction: direction || '',
        status: INACTIVE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Seed 6 kategori riasec langsung setelah doc holland berhasil dibuat.
      // Kalau seeding gagal, instrumen tetap kebuat tapi tanpa kategori —
      // log error biar kelihatan, jangan biarkan silent.
      try {
        await seedRiasecCategories(ref.id)
      } catch (seedError) {
        console.error('Gagal seed kategori riasec untuk holland baru:', ref.id, seedError)
        throw new Error(
          'Instrumen dibuat, tapi gagal menyiapkan 6 kategori RIASEC. Silakan cek atau hapus dan coba lagi.'
        )
      }

      await fetchHollands()
      return ref.id
    } catch (error) {
      console.error('Error adding holland:', error)
      throw error
    }
  }

  // ── Update instrumen (nama, deskripsi, petunjuk) ─────────────

  const updateHolland = async (hollandId, { name, description, direction }) => {
    try {
      await updateDoc(doc(db, 'holland', hollandId), {
        name,
        slug: slugify(name),
        description: description || '',
        direction: direction || '',
        updatedAt: serverTimestamp(),
      })
      await fetchHollands()
    } catch (error) {
      console.error('Error updating holland:', error)
      throw error
    }
  }

  // ── Update konten 1 kategori riasec (BUKAN code/label) ───────
  // Dipakai kalau admin mau sesuaikan description/skills/careers/subjects
  // per instrumen. `code` dan `label` sengaja tidak diterima parameter
  // ini sama sekali, biar nggak ada jalan buat keubah dari sisi kode.

  const updateRiasecContent = async (hollandId, riasecId, { description, skills, careers, subjects }) => {
    try {
      await updateDoc(doc(db, 'holland', hollandId, 'riasec', riasecId), {
        description,
        skills,
        careers,
        subjects,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error updating riasec content:', error)
      throw error
    }
  }

  // ── Hapus instrumen ───────────────────────────────────────
  // CATATAN: ini cuma hapus doc holland utama. Subcollection
  // `riasec` (dan nested `questions` di dalamnya) serta `submissions`
  // TIDAK ikut terhapus otomatis — Firestore tidak punya cascade delete
  // dari client SDK. Untuk pembersihan penuh, perlu Cloud Function
  // terpisah atau dihapus manual. Untuk sekarang biarkan begini dulu,
  // tapi ini technical debt yang perlu diketahui.

  const deleteHolland = async (hollandId) => {
    try {
      await deleteDoc(doc(db, 'holland', hollandId))
      await fetchHollands()
    } catch (error) {
      console.error('Error deleting holland:', error)
      throw error
    }
  }

  // ── Update status ─────────────────────────────────────────

  const updateHollandStatus = async (id, status) => {
    if (status === ACTIVE) {
      const others = hollands.value.filter(
        (h) => h.id !== id && h.status === ACTIVE
      )
      for (const other of others) {
        await updateDoc(doc(db, 'holland', other.id), {
          status: INACTIVE,
          updatedAt: serverTimestamp(),
        })
      }
    }

    await updateDoc(doc(db, 'holland', id), {
      status,
      updatedAt: serverTimestamp(),
    })

    await fetchHollands()
  }

  return {
    hollands,
    currentHolland,
    loading,
    fetchHollands,
    getHollandById,
    getHollandBySlug,
    addHolland,
    updateHolland,
    updateRiasecContent,
    deleteHolland,
    updateHollandStatus,
  }
})