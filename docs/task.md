# 📋 Task — Pindahkan Tombol "Lihat Submissions" ke Sebelah Tombol Informasi

## Tujuan

Memindahkan tombol **"Lihat Submissions"** yang saat ini berada di dalam **Header** (kanan atas) agar berada **di sebelah tombol "Cara Penilaian Skala Likert"** (tombol informasi) pada baris tombol di bawah header.

---

## 1. Kondisi Saat Ini

### 1.1 Tombol "Lihat Submissions" (di Header)

Berada di dalam blok `<!-- Header -->`, pada bagian kanan:

```html
<div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
	<button @click="router.push({ name: 'admin-likert-submissions', ... })">
		<font-awesome-icon icon="fa-solid fa-right-to-bracket" />
		Lihat Submissions
	</button>
</div>
```

- Gaya: **primary** (`bg-primary`, teks `text-text-on-primary`, hover `bg-primary-hover`), ukuran `px-4 py-2.5 md:py-2 text-sm h-10`.

### 2. Tombol "Cara Penilaian Skala Likert" (baris terpisah di bawah header)

- Berada di blok `<!-- Tombol Panduan Penilaian Skala Likert -->`:

```html
<div class="flex justify-end mb-4 md:mb-6">
	<button
		@click="openGuideDialog"
		class="... border border-border rounded-lg ..."
	>
		<font-awesome-icon icon="fa-solid fa-circle-info" />
		Cara Penilaian Skala Likert
	</button>
</div>
```

- Gaya: **outline** (`border border-border`, teks `text-text-secondary`, hover `bg-surface-muted`), ukuran `px-3 py-1.5 text-xs`.

---

## 2. Perubahan pada Template

### 2.1 Hapus tombol "Lihat Submissions" dari Header

- Hapus seluruh `<div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">` yang berisi tombol "Lihat Submissions" dari dalam blok `<!-- Header -->`.
- Setelah dihapus, bagian kanan header menjadi kosong — struktur header tetap utuh (judul + deskripsi di kiri).

### 2.2 Gabungkan kedua tombol dalam satu baris

Ubah blok `<!-- Tombol Panduan Penilaian Skala Likert -->` menjadi satu baris berisi **dua tombol**:

```html
<!-- Tombol Aksi (Submissions + Panduan) -->
<div class="flex flex-wrap justify-end gap-2 mb-4 md:mb-6">
	<!-- Tombol Lihat Submissions (primary) -->
	<button
		@click="router.push({ name: 'admin-likert-submissions', params: { slug: likertSlug } })"
		class="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap h-10 cursor-pointer"
	>
		<font-awesome-icon
			icon="fa-solid fa-right-to-bracket"
			class="w-4 h-4 shrink-0"
		/>
		Lihat Submissions
	</button>

	<!-- Tombol "Cara Penilaian Skala Likert" (outline) -->
	<button
		@click="openGuideDialog"
		class="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-muted transition-colors whitespace-nowrap cursor-pointer"
	>
		<font-awesome-icon
			icon="fa-solid fa-circle-info"
			class="w-3.5 h-3.5 shrink-0"
		/>
		Cara Penilaian Skala Likert
	</button>
</div>
```

Detail:

- Container: `flex flex-wrap justify-end gap-2` — tombol sejajar di kanan, otomatis wrap di layar kecil.
- Tombol "Lihat Submissions" mempertahankan gaya **primary** dan ukuran aslinya (`h-10`, `px-4 py-2.5 md:py-2 text-sm`).
- Tombol "Cara Penilaian Skala Likert" mempertahankan gaya **outline** dan ukurannya (`px-3 py-1.5 text-xs`).
- Urutan: **"Lihat Submissions" di kiri**, **"Cara Penilaian Skala Likert" di kanan** (atau sesuai preferensi).

---

## 3. Perubahan pada Script

- **Tidak ada perubahan** pada `<script setup>`.
- Fungsi `openGuideDialog`, `closeGuideDialog`, `router.push` sudah tersedia dan tetap dipakai.

---

## 4. Catatan Kepatuhan (Code Rule)

- [ ] Murni perubahan UI — tidak menyentuh alur data (Front → Store → Firebase).
- [ ] Tidak ada fungsi baru — tidak perlu JSDoc tambahan.
- [ ] Styling konsisten dengan token tema (`--color-primary`, `--color-border`, `--color-surface-muted`, dll).
- [ ] Responsif: tombol tetap rapi di layar kecil (`flex-wrap`).

---

## 5. File yang Diubah

| File                                              | Perubahan                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/pages/admin/likert/AdminLikertQuestions.vue` | Pindah tombol "Lihat Submissions" dari Header ke baris tombol informasi |
