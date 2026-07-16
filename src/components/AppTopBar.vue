<template>
  <nav class="w-full bg-surface border-b border-border px-4 md:px-6 py-3 relative">
    <div class="flex items-center justify-between">
      <span class="text-base font-medium text-text-primary tracking-tight">Self Assessment</span>

      <div class="hidden md:flex items-center gap-1">
        <router-link
          to="/"
          class="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-soft rounded-lg transition-colors"
          active-class="text-text-primary bg-primary-soft"
        >
          Beranda
        </router-link>

        <div v-if="allInstruments.length > 0" class="relative" ref="instrumentDropdownRef">
          <button
            @click="toggleDropdown"
            class="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-soft rounded-lg transition-colors"
            :class="{ 'text-text-primary bg-primary-soft': isInstrumentDropdownOpen }"
          >
            Instrumen
            <font-awesome-icon
              icon="fa-solid fa-chevron-down"
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'fa-rotate-180': isInstrumentDropdownOpen }"
            />
          </button>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="isInstrumentDropdownOpen"
              class="absolute top-full left-0 mt-1.5 w-64 bg-surface border border-border rounded-xl shadow-sm py-1 z-50"
            >
              <router-link
                v-for="item in allInstruments"
                :key="item.key"
                :to="item.to"
                @click="isInstrumentDropdownOpen = false"
                class="flex items-start gap-3 px-4 py-2.5 hover:bg-primary-soft transition-colors"
              >
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-instrument-soft"
                >
                  <font-awesome-icon
                    :icon="item.type === 'holland' ? 'fa-solid fa-chart-bar' : 'fa-solid fa-file-lines'"
                    class="w-4 h-4 text-instrument"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-text-primary">{{ item.name }}</p>
                  <p v-if="item.description" class="text-xs text-text-muted">{{ item.description }}</p>
                </div>
              </router-link>
            </div>
          </transition>
        </div>

        <router-link
          to="/tentang-kami"
          class="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-soft rounded-lg transition-colors"
          active-class="text-text-primary bg-primary-soft"
        >
          Tentang kami
        </router-link>
      </div>

      <router-link
        to="/login"
        class="hidden md:inline-block px-4 py-1.5 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors"
      >
        Login
      </router-link>

      <button
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-primary-soft transition-colors"
        :aria-expanded="mobileMenuOpen"
        aria-label="Buka menu"
      >
        <font-awesome-icon :icon="mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'" class="w-5 h-5" />
      </button>
    </div>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="md:hidden absolute top-full left-0 right-0 bg-surface border-b border-border shadow-sm z-40 max-h-[calc(100vh-56px)] overflow-y-auto"
      >
        <div class="px-4 py-3 space-y-1">
          <router-link
            to="/"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-primary-soft rounded-lg transition-colors"
            active-class="text-text-primary bg-primary-soft"
          >
            Beranda
          </router-link>

          <div v-if="allInstruments.length > 0" class="pt-1">
            <p class="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Instrumen
            </p>
            <router-link
              v-for="item in allInstruments"
              :key="item.key"
              :to="item.to"
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary-soft transition-colors"
            >
              <span
                class="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-instrument-soft"
              >
                <font-awesome-icon
                  :icon="item.type === 'holland' ? 'fa-solid fa-chart-bar' : 'fa-solid fa-file-lines'"
                  class="w-3.5 h-3.5 text-instrument"
                />
              </span>
              <span class="text-sm font-medium text-text-primary">{{ item.name }}</span>
            </router-link>
          </div>

          <router-link
            to="/tentang-kami"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-primary-soft rounded-lg transition-colors"
            active-class="text-text-primary bg-primary-soft"
          >
            Tentang kami
          </router-link>

          <router-link
            to="/login"
            @click="mobileMenuOpen = false"
            class="block mt-2 px-3 py-2.5 text-sm font-semibold text-center text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors"
          >
            Login
          </router-link>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLikertStore } from '@/stores/likert/likert'
import { useHollandStore } from '@/stores/holland/holland'
import { ACTIVE } from '@/apps/status'

const route = useRoute()

// State untuk Menu Dropdown Gabungan
const isInstrumentDropdownOpen = ref(false)
const instrumentDropdownRef = ref(null)
const mobileMenuOpen = ref(false)

const likertStore = useLikertStore()
const { likerts } = storeToRefs(likertStore)

const hollandStore = useHollandStore()
const { hollands } = storeToRefs(hollandStore)

const activedLikerts = computed(() =>
  likerts.value.filter((l) => l.status === ACTIVE)
)

const activedHollands = computed(() =>
  hollands.value.filter((h) => h.status === ACTIVE)
)

// Gabungan Instrumen (Dipakai di Desktop & Mobile)
const allInstruments = computed(() => [
  ...activedLikerts.value.map((l) => ({
    key: `likert-${l.id}`,
    type: 'likert',
    name: l.name,
    description: l.description,
    to: { name: 'likert-form', params: { slug: l.slug } },
  })),
  ...activedHollands.value.map((h) => ({
    key: `holland-${h.id}`,
    type: 'holland',
    name: h.name || 'RIASEC',
    description: h.description,
    to: { name: 'holland-form', params: { slug: h.slug } },
  })),
])

onMounted(async () => {
  await Promise.all([
    likertStore.fetchLikerts(),
    hollandStore.fetchHollands(),
  ])
})

// Toggle Dropdown (Boolean)
const toggleDropdown = () => {
  isInstrumentDropdownOpen.value = !isInstrumentDropdownOpen.value
}

// Menutup menu jika klik di luar dropdown gabungan
const handleClickOutside = (e) => {
  if (instrumentDropdownRef.value && !instrumentDropdownRef.value.contains(e.target)) {
    isInstrumentDropdownOpen.value = false
  }
}

// Tutup menu tiap kali route berubah
watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
    isInstrumentDropdownOpen.value = false
  }
)

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>