<template>
	<div class="min-h-screen bg-bg flex items-center justify-center px-4">
		<div class="w-full max-w-sm">
			<!-- Logo / Brand -->
			<div class="text-center mb-8">
				<div
					class="w-10 h-10 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center"
				>
					<font-awesome-icon icon="fa-solid fa-user" class="w-5 h-5 text-text-on-primary" />
				</div>
				<h1 class="text-lg font-medium text-text-primary">Self Assessment</h1>
				<p class="text-sm text-text-muted mt-1">Masuk ke panel admin</p>
			</div>

			<!-- Card -->
			<div class="bg-surface border border-border rounded-2xl p-6">
				<form @submit.prevent="handleLogin" class="space-y-4">
					<!-- Username -->
					<div>
						<label
							for="username"
							class="block text-xs font-medium text-text-secondary mb-1.5"
						>
							Username
						</label>
						<input
							v-model="username"
							id="username"
							type="text"
							required
							placeholder="username"
							class="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface-muted text-text-primary placeholder-text-muted focus:outline-none focus:border-instrument focus:bg-surface transition-colors"
						/>
					</div>

					<!-- Password -->
					<div>
						<label
							for="password"
							class="block text-xs font-medium text-text-secondary mb-1.5"
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
								class="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface-muted text-text-primary placeholder-text-muted focus:outline-none focus:border-instrument focus:bg-surface transition-colors pr-10"
							/>
							<button
								type="button"
								@click="showPassword = !showPassword"
								class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
								tabindex="-1"
							>
								<font-awesome-icon v-if="!showPassword" icon="fa-solid fa-eye" class="w-4 h-4" />
								<font-awesome-icon v-else icon="fa-solid fa-eye-slash" class="w-4 h-4" />
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
							class="flex items-start gap-2.5 bg-danger-soft border border-danger rounded-lg px-3 py-2.5"
						>
							<font-awesome-icon icon="fa-solid fa-circle-exclamation" class="w-4 h-4 text-danger shrink-0 mt-0.5" />
							<p class="text-xs text-danger leading-relaxed">
								{{ errorMessage }}
							</p>
						</div>
					</transition>

					<!-- Submit -->
					<button
						type="submit"
						:disabled="isLoading"
						class="w-full py-2.5 bg-primary text-text-on-primary text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
					>
						<font-awesome-icon
							v-if="isLoading"
							icon="fa-solid fa-spinner"
							class="w-4 h-4 animate-spin"
						/>
						{{ isLoading ? "Memproses..." : "Masuk" }}
					</button>
				</form>
			</div>

			<!-- Back to home -->
			<div class="text-center mt-5">
				<router-link
					to="/"
					class="text-xs text-text-muted hover:text-text-secondary transition-colors"
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
}
</script>