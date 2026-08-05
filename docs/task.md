# Task: Ubah Semua Tulisan di RiasecAnswerDetails.vue Menjadi text-black

## Tujuan

Mengganti semua class warna teks di `src/components/holland/RiasecAnswerDetails.vue` menjadi `text-black`.

## Analisis

File memiliki 2 mode tampilan: **bare mode** dan **card mode**. Class warna teks yang ditemukan:

| Lokasi                                            | Class Saat Ini        | Target       |
| ------------------------------------------------- | --------------------- | ------------ |
| Label section (bare & card)                       | `text-text-primary`   | `text-black` |
| Kode section `({{ section.code }})` (bare & card) | `text-text-muted`     | `text-black` |
| Label kolom (bare & card)                         | `text-text-secondary` | `text-black` |
| Teks pertanyaan terjawab (bare & card)            | `text-text-primary`   | `text-black` |
| Teks pertanyaan belum terjawab (bare & card)      | `text-text-muted`     | `text-black` |
| Judul collapsible / title (card mode)             | `text-text-muted`     | `text-black` |

## Catatan

- Icon centang (check) pada jawaban menggunakan `text-text-on-primary` — **tidak diubah** karena itu icon di atas background primary, bukan tulisan.
- Class `text-xs`, `text-sm`, `text-base`, `font-semibold`, dll tetap dipertahankan — hanya warna teks yang diganti.

## Rencana Implementasi

1. **Bare mode** — ganti 4 class warna teks:
   - `text-text-primary` → `text-black` (label section)
   - `text-text-muted` → `text-black` (kode section)
   - `text-text-secondary` → `text-black` (label kolom)
   - `:class="answeredIds.has(q.id) ? 'text-text-primary' : 'text-text-muted'"` → `text-black` (teks pertanyaan)

2. **Card mode** — ganti 6 class warna teks:
   - `text-text-muted` → `text-black` (title collapsible & title non-collapsible)
   - `text-text-primary` → `text-black` (label section)
   - `text-text-muted` → `text-black` (kode section)
   - `text-text-secondary` → `text-black` (label kolom)
   - `:class="answeredIds.has(q.id) ? 'text-text-primary' : 'text-text-muted'"` → `text-black` (teks pertanyaan)

3. **Verifikasi** — jalankan `npm run build` untuk memastikan tidak ada error.
