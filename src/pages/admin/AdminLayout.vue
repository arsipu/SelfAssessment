<template>
  <div class="min-h-screen">
    <AdminSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Backdrop mobile -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-30 md:hidden"
    ></div>

    <div class="md:ml-56 flex flex-col min-h-screen">
      <!-- Mobile-only header -->
      <header class="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-20">
        <button @click="isSidebarOpen = true" class="p-1 text-gray-600">
          ☰
        </button>
        <p class="text-sm font-medium text-gray-900">Self Assessment</p>
      </header>
      
      <main class="flex-1 p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const isSidebarOpen = ref(false)
</script>