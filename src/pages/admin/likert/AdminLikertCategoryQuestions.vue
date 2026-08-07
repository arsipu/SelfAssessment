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
				>{{ currentCategory?.name ?? "..." }}</span
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
						{{ currentCategory?.name ?? "Memuat..." }}
					</h1>
					<p class="text-sm text-text-secondary max-w-3xl">
						{{ currentLikert?.description }}
					</p>
					<p class="text-xs text-text-muted mt-1">
						Kelola pertanyaan dalam kategori ini. Pertanyaan bisa ditambah,
						diedit, atau dihapus.
					</p>
				</div>
				<div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
					<button
						@click="
							router.push({
								name: 'admin-likert-questions',
								params: { slug: likertSlug },
							})
						"
						class="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer"
					>
						<font-awesome-icon
							icon="fa-solid fa-arrow-left"
							class="w-4 h-4 shrink-0"
						/>
						Kembali ke Kategori
					</button>
				</div>
			</div>
		</div>

		<!-- Card Soal -->
		<div
			class="bg-surface border border-border rounded-xl overflow-hidden mb-4 md:mb-6"
		>
			<div
				class="px-4 md:px-5 py-3 md:py-4 border-b border-border bg-surface-muted flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
			>
				<h2 class="text-sm font-medium text-text-primary">
					Soal ({{ questions.length }})
				</h2>
			</div>

			<!-- Tabel -->
			<div class="overflow-x-auto">
				<table class="app-table w-full text-left border-collapse table-fixed">
					<thead>
						<tr>
							<th
								class="w-[8%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
							>
								No
							</th>
							<th
								class="w-[48%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
							>
								Pertanyaan
							</th>
							<th
								class="w-[24%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
							>
								Jenis
							</th>
							<th
								class="w-[20%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
							>
								Aksi
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						<tr v-for="(q, index) in questions" :key="q.id">
							<td class="px-4 md:px-5 py-3 text-sm text-table-value-text">
								{{ index + 1 }}
							</td>
							<td class="px-4 md:px-5 py-3 text-sm text-table-value-text">
								{{ q.question }}
							</td>
							<td class="px-4 md:px-5 py-3">
								<span
									class="text-xs px-2 py-1 rounded-full font-medium"
									:class="
										q.favorable === 'favorable'
											? 'bg-success-soft text-success'
											: 'bg-danger-soft text-danger'
									"
								>
									{{
										q.favorable === "favorable" ? "Favorable" : "Unfavorable"
									}}
								</span>
							</td>
							<td class="px-4 md:px-5 py-3">
								<div class="flex items-center gap-2">
									<button
										@click="openEditModal(q)"
										class="p-2.5 md:p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
										title="Edit"
									>
										<font-awesome-icon
											icon="fa-solid fa-pen"
											class="w-5 h-5 shrink-0"
										/>
									</button>
									<button
										@click="openDeleteModal(q.id)"
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
						<tr v-if="questions.length === 0">
							<td
								colspan="4"
								class="px-4 md:px-5 py-6 text-center text-sm text-text-muted"
							>
								Belum ada pertanyaan untuk kategori ini.
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Inline Add Form -->
			<div class="border-t border-border">
				<!-- Form aktif -->
				<div v-if="showAddForm" class="px-4 md:px-5 py-4 bg-table-value">
					<div class="flex flex-col sm:flex-row items-start gap-3">
						<textarea
							v-model="inlineForm.question"
							rows="2"
							class="w-full sm:flex-1 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
							placeholder="Masukkan teks pertanyaan..."
							autofocus
						></textarea>

						<div
							class="flex flex-row sm:flex-col gap-3 sm:gap-2 pt-1 shrink-0 flex-wrap"
						>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									v-model="inlineForm.favorable"
									value="favorable"
									class="h-4 w-4 shrink-0"
								/>
								<span class="text-sm text-text-primary whitespace-nowrap"
									>Favorable</span
								>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									v-model="inlineForm.favorable"
									value="unfavorable"
									class="h-4 w-4 shrink-0"
								/>
								<span class="text-sm text-text-primary whitespace-nowrap"
									>Unfavorable</span
								>
							</label>
						</div>

						<div
							class="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto"
						>
							<button
								@click="saveInline"
								:disabled="!inlineForm.question.trim() || saving"
								class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed whitespace-nowrap h-10 cursor-pointer"
							>
								{{ saving ? "Menyimpan..." : "Simpan" }}
							</button>
							<button
								@click="cancelInline"
								class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
							>
								Batal
							</button>
						</div>
					</div>
				</div>

				<!-- Tombol tambah -->
				<button
					v-else
					@click="openInlineAdd"
					class="w-full px-4 md:px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2 h-10 cursor-pointer"
				>
					<font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
					Tambah Soal
				</button>
			</div>
		</div>

		<!-- Modal Edit Soal -->
		<div
			v-if="showEditModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
		>
			<div
				class="bg-surface rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]"
			>
				<div
					class="px-4 md:px-6 py-4 border-b border-border flex justify-between items-center shrink-0"
				>
					<h3 class="text-base font-semibold text-text-primary">Edit Soal</h3>
					<button
						@click="closeEditModal"
						class="text-text-muted hover:text-text-secondary transition-colors p-1 cursor-pointer"
					>
						<font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
					</button>
				</div>

				<div class="p-4 md:p-6 space-y-4 overflow-y-auto">
					<div>
						<label class="block text-sm font-medium text-text-primary mb-1"
							>Kategori</label
						>
						<select
							v-model="editForm.categoryId"
							class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
						>
							<option v-for="cat in categories" :key="cat.id" :value="cat.id">
								{{ cat.name }}
							</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-text-primary mb-1"
							>Pertanyaan</label
						>
						<textarea
							v-model="editForm.question"
							rows="3"
							class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
							placeholder="Masukkan teks pertanyaan..."
						></textarea>
					</div>

					<div class="flex flex-col sm:flex-row gap-4">
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								v-model="editForm.favorable"
								value="favorable"
								class="h-4 w-4 shrink-0"
							/>
							<span class="text-sm text-text-primary">Favorable</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								v-model="editForm.favorable"
								value="unfavorable"
								class="h-4 w-4 shrink-0"
							/>
							<span class="text-sm text-text-primary">Unfavorable</span>
						</label>
					</div>
				</div>

				<div
					class="px-4 md:px-6 py-4 border-t border-border bg-surface flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0"
				>
					<button
						@click="closeEditModal"
						class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
					>
						Batal
					</button>
					<button
						@click="saveEdit"
						:disabled="!editForm.question.trim() || saving"
						class="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed h-10 cursor-pointer"
					>
						{{ saving ? "Menyimpan..." : "Simpan" }}
					</button>
				</div>
			</div>
		</div>

		<!-- Modal Hapus Soal -->
		<ConfirmDeleteModal
			:show="showDeleteModal"
			title="Hapus Soal"
			:loading="saving"
			@confirm="confirmDelete"
			@cancel="showDeleteModal = false"
		>
			Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat
			dibatalkan.
		</ConfirmDeleteModal>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLikertStore } from "@/stores/likert/likert";
import { useLikertCategoriesStore } from "@/stores/likert/likert-categories";
import { useLikertQuestionsStore } from "@/stores/likert/likert-questions";
import { storeToRefs } from "pinia";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal.vue";

const route = useRoute();
const router = useRouter();
const likertSlug = route.params.slug;
const categoryId = route.params.categoryId;
const likertId = ref(null);

const likertStore = useLikertStore();
const categoryStore = useLikertCategoriesStore();
const likertQuestionsStore = useLikertQuestionsStore();

const { currentLikert } = storeToRefs(likertStore);
const { categories } = storeToRefs(categoryStore);
const { questions } = storeToRefs(likertQuestionsStore);

// ── Computed ───────────────────────────────────────────────

const currentCategory = computed(() =>
	categories.value.find((c) => c.id === categoryId),
);

// ── State ──────────────────────────────────────────────────

const saving = ref(false);

// Inline add
const showAddForm = ref(false);
const inlineForm = ref({ question: "", favorable: "favorable" });

// Edit modal
const showEditModal = ref(false);
const editingId = ref(null);
const editOriginalCategoryId = ref(null);
const editForm = ref({ question: "", favorable: "favorable", categoryId: "" });

// Delete modal
const showDeleteModal = ref(false);
const deletingId = ref(null);

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {
	const likert = await likertStore.getLikertBySlug(likertSlug);
	if (!likert) {
		router.push({ name: "admin-likert" });
		return;
	}

	likertId.value = likert.id;

	// Fetch categories untuk mendapatkan nama kategori
	await categoryStore.fetchCategories(likertId.value);

	// Jika kategori tidak ditemukan, kembali ke daftar kategori
	if (!currentCategory.value) {
		router.push({
			name: "admin-likert-questions",
			params: { slug: likertSlug },
		});
		return;
	}

	// Fetch questions untuk kategori ini
	await likertQuestionsStore.fetchQuestions(likertId.value, categoryId);
});

// ── Inline Add ─────────────────────────────────────────────

const openInlineAdd = () => {
	showAddForm.value = true;
	inlineForm.value = { question: "", favorable: "favorable" };
};

const cancelInline = () => {
	showAddForm.value = false;
	inlineForm.value = { question: "", favorable: "favorable" };
};

const saveInline = async () => {
	if (!inlineForm.value.question.trim()) return;
	saving.value = true;
	try {
		await likertQuestionsStore.addQuestion(likertId.value, categoryId, {
			question: inlineForm.value.question.trim(),
			favorable: inlineForm.value.favorable,
		});
		cancelInline();
	} catch (e) {
		console.error(e);
	} finally {
		saving.value = false;
	}
};

// ── Edit Modal ─────────────────────────────────────────────

const openEditModal = (q) => {
	editingId.value = q.id;
	editOriginalCategoryId.value = categoryId;
	editForm.value = {
		question: q.question,
		favorable: q.favorable,
		categoryId,
	};
	showEditModal.value = true;
};

const closeEditModal = () => {
	showEditModal.value = false;
	editingId.value = null;
	editOriginalCategoryId.value = null;
	editForm.value = { question: "", favorable: "favorable", categoryId: "" };
};

const saveEdit = async () => {
	if (!editForm.value.question.trim()) return;
	saving.value = true;
	try {
		await likertQuestionsStore.updateQuestion(
			likertId.value,
			editOriginalCategoryId.value,
			editingId.value,
			{
				question: editForm.value.question.trim(),
				favorable: editForm.value.favorable,
				newCategoryId:
					editForm.value.categoryId !== editOriginalCategoryId.value
						? editForm.value.categoryId
						: null,
			},
		);

		// Jika soal dipindah ke kategori lain, muat ulang soal kategori ini
		if (editForm.value.categoryId !== editOriginalCategoryId.value) {
			await likertQuestionsStore.fetchQuestions(likertId.value, categoryId);
		}
		closeEditModal();
	} catch (e) {
		console.error(e);
	} finally {
		saving.value = false;
	}
};

// ── Delete Modal ───────────────────────────────────────────

const openDeleteModal = (id) => {
	deletingId.value = id;
	showDeleteModal.value = true;
};

const confirmDelete = async () => {
	saving.value = true;
	try {
		await likertQuestionsStore.deleteQuestion(
			likertId.value,
			categoryId,
			deletingId.value,
		);
		showDeleteModal.value = false;
		deletingId.value = null;
	} catch (e) {
		console.error(e);
	} finally {
		saving.value = false;
	}
};
</script>
