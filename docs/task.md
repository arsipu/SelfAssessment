# 📋 Task — Ubah "Panduan Penilaian Skala Likert" menjadi Tombol + Dialog

## Tujuan

Mengubah bagian **"Cara Penilaian Skala Likert"** di `src/pages/admin/likert/AdminLikertQuestions.vue` dari **accordion (expand/collapse)** menjadi **tombol yang membuka dialog (modal)** saat diklik.

---

## 1. Perubahan pada Template

### 1.1 Hapus accordion lama

Hapus seluruh blok `<!-- Panduan Penilaian Skala Likert -->` yang saat ini berupa:

- `<button @click="showGuide = !showGuide">` (toggle expand/collapse)
- `<div v-if="showGuide">` berisi konten panduan (4 pilihan jawaban, tabel Favorable/Unfavorable, kotak tips)

### 1.2 Tambah tombol pembuka dialog

Tambahkan tombol baru (ditempatkan di area yang sama, misal di bawah header / di atas card "Skala Penilaian") dengan gaya **outline** mengikuti Theme Guide:

- Ikon `fa-solid fa-circle-info`
- Teks: **"Cara Penilaian Skala Likert"**
- `@click="showGuideDialog = true"`
- Styling: `border border-border rounded-lg hover:bg-surface-muted` (konsisten dengan tombol "Tambah Kategori" yang sudah ada)

### 1.3 Tambah dialog (modal) panduan

Tambahkan modal baru mengikuti **pola modal yang sudah ada** di file ini (Modal Tambah/Edit Kategori & Modal Konfirmasi Hapus):

```html
<div
	v-if="showGuideDialog"
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
>
	<div class="bg-surface rounded-xl shadow-xl w-full max-w-2xl mx-auto">
		<!-- Header modal: judul + tombol tutup (X) -->
		<!-- Body modal: isi panduan (dipindahkan dari accordion lama) -->
		<!-- Footer modal: tombol "Tutup" -->
	</div>
</div>
```

Detail modal:

- **Header**: judul "Cara Penilaian Skala Likert" + ikon `fa-circle-info`, tombol tutup (X) di kanan.
- **Body**: pindahkan seluruh konten panduan dari accordion lama:
  - 4 pilihan jawaban (SS, S, TS, STS) — grid 4 kolom
  - Tabel nilai Favorable / Unfavorable
  - Kotak tips (total skor → Skala Penilaian)
- **Footer**: tombol **"Tutup"** (`@click="showGuideDialog = false"`).
- Ukuran modal lebih lebar (`max-w-2xl`) karena berisi tabel.

---

## 2. Perubahan pada Script

### 2.1 Ganti state

- Hapus: `const showGuide = ref(false);`
- Tambah: `const showGuideDialog = ref(false);`

### 2.2 (Opsional) Fungsi pembuka/tutup

Jika ingin lebih rapi, tambahkan fungsi dengan JSDoc sesuai Code Rule:

```js
/**
 * Membuka dialog panduan penilaian skala likert.
 *
 * @returns {void}
 */
const openGuideDialog = () => {
	showGuideDialog.value = true;
};

/**
 * Menutup dialog panduan penilaian skala likert.
 *
 * @returns {void}
 */
const closeGuideDialog = () => {
	showGuideDialog.value = false;
};
```

---

## 3. Catatan Kepatuhan (Code Rule)

- [ ] Tidak ada perubahan pada alur data (Front → Store → Firebase) — murni perubahan UI.
- [ ] Fungsi baru (jika ada) wajib punya JSDoc (`@param` / `@returns`).
- [ ] Gunakan komentar section `// ── Guide Dialog State ──` untuk state baru.
- [ ] Styling modal konsisten dengan modal lain di file (token `--color-surface`, `--color-border`, `--color-primary`, dll).
- [ ] Tombol tutup & klik di luar modal (overlay) menutup dialog.

---

## 4. File yang Diubah

| File                                              | Perubahan                                       |
| ------------------------------------------------- | ----------------------------------------------- |
| `src/pages/admin/likert/AdminLikertQuestions.vue` | Hapus accordion, tambah tombol + dialog panduan |
