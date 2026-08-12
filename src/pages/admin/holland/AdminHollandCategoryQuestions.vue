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
			<button
				@click="
					router.push({
						name: 'admin-holland-questions',
						params: { slug: hollandSlug },
					})
				"
				class="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
			>
				{{ hollandName ?? "..." }}
			</button>
			<span class="text-text-muted">/</span>
			<span
				class="text-sm text-text-primary font-medium truncate max-w-[200px] md:max-w-none"
				>{{ currentCategory?.label ?? "..." }}</span
			>
		</div>

		<!-- Header -->
		<div class="bg-surface mb-4">
			<div>
				<h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">
					{{ currentCategory?.label ?? "Memuat..." }}
				</h1>
				<p class="text-sm text-text-secondary max-w-3xl mb-3">
					Kelola pertanyaan dan kolom pada kategori ini. Pertanyaan bisa
					ditambah, diedit, atau dihapus.
				</p>
			</div>
		</div>

		<!-- Tombol Kembali -->
		<div class="mb-1 md:mb-2 mt-8">
			<button
				@click="
					router.push({
						name: 'admin-holland-questions',
						params: { slug: hollandSlug },
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

		<!-- Loading -->
		<div
			v-if="loading"
			class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center"
		>
			<p class="text-sm text-text-muted">Memuat pertanyaan...</p>
		</div>

		<!-- Judul & Tombol Aksi -->
		<div v-else>
			<div
				class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6"
			>
				<h2 class="text-lg font-semibold text-text-primary">
					Soal ({{ totalQuestions }})
				</h2>
				<button
					@click="openAddColumnModal"
					class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-muted transition-colors whitespace-nowrap cursor-pointer"
					title="Tambah kolom baru"
				>
					<font-awesome-icon
						icon="fa-solid fa-table-columns"
						class="w-3.5 h-3.5 shrink-0"
					/>
					Tambah Kolom
				</button>
			</div>

			<!-- Daftar Card per Kolom -->
			<div v-if="columns.length > 0" class="space-y-4 md:space-y-6">
				<div v-for="col in columns" :key="col.id" class="table-content">
					<!-- Header Kolom -->
					<div
						class="table-header px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
					>
						<h2
							class="min-w-0 text-sm font-medium text-white whitespace-normal break-words"
						>
							{{ col.name }}
						</h2>
						<div class="flex items-center gap-2 shrink-0">
							<button
								@click="openEditColumnModal(col)"
								class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white border border-border rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
								title="Ubah nama / urutan kolom"
							>
								<font-awesome-icon
									icon="fa-solid fa-pen"
									class="w-3.5 h-3.5 shrink-0"
								/>
								Edit
							</button>
							<button
								@click="openDeleteColumnModal(col)"
								class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white border border-border rounded-lg hover:bg-danger hover:border-danger transition-colors whitespace-nowrap cursor-pointer"
								title="Hapus kolom"
							>
								<font-awesome-icon
									icon="fa-solid fa-trash"
									class="w-3.5 h-3.5 shrink-0"
								/>
								Hapus
							</button>
						</div>
					</div>

					<!-- Tabel Pernyataan -->
					<div class="overflow-x-auto">
						<table class="w-full text-left border-collapse table-fixed">
							<thead class="border-b border-black-secondary">
								<tr>
									<th
										class="w-[8%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
									>
										No
									</th>
									<th
										class="w-[68%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
									>
										Pernyataan
									</th>
									<th
										class="w-[24%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
									>
										Aksi
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								<tr v-for="(q, index) in questionsByColumn(col.id)" :key="q.id">
									<td class="px-4 md:px-5 py-3 text-sm text-table-value-text">
										{{ index + 1 }}
									</td>
									<td class="px-4 md:px-5 py-3 text-sm text-table-value-text">
										{{ q.question }}
									</td>
									<td class="px-4 md:px-5 py-3 text-sm">
										<div class="flex items-center gap-2">
											<button
												@click="openEditModal(q, col.id)"
												class="p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors cursor-pointer"
												title="Edit Pernyataan"
											>
												<font-awesome-icon
													icon="fa-solid fa-pen"
													class="w-4 h-4"
												/>
											</button>
											<button
												@click="openDeleteModal(q.id, col.id)"
												class="p-2 rounded-lg text-danger hover:bg-danger-soft transition-colors cursor-pointer"
												title="Hapus Pernyataan"
											>
												<font-awesome-icon
													icon="fa-solid fa-trash"
													class="w-4 h-4"
												/>
											</button>
										</div>
									</td>
								</tr>

								<!-- Empty state -->
								<tr v-if="questionsByColumn(col.id).length === 0">
									<td
										colspan="3"
										class="px-4 md:px-5 py-6 text-center text-sm text-text-muted"
									>
										Belum ada pernyataan di kolom ini.
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- Inline Add Form -->
					<div
						v-if="activeAddKey === col.id"
						class="px-4 py-3 bg-surface border-t border-border"
					>
						<div
							class="flex flex-col sm:flex-row items-stretch sm:items-start gap-2"
						>
							<input
								v-model="inlineForm.question"
								type="text"
								class="w-full sm:flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
								placeholder="Masukkan teks pernyataan..."
								autofocus
								@keyup.enter="saveInline(col.id)"
							/>
							<div class="flex items-center gap-2 shrink-0">
								<button
									@click="saveInline(col.id)"
									:disabled="!inlineForm.question.trim() || saving"
									class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-primary text-text-on-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
								>
									{{ saving ? "Menyimpan..." : "Simpan" }}
								</button>
								<button
									@click="cancelInline"
									class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium border border-border rounded-lg text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
								>
									Batal
								</button>
							</div>
						</div>
					</div>

					<!-- Tombol Tambah Pernyataan -->
					<div
						v-else
						class="px-4 py-2.5 border-t border-border flex justify-end"
					>
						<button
							@click="openInlineAdd(col.id)"
							class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-muted transition-colors whitespace-nowrap cursor-pointer"
						>
							<font-awesome-icon
								icon="fa-solid fa-plus"
								class="w-3.5 h-3.5 shrink-0"
							/>
							Tambah Pernyataan
						</button>
					</div>
				</div>
			</div>

			<!-- Empty state: kategori belum punya kolom sama sekali -->
			<div v-if="columns.length === 0" class="px-5 py-6 text-center">
				<p class="text-xs text-text-muted mb-3">
					Kategori ini belum punya kolom pernyataan.
				</p>
				<button
					@click="openAddColumnModal"
					class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-muted transition-colors whitespace-nowrap cursor-pointer"
				>
					<font-awesome-icon
						icon="fa-solid fa-plus"
						class="w-3.5 h-3.5 shrink-0"
					/>
					Tambah Kolom Pertama
				</button>
			</div>
		</div>

		<!-- Modal Edit Soal -->
		<div
			v-if="showEditModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
		>
			<div class="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-auto">
				<div class="px-6 py-4 flex justify-between items-center">
					<h3 class="text-base font-semibold text-text-primary">
						Edit Pernyataan
					</h3>
					<button
						@click="closeEditModal"
						class="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
					>
						<font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
					</button>
				</div>

				<div class="p-6 space-y-4">
					<div>
						<label class="block text-sm font-medium text-text-primary mb-1"
							>Kategori</label
						>
						<input
							:value="currentCategory?.label || riasecId"
							disabled
							class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface-muted text-text-muted cursor-not-allowed"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-text-primary mb-1"
							>Kolom</label
						>
						<select
							v-model="editForm.columnId"
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-surface"
						>
							<option v-for="col in columns" :key="col.id" :value="col.id">
								{{ col.name }}
							</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-text-primary mb-1"
							>Teks Pernyataan</label
						>
						<textarea
							v-model="editForm.question"
							rows="2"
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
						></textarea>
					</div>
				</div>

				<div class="px-6 py-4 border-t border-border flex justify-end gap-3">
					<button
						@click="closeEditModal"
						class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm cursor-pointer"
					>
						Batal
					</button>
					<button
						@click="saveEdit"
						:disabled="!editForm.question.trim() || saving"
						class="px-4 py-2 bg-primary text-text-on-primary rounded-lg hover:bg-primary-hover text-sm disabled:opacity-60 cursor-pointer"
					>
						{{ saving ? "Menyimpan..." : "Simpan" }}
					</button>
				</div>
			</div>
		</div>

		<!-- Modal Tambah / Edit Kolom -->
		<div
			v-if="showColumnModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
		>
			<div class="bg-surface rounded-xl shadow-xl w-full max-w-sm mx-auto">
				<div class="px-6 py-4 flex justify-between items-center">
					<h3 class="text-base font-semibold text-text-primary">
						{{ columnForm.id ? "Ubah Kolom" : "Tambah Kolom" }}
					</h3>
					<button
						@click="closeColumnModal"
						class="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
					>
						<font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
					</button>
				</div>

				<div class="p-6 space-y-4">
					<div>
						<label class="block text-sm font-medium text-text-primary mb-1"
							>Nama Kolom</label
						>
						<input
							v-model="columnForm.name"
							type="text"
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
							placeholder="Misal: Saya adalah"
							autofocus
							@keyup.enter="saveColumn"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-text-primary mb-1"
							>Posisi</label
						>
						<select
							v-model.number="columnForm.order"
							class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface"
						>
							<option v-for="pos in orderOptions" :key="pos" :value="pos">
								Posisi {{ pos + 1 }}
							</option>
						</select>
					</div>
				</div>

				<div class="px-6 py-4 border-t border-border flex justify-end gap-3">
					<button
						@click="closeColumnModal"
						class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm cursor-pointer"
					>
						Batal
					</button>
					<button
						@click="saveColumn"
						:disabled="!columnForm.name.trim() || savingColumn"
						class="px-4 py-2 bg-primary text-text-on-primary rounded-lg hover:bg-primary-hover text-sm disabled:opacity-60 cursor-pointer"
					>
						{{ savingColumn ? "Menyimpan..." : "Simpan" }}
					</button>
				</div>
			</div>
		</div>

		<!-- Alert Maksimal 4 Kolom -->
		<div
			v-if="showMaxColumnsAlert"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
		>
			<div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-auto">
				<div class="p-6">
					<div class="flex items-center gap-3 mb-3">
						<div
							class="w-10 h-10 rounded-full bg-warning-soft flex items-center justify-center shrink-0"
						>
							<font-awesome-icon
								icon="fa-solid fa-triangle-exclamation"
								class="w-5 h-5 text-warning"
							/>
						</div>
						<h3 class="text-lg font-semibold text-text-primary">
							Batasan Kolom
						</h3>
					</div>
					<p class="text-sm text-text-secondary">
						Kategori
						<strong>{{ currentCategory?.label || riasecId }}</strong> sudah
						memiliki 4 kolom. Maksimal kolom per kategori adalah 4.
					</p>
				</div>
				<div class="px-6 py-4 border-t border-border flex justify-end">
					<button
						@click="showMaxColumnsAlert = false"
						class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm cursor-pointer"
					>
						Mengerti
					</button>
				</div>
			</div>
		</div>

		<!-- Modal Hapus Soal -->
		<ConfirmDeleteModal
			:show="showDeleteModal"
			title="Hapus Pernyataan"
			:loading="saving"
			@confirm="confirmDelete"
			@cancel="showDeleteModal = false"
		>
			Apakah Anda yakin ingin menghapus pernyataan ini? Tindakan ini tidak dapat
			dibatalkan.
		</ConfirmDeleteModal>

		<!-- Modal Hapus Kolom -->
		<ConfirmDeleteModal
			:show="showDeleteColumnModal"
			:title="deleteColumnTitle"
			:loading="savingColumn"
			confirmText="Hapus Kolom & Isinya"
			@confirm="confirmDeleteColumn"
			@cancel="closeDeleteColumnModal"
		>
			Semua pernyataan di dalam kolom ini (<strong
				>{{ questionsByColumn(deletingColumn?.id).length }} soal</strong
			>) akan ikut terhapus permanen. Tindakan ini tidak dapat dibatalkan.
		</ConfirmDeleteModal>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useHollandQuestionsStore } from "@/stores/holland/holland-questions";
import { useHollandColumnsStore } from "@/stores/holland/holland-columns";
import { useHollandRiasecStore } from "@/stores/holland/holland-riasec";
import { useHollandStore } from "@/stores/holland/holland";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal.vue";

const route = useRoute();
const router = useRouter();
const hollandSlug = route.params.slug;
const riasecId = route.params.riasecId;
const hollandId = ref(null);
const hollandName = ref("");

const questionsStore = useHollandQuestionsStore();
const { allQuestions, loading } = storeToRefs(questionsStore);

const columnsStore = useHollandColumnsStore();
const { columnsByRiasec } = storeToRefs(columnsStore);

const riasecStore = useHollandRiasecStore();
const { riasecList } = storeToRefs(riasecStore);

const hollandStore = useHollandStore();

// ── Computed ───────────────────────────────────────────────

const currentCategory = computed(() =>
	riasecList.value.find((c) => c.id === riasecId),
);

const columns = computed(() => columnsByRiasec.value[riasecId] || []);

const totalQuestions = computed(
	() => allQuestions.value.filter((q) => q.riasecId === riasecId).length,
);

// ── State ──────────────────────────────────────────────────

const saving = ref(false);

// Inline add — key = columnId (hanya 1 form aktif dalam satu waktu)
const activeAddKey = ref(null);
const inlineForm = ref({ question: "" });

// Edit modal soal
const showEditModal = ref(false);
const editingId = ref(null);
const editOriginalColumnId = ref(null);
const editForm = ref({ question: "", columnId: "" });

// Delete modal soal
const showDeleteModal = ref(false);
const deletingId = ref(null);
const deleteColumnIdForQuestion = ref(null);

// Modal tambah / edit kolom
const showColumnModal = ref(false);
const savingColumn = ref(false);
const columnForm = ref({ id: null, name: "", order: 0 });

// Modal hapus kolom
const showDeleteColumnModal = ref(false);
const deletingColumn = ref(null);
const deleteColumnTitle = computed(() =>
	deletingColumn.value
		? `Hapus Kolom "${deletingColumn.value.name}"`
		: "Hapus Kolom",
);

// Alert batasan maksimal 4 kolom
const showMaxColumnsAlert = ref(false);

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

	// Fetch riasec list untuk mendapatkan label kategori
	await riasecStore.fetchRiasecList(hollandId.value);

	// Jika kategori tidak ditemukan, kembali ke daftar kategori
	if (!currentCategory.value) {
		router.push({
			name: "admin-holland-questions",
			params: { slug: hollandSlug },
		});
		return;
	}

	// Fetch columns untuk kategori ini, lalu semua questions
	await columnsStore.fetchColumns(hollandId.value, riasecId);
	await questionsStore.fetchAllQuestions(hollandId.value, {
		[riasecId]: columns.value,
	});
});

// ── Helpers ────────────────────────────────────────────────

const questionsByColumn = (columnId) =>
	allQuestions.value.filter(
		(q) => q.riasecId === riasecId && q.columnId === columnId,
	);

// jumlah opsi beda buat tambah vs edit:
// - tambah: 0..N (N = jumlah existing, boleh nyisip di paling akhir juga)
// - edit: 0..N-1 (N = jumlah existing termasuk dirinya sendiri)
const orderOptions = computed(() => {
	const count = columns.value.length;
	const max = columnForm.value.id ? count - 1 : count;
	return Array.from({ length: max + 1 }, (_, i) => i);
});

// ── Inline Add Soal ────────────────────────────────────────

const openInlineAdd = (columnId) => {
	activeAddKey.value = columnId;
	inlineForm.value = { question: "" };
};

const cancelInline = () => {
	activeAddKey.value = null;
	inlineForm.value = { question: "" };
};

const saveInline = async (columnId) => {
	if (!inlineForm.value.question.trim()) return;
	saving.value = true;
	try {
		await questionsStore.addQuestion(hollandId.value, riasecId, columnId, {
			question: inlineForm.value.question,
		});
		cancelInline();
	} catch (e) {
		console.error(e);
	} finally {
		saving.value = false;
	}
};

// ── Edit Modal Soal ────────────────────────────────────────

const openEditModal = (q, columnId) => {
	editingId.value = q.id;
	editOriginalColumnId.value = columnId;
	editForm.value = { question: q.question, columnId };
	showEditModal.value = true;
};

const closeEditModal = () => {
	showEditModal.value = false;
	editingId.value = null;
	editOriginalColumnId.value = null;
	editForm.value = { question: "", columnId: "" };
};

const saveEdit = async () => {
	if (!editForm.value.question.trim()) return;
	saving.value = true;
	try {
		await questionsStore.updateQuestion(
			hollandId.value,
			riasecId,
			editOriginalColumnId.value,
			editingId.value,
			{
				question: editForm.value.question.trim(),
				newColumnId:
					editForm.value.columnId !== editOriginalColumnId.value
						? editForm.value.columnId
						: null,
			},
		);
		closeEditModal();
	} catch (e) {
		console.error(e);
	} finally {
		saving.value = false;
	}
};

// ── Delete Modal Soal ──────────────────────────────────────

const openDeleteModal = (id, columnId) => {
	deletingId.value = id;
	deleteColumnIdForQuestion.value = columnId;
	showDeleteModal.value = true;
};

const confirmDelete = async () => {
	saving.value = true;
	try {
		await questionsStore.deleteQuestion(
			hollandId.value,
			riasecId,
			deleteColumnIdForQuestion.value,
			deletingId.value,
		);
		showDeleteModal.value = false;
		deletingId.value = null;
		deleteColumnIdForQuestion.value = null;
	} catch (e) {
		console.error(e);
	} finally {
		saving.value = false;
	}
};

// ── Tambah / Edit Kolom ──────────────────────────────────────

const openAddColumnModal = () => {
	// Batasi maksimal 4 kolom per kategori
	if (columns.value.length >= 4) {
		showMaxColumnsAlert.value = true;
		return;
	}
	const nextOrder = columns.value.length
		? Math.max(...columns.value.map((c) => c.order ?? 0)) + 1
		: 0;
	columnForm.value = { id: null, name: "", order: nextOrder };
	showColumnModal.value = true;
};

const openEditColumnModal = (col) => {
	columnForm.value = { id: col.id, name: col.name, order: col.order ?? 0 };
	showColumnModal.value = true;
};

const closeColumnModal = () => {
	showColumnModal.value = false;
	columnForm.value = { id: null, name: "", order: 0 };
};

const saveColumn = async () => {
	if (!columnForm.value.name.trim()) return;
	savingColumn.value = true;
	try {
		if (columnForm.value.id) {
			await columnsStore.updateColumn(
				hollandId.value,
				riasecId,
				columnForm.value.id,
				{
					name: columnForm.value.name.trim(),
					order: columnForm.value.order,
				},
			);
		} else {
			await columnsStore.addColumn(hollandId.value, riasecId, {
				name: columnForm.value.name.trim(),
				order: columnForm.value.order,
			});
		}
		closeColumnModal();
	} catch (e) {
		console.error(e);
	} finally {
		savingColumn.value = false;
	}
};

// ── Hapus Kolom ──────────────────────────────────────────────

const openDeleteColumnModal = (col) => {
	deletingColumn.value = col;
	showDeleteColumnModal.value = true;
};

const closeDeleteColumnModal = () => {
	showDeleteColumnModal.value = false;
	deletingColumn.value = null;
};

const confirmDeleteColumn = async () => {
	savingColumn.value = true;
	try {
		await questionsStore.deleteAllQuestionsInColumn(
			hollandId.value,
			riasecId,
			deletingColumn.value.id,
		);
		await columnsStore.deleteColumn(
			hollandId.value,
			riasecId,
			deletingColumn.value.id,
		);
		closeDeleteColumnModal();
	} catch (e) {
		console.error(e);
	} finally {
		savingColumn.value = false;
	}
};
</script>
