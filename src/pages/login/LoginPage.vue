<template>
	<div class="min-h-screen flex items-center justify-center px-4">
		<div class="w-full max-w-sm">
			<!-- Logo / Brand -->
			<div class="text-center mb-8">
				<div
					class="w-10 h-10 bg-gray-900 rounded-xl mx-auto mb-4 flex items-center justify-center"
				>
					<svg class="w-5 h-5 text-white" viewBox="0 0 16 16" fill="none">
						<circle cx="8" cy="6" r="3" stroke="white" stroke-width="1.5" />
						<path
							d="M2 14c0-3 2.5-5 6-5s6 2 6 5"
							stroke="white"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
				</div>
				<h1 class="text-lg font-medium text-gray-900">Self Assessment</h1>
				<p class="text-sm text-gray-400 mt-1">Masuk ke panel admin</p>
			</div>

			<!-- Card -->
			<div class="bg-white border border-gray-200 rounded-2xl p-6">
				<form @submit.prevent="handleLogin" class="space-y-4">
					<!-- Username -->
					<div>
						<label
							for="username"
							class="block text-xs font-medium text-gray-600 mb-1.5"
						>
							Username
						</label>
						<input
							v-model="username"
							id="username"
							type="text"
							required
							placeholder="username"
							class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
						/>
					</div>

					<!-- Password -->
					<div>
						<label
							for="password"
							class="block text-xs font-medium text-gray-600 mb-1.5"
						>
							Kata sandi
						</label>
						<div class="relative">
							<input
								v-model="password"
								id="password"
								:type="showPassword ? 'text' : 'password'"
								required
								placeholder="••••••••"
								class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors pr-10"
							/>
							<button
								type="button"
								@click="showPassword = !showPassword"
								class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
								tabindex="-1"
							>
								<svg
									v-if="!showPassword"
									class="w-4 h-4"
									viewBox="0 0 16 16"
									fill="none"
								>
									<path
										d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									/>
									<circle
										cx="8"
										cy="8"
										r="2"
										stroke="currentColor"
										stroke-width="1.5"
									/>
								</svg>
								<svg v-else class="w-4 h-4" viewBox="0 0 16 16" fill="none">
									<path
										d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.8 5.3 1.8 6.7 1 8c1.3 2.3 3.8 5 7 5 1.3 0 2.5-.4 3.5-1M6 3.2C6.6 3.1 7.3 3 8 3c3.2 0 5.7 2.7 7 5-.5.9-1.2 1.9-2 2.6"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									/>
								</svg>
							</button>
						</div>
					</div>

					<!-- Error -->
					<transition
						enter-active-class="transition duration-200 ease-out"
						enter-from-class="opacity-0 -translate-y-1"
						enter-to-class="opacity-100 translate-y-0"
					>
						<div
							v-if="errorMessage"
							class="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5"
						>
							<svg
								class="w-4 h-4 text-red-500 shrink-0 mt-0.5"
								viewBox="0 0 16 16"
								fill="none"
							>
								<circle
									cx="8"
									cy="8"
									r="6"
									stroke="currentColor"
									stroke-width="1.5"
								/>
								<path
									d="M8 5v3M8 10.5v.5"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
								/>
							</svg>
							<p class="text-xs text-red-600 leading-relaxed">
								{{ errorMessage }}
							</p>
						</div>
					</transition>

					<!-- Submit -->
					<button
						type="submit"
						:disabled="isLoading"
						class="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
					>
						<svg
							v-if="isLoading"
							class="w-4 h-4 animate-spin"
							viewBox="0 0 16 16"
							fill="none"
						>
							<circle
								cx="8"
								cy="8"
								r="6"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-dasharray="28"
								stroke-dashoffset="10"
							/>
						</svg>
						{{ isLoading ? "Memproses..." : "Masuk" }}
					</button>
				</form>
			</div>

			<!-- Back to home -->
			<div class="text-center mt-5">
				<router-link
					to="/"
					class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
				>
					← Kembali ke beranda
				</router-link>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");
const errorMessage = ref(null);
const isLoading = ref(false);
const showPassword = ref(false);

const handleLogin = async () => {
	isLoading.value = true;
	errorMessage.value = null;
	const userStore = useUserStore();

	try {
		await userStore.login(username.value + "@gmail.com", password.value);

		router.push({ name: "admin-overview" });
	} catch (err) {
		console.error(err);
		errorMessage.value = "Username atau kata sandi salah. Coba lagi.";
	} finally {
		isLoading.value = false;
	}

	// await userStore.login(username.value + '@gmail.com', password.value).catch((err) => {
	//   console.log(err)
	//   errorMessage.value = 'Username atau kata sandi salah. Coba lagi.'
	// })

	// isLoading.value = false
};
</script>
