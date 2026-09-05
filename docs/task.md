# Task: Red Warning Saat Soal Kosong

## Tujuan
Saat soal dimuat, **jangan** tampilkan warning merah (`border-l-2 border-red-400 bg-red-50`) pada soal yang belum dijawab. Warning merah hanya muncul saat pengguna mengklik tombol "Lihat nomor yang belum dijawab".

---

## Analisis Kode Saat Ini

### File: `src/pages/likert/LikertQuestions.vue`

#### Template (baris 56-59)
Saat ini setiap soal memiliki class binding:
```html
:class="{ 'border-l-2 border-red-400 bg-red-50': !answers[q.id] }"
```
Artinya: **setiap soal yang belum dijawab langsung mendapat highlight merah** sejak halaman dimuat. Ini yang harus diubah.

#### Komponen state `showUnansweredList` (baris 207)
Sudah ada state `showUnansweredList` (default `false`) yang mengontrol visibilitas daftar nomor yang belum dijawab.

---

## Rencana Perubahan

### 1. Ubah class binding pada template
**Lokasi**: Template, baris 56-59 (elemen `div` tiap soal)

**Sebelum**:
```html
:class="{ 'border-l-2 border-red-400 bg-red-50': !answers[q.id] }"
```

**Sesudah**:
```html
:class="{ 'border-l-2 border-red-400 bg-red-50': showUnansweredList && !answers[q.id] }"
```

Dengan perubahan ini:
- Secara **default** (`showUnansweredList = false`): tidak ada highlight merah.
- Setelah pengguna mengklik **"Lihat nomor yang belum dijawab"** (`showUnansweredList = true`): highlight merah muncul pada soal yang belum dijawab.

### 2. Tidak ada perubahan lain
- Tidak perlu menambah/mengubah `script`, karena `showUnansweredList` sudah didefinisikan.
- Tidak perlu mengubah tombol atau logika toggle — hanya perlu mengubah satu baris di template.

---

## Ringkasan Perubahan
| File | Perubahan |
|------|-----------|
| `src/pages/likert/LikertQuestions.vue` | Baris ~57: tambah `showUnansweredList &&` di depan `!answers[q.id]` pada class binding |

Selesai. Hanya 1 (satu) baris yang diubah.
