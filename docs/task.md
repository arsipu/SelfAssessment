# Task: Refactoring Desain AdminHolland agar Selaras dengan AdminLikert

**File yang diubah:** `src/pages/admin/holland/AdminHolland.vue`
**Acuan desain:** `src/pages/admin/likert/AdminLikert.vue`

## Tujuan

Menyelaraskan desain halaman **AdminHolland** (header, tulisan, tombol, tabel, modal, dll.) agar mengikuti pola desain **AdminLikert**, tanpa mengubah logika/fungsionalitas khusus Holland (seperti field "Petunjuk Pengerjaan" dan navigasi ke halaman pertanyaan).

---

## Rencana Perubahan

### 1. Header

**Kondisi saat ini (Holland):**

- Header dibungkus card: `bg-surface border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6`
- Berisi judul, deskripsi, badge jumlah instrumen (`{{ hollands.length }} Instrumen`), dan tombol "Tambah Instrumen" di dalam card.

**Perubahan (mengikuti pola Likert):**

- Sederhanakan header menjadi blok tanpa card: `bg-surface mb-2`
- Hapus badge jumlah instrumen.
- Hapus tombol "Tambah Instrumen" dari dalam header (dipindah ke baris aksi terpisah, lihat poin 2).
- Judul: "Instrumen Holland RIASEC" (tetap, hanya styling disamakan).
- Deskripsi: "Kelola daftar instrumen Holland. Klik instrumen untuk mengelola pertanyaan di dalamnya." (tetap).

### 2. Tombol Aksi "Tambah"

**Kondisi saat ini (Holland):**

- Tombol "Tambah Instrumen" di dalam header card, styling: `bg-primary hover:bg-primary-hover text-text-on-primary px-4 py-2.5 md:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full md:w-auto h-10 cursor-pointer`

**Perubahan (mengikuti pola Likert):**

- Pindahkan tombol ke baris aksi terpisah di atas card tabel, rata kanan:
  ```
  <div class="flex justify-end mb-3">
    <button ...>Tambah</button>
  </div>
  ```
- Ganti teks tombol menjadi **"Tambah"**.
- Ganti styling tombol mengikuti Likert:
  - Class: `inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/80 px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium h-8 md:h-10 cursor-pointer transition-colors active:scale-[0.98]`
  - Ikon `fa-solid fa-plus` tetap.

### 3. Loading State

**Perubahan:**

- Ganti class card loading dari `bg-surface border border-border rounded-xl` menjadi `bg-surface border border-primary-soft rounded-xl`.

### 4. Card Tabel

**Perubahan:**

- Ganti class card tabel dari `bg-surface border border-border rounded-xl overflow-hidden` menjadi `bg-surface border border-black/30 rounded-md overflow-hidden`.

### 5. Header Tabel (`<th>`)

**Perubahan:**

- Ganti class `<th>` dari `px-4 md:px-5 py-3 text-xs font-medium uppercase tracking-wider` menjadi `px-4 md:px-5 py-3 text-xs md:text-sm font-semibold`.
- Terapkan ke semua 5 kolom (No, Nama Instrumen, Deskripsi, Status, Aksi).

### 6. Body Tabel (`<tbody>` & `<tr>`)

**Perubahan:**

- Ganti `divide-y divide-border` menjadi `divide-y divide-black/30`.
- Tambahkan efek hover pada baris: `hover:bg-surface-muted/50 transition-colors` (tetap mempertahankan `cursor-pointer`).

### 7. Ukuran Teks Sel (`<td>`)

**Perubahan:**

- Ganti semua `text-sm` pada sel menjadi `text-xs md:text-sm` (konsisten dengan Likert), termasuk:
  - Kolom No
  - Kolom Nama Instrumen (tombol)
  - Kolom Deskripsi
  - Kolom Status
- Kolom Aksi tetap `text-sm` (mengikuti Likert).

### 8. Empty State

**Perubahan:**

- Teks "Belum ada instrumen Holland." tetap (hanya penyesuaian konteks Holland, bukan disamakan dengan Likert).

### 9. Modal Tambah/Edit

**Kondisi saat ini (Holland):**

- Header modal: `px-6 py-4 border-b border-border`, judul `text-text-primary`, deskripsi modal.
- Body: field Nama, Deskripsi, dan **Petunjuk Pengerjaan** (khusus Holland).
- Footer: `px-6 py-4 border-t border-border bg-surface`, tombol Batal & Simpan.

**Perubahan (mengikuti pola Likert, tetap mempertahankan field Petunjuk Pengerjaan):**

- Header modal: hapus `border-b border-border`, judul ganti `text-text-primary` → `text-black`.
- Label form: ganti `text-text-primary` → `text-black`.
- Input/textarea: ganti `border-border` → `border-black-secondary`.
- Footer modal: hapus `border-t border-border bg-surface`.
- Tombol Batal: tambahkan `active:scale-[0.98]`, ganti `border-border` → `border-black/30`.
- Tombol Simpan: ganti styling menjadi `btn-primary hover:bg-primary-soft/80 rounded-lg transition-colors active:scale-[0.98] disabled:bg-text-muted disabled:cursor-not-allowed cursor-pointer` (mengikuti Likert).
- **Pertahankan** field "Petunjuk Pengerjaan" beserta teks bantuannya (khusus Holland, tidak ada di Likert).

### 10. Modal Hapus

**Perubahan:**

- Teks konfirmasi disesuaikan agar tetap konteks Holland: "termasuk kategori RIASEC, pertanyaan, kolom, dan submission" (tetap, hanya penyesuaian konteks).

### 11. Script (`<script setup>`)

**Catatan:**

- Tidak ada perubahan logika utama.
- Opsional: samakan gaya penulisan (indentasi tab, tanda kutip ganda) mengikuti Likert, namun tidak wajib karena tidak memengaruhi desain.
- **Pertahankan** logika khusus Holland:
  - Field `direction` pada form.
  - `saveForm` tidak otomatis navigasi ke halaman pertanyaan (berbeda dengan Likert yang memanggil `goToQuestions(doc)` setelah tambah). **Keputusan:** ikuti perilaku Holland saat ini (tidak navigasi otomatis) kecuali diminta lain.

---

## Langkah Implementasi

1. Edit `src/pages/admin/holland/AdminHolland.vue`:
   - Sederhanakan header (hapus card, badge, dan tombol dari dalam header).
   - Tambahkan baris aksi "Tambah" terpisah di atas card tabel (rata kanan).
   - Sesuaikan styling loading, card tabel, header tabel, body tabel, dan ukuran teks sel.
   - Sesuaikan styling modal tambah/edit (header, label, input, footer, tombol) tanpa menghapus field "Petunjuk Pengerjaan".
2. Verifikasi hasil di browser (mode admin, halaman Instrumen Holland).

---

## Catatan

- Perubahan bersifat tata letak (layout) dan styling saja.
- Logika CRUD, status dropdown, dan navigasi ke halaman pertanyaan tidak diubah.
- Field "Petunjuk Pengerjaan" (khusus Holland) tetap dipertahankan.
