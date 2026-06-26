<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">

      <!-- Logo (flex-1 kiri) -->
      <router-link
        to="/"
        class="flex-1 flex items-center gap-2 group"
      >
        <span class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </span>
        <span class="text-[15px] font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
          SelfAssessment
        </span>
      </router-link>

      <!-- Nav -->
      <nav class="flex items-center gap-1">

        <!-- Beranda -->
        <router-link
          to="/"
          class="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
          exact-active-class="!text-blue-600 !bg-blue-50 hover:!bg-blue-100"
        >
          Beranda
        </router-link>

        <!-- Dropdown Tes -->
        <div class="relative" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
          <button
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all"
            :class="isDropdownActive || isOpen
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
          >
            Tes
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13" height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="['transition-transform duration-200', isOpen ? 'rotate-180' : '']"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <Transition name="dropdown">
            <div
              v-if="isOpen"
              class="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/60 overflow-hidden p-1"
            >
              <!-- Label section kecil -->
              <p class="px-3 pt-1.5 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Pilih Tes
              </p>

              <router-link
                to="/holland"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                active-class="bg-blue-50 text-blue-600"
                @click="isOpen = false"
              >
                <span>Holland RIASEC</span>
              </router-link>

              <router-link
                to="/workreadiness"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                active-class="bg-blue-50 text-blue-600"
                @click="isOpen = false"
              >
                <span>Work Readiness</span>
              </router-link>
            </div>
          </Transition>
        </div>

        <!-- Tentang Kami -->
        <router-link
          to="/tentang-kami"
          class="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
          active-class="!text-blue-600 !bg-blue-50 hover:!bg-blue-100"
        >
          Tentang Kami
        </router-link>

      </nav>

      <!-- Auth (flex-1 kanan) -->
      <div class="flex-1 flex justify-end">
        <!-- Belum login -->
        <router-link
          v-if="!authStore.isLoggedIn"
          to="/login"
          class="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          Masuk
        </router-link>

        <!-- Sudah login: user menu -->
        <div
          v-else
          class="relative"
          @mouseenter="isAdminMenuOpen = true"
          @mouseleave="isAdminMenuOpen = false"
        >
          <button class="flex items-center gap-2.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all">
            <span class="w-6 h-6 bg-blue-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center shrink-0">
              {{ shortEmail[0]?.toUpperCase() }}
            </span>
            <span class="text-sm font-medium text-gray-700 max-w-[120px] truncate">{{ shortEmail }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12" height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="['text-gray-400 transition-transform duration-200', isAdminMenuOpen ? 'rotate-180' : '']"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <Transition name="dropdown">
            <div
              v-if="isAdminMenuOpen"
              class="absolute top-[calc(100%+8px)] right-0 w-48 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/60 overflow-hidden p-1"
            >
              <router-link
                to="/admin/dashboard"
                class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                @click="isAdminMenuOpen = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </router-link>

              <div class="h-px bg-gray-100 mx-2 my-1"></div>

              <button
                class="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all text-left"
                @click="handleLogout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Keluar
              </button>
            </div>
          </Transition>
        </div>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const isOpen = ref(false)
const isAdminMenuOpen = ref(false)
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isDropdownActive = computed(() =>
  route.path === '/holland' || route.path === '/workreadiness'
)

const shortEmail = computed(() => {
  const email = authStore.user?.email ?? ''
  return email.length > 18 ? email.split('@')[0] : email
})

async function handleLogout() {
  isAdminMenuOpen.value = false
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>