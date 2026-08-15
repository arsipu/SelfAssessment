<template>
	<div :class="embedded ? '' : 'min-h-screen bg-bg'">
		<div
			:class="embedded ? '' : 'max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10'"
		>
			<div
				v-if="!result || loading"
				class="text-center text-sm text-black-secondary py-20"
			>
				Memuat hasil...
			</div>

			<div v-else class="space-y-6">
				<!-- CARD RAPOR -->
				<div
					class="print-area card border border-border rounded-2xl shadow-sm overflow-hidden print:p-8"
				>
					<!-- Kop -->
					<div class="p-5 md:p-6 border-b border-border">
						<p class="text-[11px] text-black tracking-wide mb-1">
							Hai, Berikut Hasil dari :
						</p>
						<h1 class="text-lg font-semibold text-black mb-4">
							{{ likertStore.currentLikert?.name || "Kuesioner" }}
						</h1>

						<!-- Kode tracking -->
						<div
							v-if="result?.code"
							class="print:hidden flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-5 p-3 rounded-xl"
						>
							<div class="flex items-center gap-2 flex-1 min-w-0">
								<font-awesome-icon
									icon="fa-solid fa-key"
									class="w-3.5 h-3.5 text-primary shrink-0"
								/>
								<div class="min-w-0">
									<p
										class="text-xs md:text-[11px] text-black-secondary leading-snug"
									>
										Simpan kode ini untuk melihat hasil kembali kapan saja
									</p>
									<p
										class="text-xs md:text-sm font-mono font-semibold text-black tracking-wide"
									>
										{{ result.code }}
									</p>
								</div>
							</div>
							<button
								@click="copyCode"
								class="self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-black transition cursor-pointer"
							>
								<font-awesome-icon
									:icon="codeCopied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"
									class="w-3 h-3"
								/>
								{{ codeCopied ? "Tersalin" : "Salin" }}
							</button>
						</div>

						<!-- Versi cetak: kode tetap tampil tanpa tombol -->
						<p
							v-if="result?.code"
							class="hidden print:block text-xs text-black-secondary mb-4"
						>
							Kode hasil:
							<span class="font-mono font-semibold">{{ result.code }}</span>
						</p>

						<div
							class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm"
						>
							<div>
								<p class="text-black-secondary text-xs mb-0.5">Nama</p>
								<p class="text-black font-medium">
									{{ result?.respondent?.nama }}
								</p>
							</div>
							<div>
								<p class="text-black-secondary text-xs mb-0.5">Kelas</p>
								<p class="text-black font-medium">
									{{ result?.respondent?.kelas }}
								</p>
							</div>
							<div>
								<p class="text-black-secondary text-xs mb-0.5">Sekolah</p>
								<p class="text-black font-medium">
									{{ result?.respondent?.sekolah }}
								</p>
							</div>
							<div>
								<p class="text-black-secondary text-xs mb-0.5">
									Jurusan / Kompetensi Keahlian
								</p>
								<p class="text-black font-medium">
									{{ result?.respondent?.jurusan }}
								</p>
							</div>
							<div>
								<p class="text-black-secondary text-xs mb-0.5">Usia / Gender</p>
								<p class="text-black font-medium">
									{{ result?.respondent?.usia }} Tahun, {{ genderLabel }}
								</p>
							</div>
							<div v-if="result?.respondent?.pkl">
								<p class="text-black-secondary text-xs mb-0.5">Pernah PKL</p>
								<p class="text-black font-medium">
									{{ result.respondent.pkl }}
								</p>
							</div>
						</div>
					</div>

					<!-- Ringkasan: total skor + badge + deskripsi -->
					<div
						v-if="showScoreSummary"
						class="p-5 md:p-8 border-b border-border"
					>
						<LikertScoreSummary
							:total-score="computedScore"
							:scale-label="category?.label"
							:scale-description="category?.description"
							:badge-bg="category?.bg"
							:badge-text="category?.text"
							variant="center"
						/>
					</div>

					<!-- Rincian jawaban (collapsible, nempel di card) -->
					<div class="p-4 md:p-6">
						<button
							@click="showDetails = !showDetails"
							class="print:hidden w-full flex items-center justify-between gap-2"
						>
							<p class="text-xs font-medium text-black-secondary">
								Rincian jawaban
							</p>
							<font-awesome-icon
								icon="fa-solid fa-chevron-down"
								class="w-4 h-4 text-text-muted transition-transform duration-200"
								:class="{ 'fa-rotate-180': showDetails }"
							/>
						</button>

						<Transition name="expand">
							<div v-if="showDetails" class="mt-4">
								<LikertAnswerSections :sections="sections" variant="table" />
							</div>
						</Transition>
					</div>
				</div>

				<!-- Tombol aksi -->
				<div
					v-if="!embedded"
					class="print:hidden flex flex-col md:flex-row gap-3"
				>
					<button
						@click="showExportPDFModal = true"
						class="w-full md:flex-1 py-3 h-10 border border-black-secondary text-text-primary text-sm font-semibold rounded-xl hover:bg-surface-muted transition cursor-pointer"
					>
						Unduh PDF
					</button>
					<router-link
						to="/"
						class="w-full md:flex-1 text-center py-3 h-10 btn-primary text-sm font-semibold rounded-xl transition"
					>
						Selesai
					</router-link>
				</div>
			</div>
		</div>
	</div>

	<!-- Modal konfirmasi export PDF -->
	<Transition name="fade">
		<div
			v-if="showExportPDFModal && !embedded"
			class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
			@click.self="showExportPDFModal = false"
		>
			<div
				class="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-lg max-h-[90vh] overflow-y-auto"
			>
				<h2 class="text-base font-semibold text-black mb-2">
					Unduh hasil PDF?
				</h2>
				<p class="text-sm text-black-secondary leading-relaxed mb-6">
					Rekap jawaban akan diunduh dalam format .pdf.
				</p>

				<div class="flex gap-3">
					<button
						@click="showExportPDFModal = false"
						class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-primary-soft transition-colors cursor-pointer"
					>
						Batal
					</button>
					<button
						@click="confirmExportPDF"
						class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover transition-colors cursor-pointer"
					>
						Ya, unduh
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import LikertScoreSummary from "@/components/likert/LikertScoreSummary.vue";
import LikertAnswerSections from "@/components/likert/LikertAnswerSections.vue";
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLikertStore } from "@/stores/likert/likert";
import { useLikertSessionStore } from "@/stores/likert/likert-session";
import { useLikertQuestionsStore } from "@/stores/likert/likert-questions";
import { useLikertCategoriesStore } from "@/stores/likert/likert-categories";
import { LIKERT_SCALE_OPTIONS } from "@/apps/likert";
import { computeTotalScore } from "@/utils/likert-scoring";

const props = defineProps({
	result: { type: Object, default: null }, // data hasil (dipakai mode admin/embedded)
	embedded: { type: Boolean, default: false }, // true = hanya render card, tanpa layout halaman
	showScoreSummary: { type: Boolean, default: true }, // false = sembunyikan ringkasan skor (submission belum selesai)
});

const route = useRoute();
const router = useRouter();
const likertSlug = route.params.slug;
const likertId = computed(() => likertStore?.currentLikert?.id || null);

const likertStore = useLikertStore();
const likertSessionStore = useLikertSessionStore();
const likertQuestionsStore = useLikertQuestionsStore();
const categoryStore = useLikertCategoriesStore();

const categories = ref([]);
const loading = ref(true);

const showExportPDFModal = ref(false);
const showDetails = ref(props.embedded);
const codeCopied = ref(false);

async function copyCode() {
	if (!result.value?.code) return;
	try {
		await navigator.clipboard.writeText(result.value.code);
		codeCopied.value = true;
		setTimeout(() => {
			codeCopied.value = false;
		}, 2000);
	} catch (e) {
		console.error("Gagal menyalin kode:", e);
	}
}

async function confirmExportPDF() {
	await handleExportPDF();
}

const badgeStyleMap = {
	"Sangat Tinggi": {
		bg: "var(--color-level-5-soft)",
		text: "var(--color-level-5)",
	},
	Tinggi: { bg: "var(--color-level-4-soft)", text: "var(--color-level-4)" },
	Sedang: { bg: "var(--color-level-3-soft)", text: "var(--color-level-3)" },
	Rendah: { bg: "var(--color-level-2-soft)", text: "var(--color-level-2)" },
	"Sangat Rendah": {
		bg: "var(--color-level-1-soft)",
		text: "var(--color-level-1)",
	},
};

const answerLabelMap = Object.fromEntries(
	LIKERT_SCALE_OPTIONS.map((opt) => [opt.value, opt.label]),
);

const genderLabel = computed(() => {
	const g = result.value?.respondent?.jenisKelamin;
	return g === "L" ? "Laki-laki" : g === "P" ? "Perempuan" : g || "-";
});

const result = computed(
	() => props.result ?? likertSessionStore.getResult(likertId.value),
);
const respondentName = computed(() => result.value?.respondentName || "-");
const maxScore = computed(
	() => categories.value[0]?.max ?? categories.value[0]?.min ?? "-",
);

// totalScore dihitung ulang dari answers setiap kali — tidak baca dari Firestore
const computedScore = computed(() => computeTotalScore(result.value?.answers));

const category = computed(() => {
	const score = computedScore.value;
	const found =
		categories.value.find((c) => score >= c.min && score <= c.max) ||
		categories.value[categories.value.length - 1] ||
		null;
	if (found) {
		const style = badgeStyleMap[found.label] || {
			bg: "var(--color-surface-muted)",
			text: "var(--color-text-secondary)",
		};
		return { ...found, bg: style.bg, text: style.text };
	}
	return null;
});

const sections = computed(() => {
	const answers = result.value?.answers || [];
	const grouped = {};

	for (const a of answers) {
		const question = likertQuestionsStore.questions.find(
			(q) => q.id === a.questionId,
		);
		if (!grouped[a.categoryId]) grouped[a.categoryId] = [];
		grouped[a.categoryId].push({
			questionId: a.questionId,
			questionText: question?.question || "(soal tidak ditemukan)",
			answerLabel: answerLabelMap[a.answer] || a.answer || "-",
			point: a.point ?? "-",
		});
	}

	return Object.keys(grouped).map((categoryId) => {
		const cat = categoryStore.categories.find((c) => c.id === categoryId);
		return {
			key: categoryId,
			label: cat?.name || "Tanpa kategori",
			items: grouped[categoryId],
		};
	});
});

onMounted(async () => {
	loading.value = true;
	try {
		if (!likertStore.currentLikert) {
			await likertStore.getLikertBySlug(likertSlug);
		}

		if (!likertStore.currentLikert) {
			router.replace({
				name: "not-available",
				query: {
					title: "Instrumen Tidak Ditemukan",
					message:
						"Instrumen yang kamu cari mungkin sudah dihapus atau link tidak valid.",
				},
			});
			return;
		}

		await categoryStore.fetchCategories(likertId.value);

		// Mode publik saja: muat hasil dari kode/sesi
		if (!props.result) {
			const code = route.query.code;

			if (code) {
				const fetched = await likertSessionStore.loadResultByCode(
					likertId.value,
					code,
				);
				if (!fetched) {
					router.replace({
						name: "not-available",
						query: {
							title: "Hasil Tidak Ditemukan",
							message: "Kode tidak valid atau hasil tidak ditemukan.",
						},
					});
					return;
				}
			} else if (!result.value) {
				router.replace({ name: "likert-form", params: { slug: likertSlug } });
				return;
			}
		}

		await likertQuestionsStore.fetchAllQuestions(categoryStore.categories);

		const scales = await likertStore.fetchLikertScales(likertId.value);
		categories.value = scales.map((s) => ({
			...s,
			bg: badgeStyleMap[s.label]?.bg || "var(--color-surface-muted)",
			text: badgeStyleMap[s.label]?.text || "var(--color-text-secondary)",
		}));
	} finally {
		loading.value = false;
	}
});

const wasDetailsExpandedBeforePrint = ref(false);
const exportingFromButton = ref(false);

// Fallback untuk Ctrl+P / print manual: paksa rincian jawaban terbuka
function handleBeforePrint() {
	// Jangan timpa state saat proses export dari tombol — sudah ditangani handleExportPDF
	if (exportingFromButton.value) return;
	wasDetailsExpandedBeforePrint.value = showDetails.value;
	showDetails.value = true;
}

// Fallback setelah print manual selesai: kembalikan state semula
function handleAfterPrint() {
	if (exportingFromButton.value) return;
	if (!wasDetailsExpandedBeforePrint.value) {
		showDetails.value = false;
	}
}

onMounted(() => {
	window.addEventListener("beforeprint", handleBeforePrint);
	window.addEventListener("afterprint", handleAfterPrint);
});

onBeforeUnmount(() => {
	window.removeEventListener("beforeprint", handleBeforePrint);
	window.removeEventListener("afterprint", handleAfterPrint);
});

async function handleExportPDF() {
	if (!likertId.value || !result.value?.code) return;

	try {
		const url = `http://localhost:8000/api/create-pdf/${likertId.value}?code=${result.value.code}`;
		window.open(url, "_blank");
	} finally {
		showExportPDFModal.value = false;
	}
}
</script>

<style scoped>
.avoid-break {
	break-inside: avoid;
	page-break-inside: avoid;
}
</style>

<style>
/* Aturan print sengaja TIDAK scoped agar menembus komponen child
   (LikertScoreSummary, LikertAnswerSections) sehingga border di dalam
   tabel jawaban juga ikut dihilangkan saat print. */
@media print {
	/* Margin 18mm di SEMUA sisi dan berlaku di SETIAP halaman cetak.
	   PENTING: .print-area TIDAK memakai position: absolute — elemen dibiarkan
	   mengalir normal di dalam layout, sehingga margin @page diterapkan
	   sungguh-sungguh oleh browser di setiap halaman (di Chrome, margin @page
	   tidak berpengaruh pada elemen position: absolute). Ukuran kertas dibuat
	   eksplisit A4 portrait supaya @page diproses konsisten di semua browser. */
	@page {
		size: A4 portrait;
		margin: 18mm;
	}

	html,
	body {
		margin: 0;
		padding: 0;
		background: #fff !important;
	}

	body * {
		visibility: hidden;
	}
	.print-area,
	.print-area * {
		visibility: visible;
		-webkit-print-color-adjust: exact !important;
		print-color-adjust: exact !important;
	}

	/* Buang padding/margin kontainer luar agar .print-area memenuhi lebar
	   page area dan jarak dari tepi kertas murni berasal dari @page margin.
	   Padding kecil 5mm dipertahankan sebagai fallback visual tambahan di
	   halaman pertama bila @page margin tidak dihormati browser. */
	.min-h-screen,
	.max-w-2xl,
	.space-y-6 {
		margin: 0 !important;
		padding-left: 5mm !important;
		padding-right: 5mm !important;
		padding-top: 0 !important;
		padding-bottom: 0 !important;
		max-width: none !important;
	}

	/* Tailwind v4 .space-y-6 memberi margin-bottom ke child pertama
	   (.print-area) — dinonaktifkan agar tidak menambah jarak ekstra. */
	.space-y-6 > :not(:last-child) {
		margin-bottom: 0 !important;
	}

	/* Card .print-area memakai overflow: hidden — saat konten melebihi satu
	   halaman, ini bisa memotong isi antar halaman cetak. */
	.print-area {
		display: block !important;
		width: auto !important;
		margin: 0 !important;
		overflow: visible !important;
	}

	/* Hilangkan semua border & shadow agar hasil print bersih tanpa garis */
	.print-area,
	.print-area * {
		border: none !important;
		box-shadow: none !important;
	}

	/* Beri jarak antar baris tabel agar tetap mudah dibaca tanpa border */
	.print-area table tbody tr {
		padding: 0.5rem 0;
	}

	.print-area table tbody tr:first-child td {
		padding-top: 0.75rem;
	}

	.print-area table tbody tr:last-child td {
		padding-bottom: 0.75rem;
	}
}
</style>
