<template>
  <aside
    class="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col"
  >
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-100">
      <p class="text-sm font-medium text-gray-900">
        Self Assessment
      </p>
      <p class="text-xs text-gray-400">
        Panel Admin
      </p>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
        active-class="bg-gray-900 text-white"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="px-3 py-4 border-t border-gray-100">
      <div class="flex items-center gap-2 px-3 py-2 mb-2">
        <div
          class="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium"
        >
          {{ userInitials }}
        </div>

        <div class="min-w-0">
          <p class="text-sm font-medium truncate">
            {{ userName }}
          </p>
          <p class="text-xs text-gray-400">
            Admin
          </p>
        </div>
      </div>

      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        Keluar
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const navItems = [
  {
    label: 'Overview',
    name: 'admin-overview'
  },
  {
    label: 'Work Readiness',
    name: 'admin-work-readiness'
  },
  {
    label: 'Pengaturan',
    name: 'admin-setting'
  }
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