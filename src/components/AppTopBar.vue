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

      <!-- ── LIKERT ────────────────────────────────────────────── -->
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
          @click="toggleDropdown('likert')"
          class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          :class="{ 'text-gray-900 bg-gray-100': activeDropdown === 'likert' }"
        >
          Instrumen
          <font-awesome-icon
            icon="fa-solid fa-chevron-down"
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="{ 'fa-rotate-180': activeDropdown === 'likert' }"
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
            v-if="activeDropdown === 'likert'"
            class="absolute top-full left-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-sm py-1 z-50"
          >
            <router-link
              v-for="item in publishedLikerts"
              :key="item.id"
              :to="{ name: 'likert-form', params: { id: item.id } }"
              @click="activeDropdown = null"
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

      <!-- ── HOLLAND / RIASEC ───────────────────────────────────── -->
      <!-- Kalau cuma 1 holland published: tampilin langsung sebagai link -->
      <router-link
        v-if="publishedHollands.length === 1"
        :to="{ name: 'holland-form', params: { id: publishedHollands[0].id } }"
        class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        active-class="text-gray-900 bg-gray-100"
      >
        {{ publishedHollands[0].name || 'RIASEC' }}
      </router-link>

      <!-- Kalau lebih dari 1 holland published, atau 0 published:
           kalau 0, cuma tampil kalau ada > 0 total (non-published juga) -->
      <div v-else-if="publishedHollands.length > 1" class="relative" ref="hollandDropdownRef">
        <button
          @click="toggleDropdown('holland')"
          class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          :class="{ 'text-gray-900 bg-gray-100': activeDropdown === 'holland' }"
        >
          RIASEC
          <font-awesome-icon
            icon="fa-solid fa-chevron-down"
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="{ 'fa-rotate-180': activeDropdown === 'holland' }"
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
            v-if="activeDropdown === 'holland'"
            class="absolute top-full left-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-sm py-1 z-50"
          >
            <router-link
              v-for="item in publishedHollands"
              :key="item.id"
              :to="{ name: 'holland-form', params: { id: item.id } }"
              @click="activeDropdown = null"
              class="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div class="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <font-awesome-icon icon="fa-solid fa-chart-bar" class="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ item.name }}</p>
                <p class="text-xs text-gray-400">{{ item.description }}</p>
              </div>
            </router-link>
          </div>
        </transition>
      </div>

      <!-- Fallback: 0 published Holland, jangan tampilkan apa-apa -->

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

const activeDropdown = ref(null)
const dropdownRef = ref(null)
const hollandDropdownRef = ref(null)

const likertStore = useLikertStore()
const { likerts } = storeToRefs(likertStore)

const hollandStore = useHollandStore()
const { hollands } = storeToRefs(hollandStore)

const publishedLikerts = computed(() =>
  likerts.value.filter((l) => l.status === PUBLISHED)
)

const publishedHollands = computed(() =>
  hollands.value.filter((h) => h.status === PUBLISHED)
)

onMounted(async () => {
  await Promise.all([
    likertStore.fetchLikerts(),
    hollandStore.fetchHollands(),
  ])
})

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target) &&
      hollandDropdownRef.value && !hollandDropdownRef.value.contains(e.target)) {
    activeDropdown.value = null
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>