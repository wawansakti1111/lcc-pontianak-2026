# BAGIAN II — DESIGN SYSTEM & UI/UX SPECIFICATION
## Tema Visual: Cyber-Youth Festive Pontianak 255th • 3D Neon Bar-Race Arena

---

### 6. Filosofi Visual & Palet Warna Resmi Banner Acara
Seluruh elemen antarmuka panggung (`/display`) mengekstrak langsung palet warna, pencahayaan partikel, dan lantai jaring perspektif 3D dari banner resmi Lomba Cerdas Cermat Pemuda Kota Pontianak Tahun 2026 dalam rangka HUT ke-255 Kota Pontianak ("Pontianak Tangguh Bersahabat").

| Token Elemen Visual | Kode Warna / CSS Gradient | Penerapan pada Komponen UI |
| :--- | :--- | :--- |
| **Main Stage Background** | `linear-gradient(115deg, #6236FF 0%, #7B52FF 35%, #4EA8DE 70%, #48F0E8 100%)` | Latar belakang utama layar panggung (Ungu Elektrik di kiri menuju Cyan Terang di kanan). |
| **3D Perspective Grid Floor** | `rgba(72, 240, 232, 0.42)` + Horizon Glow `#38BDF8` | Jaring perspektif 3D di bagian bawah layar tempat kelima batang skor tim berpijak. |
| **Headline Gold & Stroke** | Fill `#FFD000` s/d `#F59E0B` + Outline `#1A103C` | Teks nama babak, sub-judul lokasi Hotel Mercure, serta bingkai & mahkota Peringkat #1. |
| **Batang Regu A (Blue-Cyan)** | `linear-gradient(180deg, #00F0FF 0%, #0051FF 100%)` | Gradasi batang vertikal dan cincin cahaya foto untuk Regu A. |
| **Batang Regu B (Gold-Amber)** | `linear-gradient(180deg, #FFE600 0%, #FF7A00 100%)` | Gradasi batang vertikal dan cincin cahaya foto untuk Regu B. |
| **Batang Regu C (Magenta-Pink)** | `linear-gradient(180deg, #FF4D94 0%, #C80064 100%)` | Gradasi batang vertikal dan cincin cahaya foto untuk Regu C (senada teks "CERMAT"). |
| **Batang Regu D (Emerald-Teal)** | `linear-gradient(180deg, #34D399 0%, #059669 100%)` | Gradasi batang vertikal dan cincin cahaya foto untuk Regu D. |
| **Batang Regu E (Violet-Indigo)** | `linear-gradient(180deg, #C084FC 0%, #6D28D9 100%)` | Gradasi batang vertikal dan cincin cahaya foto untuk Regu E. |

---

### 7. Sistem Tipografi & Keterbacaan Panggung (Rasio 16:9 Full HD)
* **Font Utama (Display & Skor)**: Gunakan `'Plus Jakarta Sans'`, `'Montserrat'`, atau `'Outfit'` dengan ketebalan 800 ExtraBold dan 900 Black agar angka skor terlihat tegas dari kursi penonton paling belakang.
* **Kestabilan Lebar Angka Skor**: Seluruh elemen angka wajib menerapkan properti CSS `font-variant-numeric: tabular-nums` supaya lebar digit tidak bergoyang saat animasi penambahan poin berjalan.
* **Gaya Teks Emas Ber-Outline Gelap**: Mengikuti teks "PEMBUKAAN & AUDISI TERTULIS" pada referensi banner, judul babak aktif menggunakan warna kuning keemasan (`#FFD000`) dengan kontur gelap pekat (`-webkit-text-stroke: 1.5px #1a103c`) agar selalu kontras di atas latar ungu-cyan.

---

### 8. Struktur Tata Letak Layar Panggung (3 Zona Vertikal Tanpa Scroll)
**Pembagian Proporsi Viewport Layar Panggung (`h-screen w-screen overflow-hidden`):**
* **Zona Atas — Header & Identitas Penyelenggara (Tinggi ~16%)**: Memuat kapsul putih di tengah atas (*White Pill Badge*) berisi logo Pemkot Pontianak, Disporapar Kota Pontianak, 255th Pontianak Tangguh Bersahabat, dan Raja CreArt; diikuti judul **LOMBA CERDAS CERMAT PEMUDA KOTA PONTIANAK 2026** serta lencana kategori aktif (🎓 KATEGORI MAHASISWA UMUM atau 🏫 KATEGORI SISWA SMA).
* **Zona Tengah — Main Bar-Race & Floating Photo Arena (Tinggi ~68%)**: Area panggung utama tempat 5 kolom grafik batang vertikal tumbuh ke atas bersama bingkai foto tim di puncaknya.
* **Zona Bawah — 3D Wireframe Grid Floor & Podium Pedestal (Tinggi ~16%)**: Lantai grid perspektif 3D tempat meletakkan kotak identitas Regu A–E, nama tim, asal kampus/SMA, serta teks lokasi acara.

---

### 9. Anatomi Visual Grafik Batang Vertikal & Foto Tim Melayang
* **Bagian Puncak (Floating Team Photo & Score Pill)**: Bingkai foto lingkaran/perisai berukuran `96px–115px` dengan `object-fit: cover` dan double-ring border putih menyala. Tepat di bawah foto menempel kapsul angka skor utama (`text-4xl font-black`) beserta indikator perubahan poin (`+100` / `-50`) yang melayang naik saat skor di-update.
* **Bagian Tengah (Animated 3D Neon Bar)**: Batang vertikal dengan sudut atas membulat (`rounded-t-2xl`), dilengkapi garis kilau kaca vertikal di sisi kiri (`bg-white/25 w-2`) dan animasi gelombang cahaya (*shimmer wave*) yang bergerak naik dari dasar ke puncak batang secara berulang.
* **Bagian Dasar (Fixed Podium Pedestal)**: Kotak identitas gelap transparan (`bg-slate-950/90 border border-white/25`) yang menempel tetap di atas lantai grid 3D, menampilkan kode **REGU A–E**, nama tim, dan nama kampus/sekolah SMA.

---

### 10. Spesifikasi Desain Halaman Panel Admin (`/admin`)
Halaman `/admin` menggunakan tema Dark Operator Console (`bg-slate-950 text-slate-100`) agar nyaman di mata operator. Bagian atas memuat bar status koneksi Cloud (🟢 Supabase Realtime Connected), tombol pengatur tayangan panggung (Mahasiswa Umum | Siswa SMA | Dual Split), pemilih mode urutan (Tetap Regu A–E vs Urut Ranking), serta grid 5 kartu kontrol tim lengkap dengan pratinjau foto tim dan tombol skor warna-warni.
