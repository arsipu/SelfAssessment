# Task: Tambah Gambar Hero di BerandaView.vue

## Tujuan

Menambahkan gambar `src/assets/images/hero_icon.png` di sisi kanan bagian hero pada halaman `src/pages/dashboard/BerandaView.vue`.

## Rencana Implementasi

### 1. Import Gambar

- Tambahkan import di bagian `<script setup>`:
  ```js
  import heroIcon from "@/assets/images/hero_icon.png";
  ```

### 2. Tambah Kolom Kanan (Gambar)

- Di dalam container flex hero (`flex flex-col md:flex-row items-center gap-10 md:gap-16`), tambahkan div baru **setelah** div "Kiri: Teks":
  ```html
  <!-- Kanan: Gambar -->
  <div class="flex-1 hidden md:block">
  	<img
  		:src="heroIcon"
  		alt="Ilustrasi asesmen diri"
  		class="w-full max-w-md mx-auto drop-shadow-lg"
  	/>
  </div>
  ```
- Detail:
  - `flex-1` → agar seimbang dengan kolom teks di kiri.
  - `hidden md:block` → gambar hanya tampil di layar desktop (md ke atas); di mobile disembunyikan agar hero tetap ringkas.
  - `w-full max-w-md mx-auto` → gambar proporsional, tidak terlalu besar, dan terpusat di kolomnya.
  - `drop-shadow-lg` → memberi bayangan halus agar menyatu dengan desain hero.

### 3. Verifikasi

- Jalankan dev server (`npm run dev`).
- Cek tampilan:
  - **Desktop (md+):** teks di kiri, gambar di kanan.
  - **Mobile:** hanya teks yang tampil, layout tetap rapi.
