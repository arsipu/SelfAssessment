<template>
	<div>
		<!-- Breadcrumb -->
		<div class="pdf-breadcrumb flex items-center gap-2 mb-4 flex-wrap">
			<button
				@click="router.push({ name: 'admin-likert' })"
				class="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap cursor-pointer"
			>
				Survei
			</button>
			<span class="text-text-muted shrink-0">/</span>
			<button
				@click="
					router.push({
						name: 'admin-likert-submissions',
						params: { slug: likertSlug },
					})
				"
				class="text-sm text-text-secondary hover:text-text-primary transition-colors truncate max-w-[120px] md:max-w-none cursor-pointer"
			>
				Submissions
			</button>
			<span class="text-text-muted shrink-0">/</span>
			<span
				class="text-sm text-text-primary font-medium truncate max-w-[150px] md:max-w-none"
				>{{ submission?.name ?? "..." }}</span
			>
		</div>

		<!-- Loading -->
		<div
			v-if="loading"
			class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center"
		>
			<p class="text-sm text-text-muted">Memuat data...</p>
		</div>

		<template v-else-if="submission">
			<!-- Kop admin dengan tombol aksi -->
			<div class="flex justify-between items-center mb-6">
				<div>
					<span
						class="print:hidden text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
						:class="
							submission.status === 'completed'
								? 'bg-success-soft text-success'
								: 'bg-warning-soft text-warning'
						"
					>
						{{
							submission.status === "completed"
								? "Selesai"
								: "Sedang Mengerjakan"
						}}
					</span>
				</div>
				<button
					v-if="isCompleted"
					@click="showExportPDFModal = true"
					class="print:hidden text-xs px-4 py-2 rounded-lg border border-border text-text-secondary bg-surface hover:bg-surface-muted transition-colors h-10 cursor-pointer font-semibold flex items-center gap-2"
				>
					Unduh PDF
				</button>
			</div>

			<!-- Alert untuk submission yang belum selesai -->
			<div
				v-if="!isCompleted"
				class="pdf-alert-warning bg-warning-soft border border-warning-30 rounded-xl p-4 md:p-5 mb-4 md:mb-6"
			>
				<div class="flex items-start gap-3">
					<svg
						class="w-5 h-5 text-warning shrink-0 mt-0.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
					<div>
						<p class="text-sm font-medium text-warning">
							Responden belum menyelesaikan tes
						</p>
						<p class="text-xs text-warning-80 mt-1">
							Data skor dan rincian jawaban belum tersedia karena responden
							masih dalam tahap mengerjakan kuesioner.
						</p>
					</div>
				</div>
			</div>

			<!-- Card hasil identik dengan halaman publik -->
			<LikertResult
				:result="mappedResult"
				embedded
				:show-score-summary="isCompleted"
			/>
		</template>

		<div
			v-else
			class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center"
		>
			<p class="text-sm text-text-muted">Data submission tidak ditemukan.</p>
		</div>
	</div>

	<!-- Modal konfirmasi export PDF -->
	<Transition name="fade">
		<div
			v-if="showExportPDFModal"
			class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
			@click.self="showExportPDFModal = false"
		>
			<div
				class="bg-surface rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-lg flex flex-col max-h-[90vh]"
			>
				<h2 class="text-base font-semibold text-text-primary mb-2">
					Unduh hasil PDF?
				</h2>
				<p class="text-sm text-text-secondary leading-relaxed mb-6">
					Rekap jawaban {{ submission?.name }} akan diunduh dalam format .pdf.
				</p>

				<div class="flex flex-col-reverse sm:flex-row gap-3">
					<button
						@click="showExportPDFModal = false"
						class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-surface-muted hover:bg-primary-soft transition-colors h-10 cursor-pointer"
					>
						Batal
					</button>
					<button
						@click="handleExportPDF()"
						:disabled="false"
						class="w-full sm:flex-1 py-2.5 md:py-2.5 rounded-lg text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors h-10 cursor-pointer"
					>
						Ya, unduh
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import LikertResult from "@/pages/likert/LikertResult.vue";
import { onMounted, computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useLikertStore } from "@/stores/likert/likert";
import { useLikertSubmissionsStore } from "@/stores/likert/likert-submissions";
import { getPdfDownloadUrl } from "@/apps/pdf";

const route = useRoute();
const router = useRouter();
const likertSlug = route.params.slug;
const likertId = ref(null);
const submissionSlug = route.params.submissionSlug;

const likertStore = useLikertStore();
const submissionsStore = useLikertSubmissionsStore();

const { currentSubmission: submission, loading } =
	storeToRefs(submissionsStore);

const showExportPDFModal = ref(false);

const isCompleted = computed(() => submission.value?.status === "completed");

// ── Mapped Result ───────────────────────────────────────────

/**
 * Memetakan data submission (Firestore) ke bentuk result yang dipakai LikertResult.
 *
 * @returns {{ code: string, respondent: { nama: string, kelas: string, sekolah: string, jurusan: string, usia: number, jenisKelamin: string, pkl: string }, answers: Array } | null}
 */
const mappedResult = computed(() => {
	if (!submission.value) return null;
	return {
		code: submission.value.code,
		respondent: {
			nama: submission.value.name,
			kelas: submission.value.class,
			sekolah: submission.value.school,
			jurusan: submission.value.major,
			usia: submission.value.age,
			jenisKelamin: submission.value.gender,
			pkl: submission.value.internship,
		},
		answers: submission.value.submission || [],
	};
});

// ── Print Action ────────────────────────────────────────────

/**
 * Mengunduh hasil PDF melalui API.
 */
function handleExportPDF() {
	if (!likertId.value || !submission.value?.code) return;

	// const url = `http://localhost:8000/api/create-pdf/${likertId.value}?code=${submission.value.code}`;
	const url = getPdfDownloadUrl(likertId.value, submission.value.code);
	window.open(url, "_blank");
	showExportPDFModal.value = false;
}

onMounted(async () => {
	const likert = await likertStore.getLikertBySlug(likertSlug);
	if (!likert) {
		router.push({ name: "admin-likert" });
		return;
	}

	likertId.value = likert.id;

	await submissionsStore.fetchSubmissionBySlug(likertId.value, submissionSlug);
});
</script>

<style scoped>
.avoid-break {
	break-inside: avoid;
	page-break-inside: avoid;
}
</style>
