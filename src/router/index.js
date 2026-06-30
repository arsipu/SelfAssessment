import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from '@/stores/user';

import BerandaView from '@/pages/dashboard/BerandaView.vue';
import Holland from '@/pages/holland/Holland.vue';

import Likert from '@/pages/likert/Likert.vue';
import LikertForm from '@/pages/likert/LikertForm.vue';
import LikertQuestions from '@/pages/likert/LikertQuestions.vue';
import LikertResult from '@/pages/likert/LikertResult.vue';

import AdminLayout from '@/pages/admin/AdminLayout.vue';
import AdminOverview from '@/pages/admin/AdminOverview.vue';
import AdminSetting from '@/pages/admin/AdminSetting.vue';

import AdminLikert from '@/pages/admin/likert/AdminLikert.vue';
import AdminLikertQuestions from '@/pages/admin/likert/AdminLikertQuestions.vue';

import TentangKamiView from '@/pages/dashboard/TentangKamiView.vue';
import LoginView from '@/pages/login/LoginPage.vue';

const routes = [
	// Public
	{ path: "/", name: "beranda", component: BerandaView },
	{ path: "/holland", name: "holland", component: Holland },
	{ path: "/tentang-kami", name: "tentang-kami", component: TentangKamiView },


    { path: "/likert", name: "likert", component: Likert },
    { path: "/likert-form/:id", name: "likert-form", component: LikertForm },
    { path: "/likert-questions/:id", name: "likert-questions", component: LikertQuestions },
    { path: "/likert-result/:id", name: "likert-result", component: LikertResult },

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
                path: "likert",
                name: "admin-likert",
                component: AdminLikert,
            },
            {
                path: "likert/:id",
                name: "admin-likert-questions",
                component: AdminLikertQuestions,
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
