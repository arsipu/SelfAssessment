import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user.js";

import BerandaView from "../pages/dashboard/BerandaView.vue";
import Holland from "../pages/holland/Holland.vue";

import WorkReadiness from "../pages/workreadiness/WorkReadiness.vue";
import WorkReadinessForm from "../pages/workreadiness/WorkReadinessForm.vue";
import WorkReadinessQuestions from "../pages/workreadiness/WorkReadinessQuestions.vue";

// import AdminDashboardView from "../pages/admin/AdminDashboardView.vue";
import AdminLayout from "../pages/admin/AdminLayout.vue";
import AdminOverview from "../pages/admin/AdminOverview.vue";
import AdminWorkReadiness from "../pages/admin/AdminWorkReadiness.vue";
import AdminSetting from "../pages/admin/AdminSetting.vue";

import TentangKamiView from "../pages/dashboard/TentangKamiView.vue";
import LoginView from "../pages/login/LoginPage.vue";

const routes = [
	// Public
	{ path: "/", name: "beranda", component: BerandaView },
	{ path: "/holland", name: "holland", component: Holland },
	{ path: "/workreadiness", name: "workreadiness", component: WorkReadiness },
	{ path: "/tentang-kami", name: "tentang-kami", component: TentangKamiView },

	{path: "/workreadiness-form", name: "workreadiness-form", component: WorkReadinessForm},
	{path: "/workreadiness-questions", name: "workreadiness-questions", component: WorkReadinessQuestions},

	// Auth
	{
		path: "/login",
		name: "login",
		component: LoginView,
		meta: { guestOnly: true },
	},

	
	// // Admin (protected)
	// {
	// 	path: "/admin",
	// 	meta: { requiresAdmin: true },
	// 	children: [
	// 		{
	// 			path: "dashboard",
	// 			name: "admin-dashboard",
	// 			component: AdminDashboardView,
	// 		},
	// 	],
	// },
	
	// Admin (protected)
	{
		path: "/admin",
        component: AdminLayout, // Jadikan layout sebagai parent component
        meta: { requiresAdmin: true },
        children: [
            // Redirect '/admin' langsung ke '/admin/dashboard'
            { 
                path: "", 
                redirect: { name: "admin-overview" } 
            },
            {
                path: "dashboard",
                name: "admin-overview",
                component: AdminOverview,
            },
            {
                path: "work-readiness",
                name: "admin-work-readiness",
                component: AdminWorkReadiness,
            },
            {
                path: "setting",
                name: "admin-setting",
                component: AdminSetting,
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
    return { name: 'admin-overview' };
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
