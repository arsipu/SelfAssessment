<template>
  <div class="max-w-lg space-y-4">
    <div class="bg-surface border border-border rounded-xl p-5">
      <h2 class="text-sm font-medium text-text-primary mb-4">Profil admin</h2>
      <div class="space-y-3">
        <div>
          <label class="text-xs text-text-muted block mb-1">Nama lengkap</label>
          <input type="text" :value="userName" class="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted text-text-primary focus:outline-none focus:border-instrument" />
        </div>
        <div>
          <label class="text-xs text-text-muted block mb-1">Email</label>
          <input type="email" :value="userStore.user?.email ?? ''" class="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted text-text-primary focus:outline-none focus:border-instrument" />
        </div>
      </div>
      <button class="mt-4 px-4 py-2 bg-primary text-text-on-primary text-sm rounded-lg hover:bg-primary-hover transition-colors">
        Simpan perubahan
      </button>
    </div>

    <div class="bg-surface border border-border rounded-xl p-5">
      <h2 class="text-sm font-medium text-text-primary mb-1">Instrumen aktif</h2>
      <p class="text-xs text-text-muted mb-4">Atur instrumen mana yang tersedia untuk responden.</p>
      <div class="space-y-3">
        <div v-for="ins in toggleInstruments" :key="ins.name" class="flex items-center justify-between">
          <div>
            <p class="text-sm text-text-primary">{{ ins.name }}</p>
            <p class="text-xs text-text-muted">{{ ins.sub }}</p>
          </div>
          <button
            @click="ins.active = !ins.active"
            class="w-10 h-5 rounded-full transition-colors relative shrink-0"
            :class="ins.active ? 'bg-primary' : 'bg-surface-muted'"
          >
            <span
              class="absolute top-0.5 w-4 h-4 bg-surface rounded-full transition-all"
              :class="ins.active ? 'left-5' : 'left-0.5'"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userName = computed(() => userStore.user?.displayName ?? 'Admin')

const toggleInstruments = ref([
  { name: 'Holland RIASEC', sub: '36 butir soal', active: true },
  { name: 'Likert Scale', sub: '28 butir soal', active: true },
  { name: 'Minat Bakat (MBTI)', sub: '40 butir soal', active: false },
])
</script>