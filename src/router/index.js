import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore.js";

import BerandaView from "../pages/dashboard/BerandaView.vue";
import Holland from "../pages/dashboard/Holland.vue";
import WorkReadiness from "../pages/dashboard/WorkReadiness.vue";
import TentangKamiView from "../pages/dashboard/TentangKamiView.vue";
import LoginView from "../pages/login/LoginPage.vue";
import AdminDashboardView from "../pages/admin/AdminDashboardView.vue";
import Hello from "../pages/Hello.vue";

const routes = [
	// Public
	{ path: "/", name: "beranda", component: Hello },
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

// Navigation Guard
// router.beforeEach(async (to) => {
// 	const authStore = useAuthStore();

// 	// Tunggu sampai auth state selesai dicek (init() di App.vue)
// 	if (authStore.loading) {
// 		await new Promise((resolve) => {
// 			const unwatch = setInterval(() => {
// 				if (!authStore.loading) {
// 					clearInterval(unwatch);
// 					resolve();
// 				}
// 			}, 50);
// 		});
// 	}

// 	// Halaman login: kalau udah login sebagai admin, langsung ke dashboard
// 	if (to.meta.guestOnly && authStore.isAdmin) {
// 		return { name: "admin-dashboard" };
// 	}

// 	// Halaman admin: kalau belum login / bukan admin, redirect ke login
// 	if (to.meta.requiresAdmin) {
// 		if (!authStore.isLoggedIn || !authStore.isAdmin) {
// 			return { name: "login" };
// 		}
// 	}
// });

export default router;
