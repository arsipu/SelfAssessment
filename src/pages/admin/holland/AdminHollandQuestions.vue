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
					<p class="text-xs text-text-muted mt-1">
						Kelola pertanyaan di setiap kolom RIASEC.
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
							@click="openAddColumnModal(cat.id)"
							class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white border border-border rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
							title="Tambah kolom baru"
						>
							<font-awesome-icon
								icon="fa-solid fa-table-columns"
								class="w-3.5 h-3.5 shrink-0"
							/>
							Tambah Kolom
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

				<!-- Tabel per Kolom (card → table) -->
				<div v-if="columnsFor(cat.id).length > 0" class="space-y-3 p-3 md:p-4">
					<div
						v-for="col in columnsFor(cat.id)"
						:key="col.id"
						class="border border-border rounded-lg overflow-hidden"
					>
						<!-- Sub-header Kolom -->
						<div
							class="px-4 md:px-5 py-2.5 bg-primary-soft flex items-center justify-between gap-3 border-b border-border"
						>
							<span
								class="min-w-0 text-xs md:text-sm font-medium text-text-primary whitespace-normal break-words"
							>
								{{ col.name }}
							</span>
							<div class="flex items-center gap-1 shrink-0">
								<button
									@click="openEditColumnModal(cat.id, col)"
									class="p-1.5 rounded-md text-text-secondary hover:text-primary transition-colors cursor-pointer"
									title="Ubah nama / urutan kolom"
								>
									<font-awesome-icon
										icon="fa-solid fa-pen"
										class="w-3.5 h-3.5"
									/>
								</button>
								<button
									@click="openDeleteColumnModal(cat.id, col)"
									class="p-1.5 rounded-md text-danger hover:bg-danger-soft transition-colors cursor-pointer"
									title="Hapus kolom"
								>
									<font-awesome-icon
										icon="fa-solid fa-trash"
										class="w-3.5 h-3.5"
									/>
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
									<tr
										v-for="(q, index) in questionsByRiasecAndColumn(
											cat.id,
											col.id,
										)"
										:key="q.id"
									>
										<td class="px-4 md:px-5 py-3 text-sm text-table-value-text">
											{{ index + 1 }}
										</td>
										<td class="px-4 md:px-5 py-3 text-sm text-table-value-text">
											{{ q.question }}
										</td>
										<td class="px-4 md:px-5 py-3 text-sm">
											<div class="flex items-center gap-2">
												<button
													@click="openEditModal(q, cat.id, col.id)"
													class="p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors cursor-pointer"
													title="Edit Pernyataan"
												>
													<font-awesome-icon
														icon="fa-solid fa-pen"
														class="w-4 h-4"
													/>
												</button>
												<button
													@click="openDeleteModal(q.id, cat.id, col.id)"
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
									<tr
										v-if="
											questionsByRiasecAndColumn(cat.id, col.id).length === 0
										"
									>
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
							v-if="activeAddKey === keyOf(cat.id, col.id)"
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
									@keyup.enter="saveInline(cat.id, col.id)"
								/>
								<div class="flex items-center gap-2 shrink-0">
									<button
										@click="saveInline(cat.id, col.id)"
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
								@click="openInlineAdd(cat.id, col.id)"
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
				<div
					v-if="columnsFor(cat.id).length === 0"
					class="px-5 py-6 text-center"
				>
					<p class="text-xs text-text-muted mb-3">
						Kategori ini belum punya kolom pernyataan.
					</p>
					<button
						@click="openAddColumnModal(cat.id)"
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
							:value="
								riasecList.find((c) => c.id === editRiasecId)?.label ||
								editRiasecId
							"
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
							<option
								v-for="col in columnsFor(editRiasecId)"
								:key="col.id"
								:value="col.id"
							>
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
						<strong>{{ maxColumnsAlertRiasecLabel }}</strong> sudah memiliki 4
						kolom. Maksimal kolom per kategori adalah 4.
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
				>{{
					questionsByRiasecAndColumn(deleteColumnRiasecId, deletingColumn?.id)
						.length
				}}
				soal</strong
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

const saving = ref(false);

// Inline add — key gabungan riasecId+columnId biar cuma 1 form aktif dalam satu waktu
const activeAddKey = ref(null);
const inlineForm = ref({ question: "" });
const keyOf = (riasecId, columnId) => `${riasecId}__${columnId}`;

// Edit modal soal — store riasecId separately
const showEditModal = ref(false);
const editingId = ref(null);
const editRiasecId = ref(null);
const editOriginalColumnId = ref(null);
const editForm = ref({ question: "", columnId: "" });

// Delete modal soal
const showDeleteModal = ref(false);
const deletingId = ref(null);
const deleteRiasecId = ref(null);
const deleteColumnIdForQuestion = ref(null);

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

// Alert batasan maksimal 4 kolom
const showMaxColumnsAlert = ref(false);
const maxColumnsAlertRiasecLabel = ref("");

// Modal tambah / edit kolom
const showColumnModal = ref(false);
const savingColumn = ref(false);
const columnModalRiasecId = ref(null);
const columnForm = ref({ id: null, name: "", order: 0 });

// Modal hapus kolom
const showDeleteColumnModal = ref(false);
const deleteColumnRiasecId = ref(null);
const deletingColumn = ref(null);
const deleteColumnTitle = computed(() =>
	deletingColumn.value
		? `Hapus Kolom "${deletingColumn.value.name}"`
		: "Hapus Kolom",
);

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

// jumlah opsi beda buat tambah vs edit:
// - tambah: 0..N (N = jumlah existing, boleh nyisip di paling akhir juga)
// - edit: 0..N-1 (N = jumlah existing termasuk dirinya sendiri)
const orderOptions = computed(() => {
	const count = columnsFor(columnModalRiasecId.value).length;
	const max = columnForm.value.id ? count - 1 : count;
	return Array.from({ length: max + 1 }, (_, i) => i);
});

// Konversi array <-> textarea (1 baris = 1 item), buang baris kosong saat parsing
const arrayToText = (arr) => (arr || []).join("\n");
const textToArray = (text) =>
	text
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean);

// ── Inline Add Soal ────────────────────────────────────────

const openInlineAdd = (riasecId, columnId) => {
	activeAddKey.value = keyOf(riasecId, columnId);
	inlineForm.value = { question: "" };
};

const cancelInline = () => {
	activeAddKey.value = null;
	inlineForm.value = { question: "" };
};

const saveInline = async (riasecId, columnId) => {
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

const openEditModal = (q, riasecId, columnId) => {
	editingId.value = q.id;
	editRiasecId.value = riasecId;
	editOriginalColumnId.value = columnId;
	editForm.value = { question: q.question, columnId };
	showEditModal.value = true;
};

const closeEditModal = () => {
	showEditModal.value = false;
	editingId.value = null;
	editRiasecId.value = null;
	editOriginalColumnId.value = null;
	editForm.value = { question: "", columnId: "" };
};

const saveEdit = async () => {
	if (!editForm.value.question.trim()) return;
	saving.value = true;
	try {
		await questionsStore.updateQuestion(
			hollandId.value,
			editRiasecId.value,
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

// ── Delete Modal Soal ──────────────────────────────────────

// Buka modal hapus soal
const openDeleteModal = (id, riasecId, columnId) => {
	deletingId.value = id;
	deleteRiasecId.value = riasecId;
	deleteColumnIdForQuestion.value = columnId;
	showDeleteModal.value = true;
};

// Tutup modal hapus soal
const confirmDelete = async () => {
	saving.value = true;
	try {
		await questionsStore.deleteQuestion(
			hollandId.value,
			deleteRiasecId.value,
			deleteColumnIdForQuestion.value,
			deletingId.value,
		);
		showDeleteModal.value = false;
		deletingId.value = null;
		deleteRiasecId.value = null;
		deleteColumnIdForQuestion.value = null;
	} catch (e) {
		console.error(e);
	} finally {
		saving.value = false;
	}
};

// ── Tambah / Edit Kolom ──────────────────────────────────────

// Tambah kolom baru, batasi maksimal 4 kolom per kategori
const openAddColumnModal = (riasecId) => {
	const existing = columnsFor(riasecId);
	// Batasi maksimal 4 kolom per kategori
	if (existing.length >= 4) {
		const cat = riasecList.value.find((c) => c.id === riasecId);
		maxColumnsAlertRiasecLabel.value = cat?.label || riasecId;
		showMaxColumnsAlert.value = true;
		return;
	}
	columnModalRiasecId.value = riasecId;
	const nextOrder = existing.length
		? Math.max(...existing.map((c) => c.order ?? 0)) + 1
		: 0;
	columnForm.value = { id: null, name: "", order: nextOrder };
	showColumnModal.value = true;
};

// Edit kolom yang sudah ada
const openEditColumnModal = (riasecId, col) => {
	columnModalRiasecId.value = riasecId;
	columnForm.value = { id: col.id, name: col.name, order: col.order ?? 0 };
	showColumnModal.value = true;
};

// Tutup modal tambah / edit kolom
const closeColumnModal = () => {
	showColumnModal.value = false;
	columnModalRiasecId.value = null;
	columnForm.value = { id: null, name: "", order: 0 };
};

// Simpan kolom baru / update kolom lama
const saveColumn = async () => {
	if (!columnForm.value.name.trim()) return;
	savingColumn.value = true;
	try {
		if (columnForm.value.id) {
			await columnsStore.updateColumn(
				hollandId.value,
				columnModalRiasecId.value,
				columnForm.value.id,
				{
					name: columnForm.value.name.trim(),
					order: columnForm.value.order,
				},
			);
		} else {
			await columnsStore.addColumn(hollandId.value, columnModalRiasecId.value, {
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

const openDeleteColumnModal = (riasecId, col) => {
	deleteColumnRiasecId.value = riasecId;
	deletingColumn.value = col;
	showDeleteColumnModal.value = true;
};

const closeDeleteColumnModal = () => {
	showDeleteColumnModal.value = false;
	deleteColumnRiasecId.value = null;
	deletingColumn.value = null;
};

const confirmDeleteColumn = async () => {
	savingColumn.value = true;
	try {
		// Hapus semua soal di kolom ini dulu (sekarang tinggal set array questions jadi [])
		await questionsStore.deleteAllQuestionsInColumn(
			hollandId.value,
			deleteColumnRiasecId.value,
			deletingColumn.value.id,
		);
		await columnsStore.deleteColumn(
			hollandId.value,
			deleteColumnRiasecId.value,
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
