# Task: Flat Table/List — Section Label Dihapus, Semua Data Digabung

## Ringkasan

Saat ini `LikertAnswerSections.vue` menampilkan data dengan **pengelompokan per section** — setiap section memiliki label/nama kategori, daftar item di dalamnya, dan (untuk variant `table`) tabel terpisah per section.

Yang diminta:
1. **Section label tidak perlu** — nama kategori tidak ditampilkan.
2. **Table head hanya 1 saja** — untuk variant `table`, buat satu tabel dengan satu baris header, lalu semua item dari seluruh section ditampilkan dalam satu tabel.
3. **Semua data digabung** — baik variant `list` maupun `table`, seluruh item (jawaban + soal) dari semua section ditampilkan secara flat tanpa pengelompokan.

---

## File yang perlu dimodifikasi

| File | Perubahan |
|---|---|
| `src/components/likert/LikertAnswerSections.vue` | Template + script — hapus section grouping, flatten semua item |

> **Catatan:** `LikertResult.vue` tidak perlu diubah — ia tetap mengirimkan `sections` yang sama. Komponen ini sendiri yang akan mem-flatten data.

---

## Pendekatan Teknis

### 1. Computed `flatItems` — Flatten Semua Section

Buat computed baru yang menggabungkan seluruh `section.items` dari semua section menjadi satu array, sekaligus memberikan nomor global.

```js
/**
 * Semua item dari seluruh section yang digabung menjadi satu array,
 * dengan nomor global (1–N) untuk penomoran berurutan.
 * Section label tidak dipertahankan.
 *
 * @returns {Array<{ questionId: string, questionText: string, answerLabel: string, point: number|string, globalNumber: number }>}
 */
const flatItems = computed(() => {
  let number = 0;
  const result = [];
  for (const section of props.sections) {
    for (const item of section.items) {
      number++;
      result.push({ ...item, globalNumber: number });
    }
  }
  return result;
});
```

**Konsekuensi:**
- `sectionsWithGlobalIndex` bisa dihapus karena tidak lagi dipakai.
- Nomor global dihitung langsung tanpa perlu offset per section.

### 2. Template — Variant `table`

**Sebelum:**
```html
<div v-else>
  <div v-for="(section, index) in sections" ...>
    <div class="pt-4..."><h2>{{ section.label }}</h2></div>
    <table>
      <thead>...</thead>
      <tbody>
        <tr v-for="(item, itemIndex) in section.items">...</tr>
      </tbody>
    </table>
  </div>
</div>
```

**Sesudah:**
```html
<div v-else class="overflow-x-auto">
  <table class="w-full text-left border-collapse table-fixed text-xs md:text-sm">
    <thead>
      <tr>
        <th class="w-[8%] px-3 py-2 ...">No</th>
        <th class="w-[52%] px-3 py-2 ...">Pertanyaan</th>
        <th class="w-[40%] px-3 py-2 ...">Jawaban</th>
      </tr>
    </thead>
    <tbody class="bg-surface">
      <tr v-for="item in flatItems" :key="item.questionId">
        <td>{{ item.globalNumber }}</td>
        <td>{{ item.questionText }}</td>
        <td>{{ item.answerLabel }}</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Perubahan:**
- Hanya satu `<table>` — tidak ada per-`section` wrapper.
- `<thead>` muncul sekali di atas.
- `<tbody>` iterasi `flatItems`.
- Tidak ada `section.label`.
- `:class` border antar section tidak diperlukan lagi.
- Wrapper `avoid-break` tidak diperlukan.

### 3. Template — Variant `list`

**Sebelum:**
```html
<div v-if="variant === 'list'" class="space-y-5">
  <div v-for="section in sections" :key="section.key">
    <div ...><span>{{ section.label }}</span></div>
    <div class="space-y-2">
      <div v-for="(item, i) in section.items" ...>
        <p><span>{{ i + 1 }}.</span>{{ item.questionText }}</p>
        <span>{{ item.answerLabel }}</span>
      </div>
    </div>
  </div>
</div>
```

**Sesudah:**
```html
<div v-if="variant === 'list'" class="space-y-2">
  <div
    v-for="item in flatItems"
    :key="item.questionId"
    class="flex items-start justify-between gap-3 py-2.5 px-3 rounded-lg bg-surface-muted"
  >
    <p class="text-xs md:text-sm text-black leading-relaxed flex-1">
      <span class="text-black-secondary mr-1">{{ item.globalNumber }}.</span
      >{{ item.questionText }}
    </p>
    <span
      class="shrink-0 text-[11px] md:text-xs font-semibold px-2 py-1 rounded-md bg-surface border border-border text-black whitespace-nowrap"
    >
      {{ item.answerLabel }}
    </span>
  </div>
</div>
```

**Perubahan:**
- Tidak ada iterasi `section`, tidak ada `section.label`.
- Langsung iterasi `flatItems`.
- `item.globalNumber` untuk penomoran global.

### 4. Hapus `sectionsWithGlobalIndex`

Computed `sectionsWithGlobalIndex` sudah tidak dipakai — bisa dihapus dari script.

### 5. Layout Table — `overflow-x-auto` Dipindah

Wrapper `overflow-x-auto` sekarang membungkus seluruh tabel, bukan per section.

---

## Checklist Kepatuhan (dari `docs/code_rule.md`)

- [ ] Setiap computed/fungsi baru memiliki JSDoc (`@param`, `@returns`)
- [ ] Logika flatten diberi komentar penjelasan
- [ ] Tidak mengubah arsitektur data (Front → Store → Firebase)
- [ ] Tidak ada akses Firebase langsung dari Vue component
- [ ] Penamaan mengikuti camelCase

---

## Prioritas & Urutan Pengerjaan

1. **Computed `flatItems`** — flatten semua section dengan globalNumber
2. **Hapus `sectionsWithGlobalIndex`** — tidak dipakai lagi
3. **Template `variant="list"`** — ganti jadi iterasi flatItems
4. **Template `variant="table"`** — ganti jadi satu tabel flat
5. **Validasi** — pastikan data muncul lengkap, nomor urut 1–N, tidak ada label section
# Task: Indikator Soal yang Belum Dijawab (Nomor + Tanda Merah)

## Ringkasan

Saat ini, halaman `LikertQuestions.vue` hanya menampilkan teks `"${unansweredCount} soal belum dijawab"` tanpa informasi soal mana saja yang belum dijawab. Pengguna harus men-scroll satu per satu untuk menemukannya.

Yang diminta:
1. Tambahkan tombol/tautan yang bisa diklik untuk menampilkan daftar **nomor global** soal yang belum dijawab.
2. Setiap soal yang belum dijawab harus diberi **tanda merah** (misal: border kiri merah, background merah tipis, atau teks nomornya merah) agar mudah dik dikenali secara visual saat di-scroll.

---

## File yang perlu dimodifikasi

| File | Perubahan |
|---|---|
| `src/pages/likert/LikertQuestions.vue` | Semua perubahan — template + script |

> **Catatan:** Tidak ada perubahan pada store, firebase, atau komponen lain.

---

## Pendekatan Teknis

### 1. Data — Computed: `unansweredGlobalNumbers`

Buat computed property baru yang menghasilkan **array nomor global** soal yang belum dijawab:

```js
/**
 * Daftar nomor global (1–N) dari soal yang belum dijawab.
 * Memanfaatkan `sectionsWithGlobalIndex` + `answers` untuk menentukan
 * nomor global tiap soal yang belum memiliki jawaban.
 *
 * @returns {Array<{ globalNumber: number, questionId: string }>}
 */
const unansweredQuestions = computed(() => {
  const result = [];
  for (const section of sectionsWithGlobalIndex.value) {
    for (let i = 0; i < section.questions.length; i++) {
      const q = section.questions[i];
      if (!answers.value[q.id]) {
        result.push({
          globalNumber: section.globalStartIndex + i + 1,
          questionId: q.id,
        });
      }
    }
  }
  return result;
});
```

### 2. UI — Tombol "Lihat nomor yang belum dijawab"

Di area submit (setelah/bareng dengan teks unanswered count), tambahkan:

- **Saat `unansweredCount > 0`:** tampilkan tombol teks kecil (mis: `"Lihat nomor yang belum dijawab"`) yang bisa diklik.
- Saat tombol diklik, toggle sebuah `ref` (mis: `showUnansweredList`), sehingga daftar nomor muncul/ hilang.
- Daftar nomor ditampilkan sebagai teks `"3, 5, 7"` (dipisah koma) dengan warna merah.

```html
<!-- Di dalam area submit -->
<template v-if="unansweredCount > 0">
  <button
    @click="showUnansweredList = !showUnansweredList"
    class="text-xs text-primary underline cursor-pointer"
  >
    Lihat nomor yang belum dijawab
  </button>
  <Transition name="fade">
    <p v-if="showUnansweredList" class="text-xs text-red-500 mt-1">
      {{ unansweredNumbers }}
    </p>
  </Transition>
</template>
```

**Computed helper:** `unansweredNumbers` mengubah `unansweredQuestions` jadi string:

```js
const unansweredNumbers = computed(() =>
  unansweredQuestions.value.map((item) => item.globalNumber).join(", "),
);
```

### 3. UI — Tanda Merah pada Soal yang Belum Dijawab

Tambahkan **dynamic class binding** pada container tiap soal (`<div v-for="(q, i) in section.questions"`):

```html
<div
  v-for="(q, i) in section.questions"
  :key="q.id"
  class="rounded-xl p-1 md:p-4 transition-colors"
  :class="{
    'border-l-2 border-red-400 bg-red-50/30': !answers[q.id],
  }"
>
```

**Penjelasan:**
- `border-l-2 border-red-400` — memberi garis merah di kiri.
- `bg-red-50/30` — latar merah sangat tipis (bisa disesuaikan dengan warna yang tersedia di proyek).
- Jika tidak ada class merah yang predefined, bisa pakai style inline atau class kustom.

Alternatif desain (pilih salah satu sesuai preferensi visual):
- Opsi A: Border kiri merah + background merah tipis → yang paling jelas.
- Opsi B: Hanya teks nomor yang berwarna merah → lebih subtle.
- Opsi C: Background merah sangat tipis di seluruh baris soal.

**Rekomendasi:** **Opsi A** karena paling mudah dikenali saat scroll.

### 4. Scroll ke Soal Pertama yang Belum Dijawab (Opsional)

Sebagai enhancement, saat tombol "Lihat nomor..." diklik, bisa juga scroll ke soal pertama yang belum dijawab:

```js
function scrollToFirstUnanswered() {
  const first = unansweredQuestions.value[0];
  if (first) {
    const el = document.getElementById(`question-${first.questionId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
```

Namun fitur ini opsional. **Prioritaskan** daftar nomor dan tanda merah dulu.

---

## Checklist Kepatuhan (dari `docs/code_rule.md`)

- [ ] Setiap computed/fungsi baru memiliki JSDoc (`@param`, `@returns`)
- [ ] Logika pengecekan unanswered diberi komentar penjelasan
- [ ] Tidak mengubah arsitektur data (Front → Store → Firebase)
- [ ] Tidak ada akses Firebase langsung dari Vue component
- [ ] Penamaan mengikuti camelCase untuk fungsi/variabel

---

## Prioritas & Urutan Pengerjaan

1. **Computed `unansweredQuestions` + `unansweredNumbers`** di script setup
2. **Ref `showUnansweredList`** untuk toggle visibility daftar nomor
3. **Template** — tombol "Lihat nomor yang belum dijawab" + daftar nomor merah
4. **Template** — dynamic class `border-l-2 border-red-400 bg-red-50/30` pada tiap soal yang belum dijawab
5. **Validasi** — pastikan nomor yang muncul sesuai, dan tanda merah muncul di soal yang benar
