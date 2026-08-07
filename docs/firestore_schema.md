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

> **Catatan:** Nilai `createdAt` dan `updatedAt` disimpan sebagai Firestore `Timestamp`. Nilai di atas ditampilkan dalam format ISO 8601 (UTC) sebagai representasi dari waktu lokal UTC+7.
