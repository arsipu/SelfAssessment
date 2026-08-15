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
							Minat karier RIASEC
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
									{{ result?.respondent?.name }}
								</p>
							</div>
							<div>
								<p class="text-black-secondary text-xs mb-0.5">Usia / Gender</p>
								<p class="text-black font-medium">
									{{ result?.respondent?.age }} Tahun,
									{{ result?.respondent?.gender }}
								</p>
							</div>
							<div>
								<p class="text-black-secondary text-xs mb-0.5">
									Sekolah / Universitas
								</p>
								<p class="text-black font-medium">
									{{ result?.respondent?.school }}
								</p>
							</div>
							<div>
								<p class="text-black-secondary text-xs mb-0.5">Jurusan</p>
								<p class="text-black font-medium">
									{{ result?.respondent?.major }}
								</p>
							</div>
							<div v-if="result?.respondent?.occupation">
								<p class="text-black-secondary text-xs mb-0.5">Pekerjaan</p>
								<p class="text-black font-medium">
									{{ result.respondent.occupation }}
								</p>
							</div>
							<div v-if="result?.respondent?.testPurpose">
								<p class="text-black-secondary text-xs mb-0.5">Tujuan Tes</p>
								<p class="text-black font-medium">
									{{ result.respondent.testPurpose }}
								</p>
							</div>
						</div>
					</div>

					<!-- Ringkasan: hex chart + kode dominan -->
					<div
						v-if="showScoreSummary"
						class="p-5 md:p-8 border-b border-border"
					>
						<RiasecSummaryHeader
							:top-code="computedTopCode"
							:top-code-info="topCodeInfo"
							:score-percent-map="scorePercentMap"
							:top-codes-info="topCodesInfo"
						/>
					</div>

					<!-- Tabel skor -->
					<div
						v-if="showScoreSummary"
						class="p-5 md:p-6 border-b border-border"
					>
						<RiasecScoreBreakdown
							:score-breakdown="scoreBreakdown"
							:get-label="riasecLabel"
							variant="table"
						/>
					</div>

					<!-- Catatan -->
					<div
						v-if="showScoreSummary"
						class="p-5 md:p-6 border-b border-border"
					>
						<p class="text-xs font-medium text-black-secondary mb-3">Catatan</p>
						<RiasecNotes :top-code-info="topCodeInfo" />
					</div>

					<!-- Rincian jawaban (collapsible, nempel di card) -->
					<div class="p-4 md:p-5">
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
								<RiasecAnswerDetails
									:detail-sections="detailSections"
									:answered-ids="answeredIds"
									bare
									avoid-break
									unanswered-class="border-border bg-surface-muted-40"
								/>
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
						@click="handleExportPDF()"
						:disabled="exportingPDF"
						class="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
					>
						{{ exportingPDF ? "Mengunduh..." : "Ya, unduh" }}
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import {
	ref,
	computed,
	onMounted,
	onBeforeUnmount,
	nextTick,
	watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useHollandStore } from "@/stores/holland/holland";
import { useHollandSessionStore } from "@/stores/holland/holland-session";
import { useHollandQuestionsStore } from "@/stores/holland/holland-questions";
import { useHollandColumnsStore } from "@/stores/holland/holland-columns";
import { useHollandRiasecStore } from "@/stores/holland/holland-riasec";
import {
	formatBirthDateAge,
	buildScoreBreakdown,
	buildDetailSections,
} from "@/utils/holland-result";
import {
	computeScoreBreakdownFromAnswers,
	computeTopCode,
} from "@/utils/holland-scoring";
import RiasecSummaryHeader from "@/components/holland/RiasecSummaryHeader.vue";
import RiasecScoreBreakdown from "@/components/holland/RiasecScoreBreakdown.vue";
import RiasecNotes from "@/components/holland/RiasecNotes.vue";
import RiasecAnswerDetails from "@/components/holland/RiasecAnswerDetails.vue";
import { getPdfDownloadUrl } from "@/apps/pdf";

const props = defineProps({
	result: { type: Object, default: null }, // data hasil (dipakai mode admin/embedded)
	embedded: { type: Boolean, default: false }, // true = hanya render card, tanpa layout halaman
	showScoreSummary: { type: Boolean, default: true }, // false = sembunyikan ringkasan skor (submission belum selesai)
});

const route = useRoute();
const router = useRouter();
const hollandSlug = route.params.slug;

const hollandStore = useHollandStore();
const sessionStore = useHollandSessionStore();
const questionsStore = useHollandQuestionsStore();
const columnsStore = useHollandColumnsStore();
const { columnsByRiasec } = storeToRefs(columnsStore);
const riasecStore = useHollandRiasecStore();

const showExportPDFModal = ref(false);
const exportingPDF = ref(false);

const hollandId = computed(() => hollandStore?.currentHolland?.id || null);
// Mode embedded (admin): data sudah di-pass via props, jadi tidak perlu
// menampilkan loading state di awal.
const loading = ref(!props.embedded);
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

const result = computed(
	() => props.result ?? sessionStore.getResult(hollandId.value),
);

const scorePercentMap = computed(() => {
	const map = {};
	for (const row of scoreBreakdown.value) map[row.code] = row.percentage;
	return map;
});

const topCodeInfo = computed(() => {
	const code = topCodes.value[0];
	if (!code) return null;
	return riasecStore.riasecList.find((r) => r.id === code) || null;
});

function riasecLabel(code) {
	return riasecStore.riasecList.find((r) => r.id === code)?.label || code;
}

const formattedBirthDateAge = computed(() =>
	formatBirthDateAge(result.value?.respondent),
);

// `scores` dan `topCode` TIDAK disimpan di Firestore — selalu dihitung
// ulang dari `answers` (lihat holland-scoring.js). Di mode publik,
// `result.scores` sudah dihitung oleh session store; di mode embedded
// (admin), `mappedResult` hanya berisi `answers`, jadi dihitung di sini.
const computedScores = computed(() => {
	if (result.value?.scores) return result.value.scores;
	const riasecIds = riasecStore.riasecList.map((c) => c.id);
	return computeScoreBreakdownFromAnswers(result.value?.answers, riasecIds);
});

const computedTopCode = computed(() => {
	if (result.value?.topCode) return result.value.topCode;
	return computeTopCode(computedScores.value);
});

const scoreBreakdown = computed(() => {
	return buildScoreBreakdown(computedScores.value, computedTopCode.value);
});

// 3 kode tertinggi dari scoreBreakdown (sudah urut menurun by percentage)
const topCodes = computed(() => {
	return scoreBreakdown.value.slice(0, 3).map((row) => row.code);
});

// Info lengkap (label, dll) untuk 3 kategori tertinggi
const topCodesInfo = computed(() => {
	return topCodes.value
		.map((code) => riasecStore.riasecList.find((r) => r.id === code) || null)
		.filter(Boolean);
});

// answers sekarang array LENGKAP semua soal + isChecked, jadi
// answeredIds harus filter isChecked === true dulu (bukan ambil semua
// questionId begitu saja seperti sebelumnya).
const answeredIds = computed(() => {
	return new Set(
		(result.value?.answers || [])
			.filter((a) => a.isChecked)
			.map((a) => a.questionId),
	);
});

const detailSections = computed(() => {
	return buildDetailSections(
		riasecStore.riasecList,
		questionsStore.allQuestions,
		columnsByRiasec.value,
	);
});

onMounted(async () => {
	loading.value = true;
	try {
		// Mode embedded (admin): data sudah di-pass via props, tidak perlu
		// fetch session/result dari store.
		if (props.embedded) {
			// Tetap perlu fetch riasec, columns, dan questions untuk
			// menampilkan detailSections & label kategori.
			if (
				!hollandStore.currentHolland ||
				hollandStore.currentHolland.slug !== hollandSlug
			) {
				await hollandStore.getHollandBySlug(hollandSlug);
			}

			if (!hollandStore.currentHolland) {
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

			await riasecStore.fetchRiasecList(hollandId.value);
			const riasecIds = riasecStore.riasecList.map((c) => c.id);

			await columnsStore.fetchAllColumns(hollandId.value, riasecIds);
			await questionsStore.fetchAllQuestions(
				hollandId.value,
				columnsByRiasec.value,
			);
			return;
		}

		if (
			!hollandStore.currentHolland ||
			hollandStore.currentHolland.slug !== hollandSlug
		) {
			await hollandStore.getHollandBySlug(hollandSlug);
		}

		if (!hollandStore.currentHolland) {
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

		await riasecStore.fetchRiasecList(hollandId.value);
		const riasecIds = riasecStore.riasecList.map((c) => c.id);

		const code = route.query.code;

		if (code) {
			// Ada code di URL -> selalu fetch dari Firestore berdasarkan code ini,
			// JANGAN pakai result.value lama walau ada di state (biar bisa ganti-ganti
			// code manual dan hasilnya sesuai).
			const fetched = await sessionStore.loadResultByCode(
				hollandId.value,
				code,
				riasecIds,
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
			// Nggak ada code & nggak ada result lokal -> balik ke form
			router.replace({ name: "holland-form", params: { slug: hollandSlug } });
			return;
		}
		// else: nggak ada code, tapi result.value ada (baru submit) -> pakai itu

		await columnsStore.fetchAllColumns(hollandId.value, riasecIds);
		await questionsStore.fetchAllQuestions(
			hollandId.value,
			columnsByRiasec.value,
		);
	} finally {
		loading.value = false;
	}
});

// Watch for manual changes to ?code= query parameter.
// Ketika user mengganti code di URL secara manual, Vue Router TIDAK
// me-re-mount komponen (karena path-nya sama), jadi onMounted tidak
// dijalankan lagi. Watcher ini memastikan data result di-refetch
// setiap kali code berubah.
watch(
	() => route.query.code,
	async (newCode) => {
		// Skip kalau code dihapus atau belum ada hollandId / riasecList
		if (!newCode) return;
		if (!hollandId.value) return;

		const riasecIds = riasecStore.riasecList.map((c) => c.id);
		if (riasecIds.length === 0) return;

		loading.value = true;
		try {
			const fetched = await sessionStore.loadResultByCode(
				hollandId.value,
				newCode,
				riasecIds,
			);
			if (!fetched) {
				router.replace({
					name: "not-available",
					query: {
						title: "Hasil Tidak Ditemukan",
						message: "Kode tidak valid atau hasil tidak ditemukan.",
					},
				});
			}
		} finally {
			loading.value = false;
		}
	},
);

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
	if (!hollandId.value || !result.value?.code) return;

	exportingPDF.value = true;
	try {
		// const url = `http://localhost:8000/api/create-pdf/${hollandId.value}?code=${result.value.code}`;
		const url = getPdfDownloadUrl(hollandId.value, result.value.code);
		window.open(url, "_blank");
	} finally {
		exportingPDF.value = false;
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
   (RiasecSummaryHeader, RiasecScoreBreakdown, RiasecNotes,
   RiasecAnswerDetails) sehingga border di dalam tabel jawaban juga
   ikut dihilangkan saat print. */
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
     halaman pertama bila @page margin tidak dihormati browser.
     Selektor mencakup mode publik (.min-h-screen, .max-w-3xl, .space-y-6)
     dan mode embedded (admin) yang tidak punya wrapper class tersebut. */
	.min-h-screen,
	.max-w-3xl,
	.max-w-4xl,
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
