# 📋 Task — Admin Submission Detail Menggunakan Komponen LikertResult (Tampilan Depan & Admin Sama)

## Tujuan

Membuat halaman `AdminLikertSubmissionDetail.vue` **menggunakan komponen `LikertResult.vue`** (halaman hasil publik) agar **tampilan kartu hasil (rapor) antara sisi depan (responden) dan sisi admin identik**.

---

## 1. Analisis Kondisi Saat Ini

### 1.1 `AdminLikertSubmissionDetail.vue` (Admin)

- Breadcrumb: Survei / Submissions / nama responden.
- Alert untuk submission yang belum selesai (`!isCompleted`).
- Card Rapor:
  - Kop: "Laporan hasil survei" + nama, tombol "Unduh PDF" + badge status, grid info (Sekolah, Kelas/Jurusan, Usia/Gender, Kode Tracking).
  - Ringkasan: `LikertScoreSummary` `variant="inline"` (total skor + label + deskripsi).
  - Jawaban per kategori: `LikertAnswerSections` `variant="table"` (selalu tampil, tidak collapsible).
- Data: `submissionsStore.currentSubmission` (dari Firestore via `fetchSubmissionBySlug`), `categories`, `questions`, `scales`.
- Print: scoped `@media print` (position absolute, margin 0mm).

### 1.2 `LikertResult.vue` (Publik)

- Layout halaman penuh: `min-h-screen bg-bg`, `max-w-4xl mx-auto`.
- Card Rapor:
  - Kop: "Hai, Berikut Hasil dari :" + nama likert, kode tracking + tombol salin (print:hidden), grid info (Nama, Kelas, Sekolah, Jurusan, Usia/Gender, PKL).
  - Ringkasan: `LikertScoreSummary` `variant="center"` dengan badge warna level.
  - Rincian jawaban: collapsible (`showDetails`), `LikertAnswerSections` `variant="table"`.
- Tombol aksi: "Unduh PDF" + "Selesai".
- Data: `likertSessionStore.getResult(likertId)` (dari sesi lokal atau `loadResultByCode`).
- Print: global `@media print` (A4 portrait, margin 18mm, tanpa position absolute — lebih robust).

### 1.3 Perbedaan Data Source

| Aspek       | Admin                                                                               | Publik                                                                                      |
| ----------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Sumber data | `submissionsStore.currentSubmission` (Firestore)                                    | `likertSessionStore.getResult()` (sesi lokal / kode)                                        |
| Bentuk data | `{ name, class, school, major, age, gender, internship, submission, code, status }` | `{ code, respondent: { nama, kelas, sekolah, jurusan, usia, jenisKelamin, pkl }, answers }` |
| Skala       | `scales` ref (fetch manual)                                                         | `categories` ref (fetch + badge warna level)                                                |

---

## 2. Pendekatan

**Jadikan `LikertResult.vue` reusable** dengan menambahkan props, lalu **embed** ke halaman admin:

1. `LikertResult.vue` menerima prop `result` (data hasil) dan `embedded` (mode tertanam).
2. Saat `result` diberikan, komponen **tidak membaca dari `likertSessionStore`** — langsung render data prop.
3. Saat `embedded`, komponen **hanya menampilkan card** (tanpa layout halaman penuh, tanpa tombol aksi, tanpa modal PDF).
4. `AdminLikertSubmissionDetail.vue` memetakan `submission` Firestore → bentuk `result`, lalu merender `<LikertResult :result="mappedResult" embedded />`.
5. Print styles disatukan: admin memakai print styles global milik `LikertResult` (lebih robust), scoped print styles admin dihapus.

---

## 3. Perubahan pada `LikertResult.vue`

### 3.1 Tambah Props

```js
const props = defineProps({
	result: { type: Object, default: null }, // data hasil (dipakai mode admin/embedded)
	embedded: { type: Boolean, default: false }, // true = hanya render card, tanpa layout halaman
	showScoreSummary: { type: Boolean, default: true }, // false = sembunyikan ringkasan skor (submission belum selesai)
});
```

### 3.2 `result` Computed

```js
// Pakai prop result jika diberikan; fallback ke session store (mode publik)
const result = computed(
	() => props.result ?? likertSessionStore.getResult(likertId.value),
);
```

### 3.3 `onMounted`

- Jika `props.result` diberikan, **lewati** blok pemuatan hasil dari sesi/kode (termasuk redirect ke form / not-available).
- Tetap fetch: likert (jika belum), `categoryStore.fetchCategories`, `likertQuestionsStore.fetchAllQuestions`, `likertStore.fetchLikertScales`.

```js
onMounted(async () => {
  loading.value = true
  try {
    if (!likertStore.currentLikert) {
      await likertStore.getLikertBySlug(likertSlug)
    }
    if (!likertStore.currentLikert) {
      router.replace({ name: 'not-available', query: { ... } })
      return
    }

    await categoryStore.fetchCategories(likertId.value)

    // Mode publik saja: muat hasil dari kode/sesi
    if (!props.result) {
      const code = route.query.code
      if (code) {
        const fetched = await likertSessionStore.loadResultByCode(likertId.value, code)
        if (!fetched) {
          router.replace({ name: 'not-available', query: { ... } })
          return
        }
      } else if (!result.value) {
        router.replace({ name: 'likert-form', params: { slug: likertSlug } })
        return
      }
    }

    await likertQuestionsStore.fetchAllQuestions(categoryStore.categories)

    const scales = await likertStore.fetchLikertScales(likertId.value)
    categories.value = scales.map((s) => ({ ...s, bg: ..., text: ... }))
  } finally {
    loading.value = false
  }
})
```

### 3.4 Template

- Root: `:class="embedded ? '' : 'min-h-screen bg-bg'"`.
- Container: `:class="embedded ? '' : 'max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10'"`.
- Bagian ringkasan skor: bungkus dengan `v-if="showScoreSummary"`.
- Tombol aksi ("Unduh PDF" + "Selesai"): `v-if="!embedded"`.
- Modal PDF: `v-if="showExportPDFModal && !embedded"`.

### 3.5 Print Styles

- **Tetap global** (tidak scoped) — sudah menangani `.print-area` dengan benar.
- Aturan `.min-h-screen`, `.max-w-2xl`, `.space-y-6` hanya cocok di mode publik; di mode embedded root tidak memakai class tersebut, jadi tidak berpengaruh.
- `@page` A4 + margin 18mm berlaku untuk kedua mode (konsisten).

---

## 4. Perubahan pada `AdminLikertSubmissionDetail.vue`

### 4.1 Template

- Hapus card rapor manual (kop, `LikertScoreSummary`, `LikertAnswerSections`).
- Ganti dengan:

```html
<template v-else-if="submission">
	<!-- Alert submission belum selesai (tetap dipertahankan) -->
	<div v-if="!isCompleted" class="...">...</div>

	<!-- Card hasil identik dengan halaman publik -->
	<LikertResult
		:result="mappedResult"
		embedded
		:show-score-summary="isCompleted"
	/>
</template>
```

- Breadcrumb, loading, tombol "Unduh PDF" + modal PDF tetap dipertahankan.

### 4.2 Script

- Import `LikertResult`.
- Hapus import yang tidak dipakai lagi: `LikertScoreSummary`, `LikertAnswerSections`, `useLikertCategoriesStore`, `useLikertQuestionsStore`, `LIKERT_SCALE_OPTIONS`, `computeTotalScore`.
- Hapus state/computed/fungsi yang tidak dipakai: `scales`, `fetchScales`, `computedScore`, `scalesLabel`, `scalesDescription`, `sections`, `answerLabel`, `questionText`.
- Tambah computed `mappedResult`:

```js
/**
 * Memetakan data submission (Firestore) ke bentuk result yang dipakai LikertResult.
 *
 * @returns {{ code: string, respondent: object, answers: Array } | null}
 */
const mappedResult = computed(() => {
	if (!submission.value) return null;
	return {
		code: submission.value.code,
		respondent: {
			nama: submission.value.name,
			kelas: submission.value.class,
			sekolah: submission.value.school,
			jurusan: submission.value.major,
			usia: submission.value.age,
			jenisKelamin: submission.value.gender,
			pkl: submission.value.internship,
		},
		answers: submission.value.submission || [],
	};
});
```

- Sederhanakan `onMounted`: hanya fetch likert + submission (categories/questions/scales ditangani `LikertResult`).

```js
onMounted(async () => {
	const likert = await likertStore.getLikertBySlug(likertSlug);
	if (!likert) {
		router.push({ name: "admin-likert" });
		return;
	}
	likertId.value = likert.id;
	await submissionsStore.fetchSubmissionBySlug(likertId.value, submissionSlug);
});
```

### 4.3 Print Styles

- Hapus scoped `@media print` milik admin (agar tidak konflik dengan print styles global `LikertResult`).
- `handlePrint()` + modal PDF tetap dipakai (memanggil `window.print()`).
- Breadcrumb, alert, tombol otomatis tersembunyi saat print karena `body * { visibility: hidden }` + `.print-area` visible.

---

## 5. Catatan Kepatuhan (Code Rule)

- [ ] Alur data tetap Front → Store → Firebase (tidak ada akses Firebase langsung dari komponen).
- [ ] Setiap fungsi baru wajib JSDoc (`@param`, `@returns`).
- [ ] Komentar section `// ── ... ──` untuk kelompok fungsi baru.
- [ ] Tidak ada perubahan pada store/firebase — murni refactor UI + reuse komponen.
- [ ] Perilaku admin dipertahankan: alert submission belum selesai, tombol "Unduh PDF", breadcrumb.

---

## 6. File yang Diubah

| File                                                     | Perubahan                                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/pages/likert/LikertResult.vue`                      | Tambah props `result`, `embedded`, `showScoreSummary`; sesuaikan computed/onMounted/template |
| `src/pages/admin/likert/AdminLikertSubmissionDetail.vue` | Embed `LikertResult`, hapus card manual & print styles lama, tambah `mappedResult`           |
