# Task: Tambah Argumen `cached` pada fetchLikertScales

## Tujuan

Menambahkan argumen `cached = false` pada fungsi `fetchLikertScales` di `src/stores/likert/likert.js` agar:

1. Jika `cached = true` → data diambil dari state management (`currentLikertScales`) jika sudah ada. Jika tidak ada data di state, baru fetch dari Firebase.
2. Jika `cached = false` (default) → selalu fetch dari Firebase (perilaku saat ini, tidak berubah).

---

## Analisis State yang Tersedia

| State                 | Tipe        | Isi                                                                         |
| --------------------- | ----------- | --------------------------------------------------------------------------- |
| `currentLikert`       | `ref(null)` | Likert yang sedang aktif/dibuka (hasil `getLikertById` / `getLikertBySlug`) |
| `currentLikertScales` | `ref([])`   | Skala penilaian likert yang sedang aktif (hasil `fetchLikertScales`)        |

> **Catatan penting:** `currentLikertScales` hanya menyimpan skala untuk **satu** likert (yang terakhir di-fetch). Jika user berpindah antar likert, data skala bisa tertimpa. Oleh karena itu, perlu validasi bahwa data di state memang milik `likertId` yang diminta.

---

## Rencana Implementasi

### 1. Modifikasi fungsi `fetchLikertScales` di `src/stores/likert/likert.js`

Ubah signature fungsi menjadi:

```
const fetchLikertScales = async (likertId, cached = false) => { ... }
```

#### a. Jika `cached = true`:

- Cek apakah `currentLikertScales.value` sudah terisi **dan** milik `likertId` yang diminta.
- **Validasi kepemilikan data:** Gunakan `currentLikert.value.id` sebagai penanda pemilik data skala. Karena `currentLikert` sudah menyimpan likert yang sedang aktif, dan `currentLikertScales` adalah skala untuk likert tersebut, maka:
  - Jika `currentLikert.value?.id === likertId` **dan** `currentLikertScales.value.length > 0` → data di state valid, kembalikan tanpa fetch.
  - Jika `currentLikert.value?.id !== likertId` atau `currentLikertScales.value` kosong → data tidak valid / belum ada, lanjut fetch dari Firebase.
- **Tidak perlu menambah state baru** — cukup gunakan `currentLikert` yang sudah ada.

#### b. Jika `cached = false` (default):

- Perilaku tetap seperti sekarang: selalu fetch dari Firebase, simpan ke `currentLikertScales`.

#### c. Error handling:

- Tetap gunakan `try/catch`, `console.error`, dan set `currentLikertScales.value = []` saat error (seperti sekarang).

---

### 2. Contoh pseudocode fungsi baru

```
const fetchLikertScales = async (likertId, cached = false) => {
  // Jika cached = true dan data sudah ada di state untuk likert ini
  if (
    cached &&
    currentLikert.value?.id === likertId &&
    currentLikertScales.value.length > 0
  ) {
    return currentLikertScales.value;
  }

  try {
    const data = await fetchLikertScalesFirebase(likertId);
    currentLikertScales.value = data;
    return currentLikertScales.value;
  } catch (error) {
    console.error("Error fetching likert scales:", error);
    currentLikertScales.value = [];
    throw error;
  }
};
```

---

## Pertimbangan / Catatan

- **Default `cached = false`:** Semua pemanggil yang ada (`AdminLikertQuestions`, `AdminLikertScales`, `AdminLikertSubmissions`, `AdminLikertSubmissionDetail`, `LikertResult`) tetap berperilaku sama — selalu fetch dari Firebase. Tidak ada perubahan perilaku untuk pemanggilan yang sudah ada.
- **Tidak ada state baru:** Cukup gunakan `currentLikert.value.id` sebagai penanda pemilik data skala — lebih sederhana dan tidak mengubah struktur store.
- **Kapan memakai `cached = true`:** Halaman yang sering diakses berulang (misal navigasi bolak-balik antara halaman questions dan scales) bisa memakai `cached = true` untuk menghindari fetch berulang.
- **Kapan TIDAK memakai `cached = true`:** Setelah operasi CRUD skala (tambah/edit/hapus), harus fetch ulang dengan `cached = false` agar data selalu terbaru.

---

## File yang Diubah

| File                          | Perubahan                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/stores/likert/likert.js` | Tambah argumen `cached = false` pada `fetchLikertScales` dan logika cek state (`currentLikert` + `currentLikertScales`) sebelum fetch |
