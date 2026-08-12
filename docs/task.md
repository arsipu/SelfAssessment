# Task: Samakan Desain AdminHollandSubmissionDetail dengan HollandResult

## Tujuan

Mengubah `src/pages/admin/holland/AdminHollandSubmissionDetail.vue` agar desainnya identik dengan halaman publik `src/pages/holland/HollandResult.vue`, dengan pola yang sama seperti `src/pages/admin/likert/AdminLikertSubmissionDetail.vue` (yaitu: admin page hanya memetakan data submission → format result, lalu me-render komponen result publik dengan prop `embedded`).

---

## Analisis Pola AdminLikertSubmissionDetail (Referensi)

`AdminLikertSubmissionDetail.vue` bekerja dengan cara:

1. **Breadcrumb** — tetap dipertahankan di halaman admin.
2. **Header admin terpisah** — status badge ("Selesai" / "Sedang Mengerjakan") dan tombol "Unduh PDF" diletakkan di baris terpisah DI LUAR card hasil (bukan di dalam card seperti implementasi Holland saat ini).
3. **Alert warning** — untuk submission yang belum selesai, ditampilkan di atas card.
4. **Reuse komponen publik** — `LikertResult` di-render dengan prop `embedded` dan `result` (data hasil yang sudah dipetakan dari submission).
5. **Modal PDF** — tetap berada di halaman admin, memanggil `window.print()`.
6. **Print styles** — ditangani sepenuhnya oleh `LikertResult` (komponen publik), bukan oleh halaman admin.

`LikertResult.vue` mendukung mode embedded melalui props:

- `result` — data hasil yang di-pass dari luar (admin), fallback ke session store jika tidak ada.
- `embedded` — `true` = hanya render card, tanpa layout halaman penuh, tanpa tombol aksi, tanpa modal PDF.
- `showScoreSummary` — `false` = sembunyikan ringkasan skor (untuk submission yang belum selesai).

---

## Perubahan yang Dibutuhkan

### 1. Modifikasi `src/pages/holland/HollandResult.vue`

Tambahkan dukungan mode embedded, mengikuti pola `LikertResult.vue`:

#### a. Tambahkan props

```js
const props = defineProps({
	result: { type: Object, default: null }, // data hasil (dipakai mode admin/embedded)
	embedded: { type: Boolean, default: false }, // true = hanya render card, tanpa layout halaman
	showScoreSummary: { type: Boolean, default: true }, // false = sembunyikan ringkasan skor (submission belum selesai)
});
```

#### b. Ubah `result` computed

```js
const result = computed(
	() => props.result ?? sessionStore.getResult(hollandId.value),
);
```

#### c. Ubah template — wrapper layout

- Root `<div>`: `:class="embedded ? '' : 'min-h-screen bg-bg'"`
- Inner wrapper: `:class="embedded ? '' : 'max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10'"`
- Tombol aksi ("Unduh PDF" + "Selesai"): tambahkan `v-if="!embedded"`
- Modal PDF: ubah kondisi menjadi `v-if="showExportPDFModal && !embedded"`

#### d. Ubah template — bagian skor (summary, tabel, catatan)

Bungkus ketiga section (Ringkasan hex chart, Tabel skor, Catatan) dengan `v-if="showScoreSummary"` agar bisa disembunyikan untuk submission yang belum selesai.

#### e. Ubah template — rincian jawaban

- Default `showDetails` menjadi `ref(props.embedded)` — di mode admin langsung terbuka.
- Tambahkan `avoid-break` dan `unanswered-class="border-border bg-surface-muted-40"` pada `RiasecAnswerDetails` (agar sama dengan implementasi admin saat ini).

#### f. Tambahkan print handler (beforeprint/afterprint)

Salin pola dari `LikertResult.vue`:

- `handleBeforePrint()` — paksa `showDetails = true` saat print manual (Ctrl+P).
- `handleAfterPrint()` — kembalikan state semula.
- `handleExportPDF()` — simpan state, paksa `showDetails = true`, `await nextTick()`, `window.print()`, kembalikan state.
- Daftarkan listener `beforeprint` / `afterprint` di `onMounted` / `onBeforeUnmount`.

#### g. Sesuaikan print styles

Print styles saat ini menargetkan `.min-h-screen`, `.max-w-3xl`, `.space-y-6` — class ini tidak ada di mode embedded. Perlu disesuaikan agar tetap berfungsi di kedua mode:

- Tambahkan selektor untuk mode embedded (misal: target `.print-area` langsung tanpa bergantung pada wrapper class).
- Pastikan `@page { size: A4 portrait; margin: 18mm; }` tetap berlaku.
- Pastikan `.print-area` tidak memakai `position: absolute` (sudah benar di implementasi saat ini).

#### h. Pertahankan `topCodesInfo`

`HollandResult` sudah menghitung `topCodesInfo` (3 kode tertinggi) dan mengirimkannya ke `RiasecSummaryHeader`. Ini harus tetap dipertahankan agar desain summary identik dengan halaman publik.

---

### 2. Modifikasi `src/pages/admin/holland/AdminHollandSubmissionDetail.vue`

Ubah mengikuti pola `AdminLikertSubmissionDetail.vue`:

#### a. Template — hapus card hasil lama

Hapus seluruh blok card hasil yang ada saat ini (Kop, Ringkasan, Tabel skor, Catatan, Rincian jawaban) beserta `pdf-export-wrapper print-area` wrapper.

#### b. Template — tambahkan header admin terpisah

```html
<!-- Kop admin dengan tombol aksi -->
<div class="flex justify-between items-center mb-6">
	<div>
		<span
			class="print:hidden text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
			:class="submission.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
		>
			{{ submission.status === 'completed' ? 'Selesai' : 'Sedang Mengerjakan' }}
		</span>
	</div>
	<button
		v-if="isCompleted"
		@click="showExportPDFModal = true"
		class="print:hidden text-xs px-4 py-2 rounded-lg border border-border text-text-secondary bg-surface hover:bg-surface-muted transition-colors h-10 cursor-pointer font-semibold flex items-center gap-2"
	>
		Unduh PDF
	</button>
</div>
```

#### c. Template — render `HollandResult` embedded

```html
<HollandResult
	:result="mappedResult"
	embedded
	:show-score-summary="isCompleted"
/>
```

#### d. Script — buat `mappedResult` computed

Petakan data submission (Firestore) ke format result yang diharapkan `HollandResult`:

```js
const mappedResult = computed(() => {
	if (!submission.value) return null;
	return {
		code: submission.value.code,
		respondent: {
			name: submission.value.name,
			major: submission.value.major,
			school: submission.value.school,
			gender: submission.value.gender,
			age: submission.value.age,
			occupation: submission.value.occupation,
			testPurpose: submission.value.testPurpose,
		},
		answers: submission.value.answers || [],
	};
});
```

#### e. Script — hapus computed yang tidak diperlukan lagi

Hapus computed yang sekarang ditangani oleh `HollandResult`:

- `scoreBreakdownRaw`, `topCode`, `topCodeInfo`, `scoreBreakdown`, `scorePercentMap`, `riasecLabel`, `detailSections`, `answeredIds`, `sections`, `riasecMap`, `riasecIds`

Pertahankan:

- `isCompleted`
- `showExportPDFModal`
- `handlePrint()`
- `onMounted` (fetch data: holland, riasec, columns, questions, submission)

#### f. Script — import `HollandResult`

```js
import HollandResult from "@/pages/holland/HollandResult.vue";
```

#### g. Style — hapus print styles lama

Hapus blok `@media print` yang ada di `<style scoped>` (yang memakai `position: absolute`). Print styles sekarang ditangani oleh `HollandResult`.

---

### 3. Pertimbangan Data & Alur

| Data                     | Sumber    | Dipakai oleh                                    |
| ------------------------ | --------- | ----------------------------------------------- |
| `submission.code`        | Firestore | `HollandResult` (kode tracking)                 |
| `submission.name`        | Firestore | `HollandResult` (nama responden)                |
| `submission.major`       | Firestore | `HollandResult` (jurusan)                       |
| `submission.school`      | Firestore | `HollandResult` (sekolah)                       |
| `submission.gender`      | Firestore | `HollandResult` (gender)                        |
| `submission.age`         | Firestore | `HollandResult` (usia)                          |
| `submission.occupation`  | Firestore | `HollandResult` (pekerjaan, opsional)           |
| `submission.testPurpose` | Firestore | `HollandResult` (tujuan tes, opsional)          |
| `submission.answers`     | Firestore | `HollandResult` (hitung skor + rincian jawaban) |
| `submission.status`      | Firestore | Admin page (badge + `showScoreSummary`)         |

`HollandResult` menghitung `scores`, `topCode`, `topCodesInfo`, `scoreBreakdown`, `detailSections`, `answeredIds` secara internal dari `result.answers` — sama seperti yang dilakukan `AdminHollandSubmissionDetail` saat ini, jadi tidak ada perubahan logika scoring.

---

### 4. Edge Cases

1. **Submission belum selesai** — `showScoreSummary=false` → summary, tabel skor, dan catatan disembunyikan. Rincian jawaban tetap tampil (dengan `unanswered-class` untuk soal yang belum dijawab).
2. **Submission tidak ditemukan** — tetap tampilkan pesan "Data submission tidak ditemukan."
3. **Print manual (Ctrl+P)** — `beforeprint` listener memaksa `showDetails=true` agar rincian jawaban ikut tercetak, lalu `afterprint` mengembalikan state.
4. **Export PDF via tombol** — `handleExportPDF()` di `HollandResult` memaksa `showDetails=true`, `await nextTick()`, lalu `window.print()`.
5. **Kode tracking di mode embedded** — mengikuti pola `LikertResult`: kode tracking tetap tampil di card (dengan tombol salin), karena `HollandResult` tidak menyembunyikannya di mode embedded. Ini konsisten dengan perilaku `AdminLikertSubmissionDetail`.

---

## Ringkasan File yang Diubah

| File                                                       | Perubahan                                                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/holland/HollandResult.vue`                      | Tambah props `result`, `embedded`, `showScoreSummary`; sesuaikan template & print styles; tambah print handlers                                  |
| `src/pages/admin/holland/AdminHollandSubmissionDetail.vue` | Hapus card hasil lama; tambah header admin; render `HollandResult` embedded; buat `mappedResult`; hapus computed & print styles yang tidak perlu |
