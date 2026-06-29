<template>
  <nav class="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <!-- Logo -->
    <span class="text-base font-medium text-gray-900 tracking-tight">Self Assessment</span>

    <!-- Nav Links -->
    <div class="flex items-center gap-1">
      <!-- Beranda -->
      <router-link
        to="/"
        class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        active-class="text-gray-900 bg-gray-100"
      >
        Beranda
      </router-link>

      <!-- Dropdown Instrumen -->
      <div class="relative" ref="dropdownRef">
        <button
          @click="toggleDropdown"
          class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          :class="{ 'text-gray-900 bg-gray-100': dropdownOpen }"
        >
          Instrumen
          <svg
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="{ 'rotate-180': dropdownOpen }"
            viewBox="0 0 12 12" fill="none"
          >
            <path d="M2 4.5L6 8L10 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="dropdownOpen"
            class="absolute top-full left-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-sm py-1 z-50"
          >
            <router-link
              to="/holland"
              @click="dropdownOpen = false"
              class="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div class="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-purple-600" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M8 4v4l2.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">Holland RIASEC</p>
                <p class="text-xs text-gray-400">36 butir soal</p>
              </div>
            </router-link>

            <router-link
              to="/likert"
              @click="dropdownOpen = false"
              class="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-blue-600" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="2" width="10" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M5.5 6h5M5.5 9h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">Likert</p>
                <p class="text-xs text-gray-400">28 butir soal</p>
              </div>
            </router-link>
          </div>
        </transition>
      </div>

      <!-- Tentang Kami -->
      <router-link
        to="/tentang-kami"
        class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        active-class="text-gray-900 bg-gray-100"
      >
        Tentang kami
      </router-link>
    </div>

    <!-- Login Button -->
    <router-link
      to="/login"
      class="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
    >
      Login
    </router-link>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>