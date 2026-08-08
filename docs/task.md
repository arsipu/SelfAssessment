# Task: Optimasi getLikertBySlug — Cek State Dulu Sebelum Fetch Firebase

## Tujuan

Mengoptimalkan fungsi `getLikertBySlug` di `src/stores/likert/likert.js` agar:

1. Jika data likert dengan slug tersebut **sudah ada di state** (`likerts`), langsung gunakan dari state (hemat data / request Firebase).
2. Jika **tidak ada**, baru fetch dari Firebase.

---

## Analisis State yang Tersedia

Di dalam store `useLikertStore` (Pinia setup store), terdapat state:

| State                 | Tipe        | Isi                                                                         |
| --------------------- | ----------- | --------------------------------------------------------------------------- |
| `likerts`             | `ref([])`   | Daftar semua likert hasil `fetchLikerts()`                                  |
| `currentLikert`       | `ref(null)` | Likert yang sedang aktif/dibuka (hasil `getLikertById` / `getLikertBySlug`) |
| `currentLikertScales` | `ref([])`   | Skala penilaian likert aktif                                                |

---

## Rencana Implementasi

### 1. Modifikasi fungsi `getLikertBySlug` di `src/stores/likert/likert.js`

Ubah logika menjadi urutan pencarian berikut:

#### a. Cek di `currentLikert` (data yang sedang aktif)

- Jika `currentLikert.value` ada **dan** `currentLikert.value.slug === slug`, langsung kembalikan `currentLikert.value` tanpa fetch.

#### b. Cek di `likerts` (daftar semua likert)

- Cari `likerts.value.find((l) => l.slug === slug)`.
- Jika ketemu, set `currentLikert.value` ke hasil tersebut dan kembalikan, tanpa fetch.

#### c. Jika tidak ada di kedua state → fetch dari Firebase

- Panggil `getLikertBySlugFirebase(slug)`.
- Simpan hasilnya ke `currentLikert.value`.
- **Opsional (disarankan):** Jika likert hasil fetch belum ada di `likerts`, tambahkan ke `likerts.value` agar fetch berikutnya tidak perlu request lagi.

#### d. Error handling

- Tetap gunakan `try/catch` dan `console.error` seperti sekarang.

---

### 2. Contoh pseudocode fungsi baru

```
const getLikertBySlug = async (slug) => {
  // 1. Cek currentLikert
  if (currentLikert.value?.slug === slug) {
    return currentLikert.value
  }

  // 2. Cek daftar likerts
  const cached = likerts.value.find((l) => l.slug === slug)
  if (cached) {
    currentLikert.value = cached
    return cached
  }

  // 3. Fetch dari Firebase
  try {
    const likert = await getLikertBySlugFirebase(slug)
    currentLikert.value = likert

    // Simpan ke list jika belum ada (untuk caching)
    if (!likerts.value.some((l) => l.id === likert.id)) {
      likerts.value.push(likert)
    }

    return likert
  } catch (error) {
    console.error("Error fetching likert by slug:", error)
  }
}
```

---

## Pertimbangan / Catatan

- **Sinkronisasi:** Jika `currentLikert` sudah terisi dari likert yang sama (slug sama), data tidak perlu di-refetch — menghemat request dan menjaga konsistensi.
- **Update data:** Setelah user mengedit likert (`updateLikert`), state `currentLikert` dan `likerts` akan diupdate langsung; sehingga `getLikertBySlug` berikutnya tetap mendapat data terbaru dari state.
- **Perilaku lain tidak berubah:** Semua pemanggil (`AdminLikertQuestions`, `AdminLikertScales`, `AdminLikertSubmissions`, `LikertForm`, `LikertQuestions`, `LikertResult`, dll.) tetap menerima return value yang sama (objek likert atau `undefined` jika gagal).
- **Field `slug`:** Perlu dipastikan objek likert hasil fetch dari Firebase memiliki field `slug` (dipakai untuk pembanding). Jika tidak yakin, bisa juga membandingkan berdasarkan `id` sebagai fallback, namun karena fungsi menerima `slug` sebagai parameter, perbandingan `slug` adalah yang paling tepat.

---

## File yang Diubah

| File                          | Perubahan                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/stores/likert/likert.js` | Modifikasi fungsi `getLikertBySlug` untuk cek state (currentLikert & likerts) sebelum fetch ke Firebase |
