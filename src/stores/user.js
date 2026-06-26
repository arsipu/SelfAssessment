import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, db } from '../firebase/firebase-config'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import router from '@/router'
import { onAuthStateChanged } from 'firebase/auth'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref(null)

    const returnUrl = ref('/')

    const initialised = ref(false)

    // Fungsi untuk memantau perubahan status login
    const listenToAuthState = () => {
      console.log('Listening to auth state changes' + initialised.value)

      if (initialised.value) {
        // Sudah diinisialisasi sebelumnya, langsung kembalikan user saat ini
        return Promise.resolve(user.value)
      }

      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          initialised.value = true

          if (firebaseUser != null) {
            console.log('User is logged in:', firebaseUser.uid, ' Initialised:' + initialised.value)
            // Ambil data user dari Firestore
            user.value = await getUserData(firebaseUser.uid)
            resolve(user.value)

            console.log('User data after fetch:' + user.value?.displayName)
          } else {
            console.log('No user is logged in', ' Initialised:' + initialised.value)
            user.value = null
            resolve(null)
            initialised.value = false
          }
          // Menandai bahwa pengecekan sudah selesai
        })
      })
    }

    const logout = async () => {
      console.log('Logging out user')
      await signOut(auth)
        .then(() => {
          user.value = null
          router.push('/login')
        })
        .catch((error) => {
          console.error('Logout error:', error)
        })
    }

    const login = async (username, password) => {
      // Implement login logic here
      try {
        const userLogin = await signInWithEmailAndPassword(auth, username, password)

        const userData = await getUserData(userLogin.user.uid)
        user.value = userData

        if (returnUrl.value && returnUrl.value !== '/login') {
          router.push(returnUrl.value)
        } else {
          if (user.value.role === 'user') {
            router.push('/')                  // user ke beranda publik
          } else {
            router.push('/admin/dashboard')   // admin/role lain ke admin dashboard
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    }

    const getUserData = async (userUID) => {
      console.log('Fetching user data for UID:', userUID)

      let userFromDoc = null
      try {
        const userDocRef = doc(db, 'users', userUID)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          userFromDoc = userDocSnap.data()
          console.log('User data fetched successfully:', userDocSnap.data())
          console.log('User data fetched:' + userFromDoc.displayName)
        } else {
          console.log('No such user document!')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
      return userFromDoc
    }

    const refreshUserData = async (userUID) => {
      console.log('Refreshing user data for UID:', userUID)

      const updatedUserData = await getUserData(userUID)
      if (updatedUserData) {
        user.value = updatedUserData
        console.log('User data refreshed successfully:', updatedUserData)
      } else {
        console.log('Failed to refresh user data: No such user document!')
      }
    }

    return { user, listenToAuthState, logout, returnUrl, login, refreshUserData }
  },
)