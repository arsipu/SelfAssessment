# 🎨 Theme Guide — Notes Theme

Tema warna terinspirasi dari notepad kertas krem dengan spiral coklat dan aksen garis merah. Kesan: hangat, cozy, tapi tetap profesional.

## 1. Palet Warna

### Neutral
| Token | Hex | Kegunaan |
|---|---|---|
| `--color-bg` | `#F7F3D7` | Background utama halaman (body) |
| `--color-surface` | `#FFFDF0` | Background card, panel, modal |
| `--color-surface-muted` | `#EDE8C4` | Background section alternate, table zebra, hover state |
| `--color-border` | `#EDE8C4` | Border card, divider, garis tabel |
| `--color-text-primary` | `#1F1F1F` | Teks utama (judul, isi konten) |
| `--color-text-on-primary` | `#FFFFFF` | Teks di atas background gelap (button, header) |
| `--color-text-secondary` | `#4A4A4A` | Sub-teks, deskripsi |
| `--color-text-muted` | `#8A8A8A` | Placeholder, teks disabled, caption |

### Brand / Primary
| Token | Hex | Kegunaan |
|---|---|---|
| `--color-primary` | `#8B5A2B` | Warna utama brand (tombol, link aktif, ikon) |
| `--color-primary-hover` | `#6B4226` | State hover/pressed dari primary |
| `--color-primary-soft` | `#EDE8C4` | Background lembut untuk badge/chip primary |

### Data-viz / Kategorikal
Dipakai untuk chart, dot indicator, legend — 6 warna berbeda biar mudah dibedakan:
`--color-viz-1` s/d `--color-viz-6` → merah, biru, coklat muda, hijau, oranye, coklat tua.

### Level Scale (Likert 1–5)
| Level | Warna | Soft |
|---|---|---|
| 1 (terendah) | `--color-level-1` `#E23A3A` | `--color-level-1-soft` `#F8D9D9` |
| 2 | `--color-level-2` `#A9763E` | `--color-level-2-soft` `#F0E6D2` |
| 3 | `--color-level-3` `#F5A623` | `--color-level-3-soft` `#FCEBD0` |
| 4 | `--color-level-4` `#3A7CA5` | `--color-level-4-soft` `#D9E7EE` |
| 5 (tertinggi) | `--color-level-5` `#4CAF50` | `--color-level-5-soft` `#DCF0DD` |

### Semantic / Status
| Token | Hex | Kegunaan |
|---|---|---|
| `--color-success` | `#4CAF50` | Pesan sukses, status selesai |
| `--color-warning` | `#F5A623` | Peringatan, perlu perhatian |
| `--color-danger` | `#E23A3A` | Error, hapus, gagal |

Masing-masing punya versi `-soft` untuk background alert/badge (mis. `--color-success-soft`).

### Table
| Token | Hex | Kegunaan |
|---|---|---|
| `--color-table-header` | `#6B4226` | Background header tabel |
| `--color-table-header-text` | `#FFFFFF` | Teks header tabel |
| `--color-table-value` | `#FFFDF0` | Background baris/isi tabel |
| `--color-table-value-text` | `#1F1F1F` | Teks isi tabel |

---

## 2. Panduan Penggunaan per Komponen

### Body / Background
```css
body { background-color: var(--color-bg); }
```
Halaman pakai `--color-bg` (krem), bukan putih polos — biar konsisten sama nuansa "kertas notes".

### Header / Navbar
- Background: `--color-primary` (`#8B5A2B`) atau `--color-primary-hover` (`#6B4226`) untuk yang lebih tegas
- Teks/logo: `--color-text-on-primary`
- Hover menu: `--color-danger` (`#E23A3A`) sebagai aksen merah khas notes
- Border bawah: `--color-primary-hover`

### Sidebar
- Background: `--color-primary-hover` (`#6B4226`, lebih gelap dari header biar ada kontras)
- Teks menu default: `--color-surface` (`#FFFDF0`)
- Menu aktif: background `--color-primary` + border kiri `--color-danger` 4px, atau full background `--color-danger`
- Icon: `--color-primary-soft`

### Card / Panel
- Background: `--color-surface`
- Border: `1px solid var(--color-border)`
- Shadow: `0 2px 8px rgba(107, 66, 38, 0.12)` (soft shadow coklat)
- Judul: `--color-text-primary`
- Isi: `--color-text-secondary`

### Tabel
Gunakan class `.app-table` yang sudah didefinisikan di `main.css`:
```html
<table class="app-table">
  <thead><tr><th>Kolom</th></tr></thead>
  <tbody><tr><td>Isi</td></tr></tbody>
</table>
```
- Header: `--color-table-header` bg + `--color-table-header-text`
- Baris genap (zebra, opsional tambahan): `--color-surface-muted`
- Hover row (opsional tambahan): `--color-primary-soft`
- Border antar sel: `--color-border`

### Tombol
- **Primary**: bg `--color-primary`, teks `--color-text-on-primary`, hover `--color-primary-hover`
- **Danger/Aksen** (untuk aksi penting, mengikuti garis merah notes): bg `--color-danger`, hover warna lebih gelap
- **Outline**: border `--color-primary`, teks `--color-primary`, hover bg `--color-primary-soft`
- **Disabled**: bg `--color-surface-muted`, teks `--color-text-muted`

### Form / Input
- Border default: `--color-border`
- Border focus: `--color-primary`
- Background: `--color-surface`
- Placeholder: `--color-text-muted`
- Error state: border `--color-danger`, helper text `--color-danger`

### Badge / Chip / Tag
- Default: bg `--color-primary-soft`, teks `--color-primary-hover`
- Success: bg `--color-success-soft`, teks `--color-success`
- Warning: bg `--color-warning-soft`, teks `--color-warning`
- Danger: bg `--color-danger-soft`, teks `--color-danger`

### Chart / Data Visualization
Pakai urutan `--color-viz-1` sampai `--color-viz-6` untuk tiap seri/kategori data supaya konsisten di semua chart pada aplikasi.

### Likert / Level Indicator
Pakai pasangan `--color-level-N` (dot/bar) dan `--color-level-N-soft` (background label) sesuai skor 1–5.

### Footer
- Background: `--color-primary-hover` (`#6B4226`) atau `--color-text-primary` (`#1F1F1F`) untuk footer lebih gelap/tegas
- Teks: `--color-surface`
- Link hover: `--color-danger`

### PDF Export
Style khusus `.pdf-exporting` sudah disesuaikan supaya background & border tetap konsisten dengan tema saat file diexport ke PDF (pakai `--color-surface` dan `--color-border` versi hex langsung, karena beberapa PDF renderer tidak selalu resolve CSS variables).

---

## 3. Catatan Migrasi dari Tema Lama

| Elemen | Warna Lama | Warna Baru |
|---|---|---|
| `--color-bg` | `#fff9e5` | `#F7F3D7` |
| `--color-surface` | `#ffffff` | `#FFFDF0` |
| `--color-border` / `--color-surface-muted` | `#e8e6d9` / `#f7f6ee` | `#EDE8C4` |
| `--color-text-primary` | `#1c1b16` | `#1F1F1F` |
| `--color-text-secondary` | `#6b6a5f` | `#4A4A4A` |
| `--color-text-muted` | `#9a988a` | `#8A8A8A` |
| `--color-primary` | `#a8623f` | `#8B5A2B` |
| `--color-primary-hover` | `#8a4f32` | `#6B4226` |
| `--color-primary-soft` | `#f3e7df` | `#EDE8C4` |
| `--color-danger` | `#b3503f` | `#E23A3A` |
| `--color-warning` | `#b8863a` | `#F5A623` |
| `--color-success` | `#3f7d5c` | `#4CAF50` |
| `--color-table-header` | `#754c35` | `#6B4226` |
| `--color-table-value` | `#FFFFB8` (kuning cerah) | `#FFFDF0` (krem lembut, lebih konsisten sama tema) |

Semua warna `-soft` dan turunan level/viz ikut disesuaikan biar tetap harmonis dengan palet baru.