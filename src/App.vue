<template>
  <template v-if="!authStore.loading">
    <!-- Sembunyikan header di halaman login & admin -->
    <AppHeader v-if="showHeader" />
    <main :class="showHeader ? 'main-content' : ''">
      <router-view />
    </main>
  </template>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import AppHeader from './components/AppHeader.vue'

const authStore = useAuthStore()
const route = useRoute()

const showHeader = computed(() =>
  !route.path.startsWith('/login') && !route.path.startsWith('/admin')
)

onMounted(async () => {
  await authStore.init()
})
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f9fafb;
  color: #111827;
}

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
}
</style>