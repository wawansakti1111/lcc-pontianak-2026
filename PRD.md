# BAGIAN I : PRODUCT REQUIREMENTS DOCUMENT (PRD.md)
## Cloud Live Scoreboard: Grafik Batang & Foto Tim
### Lomba Cerdas Cermat Pemuda Kota Pontianak Tahun 2026

---

### 1. Ringkasan Proyek & Struktur 2 Kategori Lomba
Aplikasi Cloud Live Bar-Chart Scoreboard dirancang untuk menampilkan perolehan skor secara real-time pada layar panggung atau proyektor utama Lomba Cerdas Cermat Pemuda Kota Pontianak Tahun 2026 (HUT ke-255 Kota Pontianak di Hotel Mercure Pontianak). Berbeda dari papan skor tabel konvensional, sistem ini memvisualisasikan persaingan poin menggunakan Grafik Batang Vertikal (Vertical Bar Chart) yang bergerak naik-turun secara dinamis dengan Bingkai Foto Tim berada tepat di atas puncak batang.

#### Pembagian Wajib 2 Kategori Lomba (Total 10 Tim Terdaftar di Database Cloud)
* **Kategori 1 — Mahasiswa Umum (`category: 'mahasiswa_umum'`)**: Terdiri dari 5 Tim (Regu A, Regu B, Regu C, Regu D, Regu E). Menampilkan nama regu, nama tim/kampus, foto anggota tim, serta skor aktif.
* **Kategori 2 — Siswa SMA (`category: 'siswa_sma'`)**: Terdiri dari 5 Tim (Regu A, Regu B, Regu C, Regu D, Regu E). Menampilkan nama regu, nama sekolah SMA/sederajat, foto anggota tim, serta skor aktif.
* **Fleksibilitas Tampilan Panggung**: Operator pada Laptop Admin dapat memilih untuk menampilkan Kategori Mahasiswa Umum saja (5 batang besar), Kategori Siswa SMA saja (5 batang besar), atau Mode Split Arena (kedua kategori tampil berdampingan).

---

### 2. Arsitektur Cloud Multi-Laptop & Sinkronisasi Foto Tim
Karena operator menginput skor dari Laptop Admin sedangkan proyektor panggung dijalankan oleh Laptop Display yang terpisah, aplikasi wajib menggunakan Supabase Realtime (PostgreSQL + WebSockets) sebagai jembatan data lintas perangkat:
* **Instant WebSocket Broadcast (<100ms)**: Setiap perubahan poin pada halaman `/admin` memperbarui tabel `teams` di Supabase dan memicu animasi pegas (*spring physics*) pada batang skor di halaman `/display` tanpa perlu memuat ulang halaman.
* **Auto-Compressed Team Photo Sync (WebP Base64 / Cloud URL)**: Saat Admin memilih file foto tim dari Laptop Admin, aplikasi otomatis mengecilkan resolusi gambar menggunakan HTML5 Canvas menjadi ukuran 360x360px (format WebP kualitas 0.8, ukuran ~25KB) lalu menyimpannya ke kolom `photo_url`. Dengan metode ini, foto langsung tampil instan di Laptop Panggung tanpa kendala izin storage bucket.

---

### 3. Spesifikasi Fitur Layar Panggung (`/display` atau `/`)
* **Animated Vertical Bar Chart (Batang Skor Naik-Turun)**: Setiap kategori menampilkan 5 kolom batang vertikal untuk Regu A, B, C, D, dan E. Tinggi batang dihitung proporsional dengan rumus:
  `heightPercent = Math.max(18, Math.round((team.score / maxCategoryScore) * 100))`
  di mana `maxCategoryScore = Math.max(...scores, 500)`. Batang dengan nilai 0 atau negatif tetap memiliki tinggi pijakan dasar 18% agar tata letak tidak runtuh.
* **Floating Team Photo Header (Foto Tim di Puncak Batang)**: Bingkai foto tim diletakkan tepat di atas ujung batang dan ikut bergerak naik-turun mengikuti perubahan tinggi batang dengan animasi pegas (Framer Motion spring stiffness: 120, damping: 18).
* **Crown & Glow Peringkat #1**: Tim pemegang skor tertinggi pada kategori aktif secara otomatis menampilkan ikon Mahkota Emas 3D (👑) di atas bingkai fotonya disertai pendaran cahaya emas.
* **Number Ticker & Floating Delta Badge**: Angka skor menggunakan efek counting animation. Saat poin bertambah atau berkurang, muncul lencana melayang `+100` (hijau zamrud) atau `-50` (merah muda) di samping foto tim selama 2,5 detik.
* **Dua Mode Urutan Batang**: Dapat diatur dari Admin antara Mode Meja Regu (Tetap A–B–C–D–E) agar sesuai urutan tempat duduk panggung, atau Mode Klasemen (Auto-Sort #1–#5) di mana posisi batang bergeser mengurutkan skor tertinggi ke terendah.

---

### 4. Spesifikasi Fitur Panel Kontrol Operator (`/admin`)
* **Pemilih Tab Kategori & Kontrol Tayangan**: Operator memiliki tab pengelolaan untuk Mahasiswa Umum (5 Tim) dan Siswa SMA (5 Tim), serta tombol Stage Switcher untuk menentukan kategori mana yang sedang ditayangkan di Laptop Layar Panggung.
* **Manajemen Identitas & Upload Foto Tim**: Setiap kartu tim di Admin menyediakan input Nama Regu, Nama Tim, Nama Kampus/Sekolah SMA, serta tombol Upload Foto Tim yang langsung mengompres dan menyinkronkan foto ke Cloud.
* **Tombol Aksi Skor Cepat & Kustom**: Tersedia tombol sekali klik `+100`, `+50`, `-25`, `-50`, `-100`, serta kolom input angka bebas. Dilengkapi fitur Riwayat Skor & Tombol Undo untuk membatalkan klik terakhir jika terjadi kesalahan operator.
* **Pengaturan Cloud In-App & Mode Simulasi Lokal**: Menyediakan jendela input `SUPABASE_URL` dan `SUPABASE_ANON_KEY` langsung di antarmuka Admin (tersimpan di `localStorage`), disertai fallback otomatis agar aplikasi langsung dapat diuji coba tanpa koneksi internet.

---

### 5. Skema Database Cloud Supabase (`stage_config` & `teams`)

#### Tabel: `stage_config`
| Kolom Utama & Tipe | Nilai Default / Contoh | Fungsi dalam Sistem Realtime |
| :--- | :--- | :--- |
| `id` (INT PK) | 1 | ID unik baris konfigurasi panggung tunggal |
| `active_category_view` (TEXT) | `'mahasiswa_umum'` | Menentukan tampilan aktif di panggung: `'mahasiswa_umum'`, `'siswa_sma'`, atau `'dual'` |
| `sort_mode` (TEXT) | `'desk_order'` | Mengatur urutan batang (`'desk_order'` A–E vs `'ranking'`) |
| `current_round_title` (TEXT) | `'BABAK REBUTAN'` | Judul babak yang tampil di header panggung |
| `event_subtitle` (TEXT) | `'Hotel Mercure Pontianak'` | Menyimpan sub-judul lokasi acara |
| `confetti_ts` (BIGINT) | 0 | Timestamp pemicu ledakan confetti di layar panggung |

#### Tabel: `teams`
| Kolom Utama & Tipe | Nilai Default / Contoh | Keterangan |
| :--- | :--- | :--- |
| `id` (TEXT PK) | `'mhs_a'`, `'sma_a'` | ID unik untuk tiap tim |
| `category` (TEXT) | `'mahasiswa_umum'`, `'siswa_sma'` | Pembagian 2 kategori lomba |
| `regu` (TEXT) | `'Regu A'` s/d `'Regu E'` | Urutan meja peserta |
| `team_name` (TEXT) | `'Tim Khatulistiwa'` | Nama tim peserta |
| `institution` (TEXT) | `'Universitas Tanjungpura'` / `'SMAN 1 Pontianak'` | Asal institusi / sekolah |
| `photo_url` (TEXT) | `'data:image/webp;base64,...'` | Data WebP terkompresi atau image URL |
| `score` (INT) | 100 | Skor aktif tim |
