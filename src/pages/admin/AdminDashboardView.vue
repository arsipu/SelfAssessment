<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col z-40">
      <div class="px-5 py-4 border-b border-gray-100">
        <p class="text-sm font-medium text-gray-900">Self Assessment</p>
        <p class="text-xs text-gray-400 mt-0.5">Panel Admin</p>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1">
        <button
          v-for="item in navItems"
          :key="item.key"
          @click="activePage = item.key"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left"
          :class="activePage === item.key
            ? 'bg-gray-900 text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
        >
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
            <path :d="item.icon" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ item.label }}
        </button>
      </nav>

      <!-- User info + logout -->
      <div class="px-3 py-4 border-t border-gray-100">
        <div class="flex items-center gap-2 px-3 py-2 mb-1">
          <div class="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium shrink-0">
            {{ userInitials }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-gray-800 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-400 truncate">Admin</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
        >
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Keluar
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="ml-56 flex flex-col min-h-screen">
      <!-- Topbar -->
      <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 class="text-base font-medium text-gray-900">{{ currentPage.label }}</h1>
          <p class="text-xs text-gray-400">{{ today }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="relative w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 2a5 5 0 0 1 5 5c0 2.5-1 4-2 5H5c-1-1-2-2.5-2-5a5 5 0 0 1 5-5zM6.5 13a1.5 1.5 0 0 0 3 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span class="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6">

        <!-- OVERVIEW PAGE -->
        <div v-if="activePage === 'overview'">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div v-for="stat in stats" :key="stat.label" class="bg-gray-100 rounded-xl p-4">
              <p class="text-xs text-gray-400 mb-1.5">{{ stat.label }}</p>
              <p class="text-3xl font-medium text-gray-900 leading-none">{{ stat.value }}</p>
              <p class="text-xs mt-1.5" :class="stat.positive ? 'text-green-600' : 'text-yellow-600'">{{ stat.sub }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Responden terbaru -->
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <h2 class="text-sm font-medium text-gray-800 mb-4">Responden terbaru</h2>
              <div class="space-y-3">
                <div v-for="r in recentRespondents" :key="r.name" class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                    {{ r.initials }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-800 truncate">{{ r.name }}</p>
                    <p class="text-xs text-gray-400">{{ r.instrument }}</p>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full shrink-0" :class="r.done ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                    {{ r.done ? 'Selesai' : 'Proses' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Progress instrumen -->
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <h2 class="text-sm font-medium text-gray-800 mb-4">Progress per instrumen</h2>
              <div class="space-y-4">
                <div v-for="ins in instrumentProgress" :key="ins.name">
                  <div class="flex items-center justify-between mb-1.5">
                    <p class="text-sm text-gray-700">{{ ins.name }}</p>
                    <p class="text-xs text-gray-400">{{ ins.done }}/{{ ins.total }}</p>
                  </div>
                  <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      :style="{ width: Math.round((ins.done / ins.total) * 100) + '%', background: ins.color }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RESPONDEN PAGE -->
        <div v-else-if="activePage === 'responden'">
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p class="text-sm font-medium text-gray-800">Semua responden</p>
              <input
                v-model="search"
                type="text"
                placeholder="Cari nama..."
                class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-gray-400"
              />
            </div>
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Nama</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Instrumen</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Tanggal</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in filteredRespondents" :key="r.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                        {{ r.initials }}
                      </div>
                      {{ r.name }}
                    </div>
                  </td>
                  <td class="px-5 py-3 text-gray-500">{{ r.instrument }}</td>
                  <td class="px-5 py-3 text-gray-500">{{ r.date }}</td>
                  <td class="px-5 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full" :class="r.done ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                      {{ r.done ? 'Selesai' : 'Proses' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="px-5 py-3 text-xs text-gray-400">
              Menampilkan {{ filteredRespondents.length }} dari {{ allRespondents.length }} responden
            </div>
          </div>
        </div>

        <!-- LAPORAN PAGE -->
        <div v-else-if="activePage === 'laporan'">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="report in reports" :key="report.title" class="bg-white border border-gray-200 rounded-xl p-5">
              <div class="flex items-start justify-between mb-3">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="report.color">
                  <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM10 2v3h3M5 7h6M5 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <span class="text-xs text-gray-400">{{ report.count }} file</span>
              </div>
              <p class="text-sm font-medium text-gray-800 mb-1">{{ report.title }}</p>
              <p class="text-xs text-gray-400 mb-4">{{ report.desc }}</p>
              <button class="w-full py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Unduh laporan
              </button>
            </div>
          </div>
        </div>

        <!-- PENGATURAN PAGE -->
        <div v-else-if="activePage === 'pengaturan'">
          <div class="max-w-lg space-y-4">
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <h2 class="text-sm font-medium text-gray-800 mb-4">Profil admin</h2>
              <div class="space-y-3">
                <div>
                  <label class="text-xs text-gray-400 block mb-1">Nama lengkap</label>
                  <input type="text" :value="userName" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label class="text-xs text-gray-400 block mb-1">Email</label>
                  <input type="email" :value="userStore.user?.email ?? ''" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                </div>
              </div>
              <button class="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                Simpan perubahan
              </button>
            </div>

            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <h2 class="text-sm font-medium text-gray-800 mb-1">Instrumen aktif</h2>
              <p class="text-xs text-gray-400 mb-4">Atur instrumen mana yang tersedia untuk responden.</p>
              <div class="space-y-3">
                <div v-for="ins in toggleInstruments" :key="ins.name" class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-800">{{ ins.name }}</p>
                    <p class="text-xs text-gray-400">{{ ins.sub }}</p>
                  </div>
                  <button
                    @click="ins.active = !ins.active"
                    class="w-10 h-5 rounded-full transition-colors relative shrink-0"
                    :class="ins.active ? 'bg-gray-900' : 'bg-gray-200'"
                  >
                    <span
                      class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                      :class="ins.active ? 'left-5' : 'left-0.5'"
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const activePage = ref('overview')
const search = ref('')

const today = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

const userName = computed(() => userStore.user?.displayName ?? 'Admin')
const userInitials = computed(() =>
  userName.value.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
)

const handleLogout = () => userStore.logout()

const navItems = [
  { key: 'overview', label: 'Overview', icon: 'M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z' },
  { key: 'responden', label: 'Responden', icon: 'M5 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0M2 14c0-3 2-5 6-5s6 2 6 5' },
  { key: 'laporan', label: 'Laporan', icon: 'M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM10 2v3h3M5 7h6M5 10h4' },
  { key: 'pengaturan', label: 'Pengaturan', icon: 'M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 2v1M8 13v1M3.5 3.5l.7.7M11.8 11.8l.7.7M2 8h1M13 8h1M3.5 12.5l.7-.7M11.8 4.2l.7-.7' },
]

const currentPage = computed(() => navItems.find(n => n.key === activePage.value))

const stats = [
  { label: 'Total responden', value: 248, sub: '+12 minggu ini', positive: true },
  { label: 'Asesmen selesai', value: 183, sub: '73.8% dari total', positive: true },
  { label: 'Sedang berjalan', value: 41, sub: 'Belum selesai', positive: false },
  { label: 'Laporan dibuat', value: 167, sub: '+5 hari ini', positive: true },
]

const recentRespondents = [
  { name: 'Rizky Ananda', initials: 'RA', instrument: 'Holland RIASEC', done: true },
  { name: 'Siti Rahma', initials: 'SR', instrument: 'Work Readiness', done: true },
  { name: 'Budi Santoso', initials: 'BS', instrument: 'Holland RIASEC', done: false },
  { name: 'Dewi Lestari', initials: 'DL', instrument: 'Work Readiness', done: false },
  { name: 'Agus Firmansyah', initials: 'AF', instrument: 'Holland RIASEC', done: true },
]

const instrumentProgress = [
  { name: 'Holland RIASEC', done: 112, total: 150, color: '#7F77DD' },
  { name: 'Work Readiness Scale', done: 71, total: 98, color: '#378ADD' },
]

const allRespondents = [
  { id: 1, name: 'Rizky Ananda', initials: 'RA', instrument: 'Holland RIASEC', date: '26 Jun 2026', done: true },
  { id: 2, name: 'Siti Rahma', initials: 'SR', instrument: 'Work Readiness', date: '26 Jun 2026', done: true },
  { id: 3, name: 'Budi Santoso', initials: 'BS', instrument: 'Holland RIASEC', date: '25 Jun 2026', done: false },
  { id: 4, name: 'Dewi Lestari', initials: 'DL', instrument: 'Work Readiness', date: '25 Jun 2026', done: false },
  { id: 5, name: 'Agus Firmansyah', initials: 'AF', instrument: 'Holland RIASEC', date: '24 Jun 2026', done: true },
  { id: 6, name: 'Nurul Hidayah', initials: 'NH', instrument: 'Work Readiness', date: '24 Jun 2026', done: true },
  { id: 7, name: 'Fajar Ramadhan', initials: 'FR', instrument: 'Holland RIASEC', date: '23 Jun 2026', done: true },
]

const filteredRespondents = computed(() =>
  allRespondents.filter(r =>
    r.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

const reports = [
  { title: 'Rekap Holland RIASEC', desc: 'Hasil distribusi tipe RIASEC seluruh responden.', count: 3, color: 'bg-purple-100 text-purple-600' },
  { title: 'Rekap Work Readiness', desc: 'Skor dan distribusi per dimensi kesiapan kerja.', count: 2, color: 'bg-blue-100 text-blue-600' },
  { title: 'Laporan gabungan', desc: 'Ringkasan semua instrumen dalam satu laporan.', count: 1, color: 'bg-gray-100 text-gray-600' },
  { title: 'Export data mentah', desc: 'Data responden dalam format CSV atau Excel.', count: 5, color: 'bg-green-100 text-green-600' },
]

const toggleInstruments = ref([
  { name: 'Holland RIASEC', sub: '36 butir soal', active: true },
  { name: 'Work Readiness Scale', sub: '28 butir soal', active: true },
  { name: 'Minat Bakat (MBTI)', sub: '40 butir soal', active: false },
])
</script>