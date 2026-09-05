# Tugas: Sederhanakan Tampilan LikertAnswerSections

## Tujuan

Mengubah komponen `LikertAnswerSections.vue` agar:

1. **Section labels tidak perlu ditampilkan** — baik di mode `list` maupun `table`.
2. **Pada mode `table`**, semua soal dan jawaban ditampilkan dalam **1 tabel saja**, bukan satu tabel per section.

## Analisis Awal

### Bagaimana `sections` dikonstruksi (di `LikertResult.vue`)

```js
const sections = computed(() => {
  const answers = result.value?.answers || [];
  const grouped = {};

  for (const a of answers) {
    const question = likertQuestionsStore.questions.find(
      (q) => q.id === a.questionId,
    );
    if (!grouped[a.categoryId]) grouped[a.categoryId] = [];
    grouped[a.categoryId].push({
      questionId: a.questionId,
      questionText: question?.question || "(soal tidak ditemukan)",
      answerLabel: answerLabelMap[a.answer] || a.answer || "-",
      point: a.point ?? "-",
    });
  }

  return Object.keys(grouped).map((categoryId) => {
    const cat = categoryStore.categories.find((c) => c.id === categoryId);
    return {
      key: categoryId,
      label: cat?.name || "Tanpa kategori",
      items: grouped[categoryId],
    };
  });
});
```

Setiap elemen `section` memiliki: `key`, `label`, dan `items` (array).

### Bagaimana `LikertAnswerSections` saat ini

Ada dua varian:

| Varian | Letak |
|--------|-------|
| `list` | Tidak dipakai di kode saat ini (hanya fallback) |
| `table` | Dipakai di `LikertResult.vue` (line 148) |

#### Mode `list` (sekarang)
- Tiap section: label + bullet, lalu item-item dalam kotak `bg-surface-muted`.
- Setiap item menampilkan nomor global + teks soal + label jawaban.

#### Mode `table` (sekarang)
- Tiap section: heading `h2` berisi `section.label`, lalu satu `<table>` terpisah.
- Tabel memiliki kolom: No | Pertanyaan | Jawaban.
- Setiap section menghasilkan tabel sendiri-sendiri.

## Rencana Perubahan

### 1. Hapus tampilan section label di kedua varian

**Mode `list`:**
- Hapus blok:
```html
<div class="flex items-center gap-2 mb-2.5">
  <span class="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
  <span class="text-xs font-medium text-black-secondary">{{ section.label }}</span>
</div>
```

**Mode `table`:**
- Hapus blok:
```html
<div class="pt-4 md:pt-6 pb-2 flex items-center gap-2">
  <h2 class="text-xs md:text-sm font-medium text-black">{{ section.label }}</h2>
</div>
```

### 2. Gabungkan semua section menjadi satu tabel (mode `table`)

**Pendekatan:**
- Gunakan `sectionsWithGlobalIndex` (yang sudah punya penomoran global) untuk meratakan semua item dari seluruh section menjadi satu array flat.
- Tampilkan hanya satu `<table>` yang berisi semua item tersebut.
- Penomoran tetap menggunakan `globalStartIndex + itemIndex + 1` agar nomor berurut dari 1 sampai N secara global.

**Perubahan template:**
```html
<div v-else>
  <div class="overflow-x-auto pb-4 md:pb-6">
    <table class="w-full text-left border-collapse table-fixed text-xs md:text-sm">
      <thead>
        <tr>
          <th class="w-[10%] md:w-[8%] px-3 py-2 text-xs md:text-sm font-normal text-black-secondary">No</th>
          <th class="w-[60%] md:w-[50%] px-3 py-2 text-xs md:text-sm font-normal text-black-secondary">Pertanyaan</th>
          <th class="w-[30%] px-3 py-2 text-xs md:text-sm font-normal text-black-secondary">Jawaban</th>
        </tr>
      </thead>
      <tbody class="bg-surface">
        <template v-for="section in sectionsWithGlobalIndex" :key="section.key">
          <tr v-for="(item, itemIndex) in section.items" :key="item.questionId">
            <td class="px-3 py-2 text-xs md:text-sm text-black-secondary">
              {{ section.globalStartIndex + itemIndex + 1 }}
            </td>
            <td class="px-3 py-2 text-xs md:text-sm text-black">
              {{ item.questionText }}
            </td>
            <td class="px-3 py-2 text-xs md:text-sm text-black-secondary">
              {{ item.answerLabel }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</div>
```

### 3. Tidak perlu ubah `sectionsWithGlobalIndex` (computed)

Karena `sectionsWithGlobalIndex` sudah menghitung `globalStartIndex` dengan benar — offset kumulatif dari semua section sebelumnya. Ini langsung bisa dipakai untuk penomoran global di satu tabel.

### 4. Tidak perlu ubah `LikertResult.vue` (pemanggil)

Karena struktur data `sections` yang dikirim tetap sama (array of `{ key, label, items }`), hanya cara render di komponen yang berubah.

## Ringkasan

| Perubahan | File |
|-----------|------|
| Hapus section label di mode `list` | `LikertAnswerSections.vue` |
| Hapus section label & heading di mode `table` | `LikertAnswerSections.vue` |
| Gabung semua tabel per-section jadi satu tabel di mode `table` | `LikertAnswerSections.vue` |
| Tidak ada perubahan | `LikertResult.vue` |
