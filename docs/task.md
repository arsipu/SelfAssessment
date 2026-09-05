# 📋 Task Plan — RiasecScoreBreakdown: Tampilkan 3 Kategori Teratas Saja

## 📝 Deskripsi Tugas

Pada halaman `src/pages/holland/HollandResult.vue`, komponen **`RiasecScoreBreakdown.vue`** saat ini menampilkan **semua** kategori RIASEC (R, I, A, S, E, C). Permintaan: **cukup tampilkan 3 kategori teratas saja** (berdasarkan persentase tertinggi, sesuai urutan `scoreBreakdown` yang sudah diurutkan menurun).

---

## 🔍 Analisa Kode Eksisting

### 1. `src/components/holland/RiasecScoreBreakdown.vue`

**Kondisi saat ini:**
- Menerima prop `scoreBreakdown` (Array berisi semua kategori RIASEC)
- Template **table** (line 24-28) merender SEMUA baris lewat:
  ```vue
  <tr v-for="row in scoreBreakdown" :key="row.code">
  ```
- Template **card** (line 53) merender SEMUA item lewat:
  ```vue
  <div v-for="row in scoreBreakdown" :key="row.code">
  ```
- Belum ada mekanisme pembatasan jumlah item (limit)
- Props saat ini (line 86-91): `scoreBreakdown`, `title`, `getLabel`, `variant`

**Struktur data `scoreBreakdown`:**
```js
[
  { code: 'R', percentage: 85, count: 17, total: 20, isTop: true },   // urutan 1
  { code: 'I', percentage: 70, count: 14, total: 20, isTop: true },   // urutan 2
  { code: 'A', percentage: 65, count: 13, total: 20, isTop: true },   // urutan 3
  { code: 'S', percentage: 50, count: 10, total: 20, isTop: false },  // urutan 4
  ...
]
```

### 2. `src/pages/holland/HollandResult.vue`

**Kondisi saat ini:**
- Computed `scoreBreakdown` (line ~344) menghasilkan **seluruh** kategori, urut menurun by percentage (lewat `buildScoreBreakdown`)
- Computed `topCodes` (line 350-353) sudah memanfaatkan `slice(0, 3)` untuk 3 kode teratas
- Komponen `RiasecScoreBreakdown` dipanggil di line 134-138 dengan `variant="table"` meneruskan `scoreBreakdown` **lengkap**

```vue
<!-- line 134-138 -->
<RiasecScoreBreakdown
  :score-breakdown="scoreBreakdown"
  :get-label="riasecLabel"
  variant="table"
/>
```

---

## 🎯 Rencana Perubahan

### Pendekatan yang Dipilih

Menambahkan **prop opsional `limit`** pada `RiasecScoreBreakdown.vue` untuk membatasi jumlah item yang dirender, lalu di `HollandResult.vue` meneruskan `:limit="3"`.

Perenderan item diubah dari `scoreBreakdown` menjadi **computed `displayBreakdown`** yang memotong array sesuai `limit` saat limit disediakan.

**Alasan pendekatan ini:**
- ✅ **Sesuai permintaan** — hanya menampilkan 3 kategori teratas
- ✅ **Backward compatible** — tanpa prop `limit`, komponen tetap menampilkan semua kategori
- ✅ **Reusable/fleksibel** — bisa dipakai di tempat lain dengan limit berbeda
- ✅ **Perubahan minimal & fokus** — `scoreBreakdown` tetap utuh untuk kebutuhan lain (mis. `scorePercentMap`)
- ✅ Menjaga konsistensi dengan `topCodes` yang sudah memakai `slice(0, 3)`

### Pendekatan Alternatif (dievaluasi & ditolak)
- **Memotong di `HollandResult.vue`** (buat computed baru lalu kirim hanya 3 item): lebih menyebar logika di parent; komponen anak jadi kurang fleksibel. Tidak dipilih.
- **Hardcode 3 di komponen**: kurang fleksibel & tidak reusable. Tidak dipilih.
---

## 📝 Detail Implementasi

### File 1: `src/components/holland/RiasecScoreBreakdown.vue`

#### A. Import `computed`

Tambahkan import `computed` dari `vue` pada `<script setup>`:

```js
import { computed } from "vue";
```

#### B. Ubah `defineProps` — tambahkan prop `limit`

**Lokasi:** line 86-91

```js
defineProps({
	scoreBreakdown: { type: Array, required: true },
	title: { type: String, default: "Rincian skor per kategori" },
	getLabel: { type: Function, default: (code) => code },
	variant: { type: String, default: "card" }, // 'card' | 'table'
	// Jumlah item yang ditampilkan; null = tampilkan semua kategori
	limit: { type: Number, default: null },
});
```

#### C. Tangkap props & buat computed `displayBreakdown`

Ubah `defineProps` menjadi disimpan ke variabel `props`, lalu tambahkan computed setelahnya:

```js
const props = defineProps({
	scoreBreakdown: { type: Array, required: true },
	title: { type: String, default: "Rincian skor per kategori" },
	getLabel: { type: Function, default: (code) => code },
	variant: { type: String, default: "card" }, // 'card' | 'table'
	limit: { type: Number, default: null },
});

/**
 * `scoreBreakdown` versi tampilan — dipotong ke `limit` item pertama bila
 * prop `limit` disediakan; jika `limit` null, semua kategori dirender.
 *
 * @returns {Array} item kategori yang akan dirender
 */
const displayBreakdown = computed(() => {
	if (props.limit == null) return props.scoreBreakdown;
	return props.scoreBreakdown.slice(0, props.limit);
});
```

#### D. Update template table (line 24-28)

```vue
<!-- SEBELUM -->
<tr
	class="flex items-center"
	v-for="row in scoreBreakdown"
	:key="row.code"
>

<!-- SESUDAH -->
<tr
	class="flex items-center"
	v-for="row in displayBreakdown"
	:key="row.code"
>
```

#### E. Update template card (line 53)

```vue
<!-- SEBELUM -->
<div v-for="row in scoreBreakdown" :key="row.code">

<!-- SESUDAH -->
<div v-for="row in displayBreakdown" :key="row.code">
```

---

### File 2: `src/pages/holland/HollandResult.vue`

#### A. Tambahkan prop `:limit="3"` pada pemanggilan komponen

**Lokasi:** line 134-138

```vue
<!-- SEBELUM -->
<RiasecScoreBreakdown
	:score-breakdown="scoreBreakdown"
	:get-label="riasecLabel"
	variant="table"
/>

<!-- SESUDAH -->
<RiasecScoreBreakdown
	:score-breakdown="scoreBreakdown"
	:get-label="riasecLabel"
	variant="table"
	:limit="3"
/>
```

**Catatan:**
- Tidak perlu mengubah computed `scoreBreakdown` di `HollandResult.vue` — tetap berisi **semua** kategori karena masih dipakai oleh computed lain (`scorePercentMap`, `topCodes`, `topCodesInfo`)
- Filtering tampilan sepenuhnya ditangani komponen anak lewat prop `limit`
---

## ✅ Checklist Verifikasi

Setelah implementasi selesai, pastikan:

- [ ] `computed` di-import di `RiasecScoreBreakdown.vue`
- [ ] Prop `limit` (Number, default null) ditambahkan di `defineProps`
- [ ] `defineProps` disimpan ke `props` agar bisa diakses di computed
- [ ] Computed `displayBreakdown` memotong `scoreBreakdown` sesuai `limit`
- [ ] Template **table** memakai `displayBreakdown` (bukan `scoreBreakdown`)
- [ ] Template **card** memakai `displayBreakdown` (bukan `scoreBreakdown`)
- [ ] `HollandResult.vue` meneruskan `:limit="3"` ke komponen
- [ ] `scoreBreakdown` di `HollandResult.vue` tetap utuh (tidak diubah)
- [ ] JSDoc ditambahkan untuk computed `displayBreakdown`
- [ ] Komentar penjelasan ditambahkan untuk logika limit
- [ ] Perilaku tanpa `limit` tidak berubah (backward compatible)
- [ ] Hanya 3 kategori teratas yang tampil di halaman hasil
- [ ] Tidak ada error di console

---

## 🧪 Skenario Testing

### Test Case 1: Tampilan halaman hasil Holland (mode publik)
- **Kondisi:** Submit/buka hasil, `:limit="3"` aktif
- **Expected:** Tabel hanya menampilkan 3 baris kategori teratas (urut by percentage)

### Test Case 2: Mode embedded/admin
- **Kondisi:** Admin melihat hasil via props `result`, `:limit="3"` tetap berlaku
- **Expected:** Sama, hanya 3 kategori teratas tampil

### Test Case 3: Print / Export PDF
- **Kondisi:** Printhalaman atau export PDF
- **Expected:** PDF mencetak hanya 3 kategori teratas

### Test Case 4: Tanpa prop `limit` (untuk lokasi lain)
- **Kondisi:** Komponen dipanggil tanpa `:limit`
- **Expected:** Semua kategori tetap dirender (perilaku lama)

### Test Case 5: Variant card
- **Kondisi:** `variant="card"` + `:limit="3"`
- **Expected:** Hanya 3 kategori teratas dalam bentuk card

---

## 🔄 Dampak Perubahan

| Komponen | Dampak | Status |
|----------|--------|--------|
| `RiasecScoreBreakdown.vue` | Tambah prop `limit`, computed `displayBreakdown`, ubah `v-for` | Minor, backward compatible |
| `HollandResult.vue` | Tambah atribut `:limit="3"` pada pemanggilan komponen | Minimal, hanya tambah prop |
| Komponen lain | Tidak ada (komponen hanya dipakai di `HollandResult.vue`) | No change |

**Backward Compatibility:** ✅ Aman — prop `limit` opsional; tanpa prop tersebut perilaku sama seperti sebelumnya.

---

## 📚 Referensi

- `src/components/holland/RiasecScoreBreakdown.vue` (line 24-28, 53, 86-91)
- `src/pages/holland/HollandResult.vue` (line 134-138, ~344, 350-353)
- Code rule: `docs/code_rule.md`

---

**Dibuat:** 5 September 2026
**Status:** Plan (Belum diimplementasikan)
