<template>
	<div>
		<!-- Breadcrumb -->
		<div class="flex items-center gap-2 mb-4">
			<button
				@click="router.push({ name: 'admin-likert' })"
				class="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
			>
				Likert Form
			</button>
			<span class="text-text-muted">/</span>
			<button
				@click="
					router.push({
						name: 'admin-likert-questions',
						params: { slug: likertSlug },
					})
				"
				class="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
			>
				{{ currentLikert?.name ?? "..." }}
			</button>
			<span class="text-text-muted">/</span>
			<span
				class="text-sm text-text-primary font-medium truncate max-w-[200px] md:max-w-none"
			>
				Skala Penilaian
			</span>
		</div>

		<div class="bg-surface mb-4">
			<div>
				<h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">
					Skala Likert Form
				</h1>
				<p class="text-sm text-text-secondary max-w-3xl mb-3">
					Kelola skala penilaian formulir likert.
				</p>
			</div>
		</div>

		<!-- Tombol Kembali -->
		<div class="mb-1 md:mb-2 mt-8">
			<button
				@click="
					router.push({
						name: 'admin-likert-questions',
						params: { slug: likertSlug },
					})
				"
				class="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
			>
				<font-awesome-icon
					icon="fa-solid fa-arrow-left"
					class="w-4 h-4 shrink-0"
				/>
				Kembali
			</button>
		</div>

		<!-- Card Kelola Skala -->
		<div class="table-content mb-4 md:mb-6">
			<div
				class="table-header px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
			>
				<h2 class="text-sm font-medium text-white">Skala Penilaian</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse table-fixed">
					<thead class="border-b border-black-secondary">
						<tr>
							<th class="w-[25%]">Rentang</th>
							<th class="w-[30%]">Label</th>
							<th class="w-[30%]">Deskripsi</th>
							<th class="w-[15%]">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						<tr v-for="s in scales" :key="s.id">
							<td>{{ s.min }} – {{ s.max }}</td>
							<td>{{ s.label }}</td>
							<td>{{ s.description }}</td>
							<td>
								<div class="flex items-center gap-2">
									<button
										@click="editScaleItem(s)"
										class="p-2.5 md:p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
										title="Edit"
									>
										<font-awesome-icon
											icon="fa-solid fa-pen"
											class="w-5 h-5 shrink-0"
										/>
									</button>
									<button
										@click="deleteScaleItem(s.id)"
										class="p-2.5 md:p-2 rounded-lg text-danger hover:bg-danger-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
										title="Hapus"
									>
										<font-awesome-icon
											icon="fa-solid fa-trash"
											class="w-5 h-5 shrink-0"
										/>
									</button>
								</div>
							</td>
						</tr>

						<!-- Empty state -->
						<tr v-if="scales.length === 0">
							<td colspan="4" class="text-center py-6 text-text-muted">
								Belum ada skala penilaian.
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Inline Add Form -->
			<div class="border-t border-border">
				<div v-if="showAddScaleForm" class="px-4 md:px-5 py-4 bg-table-value">
					<div class="flex flex-col sm:flex-row items-start gap-3">
						<input
							v-model="scaleForm.min"
							type="number"
							class="w-full sm:w-24 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
							placeholder="Min"
						/>
						<input
							v-model="scaleForm.max"
							type="number"
							class="w-full sm:w-24 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
							placeholder="Max"
						/>
						<input
							v-model="scaleForm.score"
							type="text"
							class="w-full sm:w-48 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
							placeholder="Label, cth: Sangat Tinggi"
						/>
						<input
							v-model="scaleForm.description"
							type="text"
							class="w-full sm:flex-1 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
							placeholder="Deskripsi (opsional)"
						/>

						<div
							class="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto"
						>
							<button
								@click="saveScale"
								:disabled="!scaleForm.score.trim() || scaleSaving"
								class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed whitespace-nowrap h-10 cursor-pointer"
							>
								{{ scaleSaving ? "Menyimpan..." : "Simpan" }}
							</button>
							<button
								@click="cancelAddScale"
								class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
							>
								Batal
							</button>
						</div>
					</div>
				</div>

				<button
					v-else
					@click="openAddScale"
					class="w-full px-4 md:px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2 h-10 cursor-pointer"
				>
					<font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
					Tambah Skala
				</button>
			</div>
		</div>

		<!-- Modal Edit Skala -->
		<div
			v-if="showEditScaleModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
		>
			<div
				class="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]"
			>
				<div
					class="px-4 md:px-6 py-4 border-b border-border flex justify-between items-center shrink-0"
				>
					<h3 class="text-base font-semibold text-text-primary">Edit Skala</h3>
					<button
						@click="cancelScaleEdit"
						class="text-text-muted hover:text-text-secondary transition-colors p-1 cursor-pointer"
					>
						<font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
					</button>
				</div>

				<div class="p-4 md:p-6 space-y-4 overflow-y-auto">
					<div>
						<label class="block text-sm font-medium text-black mb-1"
							>Label</label
						>
						<input
							v-model="scaleForm.score"
							type="text"
							class="w-full px-3 py-2.5 md:py-2 border border-black-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
							placeholder="Contoh: Sangat Tinggi"
						/>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-text-primary mb-1"
								>Min</label
							>
							<input
								v-model.number="scaleForm.min"
								type="number"
								class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-text-primary mb-1"
								>Max</label
							>
							<input
								v-model.number="scaleForm.max"
								type="number"
								class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
							/>
						</div>
					</div>
					<div>
						<label class="block text-sm font-medium text-text-primary mb-1"
							>Deskripsi</label
						>
						<textarea
							v-model="scaleForm.description"
							rows="3"
							class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-y"
							placeholder="Deskripsi (opsional)"
						></textarea>
					</div>
				</div>

				<div
					class="px-4 md:px-6 py-4 border-t border-border bg-surface-muted flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0"
				>
					<button
						@click="cancelScaleEdit"
						class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
					>
						Batal
					</button>
					<button
						@click="saveScale"
						:disabled="!scaleForm.score.trim() || scaleSaving"
						class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed h-10 cursor-pointer"
					>
						{{ scaleSaving ? "Menyimpan..." : "Simpan" }}
					</button>
				</div>
			</div>
		</div>

		<!-- Modal Konfirmasi Hapus Skala -->
		<ConfirmDeleteModal
			:show="showDeleteScaleModal"
			title="Hapus Skala"
			:loading="scaleSaving"
			@confirm="confirmDeleteScale"
			@cancel="showDeleteScaleModal = false"
		>
			Apakah Anda yakin ingin menghapus skala ini? Tindakan ini tidak dapat
			dibatalkan.
		</ConfirmDeleteModal>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLikertStore } from "@/stores/likert/likert";
import { storeToRefs } from "pinia";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal.vue";

const route = useRoute();
const router = useRouter();
const likertSlug = route.params.slug;
const likertId = ref(null);

const likertStore = useLikertStore();
const { currentLikert } = storeToRefs(likertStore);

// ── Scale State ────────────────────────────────────────────

const scales = ref([]);
const scaleSaving = ref(false);
const scaleForm = ref({ score: "", min: "", max: "", description: "" });
const editingScaleId = ref(null);

// Inline add scale
const showAddScaleForm = ref(false);

// Edit scale modal
const showEditScaleModal = ref(false);

// Delete scale
const showDeleteScaleModal = ref(false);
const deletingScaleId = ref(null);

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {
	const likert = await likertStore.getLikertBySlug(likertSlug);
	if (!likert) {
		router.push({ name: "admin-likert" });
		return;
	}

	likertId.value = likert.id;
	await fetchScales();
});

// ── Scale Management ───────────────────────────────────────

const resetScaleForm = () => {
	scaleForm.value = { score: "", min: "", max: "", description: "" };
	editingScaleId.value = null;
};

const fetchScales = async () => {
	try {
		const data = await likertStore.fetchLikertScales(likertId.value);
		scales.value = data;
	} catch (e) {
		console.error(e);
		scales.value = [];
	}
};

const openAddScale = () => {
	resetScaleForm();
	showAddScaleForm.value = true;
};

const cancelAddScale = () => {
	resetScaleForm();
	showAddScaleForm.value = false;
};

const saveScale = async () => {
	if (
		!scaleForm.value.score.trim() ||
		scaleForm.value.min === "" ||
		scaleForm.value.max === ""
	)
		return;
	scaleSaving.value = true;
	try {
		const range = `${scaleForm.value.min} – ${scaleForm.value.max}`;
		if (editingScaleId.value) {
			await likertStore.updateScale(likertId.value, editingScaleId.value, {
				score: scaleForm.value.score.trim(),
				range,
				description: scaleForm.value.description.trim(),
			});
			showEditScaleModal.value = false;
		} else {
			await likertStore.addScale(likertId.value, {
				score: scaleForm.value.score.trim(),
				range,
				description: scaleForm.value.description.trim(),
			});
			showAddScaleForm.value = false;
		}
		resetScaleForm();
		await fetchScales();
	} catch (e) {
		console.error(e);
	} finally {
		scaleSaving.value = false;
	}
};

const editScaleItem = (s) => {
	editingScaleId.value = s.id;
	scaleForm.value = {
		score: s.label,
		min: s.min,
		max: s.max,
		description: s.description || "",
	};
	showEditScaleModal.value = true;
};

const cancelScaleEdit = () => {
	resetScaleForm();
	showEditScaleModal.value = false;
};

const deleteScaleItem = (scaleId) => {
	deletingScaleId.value = scaleId;
	showDeleteScaleModal.value = true;
};

const confirmDeleteScale = async () => {
	scaleSaving.value = true;
	try {
		await likertStore.deleteScale(likertId.value, deletingScaleId.value);
		showDeleteScaleModal.value = false;
		deletingScaleId.value = null;
		await fetchScales();
	} catch (e) {
		console.error(e);
	} finally {
		scaleSaving.value = false;
	}
};
</script>
