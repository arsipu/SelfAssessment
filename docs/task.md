# Task Plan: Optimasi Update di Store — Tidak Fetch Ulang Semua Data

## Tujuan

Mengoptimalkan fungsi-fungsi update di `src/stores/likert/likert.js` agar setelah update selesai, **tidak perlu fetch ulang semua data dari Firebase** (`fetchLikerts()`). Cukup **mengubah state store secara langsung** berdasarkan data yang diupdate, sehingga lebih hemat data/bandwidth.

## Analisis Kode Saat Ini (`src/stores/likert/likert.js`)

### Fungsi yang Masih Memanggil `fetchLikerts()` Setelah Update

| Fungsi                                          | Masalah                                                                     |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| `updateLikert(likertId, { name, description })` | Setelah update, memanggil `fetchLikerts()` — fetch semua data dari Firebase |
| `updateLikertStatus(id, status)`                | Setelah update, memanggil `fetchLikerts()` — fetch semua data dari Firebase |

### Alur Saat Ini

#### `updateLikert`

```js
const updateLikert = async (likertId, { name, description }) => {
	try {
		await updateLikertFirebase(likertId, { name, description });
		await fetchLikerts(); // ← BOROS: fetch semua data
	} catch (error) {
		console.error("Error updating likert:", error);
		throw error;
	}
};
```

#### `updateLikertStatus`

```js
const updateLikertStatus = async (id, status) => {
	try {
		const activeLikertIds =
			status === ACTIVE
				? likerts.value
						.filter((l) => l.id !== id && l.status === ACTIVE)
						.map((l) => l.id)
				: [];

		await updateLikertStatusFirebase(id, status, activeLikertIds);
		await fetchLikerts(); // ← BOROS: fetch semua data
	} catch (error) {
		console.error("Error updating likert status:", error);
		throw error;
	}
};
```

## Rencana Implementasi

### 1. Update `updateLikert` — Ubah State Store Langsung

Setelah `updateLikertFirebase` berhasil, **ubah item di `likerts.value`** yang sesuai dengan `likertId`:

```js
const updateLikert = async (likertId, { name, description }) => {
	try {
		await updateLikertFirebase(likertId, { name, description });

		// Ubah state store langsung — tidak perlu fetch ulang
		const index = likerts.value.findIndex((l) => l.id === likertId);
		if (index !== -1) {
			likerts.value[index] = {
				...likerts.value[index],
				name,
				slug: slugify(name),
				description,
				updatedAt: new Date(), // atau serverTimestamp — lihat catatan
			};
		}
	} catch (error) {
		console.error("Error updating likert:", error);
		throw error;
	}
};
```

> **Catatan:** Untuk `slug`, store perlu mengimpor `slugify` dari `@/utils/slug` (karena `updateLikertFirebase` yang menghitung slug di file firebase, tapi store juga perlu menghitungnya untuk state). Alternatif: fungsi firebase `updateLikert` bisa mengembalikan data yang diupdate (termasuk `slug`), sehingga store tidak perlu menghitung ulang.

**Opsi yang direkomendasikan:** Ubah `src/firebase/update-likert.js` agar mengembalikan data yang diupdate (lengkap dengan `slug`), sehingga store tinggal meng-assign hasilnya ke state:

```js
// src/firebase/update-likert.js — mengembalikan data yang diupdate
export const updateLikert = async (likertId, { name, description }) => {
	const slug = slugify(name);
	await updateDoc(doc(db, "likert", likertId), {
		name,
		slug,
		description,
		updatedAt: serverTimestamp(),
	});
	return { id: likertId, name, slug, description, updatedAt: new Date() };
};
```

Kemudian di store:

```js
const updateLikert = async (likertId, { name, description }) => {
	try {
		const updated = await updateLikertFirebase(likertId, { name, description });

		// Ubah state store langsung — tidak perlu fetch ulang
		const index = likerts.value.findIndex((l) => l.id === likertId);
		if (index !== -1) {
			likerts.value[index] = { ...likerts.value[index], ...updated };
		}
	} catch (error) {
		console.error("Error updating likert:", error);
		throw error;
	}
};
```

### 2. Update `updateLikertStatus` — Ubah State Store Langsung

Setelah `updateLikertStatusFirebase` berhasil, **ubah status di `likerts.value`**:

```js
const updateLikertStatus = async (id, status) => {
	try {
		// Cari likert lain yang masih active (state management di store)
		const activeLikertIds =
			status === ACTIVE
				? likerts.value
						.filter((l) => l.id !== id && l.status === ACTIVE)
						.map((l) => l.id)
				: [];

		await updateLikertStatusFirebase(id, status, activeLikertIds);

		// Ubah state store langsung — tidak perlu fetch ulang
		// 1. Nonaktifkan likert lain yang masih active
		if (status === ACTIVE) {
			likerts.value = likerts.value.map((l) =>
				activeLikertIds.includes(l.id)
					? { ...l, status: INACTIVE, updatedAt: new Date() }
					: l,
			);
		}

		// 2. Update status likert yang dimaksud
		likerts.value = likerts.value.map((l) =>
			l.id === id ? { ...l, status, updatedAt: new Date() } : l,
		);
	} catch (error) {
		console.error("Error updating likert status:", error);
		throw error;
	}
};
```

> **Catatan:** Store perlu mengimpor `INACTIVE` dari `@/apps/status` (karena `updateLikertStatusFirebase` yang mengelola status di file firebase, tapi store juga perlu tahu nilai `INACTIVE` untuk mengubah state).

### 3. Verifikasi

- Pastikan `updateLikert` dan `updateLikertStatus` **tidak lagi memanggil `fetchLikerts()`**
- Pastikan state store (`likerts.value`) diperbarui dengan benar setelah update
- Pastikan tidak ada import yang rusak
- Pastikan pemanggil di komponen tetap berfungsi karena nama fungsi di store tidak berubah
- Jalankan `npm run build` untuk memastikan tidak ada error

## Catatan

- Nama fungsi di store **tidak berubah** agar pemanggil di komponen tidak perlu diubah
- `updateLikert` dan `updateLikertStatus` akan mengubah state store secara langsung setelah update berhasil
- `fetchLikerts()` hanya dipanggil saat inisialisasi halaman (onMounted) atau saat benar-benar perlu sinkronisasi penuh
- Store perlu mengimpor `slugify` (jika menghitung slug di store) atau fungsi firebase mengembalikan data yang diupdate
- Store perlu mengimpor `INACTIVE` dari `@/apps/status` untuk `updateLikertStatus`
