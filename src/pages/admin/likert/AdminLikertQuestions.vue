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

		<!-- Tombol Tambah Kategori (di bawah table scale, di atas card kategori) -->
		<div class="flex justify-end mb-4 md:mb-6">
			<button
				@click="openAddCategory"
				class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-muted transition-colors whitespace-nowrap cursor-pointer"
			>
				<font-awesome-icon
					icon="fa-solid fa-plus"
					class="w-3.5 h-3.5 shrink-0"
				/>
				Tambah Kategori
			</button>
		</div>

		<!-- Loading -->
		<div
			v-if="catLoading"
			class="bg-surface border border-border rounded-xl p-8 md:p-12 text-center"
		>
			<p class="text-sm text-text-muted">Memuat data kategori...</p>
		</div>

		<!-- Daftar Kategori (read-only) -->
		<div v-else class="space-y-4 md:space-y-6">
			<div v-for="cat in categories" :key="cat.id" class="table-content">
				<!-- Category Header (style skala) -->
				<div
					class="table-header px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
				>
					<h2 class="text-sm font-medium text-white">{{ cat.name }}</h2>
					<div class="flex items-center gap-2">
						<button
							@click="openEditCategory(cat)"
							class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white border border-border rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
							title="Edit Kategori"
						>
							<font-awesome-icon
								icon="fa-solid fa-pen"
								class="w-3.5 h-3.5 shrink-0"
							/>
							Edit
						</button>
						<button
							@click="deleteCategoryItem(cat)"
							class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white border border-border rounded-lg hover:bg-danger hover:border-danger transition-colors whitespace-nowrap cursor-pointer"
							title="Hapus Kategori"
						>
							<font-awesome-icon
								icon="fa-solid fa-trash"
								class="w-3.5 h-3.5 shrink-0"
							/>
							Hapus
						</button>
						<button
							@click="
								router.push({
									name: 'admin-likert-category-questions',
									params: { slug: likertSlug, categoryId: cat.id },
								})
							"
							class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white border border-border rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
						>
							<font-awesome-icon
								icon="fa-solid fa-gear"
								class="w-3.5 h-3.5 shrink-0"
							/>
							Kelola Kategori
						</button>
					</div>
				</div>

				<!-- Tabel Soal (read-only) -->
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse table-fixed">
						<thead class="border-b border-black-secondary">
							<tr>
								<th class="w-[8%]">No</th>
								<th class="w-[68%]">Pertanyaan</th>
								<th class="w-[24%]">Jenis</th>
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
							</tr>

							<!-- Empty state -->
							<tr v-if="(cat.questions?.length ?? 0) === 0">
								<td colspan="3" class="text-center py-6 text-text-muted">
									Belum ada soal untuk kategori ini.
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Modal Tambah/Edit Kategori -->
		<div
			v-if="showCategoryForm"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
		>
			<div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-auto">
				<div class="p-6">
					<h3 class="text-lg font-semibold text-text-primary">
						{{ editingCategoryId ? "Edit Kategori" : "Tambah Kategori Baru" }}
					</h3>
					<p class="mt-2 text-sm text-text-secondary">
						{{
							editingCategoryId
								? "Ubah nama dan posisi kategori."
								: "Masukkan nama kategori dan pilih posisi penyisipan."
						}}
					</p>

					<div class="mt-4 space-y-4">
						<div>
							<label class="block text-sm font-medium text-text-primary mb-1"
								>Nama Kategori</label
							>
							<input
								v-model="categoryForm.name"
								type="text"
								class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
								placeholder="Nama kategori..."
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-text-primary mb-1"
								>Posisi</label
							>
							<select
								v-model="categoryForm.order"
								class="w-full px-3 py-2.5 md:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-surface"
							>
								<option
									v-for="i in editingCategoryId
										? categories.length
										: categories.length + 1"
									:key="i"
									:value="i - 1"
								>
									Posisi {{ i - 1 }}
								</option>
							</select>
						</div>
					</div>
				</div>
				<div class="px-6 py-4 border-t border-border flex justify-end gap-3">
					<button
						@click="cancelCategoryForm"
						:disabled="savingCategory"
						class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm disabled:opacity-60 cursor-pointer"
					>
						Batal
					</button>
					<button
						@click="saveCategory"
						:disabled="!categoryForm.name.trim() || savingCategory"
						class="px-4 py-2 bg-primary text-text-on-primary rounded-lg hover:bg-primary-hover text-sm disabled:opacity-60 cursor-pointer"
					>
						{{ savingCategory ? "Menyimpan..." : "Simpan" }}
					</button>
				</div>
			</div>
		</div>

		<!-- Modal Konfirmasi Hapus Kategori -->
		<div
			v-if="showDeleteModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
		>
			<div class="bg-surface rounded-xl shadow-xl w-full max-w-md mx-auto">
				<div class="p-6">
					<h3 class="text-lg font-semibold text-text-primary">
						Hapus Kategori
					</h3>
					<p class="mt-2 text-sm text-text-secondary">
						Apakah Anda yakin ingin menghapus kategori
						<strong class="text-text-primary">{{
							deletingCategory?.name
						}}</strong
						>? Semua pertanyaan di dalamnya akan ikut terhapus. Tindakan ini
						tidak dapat dibatalkan.
					</p>
				</div>
				<div class="px-6 py-4 border-t border-border flex justify-end gap-3">
					<button
						@click="showDeleteModal = false"
						:disabled="savingCategory"
						class="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-muted text-sm disabled:opacity-60 cursor-pointer"
					>
						Batal
					</button>
					<button
						@click="confirmDeleteCategory"
						:disabled="savingCategory"
						class="px-4 py-2 bg-danger text-text-on-primary rounded-lg hover:bg-danger-soft text-sm disabled:opacity-60 cursor-pointer"
					>
						{{ savingCategory ? "Menghapus..." : "Hapus" }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLikertStore } from "@/stores/likert/likert";
import { useLikertCategoriesStore } from "@/stores/likert/likert-categories";
import { storeToRefs } from "pinia";

const route = useRoute();
const router = useRouter();
const likertSlug = route.params.slug;
const likertId = ref(null);

const likertStore = useLikertStore();
const categoryStore = useLikertCategoriesStore();

const { currentLikert } = storeToRefs(likertStore);
const { categories, loading: catLoading } = storeToRefs(categoryStore);

// ── State ──────────────────────────────────────────────────

const showGuide = ref(false);

// ── Scale State (read-only) ────────────────────────────────

const scales = ref([]);

// ── Category Add/Edit State ────────────────────────────────

const showCategoryForm = ref(false);
const editingCategoryId = ref(null);
const savingCategory = ref(false);
const categoryForm = ref({ name: "", order: 0 });

const openAddCategory = () => {
	editingCategoryId.value = null;
	resetCategoryForm();
	showCategoryForm.value = true;
};

const openEditCategory = (cat) => {
	editingCategoryId.value = cat.id;
	categoryForm.value = { name: cat.name, order: cat.order ?? 0 };
	showCategoryForm.value = true;
};

const resetCategoryForm = () => {
	categoryForm.value = { name: "", order: categories.value.length };
};

const cancelCategoryForm = () => {
	resetCategoryForm();
	editingCategoryId.value = null;
	showCategoryForm.value = false;
};

const saveCategory = async () => {
	if (!categoryForm.value.name.trim()) return;
	savingCategory.value = true;
	try {
		if (editingCategoryId.value) {
			await categoryStore.updateCategory(
				likertId.value,
				editingCategoryId.value,
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
		cancelCategoryForm();
	} catch (e) {
		console.error(e);
	} finally {
		savingCategory.value = false;
	}
};

// ── Category Delete State ──────────────────────────────────

const showDeleteModal = ref(false);
const deletingCategory = ref(null);

const deleteCategoryItem = (cat) => {
	deletingCategory.value = cat;
	showDeleteModal.value = true;
};

const confirmDeleteCategory = async () => {
	if (!deletingCategory.value) return;
	savingCategory.value = true;
	try {
		await categoryStore.deleteCategory(
			likertId.value,
			deletingCategory.value.id,
		);
		showDeleteModal.value = false;
		deletingCategory.value = null;
	} catch (e) {
		console.error(e);
	} finally {
		savingCategory.value = false;
	}
};

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
