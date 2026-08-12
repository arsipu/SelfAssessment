# Task: Selaraskan Desain Card AdminOverview dengan AdminLikert & AdminHolland

## Tujuan

Mengubah desain card pada `src/pages/admin/AdminOverview.vue` agar selaras dengan gaya desain yang dipakai di `src/pages/admin/likert/AdminLikert.vue` dan `src/pages/admin/holland/AdminHolland.vue`.

---

## Analisis Perbedaan Desain Saat Ini

### `AdminOverview.vue` (Card saat ini)

| Aspek              | Nilai                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Border card**    | `border-border` (#ede8c4)                                                                                                                             |
| **Radius card**    | `rounded-2xl`                                                                                                                                         |
| **Shadow**         | `shadow-sm`                                                                                                                                           |
| **Header card**    | `p-5 border-b border-border` dengan ikon `w-10 h-10 rounded-xl bg-primary-soft` + judul + link "Detail"                                               |
| **Body card**      | `p-5 space-y-4` dengan mini stats grid 3 kolom (`bg-surface-muted`, `bg-success-soft`, `bg-warning-soft`), recent respondents, progress bars (kosong) |
| **Loading**        | Spinner animasi + teks "Memuat dashboard..."                                                                                                          |
| **Header halaman** | `text-2xl font-bold text-text-primary` "Dashboard"                                                                                                    |

### `AdminLikert.vue` / `AdminHolland.vue` (Gaya yang dituju)

| Aspek                 | Nilai                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Border tabel/card** | `border-black/30`                                                                                                                              |
| **Radius tabel/card** | `rounded-md`                                                                                                                                   |
| **Shadow**            | Tidak ada (tanpa shadow)                                                                                                                       |
| **Header halaman**    | `bg-surface mb-2` dengan `h1 text-lg md:text-xl font-semibold text-text-primary mb-1` + deskripsi `text-sm text-text-secondary max-w-3xl mb-3` |
| **Tombol aksi**       | `bg-primary text-white hover:bg-primary/80 px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium h-8 md:h-10`                  |
| **Loading**           | `bg-surface border border-primary-soft rounded-xl p-8 md:p-12 text-center` dengan teks "Memuat data..."                                        |
| **Tabel**             | `app-table w-full text-left border-collapse` dengan `divide-y divide-black/30`                                                                 |
| **Empty state**       | `px-4 md:px-5 py-8 text-sm text-center text-text-muted`                                                                                        |

---

## Perubahan yang Dibutuhkan

### 1. Modifikasi `src/pages/admin/AdminOverview.vue`

#### a. Header halaman — samakan dengan AdminLikert/AdminHolland

Ubah header dari:

```html
<h1 class="text-2xl font-bold text-text-primary">Dashboard</h1>
<p class="text-sm text-text-secondary mt-1">
	Ringkasan aktivitas asesmen dan responden
</p>
```

Menjadi gaya yang konsisten:

```html
<div class="bg-surface mb-2">
	<div>
		<h1 class="text-lg md:text-xl font-semibold text-text-primary mb-1">
			Dashboard
		</h1>
		<p class="text-sm text-text-secondary max-w-3xl mb-3">
			Ringkasan aktivitas asesmen dan responden
		</p>
	</div>
</div>
```

#### b. Loading state — samakan dengan AdminLikert/AdminHolland

Ubah dari spinner animasi menjadi:

```html
<div
	v-if="loading"
	class="bg-surface border border-primary-soft rounded-xl p-8 md:p-12 text-center"
>
	<p class="text-sm text-text-muted">Memuat data...</p>
</div>
```

#### c. Card Likert & Holland — samakan border & radius

Ubah class card dari:

```
rounded-2xl border border-border bg-surface shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md min-w-0
```

Menjadi:

```
bg-surface border border-black/30 rounded-md overflow-hidden
```

#### d. Header card — samakan gaya dengan tabel AdminLikert/AdminHolland

Ubah header card dari `p-5 border-b border-border` menjadi `p-4 md:p-5 border-b border-black/30` (atau sesuaikan dengan pola tabel).

Pertahankan konten (ikon, judul, deskripsi, link "Detail") karena itu konten spesifik dashboard, hanya sesuaikan styling border & padding agar selaras.

#### e. Body card — sesuaikan border & styling

Ubah body card dari `p-5 space-y-4` menjadi `p-4 md:p-5 space-y-4`, dan sesuaikan border pada elemen dalam (recent respondents, mini stats) agar konsisten dengan `border-black/30`.

#### f. Mini stats — sesuaikan styling

Pertahankan grid 3 kolom dengan `bg-surface-muted`, `bg-success-soft`, `bg-warning-soft`, tapi sesuaikan radius dari `rounded-xl` menjadi `rounded-md` agar selaras.

#### g. Recent respondents — sesuaikan styling

Pertahankan struktur (avatar, nama, instrumen, status badge), tapi sesuaikan border/radius agar konsisten.

#### h. Progress bars — aktifkan

Progress bars saat ini ada komentar `<!-- Likert Progress Bars -->` dan `<!-- Holland Progress Bars -->` yang kosong. Data `likertProgress` dan `hollandProgress` sudah dihitung di script. Tambahkan render progress bars per instrumen di dalam card, mengikuti pola `InstrumentOverviewSection.vue` (progress bar dengan `h-1.5 bg-surface-muted rounded-full` dan bar berwarna).

---

## Ringkasan File yang Diubah

| File                                | Perubahan                                                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/admin/AdminOverview.vue` | Sesuaikan header halaman, loading state, border/radius card, styling mini stats & recent respondents, aktifkan progress bars |

---

## Catatan

- Tidak ada perubahan pada logika data/script — hanya perubahan styling template.
- `likertProgress` dan `hollandProgress` sudah tersedia di script, tinggal dirender di template.
- Gaya yang dituju mengikuti pola `AdminLikert.vue` / `AdminHolland.vue` (border `border-black/30`, radius `rounded-md`, tanpa shadow).
