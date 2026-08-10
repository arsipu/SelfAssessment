# Firestore Schema

## Collection: `likert`

Collection untuk menyimpan data instrumen/tes Likert (Skala Kesiapan Kerja).

### Document Structure

| Field         | Type      | Description                                      | Example Value                        |
| ------------- | --------- | ------------------------------------------------ | ------------------------------------ |
| `createdAt`   | timestamp | Waktu dokumen dibuat                             | `July 22, 2026 at 10:42:34 AM UTC+7` |
| `description` | string    | Deskripsi singkat formulir                       | `"Test formulir baru"`               |
| `name`        | string    | Nama instrumen Likert                            | `"Skala Kesiapan Kerja"`             |
| `slug`        | string    | Slug unik untuk URL/identifikasi                 | `"skala-kesiapan-kerja"`             |
| `status`      | string    | Status instrumen (`active`, `draft`, `inactive`) | `"active"`                           |
| `updatedAt`   | timestamp | Waktu dokumen terakhir diperbarui                | `August 5, 2026 at 8:56:00 PM UTC+7` |

### Contoh Dokumen

```json
{
	"createdAt": "2026-07-22T03:42:34.000Z",
	"description": "Test formulir baru",
	"name": "Skala Kesiapan Kerja",
	"slug": "skala-kesiapan-kerja",
	"status": "active",
	"updatedAt": "2026-08-05T13:56:00.000Z"
}
```

### Subcollection: `scale`

Subcollection di dalam dokumen `likert` untuk menyimpan data skala/rentang penilaian.

#### Document Structure

| Field         | Type   | Description           | Example Value |
| ------------- | ------ | --------------------- | ------------- |
| `description` | string | Deskripsi skala       | `"Good"`      |
| `range`       | string | Rentang nilai skala   | `"10 – 100"`  |
| `score`       | string | Skor/label dari skala | `"Tes"`       |

#### Contoh Dokumen

```json
{
	"description": "Good",
	"range": "10 – 100",
	"score": "Tes"
}
```

### Subcollection: `categories`

Subcollection di dalam dokumen `likert` untuk menyimpan data kategori beserta pertanyaan-pertanyaannya.

#### Document Structure

| Field       | Type      | Description                      | Example Value                        |
| ----------- | --------- | -------------------------------- | ------------------------------------ |
| `createdAt` | timestamp | Waktu dokumen dibuat             | `August 7, 2026 at 9:37:05 PM UTC+7` |
| `name`      | string    | Nama kategori                    | `"Katogori 2"`                       |
| `order`     | int64     | Urutan kategori                  | `0`                                  |
| `questions` | array     | Daftar pertanyaan dalam kategori | _(lihat di bawah)_                   |

#### Struktur `questions` (Array of Maps)

Setiap elemen dalam array `questions` adalah sebuah map dengan struktur berikut:

| Field       | Type   | Description        | Example Value                            |
| ----------- | ------ | ------------------ | ---------------------------------------- |
| `favorable` | string | Arah pernyataan    | `"favorable"`                            |
| `id`        | string | ID unik pertanyaan | `"aa301d65-e647-413f-9ad4-c7f9ba9ac0a3"` |
| `question`  | string | Teks pertanyaan    | `"Teks 1"`                               |

#### Contoh Dokumen

```json
{
	"createdAt": "2026-08-07T14:37:05.000Z",
	"name": "Katogori 2",
	"order": 0,
	"questions": [
		{
			"favorable": "favorable",
			"id": "aa301d65-e647-413f-9ad4-c7f9ba9ac0a3",
			"question": "Teks 1"
		}
	]
}
```

> **Catatan:** Nilai `createdAt` dan `updatedAt` disimpan sebagai Firestore `Timestamp`. Nilai di atas ditampilkan dalam format ISO 8601 (UTC) sebagai representasi dari waktu lokal UTC+7.
