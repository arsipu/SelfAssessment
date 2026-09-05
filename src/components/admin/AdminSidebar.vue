<template>
	<aside
		:class="[
			'fixed top-0 left-0 h-full w-56 bg-primary flex flex-col z-40',
			'transform transition-transform duration-300',
			isOpen ? 'translate-x-0' : '-translate-x-full',
			'md:translate-x-0',
		]"
	>
		<!-- Header -->
		<div class="px-5 mb-4 py-4 flex items-center justify-between">
			<div>
				<!-- <p class="text-md font-medium text-table-header-text">
					persiapankarir.com
				</p> -->
				<p class="text-xl text-white">Panel Admin</p>
				<p class="text-white text-xs">kompaskarir.com</p>
			</div>

			<!-- Close button, mobile only -->
			<button
				@click="$emit('close')"
				class="md:hidden p-1 text-white hover:font-bold"
			>
				✕
			</button>
		</div>

		<!-- Menu -->
		<nav class="flex-1 px-3 py-4 space-y-2">
			<RouterLink
				v-for="item in navItems"
				:key="item.name"
				:to="{ name: item.name }"
				@click="$emit('close')"
				class="flex items-center text-white gap-3 px-3 py-2 rounded-lg text-sm"
				:class="[
					isActive(item.name)
						? 'bg-primary-active font-semibold text-white'
						: 'text-white hover:font-bold',
				]"
			>
				<font-awesome-icon :icon="item.icon" class="w-4 h-4 shrink-0" />
				{{ item.label }}
			</RouterLink>
		</nav>

		<!-- Footer -->
		<div class="px-3 py-4">
			<button
				@click="handleLogout"
				class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-table-header-text hover:bg-danger-soft hover:text-danger transition-colors"
			>
				<font-awesome-icon
					icon="fa-solid fa-right-from-bracket"
					class="w-4 h-4 shrink-0"
				/>
				Keluar
			</button>
		</div>
	</aside>
</template>

<script setup>
defineProps({ isOpen: Boolean });
defineEmits(["close"]);

import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

function isActive(name) {
	return route.name?.toString().startsWith(name);
}

const navItems = [
	{
		label: "Overview",
		name: "admin-overview",
		icon: "fa-solid fa-gauge-high",
	},
	{
		label: "Likert Form",
		name: "admin-likert",
		icon: "fa-solid fa-file-lines",
	},
	{
		label: "RIASEC Form",
		name: "admin-holland",
		icon: "fa-solid fa-chart-bar",
	},
	// {
	//   label: 'Pengaturan',
	//   name: 'admin-setting',
	//   icon: 'fa-solid fa-gear'
	// }
];

const userName = computed(() => userStore.user?.displayName ?? "Admin");

const userInitials = computed(() =>
	userName.value
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase(),
);

const handleLogout = async () => {
	await userStore.logout();
	router.push({ name: "login" });
};
</script>
