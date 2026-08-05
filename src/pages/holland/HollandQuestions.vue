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
						{{ hollandStore.currentHolland?.name }}
					</h1>
					<!-- <p class="text-xs sm:text-sm mt-1">
						{{ hollandStore.currentHolland?.description }}
					</p> -->
				</div>

				<div class="p-3 md:p-6">
					<!-- Category sections — grouped by riasecId from riasecList -->
					<div v-for="section in sections" :key="section.key" class="mb-6">
						<!-- Section header -->
						<div class="flex items-center gap-3 mb-3">
							<div class="flex items-center gap-2 shrink-0">
								<span class="text-sm md:text-xl font-medium text-black">{{
									section.label
								}}</span>
							</div>
						</div>

						<!-- Tabel pernyataan per kolom (desktop) -->
						<div
							class="hidden md:block overflow-x-auto rounded-xl border border-border"
						>
							<table class="w-full text-left border-collapse table-fixed">
								<thead class="border-b border-border">
									<tr>
										<th
											v-for="col in section.columns"
											:key="col.key"
											class="px-3 md:px-4 py-2.5 text-xs md:text-sm font-medium tracking-wider"
										>
											{{ col.label }}
										</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="i in Math.max(
											...section.columns.map((c) => c.questions.length),
										)"
										:key="i"
										class="divide-x divide-border"
									>
										<td
											v-for="col in section.columns"
											:key="col.key"
											class="px-3 md:px-4 py-2.5 align-top"
										>
											<label
												v-if="col.questions[i - 1]"
												class="flex items-start text-xs md:text-sm gap-2 cursor-pointer"
											>
												<input
													type="checkbox"
													class="mt-0.5 w-3 md:w-4 h-3 md:h-4 shrink-0"
													:checked="isChecked(col.questions[i - 1].id)"
													@change="toggleAnswer(col.questions[i - 1])"
												/>
												<span
													class="leading-relaxed"
													:class="
														isChecked(col.questions[i - 1].id)
															? 'text-black-secondary'
															: 'text-black'
													"
													>{{ col.questions[i - 1].question }}</span
												>
											</label>
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<!-- Daftar pernyataan per kolom (mobile) -->
						<div
							class="md:hidden rounded-xl border border-border divide-y divide-border"
						>
							<div v-for="col in section.columns" :key="col.key" class="p-4">
								<h3 class="text-xs font-semibold uppercase tracking-wider mb-3">
									{{ col.label }}
								</h3>
								<div class="space-y-3">
									<label
										v-for="q in col.questions"
										:key="q.id"
										class="flex items-start gap-2 cursor-pointer"
									>
										<input
											type="checkbox"
											class="mt-0.5 w-4 h-4 shrink-0"
											:checked="isChecked(q.id)"
											@change="toggleAnswer(q)"
										/>
										<span
											class="leading-relaxed text-xs"
											:class="
												isChecked(q.id) ? 'text-black-secondary' : 'text-black'
											"
											>{{ q.question }}</span
										>
									</label>
								</div>
							</div>
						</div>
					</div>

					<!-- Submit -->
					<div class="mt-8 flex flex-col items-left justify-between gap-3">
						<button
							@click="showConfirmModal = true"
							:disabled="answeredCount === 0"
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
						Pastikan pilihan Anda sudah sesuai. Jawaban tidak bisa diubah lagi
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useHollandStore } from "@/stores/holland/holland";
import { useHollandQuestionsStore } from "@/stores/holland/holland-questions";
import { useHollandColumnsStore } from "@/stores/holland/holland-columns";
import { useHollandRiasecStore } from "@/stores/holland/holland-riasec";
import { useHollandSessionStore } from "@/stores/holland/holland-session";

const route = useRoute();
const router = useRouter();
const hollandSlug = route.params.slug;
const hollandId = computed(() => hollandStore?.currentHolland?.id || null);

const hollandStore = useHollandStore();

const questionsStore = useHollandQuestionsStore();
const { allQuestions } = storeToRefs(questionsStore);

const columnsStore = useHollandColumnsStore();
const { columnsByRiasec } = storeToRefs(columnsStore);

const riasecStore = useHollandRiasecStore();
const { riasecList } = storeToRefs(riasecStore);

const sessionStore = useHollandSessionStore();

// checkedMap[questionId] = true/false -> lookup cepat buat isChecked()
// Diisi dari session.answers (array LENGKAP semua soal + isChecked),
// bukan cuma soal yang kepilih seperti sebelumnya.
const checkedMap = reactive({});
let session = null;

onMounted(async () => {
	// Pastikan currentHolland terisi (mungkin dari halaman sebelumnya)
	if (!hollandStore.currentHolland) {
		await hollandStore.getHollandBySlug(hollandSlug);
	}

	session = sessionStore.getSession(hollandId.value);

	if (!session) {
		// ga ada sesi -> balik ke form
		router.push({ name: "holland-form", params: { slug: hollandSlug } });
		return;
	}

	// restore jawaban dari sesi — sekarang array ini SUDAH LENGKAP semua
	// soal (dibangun sejak startSession di HollandForm.vue), tinggal baca
	// flag isChecked masing-masing.
	for (const a of session.answers || []) {
		checkedMap[a.questionId] = !!a.isChecked;
	}

	// Fetch riasec list dulu (buat urutan & label kategori), baru columns,
	// baru questions — sesuai struktur baru riasec/{id}/columns/{id}/questions
	await riasecStore.fetchRiasecList(hollandId.value);
	const riasecIds = riasecList.value.map((c) => c.id);
	await columnsStore.fetchAllColumns(hollandId.value, riasecIds);
	await questionsStore.fetchAllQuestions(
		hollandId.value,
		columnsByRiasec.value,
	);

	// Jaga-jaga: kalau ternyata ada soal yang belum punya entry di checkedMap
	// (mis. soal baru ditambah admin setelah sesi user dimulai), default-kan false
	for (const q of allQuestions.value) {
		if (!(q.id in checkedMap)) checkedMap[q.id] = false;
	}
});

function isChecked(questionId) {
	return !!checkedMap[questionId];
}

function toggleAnswer(question) {
	checkedMap[question.id] = !checkedMap[question.id];
}

// Bangun array LENGKAP semua soal + isChecked (bukan cuma yang dicentang),
// biar konsisten dengan struktur baru yang disimpan di Firestore.
function buildAnswers() {
	return allQuestions.value.map((q) => ({
		questionId: q.id,
		riasecId: q.riasecId,
		columnId: q.columnId,
		isChecked: !!checkedMap[q.id],
	}));
}

let debounceTimer = null;

watch(
	checkedMap,
	() => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			sessionStore.updateAnswers(hollandId.value, buildAnswers());
		}, 800);
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

// Kelompokkan questions per riasecId (kategori), lalu per column-nya
// (dinamis dari Firestore, bukan constant HOLLAND_COLUMNS lagi).
// Urutan kategori dari riasecList, urutan kolom dari field `order`
// di columnsByRiasec (sudah di-sort di holland-columns.js store).
const sections = computed(() => {
	return riasecList.value
		.map((cat, index) => {
			const categoryQuestions = allQuestions.value.filter(
				(q) => q.riasecId === cat.id,
			);
			if (categoryQuestions.length === 0) return null;

			const cols = columnsByRiasec.value[cat.id] || [];
			const columns = cols
				.map((col) => ({
					key: col.id,
					label: col.name,
					questions: categoryQuestions.filter((q) => q.columnId === col.id),
				}))
				.filter((col) => col.questions.length > 0);

			if (columns.length === 0) return null;

			return {
				key: cat.id,
				code: cat.id,
				label: cat.label || cat.id,
				dot: dotColors[index % dotColors.length],
				columns,
			};
		})
		.filter(Boolean);
});

const answeredCount = computed(
	() => Object.values(checkedMap).filter(Boolean).length,
);
const progressPct = computed(() =>
	allQuestions.value.length
		? (answeredCount.value / allQuestions.value.length) * 100
		: 0,
);

const handleSubmit = async () => {
	const answers = buildAnswers();
	const riasecIds = riasecList.value.map((c) => c.id);

	try {
		// scores & topCode dihitung di dalam finishSession (holland-scoring.js),
		// TIDAK dikirim dari sini dan TIDAK disimpan ke Firestore.
		await sessionStore.finishSession(hollandId.value, answers, riasecIds);
		// router.push({ name: 'holland-result', params: { slug: hollandSlug } })
		router.push({
			name: "holland-result",
			params: { slug: hollandSlug },
			query: { code: session.code },
		});
	} catch (error) {
		alert("Gagal menyimpan jawaban, coba lagi.");
		console.error(error);
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
