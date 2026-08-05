# Task: Tampilkan 3 Kategori Tertinggi pada RiasecSummaryHeader

## Ringkasan

Mengubah tampilan `RiasecSummaryHeader` di halaman hasil Holland
(`src/pages/holland/HollandResult.vue`) agar menampilkan **3 kategori
tertinggi** beserta labelnya, namun **deskripsi (`description`) tetap
diambil dari 1 kategori tertinggi saja**.

## Konteks / Alur Data Saat Ini

1. Hasil disimpan di `sessionStore` (`src/stores/holland/holland-session.js`):
   `{ scores, topCode, ... }` — `topCode` string mis. `"S"`.
2. `computeTopCode(breakdown, topN = 1)` (`src/utils/holland-scoring.js`)
   sudah mendukung `topN`; dengan `topN = 3` menghasilkan mis. `"SAE"`.
3. `scoreBreakdown` di `HollandResult.vue` dari
   `buildScoreBreakdown(scores, topCode)` (`src/utils/holland-result.js`)
   sudah **urut menurun berdasarkan `percentage`**.
4. `topCodeInfo` di `HollandResult.vue` saat ini hanya mengambil info
   dari **1 kode** (`result.topCode`).
5. `RiasecSummaryHeader.vue` menerima props: `topCode` (String),
   `topCodeInfo` (Object, hanya `description` dipakai), `scorePercentMap`.
6. `RiasecNotes` & `RiasecScoreBreakdown` tetap memakai `topCodeInfo`
   kategori tunggal — tidak ikut berubah.

## Tujuan

- `RiasecSummaryHeader` menampilkan 3 kategori tertinggi (kode + label).
- Deskripsi tetap dari 1 kategori tertinggi (`topCodeInfo.description`).
- Komponen lain (`RiasecNotes`, `RiasecScoreBreakdown`, hex chart) tidak berubah.

## Perubahan

### 1. `src/pages/holland/HollandResult.vue`

**a. Tambah computed `topCodes` (3 kode tertinggi):**

```js
const topCodes = computed(() => {
	return scoreBreakdown.value.slice(0, 3).map((row) => row.code);
});
```

**b. Tambah computed `topCodesInfo` (info 3 kategori):**

```js
const topCodesInfo = computed(() => {
	return topCodes.value
		.map((code) => riasecStore.riasecList.find((r) => r.id === code) || null)
		.filter(Boolean);
});
```

**c. Ubah `topCodeInfo` agar ambil dari `topCodes[0]` (tetap 1 tertinggi):**

```js
const topCodeInfo = computed(() => {
	const code = topCodes.value[0];
	if (!code) return null;
	return riasecStore.riasecList.find((r) => r.id === code) || null;
});
```

**d. Kirim prop baru ke `<RiasecSummaryHeader>`:**

```html
<RiasecSummaryHeader
	:top-code="result.topCode"
	:top-code-info="topCodeInfo"
	:score-percent-map="scorePercentMap"
	:top-codes-info="topCodesInfo"
/>
```

### 2. `src/components/holland/RiasecSummaryHeader.vue`

**a. Tambah prop `topCodesInfo`:**

```js
defineProps({
	topCode: { type: String, required: true },
	topCodeInfo: { type: Object, default: null },
	scorePercentMap: { type: Object, required: true },
	topCodesInfo: { type: Array, default: () => [] },
});
```

**b. Tambah computed `displayTopCodes` (fallback dari `topCode`):**

```js
import { computed } from "vue";

const props = defineProps({ ... });

const displayTopCodes = computed(() => {
  const items = props.topCodesInfo.length
    ? props.topCodesInfo
    : (props.topCode || "")
        .split("")
        .map((code) => ({ code, label: code }));
  return items.slice(0, 3);
});
```

**c. Ubah bagian kanan header — tampilkan 3 kategori + label, deskripsi tetap:**

```html
<div>
	<p class="text-xs text-text-muted mb-1">Kode minat dominan</p>
	<div class="flex flex-wrap items-center gap-2 mb-2">
		<span
			v-for="item in displayTopCodes"
			:key="item.code"
			class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-soft text-primary font-semibold tracking-widest"
		>
			<span class="text-lg">{{ item.code }}</span>
			<span class="text-xs font-medium text-black-secondary">
				{{ item.label }}
			</span>
		</span>
	</div>
	<p v-if="topCodeInfo" class="text-sm text-black leading-relaxed">
		{{ topCodeInfo.description }}
	</p>
</div>
```

### 3. Komponen Lain yang Memakai `RiasecSummaryHeader`

- `AdminHollandSubmissionDetail.vue` juga mengimpor komponen ini.
  Prop baru `topCodesInfo` opsional (`default: () => []`), jadi tetap
  berfungsi — fallback `topCode.split("")` menampilkan kode saja.
- Opsional (di luar scope): ubah halaman admin serupa jika ingin label.

### 4. Edge Cases

- `scoreBreakdown` selalu 6 kategori, jadi `topCodes` selalu 3 item.
- Jika `riasecList` belum lengkap, `topCodesInfo` bisa < 3 — aman karena
  `displayTopCodes` di-`slice(0, 3)`.
- Skor seri: urutan stabil mengikuti `RIASEC_CATEGORY_ORDER`.
- `topCodeInfo` null: deskripsi tidak tampil (`v-if` sudah ada).

## File yang Diubah

| File                                             | Perubahan                                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `src/pages/holland/HollandResult.vue`            | Tambah `topCodes`, `topCodesInfo`; sesuaikan `topCodeInfo`; kirim prop `top-codes-info`   |
| `src/components/holland/RiasecSummaryHeader.vue` | Tambah prop `topCodesInfo`; render 3 kategori + label; deskripsi tetap dari `topCodeInfo` |

## Kriteria Selesai

- [ ] `RiasecSummaryHeader` menampilkan 3 kategori tertinggi (kode + label).
- [ ] Deskripsi tetap dari 1 kategori tertinggi (`topCodeInfo.description`).
- [ ] Halaman hasil (`HollandResult.vue`) tidak error & tetap responsif.
- [ ] Halaman admin (`AdminHollandSubmissionDetail.vue`) tetap berfungsi.
- [ ] Hasil cetak/print tetap rapi (flex-wrap aman untuk print).
