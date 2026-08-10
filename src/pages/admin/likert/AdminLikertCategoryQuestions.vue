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

		<div class="bg-surface mb-4">
			<div>
				<h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">
					{{ currentCategory?.name ?? "Memuat..." }}
				</h1>
				<p class="text-sm text-text-secondary max-w-3xl mb-3">
					Kelola pertanyaan dalam kategori ini. Pertanyaan bisa ditambah,
					diedit, atau dihapus.
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

		<!-- Card Kelola Soal -->
		<div class="table-content mb-4 md:mb-6">
			<div
				class="table-header px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
			>
				<h2 class="text-sm font-medium text-white">
					Soal ({{ questions.length }})
				</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse table-fixed">
					<thead class="border-b border-black-secondary">
						<tr>
							<th class="w-[8%]">No</th>
							<th class="w-[48%]">Pertanyaan</th>
							<th class="w-[24%]">Jenis</th>
							<th class="w-[20%]">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						<tr v-for="(q, index) in questions" :key="q.id">
							<td>{{ index + 1 }}</td>
							<td>{{ q.question }}</td>
							<td>
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
							<td>
								<div class="flex items-center gap-2">
									<button
										@click="editQuestionItem(q)"
										class="p-2.5 md:p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
										title="Edit"
									>
										<font-awesome-icon
											icon="fa-solid fa-pen"
											class="w-5 h-5 shrink-0"
										/>
									</button>
									<button
										@click="deleteQuestionItem(q.id)"
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
							<td colspan="4" class="text-center py-6 text-text-muted">
								Belum ada pertanyaan untuk kategori ini.
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Inline Add/Edit Form -->
			<div class="border-t border-border">
				<div v-if="showQuestionForm" class="px-4 md:px-5 py-4 bg-table-value">
					<p class="text-sm font-medium text-text-primary mb-3">
						{{ editingQuestionId ? "Edit Soal" : "Tambah Soal" }}
					</p>
					<div class="flex flex-col sm:flex-row items-start gap-3">
						<textarea
							v-model="questionForm.question"
							rows="2"
							class="w-full sm:flex-1 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
							placeholder="Masukkan teks pertanyaan..."
						></textarea>

						<div
							class="flex flex-row sm:flex-col gap-3 sm:gap-2 pt-1 shrink-0 flex-wrap"
						>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									v-model="questionForm.favorable"
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
									v-model="questionForm.favorable"
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
								@click="saveQuestion"
								:disabled="!questionForm.question.trim() || saving"
								class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed whitespace-nowrap h-10 cursor-pointer"
							>
								{{ saving ? "Menyimpan..." : "Simpan" }}
							</button>
							<button
								@click="cancelQuestionForm"
								class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
							>
								Batal
							</button>
						</div>
					</div>
				</div>

				<button
					v-else
					@click="openAddQuestion"
					class="w-full px-4 md:px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2 h-10 cursor-pointer"
				>
					<font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
					Tambah Soal
				</button>
			</div>
		</div>

		<!-- Modal Konfirmasi Hapus Soal -->
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

// Inline add/edit form
const showQuestionForm = ref(false);
const editingQuestionId = ref(null);
const questionForm = ref({ question: "", favorable: "favorable" });

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

// ── Inline Add/Edit ────────────────────────────────────────

const resetQuestionForm = () => {
	questionForm.value = { question: "", favorable: "favorable" };
	editingQuestionId.value = null;
};

const openAddQuestion = () => {
	resetQuestionForm();
	showQuestionForm.value = true;
};

const editQuestionItem = (q) => {
	editingQuestionId.value = q.id;
	questionForm.value = {
		question: q.question,
		favorable: q.favorable,
	};
	showQuestionForm.value = true;
};

const cancelQuestionForm = () => {
	resetQuestionForm();
	showQuestionForm.value = false;
};

const saveQuestion = async () => {
	if (!questionForm.value.question.trim()) return;
	saving.value = true;
	try {
		if (editingQuestionId.value) {
			await likertQuestionsStore.updateQuestion(
				likertId.value,
				categoryId,
				editingQuestionId.value,
				{
					question: questionForm.value.question.trim(),
					favorable: questionForm.value.favorable,
				},
			);
		} else {
			await likertQuestionsStore.addQuestion(likertId.value, categoryId, {
				question: questionForm.value.question.trim(),
				favorable: questionForm.value.favorable,
			});
		}
		cancelQuestionForm();
	} catch (e) {
		console.error(e);
	} finally {
		saving.value = false;
	}
};

// ── Delete Modal ───────────────────────────────────────────

const deleteQuestionItem = (id) => {
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
