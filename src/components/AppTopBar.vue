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

      <!-- Kalau cuma 1 likert published: tampilin langsung sebagai link -->
      <router-link
        v-if="publishedLikerts.length === 1"
        :to="{ name: 'likert-form', params: { id: publishedLikerts[0].id } }"
        class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        active-class="text-gray-900 bg-gray-100"
      >
        {{ publishedLikerts[0].name }}
      </router-link>

      <!-- Kalau lebih dari 1 likert published: pakai dropdown -->
      <div v-else-if="publishedLikerts.length > 1" class="relative" ref="dropdownRef">
        <button
          @click="toggleDropdown"
          class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          :class="{ 'text-gray-900 bg-gray-100': dropdownOpen }"
        >
          Instrumen
          <font-awesome-icon
            icon="fa-solid fa-chevron-down"
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="{ 'fa-rotate-180': dropdownOpen }"
          />
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
              v-for="item in publishedLikerts"
              :key="item.id"
              :to="{ name: 'likert-form', params: { id: item.id } }"
              @click="dropdownOpen = false"
              class="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <font-awesome-icon icon="fa-solid fa-file-lines" class="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ item.name }}</p>
                <p class="text-xs text-gray-400">{{ item.description }}</p>
              </div>
            </router-link>
          </div>
        </transition>
      </div>

      <!-- RIASEC (Holland): singleton, jadi selalu link tunggal, terpisah dari dropdown likert -->
      <router-link
        v-if="isHollandPublished"
        :to="{ name: 'holland-form' }"
        class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        active-class="text-gray-900 bg-gray-100"
      >
        {{ hollandStore.config?.name || 'RIASEC' }}
      </router-link>

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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useLikertStore } from '@/stores/likert/likert'
import { useHollandStore } from '@/stores/holland/holland'
import { PUBLISHED } from '@/apps/status'

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const likertStore = useLikertStore()
const { likerts } = storeToRefs(likertStore)

const hollandStore = useHollandStore()

const publishedLikerts = computed(() =>
  likerts.value.filter((l) => l.status === PUBLISHED)
)

// RIASEC singleton: cukup cek status config-nya, bukan filter dari list
const isHollandPublished = computed(() => hollandStore.config?.status === PUBLISHED)

onMounted(async () => {
  await Promise.all([likertStore.fetchLikerts(), hollandStore.fetchConfig()])
})

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