<template>
	<div class="min-h-screen">
		<AppTopBar />

		<div class="max-w-4xl mx-auto px-4 py-6 pb-20 sm:py-10">
			<!-- tombol kembali -->
			<button
				@click="$router.push('/')"
				class="flex items-center gap-2 text-sm text-text-secondary mb-5 sm:mb-6 cursor-pointer"
			>
				<font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
				Kembali
			</button>

			<div class="bg-surface card rounded-2xl overflow-hidden">
				<div class="mb-5 sm:mb-6 card-title p-6 text-center">
					<h1 class="text-xl sm:text-2xl font-semi-bold">
						{{ likertStore.currentLikert?.name }}
					</h1>
					<p class="text-xs sm:text-sm mt-1">
						{{ likertStore.currentLikert?.description }}
					</p>
				</div>

				<div class="p-3 md:p-6">
					<!-- Progress bar -->
					<div class="mb-8">
						<div class="flex items-center justify-between mb-1.5">
							<span class="text-xs text-text-muted">Progress</span>
							<span class="text-xs text-text-secondary font-medium"
								>{{ answeredCount }}/{{ questions.length }}</span
							>
						</div>
						<div class="h-1.5 bg-surface-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-primary rounded-full transition-all duration-300"
								:style="{ width: progressPct + '%' }"
							></div>
						</div>
					</div>

					<!-- Category sections -->
					<div v-for="section in sections" :key="section.key" class="mb-6">
						<div class="flex items-center gap-3 mb-3">
							<div class="flex items-center gap-2 shrink-0">
								<span class="text-sm md:text-md font-medium text-black">{{
									section.label
								}}</span>
							</div>
						</div>

						<div class="space-y-3">
							<div
								v-for="(q, i) in section.questions"
								:key="q.id"
								class="rounded-xl p-1 md:p-4 transition-colors"
							>
								<div class="flex items-start gap-3 mb-3">
									<span
										class="text-xs md:text-sm font-medium text-black mt-0.5 w-2 md:w-6 shrink-0"
										>{{ i + 1 }}.</span
									>
									<p class="text-xs md:text-sm text-black">
										{{ q.question }}
									</p>
								</div>

								<div
									class="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center"
								>
									<label
										v-for="opt in scaleOptions"
										:key="opt.value"
										class="flex items-center gap-2 text-xs md:text-sm text-black cursor-pointer"
									>
										<input
											type="radio"
											:name="'likert-' + q.id"
											:value="opt.value"
											v-model="answers[q.id]"
											class="w-3 md:w-4 h-3 md:h-4"
										/>
										{{ opt.label }}
									</label>
								</div>
							</div>
						</div>
					</div>

					<!-- Submit -->
					<div class="mt-8 flex flex-col items-left justify-between gap-3">
						<p class="text-xs text-black-secondary text-left">
							{{
								unansweredCount > 0
									? `${unansweredCount} soal belum dijawab`
									: "Semua soal sudah dijawab ✓"
							}}
						</p>
						<button
							@click="showConfirmModal = true"
							:disabled="unansweredCount > 0"
							class="w-full px-6 py-2.5 h-10 btn-primary text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
						>
							Kirim jawaban
						</button>
					</div>
				</div>
			</div>
		</div>
		<!-- Modal konfirmasi -->
		<Transition name="fade">
			<div
				v-if="showConfirmModal"
				class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
				@click.self="showConfirmModal = false"
			>
				<div
					class="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-lg max-h-[90vh] overflow-y-auto"
				>
					<h2 class="text-base font-semibold text-text-primary mb-2">
						Kirim jawaban?
					</h2>
					<p class="text-sm text-text-secondary leading-relaxed mb-6">
						Pastikan semua jawaban sudah sesuai. Jawaban tidak bisa diubah lagi
						setelah dikirim.
					</p>

					<div class="flex gap-3">
						<button
							@click="showConfirmModal = false"
							class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-primary-soft transition-colors cursor-pointer"
						>
							Batal
						</button>
						<button
							@click="confirmSubmit"
							:disabled="submitting"
							class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
						>
							{{ submitting ? "Mengirim..." : "Ya, kirim" }}
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useLikertStore } from "@/stores/likert/likert";
import { useLikertQuestionsStore } from "@/stores/likert/likert-questions";
import { useLikertCategoriesStore } from "@/stores/likert/likert-categories";
import { useLikertSessionStore } from "@/stores/likert/likert-session";
import {
	LikertAnswer,
	LIKERT_SCALE_OPTIONS,
	LIKERT_SCORE_MAP,
	LIKERT_SCORE_MAP_REVERSE,
} from "@/apps/likert";

const route = useRoute();
const router = useRouter();
const likertSlug = route.params.slug;
const likertId = computed(() => likertStore?.currentLikert?.id || null);

const likertStore = useLikertStore();
const likertQuestionsStore = useLikertQuestionsStore();
const likertSessionStore = useLikertSessionStore();
const { questions } = storeToRefs(likertQuestionsStore);

const categoryStore = useLikertCategoriesStore();
const { categories } = storeToRefs(categoryStore);

const answers = ref({});
let session = null;

const scaleOptions = LIKERT_SCALE_OPTIONS;

onMounted(async () => {
	// Pastikan currentLikert terisi
	if (!likertStore.currentLikert) {
		await likertStore.getLikertBySlug(likertSlug);
	}

	session = likertSessionStore.getSession(likertId.value);

	if (!session) {
		// ga ada sesi -> balik ke form
		router.push({ name: "likert-form", params: { slug: likertSlug } });
		return;
	}

	answers.value = { ...session.answers };

	// Fetch categories (subcollection) — questions ada di array field tiap kategori
	await categoryStore.fetchCategories(likertId.value);
	await likertQuestionsStore.fetchAllQuestions(categories.value);
});

let debounceTimer = null;

function buildSubmissionResult() {
	return questions.value.map((q) => {
		const raw = answers.value[q.id];
		const isFavorable = q.favorable === "favorable";
		const point = raw ? (isFavorable ? scoreMap[raw] : scoreMapRev[raw]) : null;

		return {
			questionId: q.id,
			categoryId: q.categoryId,
			favorable: q.favorable,
			answer: raw ?? null,
			point,
		};
	});
}

watch(
	answers,
	(newAnswers) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			likertSessionStore.updateAnswers(
				likertId.value,
				newAnswers,
				buildSubmissionResult(),
			);
		}, 800); // sesuaikan delay-nya sesuai selera
	},
	{ deep: true },
);

onUnmounted(() => clearTimeout(debounceTimer));

const dotColors = [
	"var(--color-viz-1)",
	"var(--color-viz-2)",
	"var(--color-viz-3)",
	"var(--color-viz-4)",
	"var(--color-viz-5)",
	"var(--color-viz-6)",
];

const sections = computed(() => {
	const grouped = {};
	for (const q of questions.value) {
		if (!grouped[q.categoryId]) grouped[q.categoryId] = [];
		grouped[q.categoryId].push(q);
	}
	return Object.keys(grouped).map((categoryId, index) => {
		const cat = categories.value.find((c) => c.id === categoryId);
		return {
			key: categoryId,
			label: cat?.name || "Tanpa kategori",
			dot: dotColors[index % dotColors.length],
			questions: grouped[categoryId],
		};
	});
});

const answeredCount = computed(() => Object.keys(answers.value).length);
const unansweredCount = computed(
	() => questions.value.length - answeredCount.value,
);
const progressPct = computed(() =>
	questions.value.length
		? (answeredCount.value / questions.value.length) * 100
		: 0,
);

const scoreMap = LIKERT_SCORE_MAP;
const scoreMapRev = LIKERT_SCORE_MAP_REVERSE;

const handleSubmit = async () => {
	const submissionResult = buildSubmissionResult();

	try {
		const session = likertSessionStore.getSession(likertId.value); // ambil dulu sebelum finishSession hapus dia
		await likertSessionStore.finishSession(likertId.value, submissionResult);
		router.push({
			name: "likert-result",
			params: { slug: likertSlug },
			query: { code: session.code },
		});
	} catch (error) {
		alert("Gagal menyimpan jawaban, coba lagi.");
	}
};

const showConfirmModal = ref(false);
const submitting = ref(false);

async function confirmSubmit() {
	if (submitting.value) return;
	submitting.value = true;
	try {
		await handleSubmit();
	} finally {
		submitting.value = false;
		showConfirmModal.value = false;
	}
}
</script>
