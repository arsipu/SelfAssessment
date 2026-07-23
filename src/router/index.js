import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from '@/stores/user';
import { ROLE_ADMIN } from '@/apps/role.js';

import BerandaView from '@/pages/dashboard/BerandaView.vue';

import NotAvailableView from '@/components/NotAvailable.vue';

import TestPrintView from '@/TestPrint.vue';

import HollandForm from '@/pages/holland/HollandForm.vue';
import HollandQuestions from '@/pages/holland/HollandQuestions.vue';
import HollandResult from '@/pages/holland/HollandResult.vue';

import LikertForm from '@/pages/likert/LikertForm.vue';
import LikertQuestions from '@/pages/likert/LikertQuestions.vue';
import LikertResult from '@/pages/likert/LikertResult.vue';

import AdminLayout from '@/pages/admin/AdminLayout.vue';
import AdminOverview from '@/pages/admin/AdminOverview.vue';
import AdminSetting from '@/pages/admin/AdminSetting.vue';

import AdminLikert from '@/pages/admin/likert/AdminLikert.vue';
import AdminLikertQuestions from '@/pages/admin/likert/AdminLikertQuestions.vue';
import AdminLikertSubmissions from '@/pages/admin/likert/AdminLikertSubmissions.vue';
import AdminLikertSubmissionDetail from '@/pages/admin/likert/AdminLikertSubmissionDetail.vue';

import AdminHolland from '@/pages/admin/holland/AdminHolland.vue';
import AdminHollandQuestions from '@/pages/admin/holland/AdminHollandQuestions.vue';
import AdminHollandSubmissions from '@/pages/admin/holland/AdminHollandSubmissions.vue';
import AdminHollandSubmissionDetail from '@/pages/admin/holland/AdminHollandSubmissionDetail.vue';

import LoginView from '@/pages/login/LoginPage.vue';

const routes = [
	// Public
	{ path: "/", name: "beranda", component: BerandaView },

    { path: "/print", name: "print", component: TestPrintView },

	// Holland — parameterized by :slug
    { path: "/holland/:slug", name: "holland-form", component: HollandForm },
    { path: "/holland/:slug/questions", name: "holland-questions", component: HollandQuestions },
    { path: "/holland/:slug/result", name: "holland-result", component: HollandResult },

	// Likert — parameterized by :slug
    { path: "/likert/:slug", name: "likert-form", component: LikertForm },
    { path: "/likert/:slug/questions", name: "likert-questions", component: LikertQuestions },
    { path: "/likert/:slug/result", name: "likert-result", component: LikertResult },

    // Route untuk Halaman Kosong / Tidak Tersedia
    {
        path: '/tidak-tersedia',
        name: 'not-available',
        component: NotAvailableView,
        props: route => ({
            title: route.query.title,
            message: route.query.message
        })
    },

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
            // Likert admin
            {
                path: "likert",
                name: "admin-likert",
                component: AdminLikert,
            },
            {
                path: "likert/:slug",
                name: "admin-likert-questions",
                component: AdminLikertQuestions,
            },
            {
                path: "likert/:slug/submissions",
                name: "admin-likert-submissions",
                component: AdminLikertSubmissions,
            },
            {
                path: "likert/:slug/submissions/:submissionSlug",
                name: 'admin-likert-submission-detail',
                component: AdminLikertSubmissionDetail,
            },
            // Holland admin — parameterized by :slug
            {
                path: "holland",
                name: "admin-holland",
                component: AdminHolland,
            },
            {
                path: "holland/:slug",
                name: "admin-holland-questions",
                component: AdminHollandQuestions,
            },
            {
                path: "holland/:slug/submissions",
                name: "admin-holland-submissions",
                component: AdminHollandSubmissions,
            },
            {
                path: "holland/:slug/submissions/:submissionSlug",
                name: "admin-holland-submission-detail",
                component: AdminHollandSubmissionDetail,
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
//   await userStore.listenToAuthState();
 
  const user = userStore.user;
  const isLoggedIn = !!user;
  const isAdmin = user?.role === ROLE_ADMIN;   // sesuaikan kondisi role admin kamu
 
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