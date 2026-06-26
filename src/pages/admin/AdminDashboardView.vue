<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1>Dashboard Admin</h1>
        <p>Selamat datang, {{ authStore.user?.email }}</p>
      </div>
      <button class="btn-logout" @click="handleLogout">Keluar</button>
    </div>

    <div class="cards">
      <div class="card">
        <span class="card-icon">📋</span>
        <div>
          <p class="card-label">Total Kuesioner</p>
          <p class="card-value">—</p>
        </div>
      </div>
      <div class="card">
        <span class="card-icon">👥</span>
        <div>
          <p class="card-label">Total Responden</p>
          <p class="card-value">—</p>
        </div>
      </div>
      <div class="card">
        <span class="card-icon">✅</span>
        <div>
          <p class="card-label">Selesai Diisi</p>
          <p class="card-value">—</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.dashboard p {
  color: #6b7280;
  font-size: 0.9rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.btn-logout {
  padding: 8px 18px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-logout:hover {
  background: #fecaca;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  font-size: 1.8rem;
}

.card-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.card-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
}
</style>