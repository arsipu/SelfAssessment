import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user.js";

import BerandaView from "../pages/dashboard/BerandaView.vue";
import Holland from "../pages/dashboard/Holland.vue";
import WorkReadiness from "../pages/dashboard/WorkReadiness.vue";
import TentangKamiView from "../pages/dashboard/TentangKamiView.vue";
import LoginView from "../pages/login/LoginPage.vue";
import AdminDashboardView from "../pages/admin/AdminDashboardView.vue";
import Hello from "../pages/Hello.vue";

const routes = [
	// Public
	{ path: "/", name: "beranda", component: BerandaView },
	{ path: "/holland", name: "holland", component: Holland },
	{ path: "/workreadiness", name: "workreadiness", component: WorkReadiness },
	{ path: "/tentang-kami", name: "tentang-kami", component: TentangKamiView },

	// Auth
	{
		path: "/login",
		name: "login",
		component: LoginView,
		meta: { guestOnly: true },
	},

	// Admin (protected)
	{
		path: "/admin",
		meta: { requiresAdmin: true },
		children: [
			{
				path: "dashboard",
				name: "admin-dashboard",
				component: AdminDashboardView,
			},
		],
	},

	// Fallback
	{ path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach(async (to) => {
  const userStore = useUserStore();
 
  // Tunggu auth state selesai
  await userStore.listenToAuthState();
 
  const user = userStore.user;
  const isLoggedIn = !!user;
  const isAdmin = user?.role !== 'user';   // sesuaikan kondisi role admin kamu
 
  // Halaman login: kalau udah login sebagai admin, redirect ke dashboard
  if (to.meta.guestOnly && isLoggedIn && isAdmin) {
    return { name: 'admin-dashboard' };
  }
 
  // Halaman admin: kalau belum login atau bukan admin, redirect ke login
  if (to.meta.requiresAdmin) {
    if (!isLoggedIn || !isAdmin) {
      userStore.returnUrl = to.fullPath;  // simpan tujuan awal
      return { name: 'login' };
    }
  }
});

export default router;
