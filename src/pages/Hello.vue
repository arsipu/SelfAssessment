<template>
	<div class="min-h-screen flex items-center justify-center bg-slate-900">
		<div
			class="text-center p-10 bg-white rounded-3xl shadow-2xl transition-transform hover:scale-105 duration-300"
		>
			<h1
				class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4"
			>
				Hello, Vue + Tailwind!
			</h1>

			<p class="text-slate-600 text-lg mb-6">
				Membangun UI modern menjadi lebih cepat dan efisien.
			</p>

			<button
				@click="increment"
				class="px-6 py-3 bg-blue-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-colors shadow-lg"
			>
				Klik Saya: {{ count }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";

const count = ref(0);
const increment = () => {
	count.value++;
};
</script>
