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
			<span
				class="text-sm text-text-primary font-medium truncate max-w-[200px] md:max-w-none"
				>{{ currentLikert?.name ?? "..." }}</span
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
						{{ currentLikert?.name ?? "Memuat..." }}
					</h1>
					<p class="text-sm text-text-secondary max-w-3xl">
						{{ currentLikert?.description }}
					</p>
					<p class="text-xs text-text-muted mt-1">
						Kelola kategori dan pertanyaan langsung di setiap kartu kategori.
					</p>
				</div>
				<div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
					<button
						@click="
							router.push({
								name: 'admin-likert-submissions',
								params: { slug: likertSlug },
							})
						"
						class="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer"
					>
						<font-awesome-icon
							icon="fa-solid fa-right-to-bracket"
							class="w-4 h-4 shrink-0"
						/>
						Lihat Submissions
					</button>
				</div>
			</div>
		</div>

		<!-- Panduan Penilaian Skala Likert -->
		<div
			class="bg-surface border border-border rounded-xl overflow-hidden mb-4 md:mb-6"
		>
			<button
				@click="showGuide = !showGuide"
				class="w-full px-4 md:px-5 py-3 md:py-4 flex items-center justify-between gap-3 hover:bg-surface-muted transition-colors cursor-pointer"
			>
				<div class="flex items-center gap-2">
					<font-awesome-icon
						icon="fa-solid fa-circle-info"
						class="w-4 h-4 text-primary shrink-0"
					/>
					<span class="text-sm font-medium text-text-primary"
						>Cara Penilaian Skala Likert</span
					>
				</div>
				<font-awesome-icon
					icon="fa-solid fa-chevron-down"
					class="w-4 h-4 text-text-muted shrink-0 transition-transform"
					:class="{ 'rotate-180': showGuide }"
				/>
			</button>

			<div
				v-if="showGuide"
				class="px-4 md:px-5 pb-4 md:pb-5 border-t border-border pt-4 space-y-4"
			>
				<div>
					<p class="text-sm text-text-secondary mb-2">
						Setiap soal dijawab responden dengan salah satu dari 4 pilihan
						berikut:
					</p>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
						<div class="bg-surface-muted rounded-lg px-3 py-2 text-center">
							<p class="text-xs text-text-muted">Sangat Setuju</p>
							<p class="text-sm font-semibold text-text-primary">SS</p>
						</div>
						<div class="bg-surface-muted rounded-lg px-3 py-2 text-center">
							<p class="text-xs text-text-muted">Setuju</p>
							<p class="text-sm font-semibold text-text-primary">S</p>
						</div>
						<div class="bg-surface-muted rounded-lg px-3 py-2 text-center">
							<p class="text-xs text-text-muted">Tidak Setuju</p>
							<p class="text-sm font-semibold text-text-primary">TS</p>
						</div>
						<div class="bg-surface-muted rounded-lg px-3 py-2 text-center">
							<p class="text-xs text-text-muted">Sangat Tidak Setuju</p>
							<p class="text-sm font-semibold text-text-primary">STS</p>
						</div>
					</div>
				</div>

				<div>
					<p class="text-sm text-text-secondary mb-2">
						Nilai tiap pilihan tergantung jenis soal —
						<strong class="text-text-primary">Favorable</strong> atau
						<strong class="text-text-primary">Unfavorable</strong>:
					</p>
					<div class="overflow-x-auto">
						<table class="w-full text-left border-collapse text-sm">
							<thead>
								<tr class="border-b border-border">
									<th
										class="py-2 pr-4 text-xs font-medium uppercase tracking-wider text-text-muted"
									>
										Jenis Soal
									</th>
									<th
										class="py-2 px-2 text-xs font-medium uppercase tracking-wider text-text-muted text-center"
									>
										SS
									</th>
									<th
										class="py-2 px-2 text-xs font-medium uppercase tracking-wider text-text-muted text-center"
									>
										S
									</th>
									<th
										class="py-2 px-2 text-xs font-medium uppercase tracking-wider text-text-muted text-center"
									>
										TS
									</th>
									<th
										class="py-2 pl-2 text-xs font-medium uppercase tracking-wider text-text-muted text-center"
									>
										STS
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								<tr>
									<td class="py-2 pr-4">
										<span
											class="text-xs px-2 py-1 rounded-full font-medium bg-success-soft text-success"
											>Favorable</span
										>
									</td>
									<td class="py-2 px-2 text-center text-table-value-text">4</td>
									<td class="py-2 px-2 text-center text-table-value-text">3</td>
									<td class="py-2 px-2 text-center text-table-value-text">2</td>
									<td class="py-2 pl-2 text-center text-table-value-text">1</td>
								</tr>
								<tr>
									<td class="py-2 pr-4">
										<span
											class="text-xs px-2 py-1 rounded-full font-medium bg-danger-soft text-danger"
											>Unfavorable</span
										>
									</td>
									<td class="py-2 px-2 text-center text-table-value-text">1</td>
									<td class="py-2 px-2 text-center text-table-value-text">2</td>
									<td class="py-2 px-2 text-center text-table-value-text">3</td>
									<td class="py-2 pl-2 text-center text-table-value-text">4</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p class="text-xs text-text-muted mt-2">
						Favorable dipakai untuk soal yang searah dengan hal yang diukur,
						Unfavorable untuk soal yang berlawanan arah — nilainya sengaja
						dibalik supaya skor akhir tetap konsisten.
					</p>
				</div>

				<div
					class="bg-primary-soft/50 border border-primary/20 rounded-lg px-3 py-2.5"
				>
					<p class="text-xs text-text-secondary">
						<font-awesome-icon
							icon="fa-solid fa-lightbulb"
							class="w-3.5 h-3.5 text-primary mr-1"
						/>
						Total skor dari semua jawaban responden dicocokkan ke rentang pada
						tabel
						<strong class="text-text-primary">"Skala Penilaian"</strong> di
						bawah untuk menentukan interpretasi akhir (misal: Sangat Tinggi,
						Tinggi, dst).
					</p>
				</div>
			</div>
		</div>

		<!-- Card Skala Penilaian (read-only) -->
		<div
			class="bg-surface border border-black-secondary rounded-xl overflow-hidden mb-4 md:mb-6"
		>
			<div
				class="px-4 md:px-5 py-3 md:py-4 border-b bg-primary border-black-secondary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
			>
				<h2 class="text-sm font-medium text-white">Skala Penilaian</h2>
				<button
					@click="
						router.push({
							name: 'admin-likert-scales',
							params: { slug: likertSlug },
						})
					"
					class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white border border-border rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap cursor-pointer"
				>
					<font-awesome-icon
						icon="fa-solid fa-gear"
						class="w-3.5 h-3.5 shrink-0"
					/>
					Kelola Skala
				</button>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse table-fixed">
					<thead class="border-b border-black-secondary">
						<tr>
							<th
								class="w-[25%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
							>
								Rentang
							</th>
							<th
								class="w-[35%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
							>
								Label
							</th>
							<th
								class="w-[40%] px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider"
							>
								Deskripsi
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						<tr v-for="s in scales" :key="s.id">
							<td class="px-4 md:px-5 py-3 text-sm text-table-value-text">
								{{ s.min }} – {{ s.max }}
							</td>
							<td class="px-4 md:px-5 py-3 text-sm text-table-value-text">
								{{ s.label }}
							</td>
							<td class="px-4 md:px-5 py-3 text-sm text-table-value-text">
								{{ s.description }}
							</td>
						</tr>

						<!-- Empty state -->
						<tr v-if="scales.length === 0">
							<td
								colspan="3"
								class="px-4 md:px-5 py-6 text-center text-sm text-text-muted"
							>
								Belum ada skala penilaian.
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Loading -->
		<div
			v-if="catLoading"
			class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center"
		>
			<p class="text-sm text-text-muted">Memuat data kategori...</p>
		</div>

		<!-- Daftar Kategori -->
		<div v-else class="space-y-4 md:space-y-6">
			<div v-for="cat in categories" :key="cat.id" class="table-content">
				<!-- Category Header (style skala) -->
				<div
					class="table-header px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
				>
					<h2 class="text-sm font-medium text-white">{{ cat.name }}</h2>
					<div class="flex items-center gap-2 shrink-0">
						<span
							class="text-xs font-medium text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/20"
						>
							{{ cat.questions?.length ?? 0 }} Soal
						</span>
						<button
							@click="openEditCategory(cat)"
							class="p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
							title="Ubah nama kategori"
						>
							<font-awesome-icon icon="fa-solid fa-pen" class="w-4 h-4" />
						</button>
						<button
							@click="openDeleteCategoryModal(cat)"
							class="p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
							title="Hapus kategori"
						>
							<font-awesome-icon icon="fa-solid fa-trash" class="w-4 h-4" />
						</button>
					</div>
				</div>

				<!-- Tabel Soal -->
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
							<tr v-for="(q, index) in cat.questions || []" :key="q.id">
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
											@click="openEditQuestion(cat, q)"
											class="p-2.5 md:p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors h-10 w-10 md:h-auto md:w-auto flex items-center justify-center cursor-pointer"
											title="Edit"
										>
											<font-awesome-icon
												icon="fa-solid fa-pen"
												class="w-5 h-5 shrink-0"
											/>
										</button>
										<button
											@click="deleteQuestionItem(cat, q)"
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
							<tr v-if="(cat.questions?.length ?? 0) === 0">
								<td colspan="4" class="text-center py-6 text-text-muted">
									Belum ada soal untuk kategori ini.
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Inline Add/Edit Soal -->
				<div class="border-t border-border">
					<div
						v-if="showQuestionForm && activeCategoryId === cat.id"
						class="px-4 md:px-5 py-4 bg-table-value"
					>
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
									:disabled="!questionForm.question.trim() || savingQuestion"
									class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed whitespace-nowrap h-10 cursor-pointer"
								>
									{{ savingQuestion ? "Menyimpan..." : "Simpan" }}
								</button>
								<button
									@click="closeQuestionForm"
									class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
								>
									Batal
								</button>
							</div>
						</div>
					</div>

					<button
						v-else
						@click="openAddQuestion(cat)"
						class="w-full px-4 md:px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2 h-10 cursor-pointer"
					>
						<font-awesome-icon
							icon="fa-solid fa-plus"
							class="h-4 w-4 shrink-0"
						/>
						Tambah Soal
					</button>
				</div>
			</div>

			<!-- Inline Add/Edit Kategori -->
			<div class="table-content">
				<div v-if="showCategoryForm" class="px-4 md:px-5 py-4 bg-table-value">
					<p class="text-sm font-medium text-text-primary mb-3">
						{{ categoryForm.id ? "Edit Kategori" : "Tambah Kategori" }}
					</p>
					<div class="flex flex-col sm:flex-row items-start gap-3">
						<input
							v-model="categoryForm.name"
							type="text"
							class="w-full sm:flex-1 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
							placeholder="Nama kategori, cth: Kemampuan Analitis"
							@keyup.enter="saveCategory"
						/>
						<select
							v-model.number="categoryForm.order"
							class="w-full sm:w-40 px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
						>
							<option v-for="pos in orderOptions" :key="pos" :value="pos">
								Posisi {{ pos + 1 }}
							</option>
						</select>

						<div
							class="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto"
						>
							<button
								@click="saveCategory"
								:disabled="!categoryForm.name.trim() || savingCategory"
								class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed whitespace-nowrap h-10 cursor-pointer"
							>
								{{ savingCategory ? "Menyimpan..." : "Simpan" }}
							</button>
							<button
								@click="closeCategoryForm"
								class="flex-1 sm:flex-none px-4 py-2.5 md:py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors h-10 cursor-pointer"
							>
								Batal
							</button>
						</div>
					</div>
				</div>

				<button
					v-else
					@click="openAddCategory"
					class="w-full px-4 md:px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors flex items-center justify-center gap-2 h-10 cursor-pointer"
				>
					<font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 shrink-0" />
					Tambah Kategori
				</button>
			</div>
		</div>

		<!-- Modal Hapus Kategori -->
		<ConfirmDeleteModal
			:show="showDeleteCategoryModal"
			:title="deleteCategoryTitle"
			:loading="savingCategory"
			confirmText="Hapus Kategori & Isinya"
			@confirm="confirmDeleteCategory"
			@cancel="closeDeleteCategoryModal"
		>
			Semua pertanyaan di dalam kategori ini (<strong
				>{{ deletingCategory?.questions?.length ?? 0 }} soal</strong
			>) akan ikut terhapus permanen. Tindakan ini tidak dapat dibatalkan.
		</ConfirmDeleteModal>

		<!-- Modal Hapus Soal -->
		<ConfirmDeleteModal
			:show="showDeleteQuestionModal"
			title="Hapus Soal"
			:loading="savingQuestion"
			@confirm="confirmDeleteQuestion"
			@cancel="showDeleteQuestionModal = false"
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
const likertId = ref(null);

const likertStore = useLikertStore();
const categoryStore = useLikertCategoriesStore();
const likertQuestionsStore = useLikertQuestionsStore();

const { currentLikert } = storeToRefs(likertStore);
const { categories, loading: catLoading } = storeToRefs(categoryStore);

// ── State ──────────────────────────────────────────────────

const showGuide = ref(false);

// Category inline form (tambah/edit nama)
const showCategoryForm = ref(false);
const savingCategory = ref(false);
const categoryForm = ref({ id: null, name: "", order: 0 });

// Delete category modal
const showDeleteCategoryModal = ref(false);
const deletingCategory = ref(null);
const deleteCategoryTitle = computed(() =>
	deletingCategory.value
		? `Hapus Kategori "${deletingCategory.value.name}"`
		: "Hapus Kategori",
);

// Question inline form (tambah/edit soal)
const showQuestionForm = ref(false);
const savingQuestion = ref(false);
const questionForm = ref({ question: "", favorable: "favorable" });
const editingQuestionId = ref(null);
const activeCategoryId = ref(null);

// Delete question modal
const showDeleteQuestionModal = ref(false);
const deletingQuestionId = ref(null);
const deletingCategoryId = ref(null);

// ── Scale State (read-only) ────────────────────────────────

const scales = ref([]);

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {
	const likert = await likertStore.getLikertBySlug(likertSlug);
	if (!likert) {
		router.push({ name: "admin-likert" });
		return;
	}

	likertId.value = likert.id;

	// Fetch categories (subcollection) — questions otomatis termuat di field questions tiap kategori
	await categoryStore.fetchCategories(likertId.value);
	await fetchScales();
});

// ── Category CRUD ──────────────────────────────────────────

// jumlah opsi beda buat tambah vs edit:
// - tambah: 0..N (N = jumlah kategori existing, boleh nyisip di paling akhir)
// - edit: 0..N-1 (N = jumlah kategori existing termasuk dirinya sendiri)
const orderOptions = computed(() => {
	const count = categories.value.length;
	const max = categoryForm.value.id ? count - 1 : count;
	return Array.from({ length: max + 1 }, (_, i) => i);
});

const openAddCategory = () => {
	categoryForm.value = { id: null, name: "", order: categories.value.length };
	showCategoryForm.value = true;
};

const openEditCategory = (cat) => {
	categoryForm.value = { id: cat.id, name: cat.name, order: cat.order ?? 0 };
	showCategoryForm.value = true;
};

const closeCategoryForm = () => {
	showCategoryForm.value = false;
	categoryForm.value = { id: null, name: "", order: 0 };
};

const saveCategory = async () => {
	if (!categoryForm.value.name.trim()) return;
	savingCategory.value = true;
	try {
		if (categoryForm.value.id) {
			await categoryStore.updateCategory(
				likertId.value,
				categoryForm.value.id,
				{
					name: categoryForm.value.name.trim(),
					order: categoryForm.value.order,
				},
			);
		} else {
			await categoryStore.addCategory(likertId.value, {
				name: categoryForm.value.name.trim(),
				order: categoryForm.value.order,
			});
		}
		closeCategoryForm();
	} catch (e) {
		console.error(e);
	} finally {
		savingCategory.value = false;
	}
};

const openDeleteCategoryModal = (cat) => {
	deletingCategory.value = cat;
	showDeleteCategoryModal.value = true;
};

const closeDeleteCategoryModal = () => {
	showDeleteCategoryModal.value = false;
	deletingCategory.value = null;
};

const confirmDeleteCategory = async () => {
	savingCategory.value = true;
	try {
		await categoryStore.deleteCategory(
			likertId.value,
			deletingCategory.value.id,
		);
		closeDeleteCategoryModal();
	} catch (e) {
		console.error(e);
	} finally {
		savingCategory.value = false;
	}
};

// ── Question CRUD ──────────────────────────────────────────

const openAddQuestion = (cat) => {
	activeCategoryId.value = cat.id;
	editingQuestionId.value = null;
	questionForm.value = { question: "", favorable: "favorable" };
	showQuestionForm.value = true;
};

const openEditQuestion = (cat, q) => {
	activeCategoryId.value = cat.id;
	editingQuestionId.value = q.id;
	questionForm.value = {
		question: q.question,
		favorable: q.favorable,
	};
	showQuestionForm.value = true;
};

const closeQuestionForm = () => {
	showQuestionForm.value = false;
	activeCategoryId.value = null;
	editingQuestionId.value = null;
	questionForm.value = { question: "", favorable: "favorable" };
};

const saveQuestion = async () => {
	if (!questionForm.value.question.trim()) return;
	savingQuestion.value = true;
	try {
		if (editingQuestionId.value) {
			await likertQuestionsStore.updateQuestion(
				likertId.value,
				activeCategoryId.value,
				editingQuestionId.value,
				{
					question: questionForm.value.question.trim(),
					favorable: questionForm.value.favorable,
				},
			);
		} else {
			await likertQuestionsStore.addQuestion(
				likertId.value,
				activeCategoryId.value,
				{
					question: questionForm.value.question.trim(),
					favorable: questionForm.value.favorable,
				},
			);
		}
		closeQuestionForm();
		await categoryStore.fetchCategories(likertId.value);
	} catch (e) {
		console.error(e);
	} finally {
		savingQuestion.value = false;
	}
};

const deleteQuestionItem = (cat, q) => {
	deletingCategoryId.value = cat.id;
	deletingQuestionId.value = q.id;
	showDeleteQuestionModal.value = true;
};

const confirmDeleteQuestion = async () => {
	savingQuestion.value = true;
	try {
		await likertQuestionsStore.deleteQuestion(
			likertId.value,
			deletingCategoryId.value,
			deletingQuestionId.value,
		);
		showDeleteQuestionModal.value = false;
		deletingQuestionId.value = null;
		deletingCategoryId.value = null;
		await categoryStore.fetchCategories(likertId.value);
	} catch (e) {
		console.error(e);
	} finally {
		savingQuestion.value = false;
	}
};

// ── Scale (read-only) ──────────────────────────────────────

const fetchScales = async () => {
	try {
		const data = await likertStore.fetchLikertScales(likertId.value, false);
		scales.value = data;
	} catch (e) {
		console.error(e);
		scales.value = [];
	}
};
</script>
