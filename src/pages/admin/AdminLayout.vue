<template>
  <div class="min-h-screen bg-gray-50">
    <AdminSidebar />

    <div class="ml-56 flex flex-col min-h-screen">
      <AdminTopbar />

      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
// import AdminTopbar from '@/components/admin/AdminTopbar.vue'
</script>