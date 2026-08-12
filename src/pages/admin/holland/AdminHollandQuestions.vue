<template>
	<div>
		<!-- Breadcrumb -->
		<div class="flex items-center gap-2 mb-4">
			<button
				@click="router.push({ name: 'admin-holland' })"
				class="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
			>
				Holland RIASEC
			</button>
			<span class="text-text-muted">/</span>
			<span
				class="text-sm text-text-primary font-medium truncate max-w-[200px] md:max-w-none"
				>{{ hollandName ?? "..." }}</span
			>
		</div>

		<!-- Header -->
		<div
			class="bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6"
		>
			<div
				class="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
			>
				<div>
					<h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">
						{{ hollandName ?? "Memuat..." }}
					</h1>
					<p class="text-sm text-text-secondary max-w-3xl">
						{{ hollandDescription }}
					</p>
				</div>
			</div>
		</div>

		<!-- Tombol Aksi (Submissions) -->
		<div class="flex flex-wrap justify-end gap-2 mb-4 md:mb-6">
			<button
				@click="
					router.push({
						name: 'admin-holland-submissions',
						params: { slug: hollandSlug },
					})
				"
				class="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium bg-primary rounded-sm border border-black secondary text-white hover:bg-primary/80 transition-colors whitespace-nowrap h-10 cursor-pointer"
			>
				<font-awesome-icon
					icon="fa-solid fa-right-to-bracket"
					class="w-4 h-4 shrink-0"
				/>
				Lihat Submissions
			</button>
		</div>

		<!-- Loading -->
		<div
			v-if="loading"
			class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center"
		>
			<p class="text-sm text-text-muted">Memuat pertanyaan...</p>
		</div>

		<!-- Blocks per Category (riasec) — from Firestore, not constants -->
		<div v-else class="space-y-4 md:space-y-6">
			<div v-for="cat in riasecList" :key="cat.id" class="table-content">
				<!-- Category Header — label from Firestore -->
				<div
					class="table-header px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
				>
					<h2 class="text-sm font-medium text-white truncate">
						{{ cat.label || cat.id }}
						<span class="text-white/70">({{ cat.id }})</span>
					</h2>
					<div class="flex flex-wrap items-center gap-2">
						<span
							class="text-xs font-medium text-white bg-white/20 px-2.5 py-1 rounded-md"
						>
							{{ questionsByRiasec(cat.id).length }} Soal
						</span>
						<button
							@click="
								router.push({
									name: 'admin-holland-category-questions',
									params: { slug: hollandSlug, riasecId: cat.id },
								})
							"
							class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white border border-border rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
							title="Kelola pertanyaan & kolom kategori ini"
						>
							<font-awesome-icon
								icon="fa-solid fa-gear"
								class="w-3.5 h-3.5 shrink-0"
							/>
							Kelola
						</button>
						<button
							@click="openRiasecEditModal(cat)"
							class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white border border-border rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
							title="Edit deskripsi & rekomendasi kategori"
						>
							<font-awesome-icon
								icon="fa-solid fa-pen"
								class="w-3.5 h-3.5 shrink-0"
							/>
							Edit
						</button>
					</div>
				</div>

				<!-- Tabel Read-Only per Kategori (gaya front-end) -->
				<div v-if="columnsFor(cat.id).length > 0" class="overflow-x-auto">
					<table class="w-full text-left border-collapse table-fixed">
						<thead class="border-b border-black-secondary">
							<tr>
								<th
									v-for="col in columnsFor(cat.id)"
									:key="col.id"
									class="px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
								>
									{{ col.name }}
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-none">
							<tr
								v-for="i in maxQuestionsInCategory(cat.id)"
								:key="i"
								class="divide-x divide-black-secondary"
							>
								<td
									v-for="col in columnsFor(cat.id)"
									:key="col.id"
									class="px-4 md:px-5 py-3 align-top text-sm text-table-value-text"
								>
									{{
										questionsByRiasecAndColumn(cat.id, col.id)[i - 1]?.question
									}}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Empty state: kategori belum punya kolom/soal -->
				<div v-else class="px-5 py-6 text-center">
					<p class="text-xs text-text-muted">
						Belum ada pernyataan di kategori ini.
					</p>
				</div>
			</div>
		</div>

		<!-- Modal Edit Deskripsi & Rekomendasi Kategori -->
		<div
			v-if="showRiasecEditModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
		>
			<div
				class="bg-surface rounded-xl shadow-xl w-full max-w-xl mx-auto flex flex-col max-h-[90vh]"
			>
				<div class="px-6 py-4 flex justify-between items-center shrink-0">
					<div>
						<h3 class="text-base font-semibold text-text-primary">
							Edit Kategori {{ riasecEditForm.label }}
						</h3>
						<p class="text-xs text-text-muted mt-0.5">
							Kode & label kategori baku, tidak bisa diubah.
						</p>
					</div>
					<button
						@click="closeRiasecEditModal"
						class="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
					>
						<font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
					</button>
				</div>

				<div class="p-6 space-y-4 overflow-y-auto">
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="block text-sm font-medium text-text-primary mb-1"
								>Kode</label
							>
							<input
								:value="riasecEditForm.code"
								disabled
								class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface-muted text-text-muted cursor-not-allowed"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-text-primary mb-1"
								>Label</label
							>
							<input
								:value="riasecEditForm.label"
								disabled
								class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface-muted text-text-muted cursor-not-allowed"
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-text-primary mb-1"
							>Deskripsi bidang minat</label
						>
						<textarea
							v-model="riasecEditForm.description"
							rows="3"
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
							placeholder="Deskripsi karakteristik kategori ini..."
						></textarea>
					</div>

					<div>
						<label class="block text-sm font-medium text-text-primary mb-1">
							Keterampilan kunci
							<span class="text-text-muted font-normal"
								>(1 baris = 1 item)</span
							>
						</label>
						<textarea
							v-model="riasecEditForm.skillsText"
							rows="4"
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-mono resize-none"
							placeholder="Menggunakan dan mengoperasikan alat&#10;Merancang, membangun, memperbaiki"
						></textarea>
					</div>

					<div>
						<label class="block text-sm font-medium text-text-primary mb-1">
							Contoh pekerjaan relevan
							<span class="text-text-muted font-normal"
								>(1 baris = 1 item)</span
							>
						</label>
						<textarea
							v-model="riasecEditForm.careersText"
							rows="4"
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-mono resize-none"
							placeholder="Pilot&#10;Petani&#10;Insinyur"
						></textarea>
					</div>

					<div>
						<label class="block text-sm font-medium text-text-primary mb-1">
							Mata pelajaran pendukung
							<span class="text-text-muted font-normal"
								>(1 baris = 1 item)</span
							>
						</label>
						<textarea
							v-model="riasecEditForm.subjectsText"
							rows="3"
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-mono resize-none"
							placeholder="Matematika&#10;Sains&#10;Teknologi"
						></textarea>
					</div>
				</div>

				<div
					class="px-6 py-4 border-t border-border flex justify-end gap-3 shrink-0"
				>
					<button
						@click="closeRiasecEditModal"
						class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm cursor-pointer"
					>
						Batal
					</button>
					<button
						@click="saveRiasecEdit"
						:disabled="savingRiasec"
						class="px-4 py-2 bg-primary text-text-on-primary rounded-lg hover:bg-primary-hover text-sm disabled:opacity-60 cursor-pointer"
					>
						{{ savingRiasec ? "Menyimpan..." : "Simpan" }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useHollandQuestionsStore } from "@/stores/holland/holland-questions";
import { useHollandColumnsStore } from "@/stores/holland/holland-columns";
import { useHollandRiasecStore } from "@/stores/holland/holland-riasec";
import { useHollandStore } from "@/stores/holland/holland";

const route = useRoute();
const router = useRouter();
const hollandSlug = route.params.slug;
const hollandId = ref(null);
const hollandName = ref("");
const hollandDescription = ref("");

const questionsStore = useHollandQuestionsStore();
const { allQuestions, loading } = storeToRefs(questionsStore);

const columnsStore = useHollandColumnsStore();
const { columnsByRiasec } = storeToRefs(columnsStore);

const riasecStore = useHollandRiasecStore();
const { riasecList } = storeToRefs(riasecStore);

const hollandStore = useHollandStore();

// ── State ──────────────────────────────────────────────────

// Edit deskripsi & rekomendasi kategori riasec
const showRiasecEditModal = ref(false);
const savingRiasec = ref(false);
const riasecEditForm = ref({
	id: null,
	code: "",
	label: "",
	description: "",
	skillsText: "",
	careersText: "",
	subjectsText: "",
});

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {
	// Resolve slug to document ID
	const holland = await hollandStore.getHollandBySlug(hollandSlug);
	if (!holland) {
		router.push({ name: "admin-holland" });
		return;
	}
	hollandId.value = holland.id;
	hollandName.value = holland.name;
	hollandDescription.value = holland.description || "";

	// Fetch riasec list dulu, baru columns per riasec, baru semua questions
	await riasecStore.fetchRiasecList(hollandId.value);
	const riasecIds = riasecList.value.map((c) => c.id);
	await columnsStore.fetchAllColumns(hollandId.value, riasecIds);
	await questionsStore.fetchAllQuestions(
		hollandId.value,
		columnsByRiasec.value,
	);
});

// ── Helpers ────────────────────────────────────────────────

const columnsFor = (riasecId) => columnsByRiasec.value[riasecId] || [];

const questionsByRiasec = (riasecId) =>
	allQuestions.value.filter((q) => q.riasecId === riasecId);

const questionsByRiasecAndColumn = (riasecId, columnId) =>
	allQuestions.value.filter(
		(q) => q.riasecId === riasecId && q.columnId === columnId,
	);

// Jumlah baris tabel = jumlah soal terbanyak di antara kolom-kolom kategori
const maxQuestionsInCategory = (riasecId) => {
	const cols = columnsFor(riasecId);
	if (cols.length === 0) return 0;
	return Math.max(
		...cols.map((col) => questionsByRiasecAndColumn(riasecId, col.id).length),
	);
};

// Konversi array <-> textarea (1 baris = 1 item), buang baris kosong saat parsing
const arrayToText = (arr) => (arr || []).join("\n");
const textToArray = (text) =>
	text
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean);

// ── Edit Modal Kategori (deskripsi & rekomendasi) ─────────────

const openRiasecEditModal = (cat) => {
	riasecEditForm.value = {
		id: cat.id,
		code: cat.code || cat.id,
		label: cat.label || cat.id,
		description: cat.description || "",
		skillsText: arrayToText(cat.skills),
		careersText: arrayToText(cat.careers),
		subjectsText: arrayToText(cat.subjects),
	};
	showRiasecEditModal.value = true;
};

const closeRiasecEditModal = () => {
	showRiasecEditModal.value = false;
	riasecEditForm.value = {
		id: null,
		code: "",
		label: "",
		description: "",
		skillsText: "",
		careersText: "",
		subjectsText: "",
	};
};

const saveRiasecEdit = async () => {
	savingRiasec.value = true;
	try {
		await hollandStore.updateRiasecContent(
			hollandId.value,
			riasecEditForm.value.id,
			{
				description: riasecEditForm.value.description.trim(),
				skills: textToArray(riasecEditForm.value.skillsText),
				careers: textToArray(riasecEditForm.value.careersText),
				subjects: textToArray(riasecEditForm.value.subjectsText),
			},
		);
		// refresh list riasec biar label/deskripsi di kartu kategori langsung ke-update
		await riasecStore.fetchRiasecList(hollandId.value);
		closeRiasecEditModal();
	} catch (e) {
		console.error(e);
	} finally {
		savingRiasec.value = false;
	}
};
</script>
