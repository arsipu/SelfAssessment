# Task: Ubah Edit Skala dari Modal ke Inline Form

## Tujuan

Mengubah mekanisme **edit skala** pada halaman `src/pages/admin/likert/AdminLikertScales.vue` dari **modal dialog** menjadi **inline form**, dengan pola yang sama persis seperti saat menambahkan skala (inline form di bagian bawah tabel).

---

## Kondisi Saat Ini

| Aksi   | Mekanisme                                                         |
| ------ | ----------------------------------------------------------------- |
| Tambah | Inline form di bawah tabel (`showAddScaleForm`)                   |
| Edit   | Modal dialog (`showEditScaleModal`)                               |
| Hapus  | Modal konfirmasi (`ConfirmDeleteModal`) — **tetap dipertahankan** |

---

## Rencana Perubahan

### 1. Hapus Modal Edit Skala

- Hapus seluruh blok template **Modal Edit Skala** (`v-if="showEditScaleModal"` ... sampai penutupnya).
- Hapus state `showEditScaleModal` pada `<script setup>`.

### 2. Gunakan Satu Inline Form untuk Tambah & Edit

- **Satu** form inline di bawah tabel yang dipakai untuk dua mode: tambah & edit.
- Form ini sudah ada (blok `showAddScaleForm`). Yang perlu ditambah:
  - **Judul/indikator mode**: tampilkan teks kecil seperti `"Edit Skala"` atau `"Tambah Skala"` di atas form agar jelas mode aktif.
  - **Tombol aksi** tetap sama: `Simpan` & `Batal`.

### 3. Ubah Logika `editScaleItem`

Saat tombol edit diklik:

1. Isi `scaleForm` dengan data baris yang diedit (`score`, `min`, `max`, `description`).
2. Set `editingScaleId` ke `s.id`.
3. Set `showAddScaleForm = true` (tampilkan inline form).
4. **Hapus** `showEditScaleModal.value = true`.

### 4. Ubah Logika `saveScale`

- Saat `editingScaleId` terisi → lakukan update, lalu **tutup inline form** (`showAddScaleForm = false`).
- Saat `editingScaleId` kosong → tambah data baru, lalu tutup inline form.
- Hapus baris `showEditScaleModal.value = false`.

### 5. Ubah Logika `cancelScaleEdit`

- Fungsi ini tidak lagi menutup modal, melainkan:
  - `resetScaleForm()`
  - `showAddScaleForm = false`

### 6. Perilaku Tombol "Tambah Skala"

- Jika sedang dalam mode edit, tombol `Tambah Skala` (yang muncul saat form tertutup) tetap berfungsi normal: reset form lalu tampilkan form dalam mode tambah.

---

## Ringkasan Perubahan Kode

| Bagian                             | Perubahan                                        |
| ---------------------------------- | ------------------------------------------------ |
| Template: Modal Edit               | Dihapus                                          |
| Template: Inline form              | Ditambah indikator mode (Tambah/Edit)            |
| `showEditScaleModal`               | Dihapus                                          |
| `editScaleItem`                    | Isi form + tampilkan inline form, tanpa modal    |
| `saveScale`                        | Tutup inline form setelah simpan (tambah/update) |
| `cancelScaleEdit`                  | Reset form + tutup inline form                   |
| Modal Hapus (`ConfirmDeleteModal`) | Tidak berubah                                    |

---

## Catatan

- Modal konfirmasi hapus **tetap** menggunakan `ConfirmDeleteModal` (tidak diubah).
- Tidak ada perubahan pada store, firebase, atau file lain — hanya file `AdminLikertScales.vue`.
