<template>
	<!-- Layout admin: sidebar kiri + konten utama -->
	<div class="min-h-screen">
		<AdminSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

		<!-- Backdrop mobile saat sidebar terbuka -->
		<div
			v-if="isSidebarOpen"
			@click="isSidebarOpen = false"
			class="fixed inset-0 bg-black/50 z-30 md:hidden"
		></div>

		<div class="md:ml-56 flex flex-col min-h-screen">
			<!-- Header khusus mobile -->
			<header
				class="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-primary sticky top-0 z-20"
			>
				<button @click="isSidebarOpen = true" class="p-1 text-white">☰</button>
				<p class="text-sm font-medium text-white">Admin Panel</p>
			</header>

			<!-- Konten halaman admin -->
			<main class="flex-1 p-4 md:p-6">
				<RouterView />
			</main>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";

// State toggle sidebar (mobile)
const isSidebarOpen = ref(false);
</script>
