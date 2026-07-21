<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-full w-56 bg-surface border-r border-border flex flex-col z-40',
      'transform transition-transform duration-300',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'md:translate-x-0'
    ]"
  >
    <!-- Header -->
    <div class="px-5 py-4 border-b border-border flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-text-primary">
          Self Assessment
        </p>
        <p class="text-xs text-text-muted">
          Panel Admin
        </p>
      </div>

      <!-- Close button, mobile only -->
      <button
        @click="$emit('close')"
        class="md:hidden p-1 text-text-muted hover:text-text-primary"
      >
        ✕
      </button>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        @click="$emit('close')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
        :class="[isActive(item.name) ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-muted']"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="px-3 py-4 border-t border-border">
      <div class="flex items-center gap-2 px-3 py-2 mb-2">
        <div
          class="w-8 h-8 rounded-full bg-primary text-text-on-primary flex items-center justify-center text-xs font-medium"
        >
          {{ userInitials }}
        </div>

        <div class="min-w-0">
          <p class="text-sm font-medium truncate">
            {{ userName }}
          </p>
          <p class="text-xs text-text-muted">
            Admin
          </p>
        </div>
      </div>

      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-danger-soft hover:text-danger transition-colors"
      >
        Keluar
      </button>
    </div>
  </aside>
</template>

<script setup>
defineProps({ isOpen: Boolean })
defineEmits(['close'])

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

function isActive(name) {
  return route.name?.toString().startsWith(name)
}

const navItems = [
  {
    label: 'Overview',
    name: 'admin-overview'
  },
  {
    label: 'Survei',
    name: 'admin-likert'
  },
  {
    label: 'Holland',
    name: 'admin-holland'
  },
  // {
  //   label: 'Pengaturan',
  //   name: 'admin-setting'
  // }
]

const userName = computed(
  () => userStore.user?.displayName ?? 'Admin'
)

const userInitials = computed(() =>
  userName.value
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
)

const handleLogout = async () => {
  await userStore.logout()
  router.push({ name: 'login' })
}
</script>