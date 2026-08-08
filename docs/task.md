# Task: Kembalikan Dokumen Scale yang Sudah Diupdate untuk Update State Langsung

## Tujuan

Mengubah fungsi di `src/firebase/add-scale.js` dan `src/firebase/update-scale.js` agar mengembalikan dokumen scale yang sudah dibuat/diupdate, sehingga `src/stores/likert/likert.js` dapat mengupdate state `currentLikertScales` secara langsung **tanpa fetch ulang** ke Firebase.

---

## Analisis Struktur Data Scale

### Format data scale yang dikembalikan `fetchLikertScalesFirebase`:

```js
{
  id: string,
  label: string,        // dari field `score` di Firestore
  description: string,  // dari field `description` di Firestore
  min: number,          // dipecah dari field `range` ("min – max")
  max: number,          // dipecah dari field `range` ("min – max")
}
```

### Fungsi Firebase saat ini:

| File                           | Return saat ini   | Masalah                                   |
| ------------------------------ | ----------------- | ----------------------------------------- |
| `src/firebase/add-scale.js`    | `ref.id` (string) | Tidak ada data lengkap untuk update state |
| `src/firebase/update-scale.js` | `undefined`       | Tidak ada data lengkap untuk update state |

---

## Rencana Implementasi

### 1. `src/firebase/add-scale.js` — Kembalikan dokumen lengkap

Setelah `addDoc` berhasil, baca kembali dokumen yang baru dibuat (atau konstruksi objek dari data yang dikirim + `ref.id`), lalu kembalikan dalam format yang sama dengan `fetchLikertScalesFirebase`:

```
{
  id: ref.id,
  label: score,              // dari argumen
  description,               // dari argumen
  min: Number(parts[0]),     // dipecah dari argumen range
  max: Number(parts[1]),     // dipecah dari argumen range
}
```

**Catatan:** Karena argumen `range` sudah tersedia, tidak perlu membaca ulang dari Firestore — cukup pecah `range` dengan regex yang sama (`/\s*[-–—]\s*/`) seperti di `fetchLikertScales`.

---

### 2. `src/firebase/update-scale.js` — Kembalikan dokumen yang sudah diupdate

Setelah `updateDoc` berhasil, konstruksi objek dari argumen (`score`, `range`, `description`) + `scaleId`, dengan format yang sama:

```
{
  id: scaleId,
  label: score,              // dari argumen
  description,               // dari argumen
  min: Number(parts[0]),     // dipecah dari argumen range
  max: Number(parts[1]),     // dipecah dari argumen range
}
```

Kembalikan objek tersebut sehingga store bisa langsung mengupdate state.

---

### 3. `src/stores/likert/likert.js` — Update state langsung tanpa fetch ulang

#### a. `addScale`

- Terima hasil dari `addScaleFirebase` (objek dokumen lengkap).
- Tambahkan objek tersebut ke `currentLikertScales.value`.
- Urutkan ulang `currentLikertScales.value` dari `min` terbesar ke terkecil (konsisten dengan `fetchLikertScalesFirebase`).
- Kembalikan objek dokumen.

#### b. `updateScale`

- Terima hasil dari `updateScaleFirebase` (objek dokumen lengkap).
- Ganti item di `currentLikertScales.value` yang `id`-nya sama dengan `scaleId`.
- Urutkan ulang `currentLikertScales.value` dari `min` terbesar ke terkecil.
- Kembalikan objek dokumen.

#### c. `deleteScale`

- Setelah `deleteScaleFirebase` berhasil, hapus item dari `currentLikertScales.value` berdasarkan `scaleId` langsung (tanpa fetch ulang).
- Ini juga menghemat fetch tambahan.

---

### 4. Contoh pseudocode

#### `addScale` di store:

```
const addScale = async (likertId, { score, range, description }) => {
  try {
    const created = await addScaleFirebase(likertId, { score, range, description });

    // Update state langsung — tidak perlu fetch ulang
    currentLikertScales.value.push(created);
    currentLikertScales.value.sort((a, b) => b.min - a.min);

    return created;
  } catch (error) {
    console.error("Error adding scale:", error);
    throw error;
  }
};
```

#### `updateScale` di store:

```
const updateScale = async (likertId, scaleId, { score, range, description }) => {
  try {
    const updated = await updateScaleFirebase(likertId, scaleId, {
      score,
      range,
      description,
    });

    // Update state langsung — tidak perlu fetch ulang
    const index = currentLikertScales.value.findIndex((s) => s.id === scaleId);
    if (index !== -1) {
      currentLikertScales.value[index] = updated;
    }
    currentLikertScales.value.sort((a, b) => b.min - a.min);

    return updated;
  } catch (error) {
    console.error("Error updating scale:", error);
    throw error;
  }
};
```

#### `deleteScale` di store:

```
const deleteScale = async (likertId, scaleId) => {
  try {
    await deleteScaleFirebase(likertId, scaleId);

    // Hapus dari state langsung — tidak perlu fetch ulang
    currentLikertScales.value = currentLikertScales.value.filter(
      (s) => s.id !== scaleId,
    );
  } catch (error) {
    console.error("Error deleting scale:", error);
    throw error;
  }
};
```

---

## Pertimbangan / Catatan

- **Format konsisten:** Objek yang dikembalikan dari `add-scale.js` dan `update-scale.js` harus persis sama dengan format dari `fetchLikertScalesFirebase` (`{ id, label, description, min, max }`) agar state konsisten.
- **Tidak perlu baca ulang dari Firestore:** Karena data (`score`, `range`, `description`) sudah tersedia sebagai argumen, cukup konstruksi objek langsung — hemat 1 request per operasi.
- **Pemanggil tidak berubah:** Semua halaman yang memanggil `addScale` / `updateScale` / `deleteScale` tetap bekerja — mereka hanya menerima return value tambahan.
- **Manfaat:** Halaman `AdminLikertScales.vue` setelah CRUD tidak perlu memanggil `fetchScales()` lagi — state sudah terupdate langsung dari store.

---

## File yang Diubah

| File                           | Perubahan                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `src/firebase/add-scale.js`    | Kembalikan objek dokumen lengkap `{ id, label, description, min, max }`                          |
| `src/firebase/update-scale.js` | Kembalikan objek dokumen lengkap `{ id, label, description, min, max }`                          |
| `src/stores/likert/likert.js`  | `addScale`, `updateScale`, `deleteScale` update `currentLikertScales` langsung tanpa fetch ulang |
