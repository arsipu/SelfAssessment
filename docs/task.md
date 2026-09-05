# Task: Penomoran Soal Global (1–N) di Seluruh Section

## Ringkasan

Saat ini, penomoran soal/pertanyaan pada halaman pertanyaan (`LikertQuestions.vue`) dan hasil jawaban (`LikertAnswerSections.vue`) dihitung **per section** — yaitu menggunakan index lokal dari `v-for` pada tiap section, sehingga nomor restart dari 1 setiap berganti section.

Yang diminta: nomor harus **global (1, 2, 3, …, N)** tanpa peduli section mana pun. Artinya, soal ke-1 section A adalah nomor 1, soal ke-1 section B adalah nomor (jumlah soal section A) + 1, dan seterusnya.

---

## File yang perlu dimodifikasi

| File | Perubahan |
|---|---|
| `src/pages/likert/LikertQuestions.vue` | Penomoran di template: ganti `{{ i + 1 }}` menjadi nomor global |
| `src/components/likert/LikertAnswerSections.vue` | Penomoran di template: ganti `{{ i + 1 }}` (list) dan `{{ itemIndex + 1 }}` (table) menjadi nomor global |

> **Catatan:** `LikertResult.vue` tidak perlu diubah secara langsung karena ia melempar data `sections` ke komponen `LikertAnswerSections`. Cukup perbaiki `LikertAnswerSections` saja.

---

## Pendekatan Teknis

### 1. `LikertQuestions.vue` — Penomoran Global di Template

**Lokasi perubahan:** Template bagian `v-for="section in sections"` → `v-for="(q, i) in section.questions"` yang saat ini menampilkan `{{ i + 1 }}`.

**Pendekatan:**

Di `script setup`, buat **computed property** baru (atau extended dari `sections`) yang menambahkan properti `globalStartIndex` pada tiap section, yaitu total jumlah pertanyaan dari semua section sebelumnya.

```js
// Contoh pendekatan:
const sectionsWithGlobalIndex = computed(() => {
  let offset = 0;
  return sections.value.map((section) => {
    const start = offset;
    offset += section.questions.length;
    return { ...section, globalStartIndex: start };
  });
});
```

Lalu di template, ganti `{{ i + 1 }}` menjadi `{{ section.globalStartIndex + i + 1 }}`.

**Keuntungan:**
- Tidak perlu mengubah struktur data pertanyaan.
- `sections` computed asli tetap bisa digunakan di tempat lain (jika ada).
- Computed baru hanya menambahkan satu properti `globalStartIndex`.

**Aturan kode (`docs/code_rule.md`) yang harus dipatuhi:**
- Setiap fungsi/computed **wajib** punya JSDoc.
- Beri komentar `//` untuk logika offset.
- Ikuti pola penulisan yang konsisten dengan kode yang sudah ada.

### 2. `LikertAnswerSections.vue` — Penomoran Global untuk List & Table

**Lokasi perubahan:**
- `variant="list"`: baris `{{ i + 1 }}` di `v-for="(item, i) in section.items"`.
- `variant="table"`: baris `{{ itemIndex + 1 }}` di `v-for="(item, itemIndex) in section.items"`.

**Pendekatan:**

Sama seperti di atas — pass `globalStartIndex` sebagai bagian dari tiap objek section. Karena `LikertResult.vue` yang membangun array `sections`, maka perhitungan offset bisa dilakukan di **`LikertResult.vue`** saat membangun `sections` computed, atau alternatifnya di **`LikertAnswerSections.vue`** sendiri (lebih otonom).

**Opsi A (lebih otonom):** `LikertAnswerSections` menerima props `sections` biasa lalu menghitung `globalStartIndex` secara internal via computed. Ini membuat komponen tidak bergantung pada parent.

**Opsi B (lebih eksplisit):** `LikertResult.vue` menghitung `globalStartIndex` saat membangun `sections`, lalu melemparnya sebagai bagian dari data section. `LikertAnswerSections` tinggal pakai.

**Rekomendasi:** **Opsi A** karena komponen lebih mandiri, dan parent tidak perlu diubah.

**Detail Opsi A:**

Di `LikertAnswerSections.vue`:

```js
/**
 * ...
 */
const sectionsWithGlobalIndex = computed(() => {
  let offset = 0;
  return props.sections.map((section) => {
    const start = offset;
    offset += section.items.length;
    return { ...section, globalStartIndex: start };
  });
});
```

Lalu di template, iterasi dari `sectionsWithGlobalIndex` dan tampilkan:
- List: `{{ section.globalStartIndex + i + 1 }}`
- Table: `{{ section.globalStartIndex + itemIndex + 1 }}`

---

## Checklist Kepatuhan (dari `docs/code_rule.md`)

- [ ] Setiap computed/fungsi baru memiliki JSDoc (`@param`, `@returns`)
- [ ] Logika offset (perhitungan globalStartIndex) diberi komentar penjelasan
- [ ] Tidak mengubah arsitektur data (Front → Store → Firebase)
- [ ] Tidak ada akses Firebase langsung dari Vue component
- [ ] Penamaan mengikuti camelCase untuk fungsi/variabel
- [ ] Error handling tidak diperlukan karena ini operasi murni computed

---

## Prioritas & Urutan Pengerjaan

1. **`LikertQuestions.vue`** — ubah penomoran di template
2. **`LikertAnswerSections.vue`** — ubah penomoran di template (list & table)
3. **Validasi** — pastikan numbering berjalan 1–N, tidak ada loncatan atau pengulangan
