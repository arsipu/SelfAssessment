import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { ROLE_ADMIN } from '../apps/role'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const loading = ref(true) // true saat pertama kali cek auth state

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => role.value === ROLE_ADMIN)

  // Dipanggil sekali di App.vue saat app pertama kali mount
  function init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          user.value = firebaseUser
          await fetchRole(firebaseUser.uid)
        } else {
          user.value = null
          role.value = null
        }
        loading.value = false
        resolve()
      })
    })
  }

  async function fetchRole(uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) {
        role.value = snap.data().role ?? null
      } else {
        role.value = null
      }
    } catch {
      role.value = null
    }
  }

  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    user.value = credential.user
    await fetchRole(credential.user.uid)

    if (!isAdmin.value) {
      await logout()
      throw new Error('Akun ini tidak memiliki akses admin.')
    }
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    role.value = null
  }

  return { user, role, loading, isLoggedIn, isAdmin, init, login, logout }
})