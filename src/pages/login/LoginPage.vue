<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <span class="brand-logo">SA</span>
        <h1 class="brand-name">SelfAssessment</h1>
        <p class="brand-sub">Portal Admin</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            autocomplete="email"
            :disabled="isLoading"
            required
          />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            :disabled="isLoading"
            required
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-login" :disabled="isLoading">
          <span v-if="isLoading" class="spinner" />
          <span>{{ isLoading ? 'Masuk...' : 'Masuk' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  isLoading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/admin/dashboard')
  } catch (err) {
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
      errorMsg.value = 'Email atau password salah.'
    } else {
      errorMsg.value = err.message || 'Terjadi kesalahan, coba lagi.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4ff;
  padding: 24px;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: #1d4ed8;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 14px;
  margin-bottom: 12px;
}

.brand-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.brand-sub {
  font-size: 0.85rem;
  color: #6b7280;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.field input {
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #111827;
  outline: none;
  transition: border-color 0.15s;
  background: #f9fafb;
}

.field input:focus {
  border-color: #1d4ed8;
  background: #fff;
}

.field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Error */
.error-msg {
  font-size: 0.85rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 0;
}

/* Button */
.btn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  background: #1d4ed8;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}

.btn-login:hover:not(:disabled) {
  background: #1e40af;
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>