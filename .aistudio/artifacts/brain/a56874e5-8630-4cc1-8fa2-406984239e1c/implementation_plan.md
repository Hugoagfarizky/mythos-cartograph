# Rencana Peningkatan Tab Sejarah (Grand Historical Archive & Lore Revisionism Sheet) — MythosCartograph

## 1. Konteks & Tujuan
Menyempurnakan tab **Sejarah** (`history`) agar berfungsi sebagai **Arsip Historiografi & Dossier Peristiwa Besar Dunia** yang tidak hanya mencatat apa yang terjadi di masa lalu, tetapi juga membedakan antara **Sejarah Resmi yang Diajarkan Pemenang** dengan **Kebenaran Tersembunyi (Plot Twist)** serta terhubung langsung ke **Pita Kronologi Dunia** (`timeline`), **Negara**, **Kelompok**, **Character**, dan **Wilayah**.

Berdasarkan preferensi Anda, pembaruan tab **Sejarah** mencakup 5 fokus utama:
1. **Pemicu Awal Konflik (Casus Belli), Korban/Kerugian & Dampak Jangka Panjang Dunia**:
   - Mencatat pemicu meletusnya peristiwa (`historicalTrigger`), skala korban atau kehancuran (`casualtiesAndLosses`), hasil akhir langsung (`outcome`), serta warisan geopolitik/magis jangka panjang hingga era cerita saat ini (`worldImpactLegacy`).
2. **Sejarah Resmi Pemenang vs Kebenaran Rahasia Tersembunyi (Propaganda vs Kanon Rahasia)**:
   - Panel berdampingan khusus penulis novel untuk membandingkan **Versi Sejarah Resmi / Doktrin Umum (`officialHistoryVersion`)** dengan **Kebenaran Sejarah yang Disembunyikan (`hiddenHistoricalTruth`)**.
3. **Pemilih Hibrida Pihak Terlibat, Tokoh Kunci & Lokasi Kejadian**:
   - Saat mengedit catatan Sejarah, pengguna dapat memilih **Pihak / Fraksi Terlibat (`belligerentsList`)** dari daftar **Negara**, **Kelompok**, atau **Ras** yang ada (atau mengetik manual), memilih **Tokoh Kunci Sejarah (`keyHistoricalFigures`)** dari daftar **Character** (atau mengetik tokoh leluhur manual), serta memilih **Lokasi Kejadian Utama (`eventLocation`)** dari daftar **Wilayah** / **Pin Peta**.
   - Di mode baca, seluruh nama pihak terlibat, tokoh kunci, dan lokasi kejadian tampil sebagai tombol interaktif yang dapat diklik untuk melompat ke profil entitas terkait.
4. **Filter Jenis / Skala Peristiwa di Direktori Kiri**:
   - Menambahkan tombol filter di kolom kiri: **Semua**, **Bencana Kosmik / Arcane**, **Perang Besar & Pengepungan**, **Berdirinya / Runtuhnya Dinasti**, dan **Traktat, Pakta & Penemuan Agung**.
5. **Sinkronisasi Otomatis & Tombol 1-Klik Kirim ke Tab Kronologi**:
   - Menampilkan daftar titik waktu di tab **Kronologi** (`TimelineEvent`) yang terhubung dengan catatan Sejarah ini.
   - Menyediakan tombol 1-klik **+ Catat / Sinkronkan ke Pita Kronologi** di lembar Sejarah agar peristiwa tersebut langsung masuk ke lini masa **Kronologi** sesuai tahun dan eranya tanpa perlu mengetik ulang.

---

## 2. Perubahan Struktur Data (`src/types/world.ts` & `src/data/starterWorld.ts`)
- Menambahkan properti baru yang kompatibel ke belakang pada `LoreAttributes` di `src/types/world.ts`:
  - `historyEventType?: string` — Klasifikasi jenis/skala peristiwa (`Bencana Kosmik / Arcane`, `Perang Besar & Pengepungan`, `Berdirinya / Runtuhnya Dinasti`, `Traktat, Pakta & Penemuan Agung`).
  - `displayDate?: string` — Penanggalan lengkap peristiwa (misal: `Tahun 1 AE · Malam Gerhana Ganda`).
  - `eventLocation?: string` — Lokasi/wilayah terjadinya peristiwa (terhubung ke tab **Wilayah**).
  - `belligerentsList?: string[]` — Daftar negara, faksi, atau ras yang terlibat (chip interaktif).
  - `keyHistoricalFigures?: string[]` — Daftar tokoh kunci yang berperan dalam peristiwa tersebut (chip interaktif).
  - `historicalTrigger?: string` — Pemicu awal / penyebab langsung meletusnya peristiwa.
  - `casualtiesAndLosses?: string` — Korban jiwa, kehancuran kota, atau hilangnya artefak/ilmu kuno.
  - `worldImpactLegacy?: string` — Dampak jangka panjang terhadap peta politik dan hukum sihir saat ini.
  - `officialHistoryVersion?: string` — Narasi sejarah resmi yang diajarkan kepada masyarakat umum / bangsawan.
  - `hiddenHistoricalTruth?: string` — Kebenaran rahasia di balik peristiwa yang hanya diketahui segelintir tokoh.
- Memperkaya data awal Sejarah di `src/data/starterWorld.ts`:
  - Memperbarui **Konvergensi Gerhana Merah** (`hist-gerhana-merah`, jenis: `Bencana Kosmik / Arcane`).
  - Menambahkan catatan sejarah kedua **Perang Rantai Besi & Sumpah Kubah Ketujuh** (`hist-perang-rantai-besi`, jenis: `Perang Besar & Pengepungan`, menceritakan konflik perbatasan masa lalu antara [[Kekaisaran Gondoria]] dan [[Kerajaan Bawah Tanah Nidavellir]]).
  - Menambahkan catatan sejarah ketiga **Traktat Menara Cakrawala & Penempaan Astrolabe** (`hist-traktat-astrolabe`, jenis: `Traktat, Pakta & Penemuan Agung`).

---

## 3. Desain Antarmuka & Komponen (`src/components/CodexWorkspace.tsx` & `src/App.tsx`)

### A. Filter Jenis Peristiwa Sejarah di Kolom Direktori Kiri
- Saat berada di tab **Sejarah** (`category === 'history'`), menampilkan baris tombol filter:
  - `Semua`
  - `Bencana Kosmik / Arcane`
  - `Perang Besar & Pengepungan`
  - `Berdirinya / Runtuhnya Dinasti`
  - `Traktat, Pakta & Penemuan Agung`
- Setiap kartu Sejarah di daftar kiri menampilkan lencana jenis peristiwa, tahun/era penanggalan, serta lokasi kejadian.

### B. Lembar Profil Sejarah (View Mode)
1. **Banner Penanggalan Kronik, Pemicu Awal & Lokasi Kejadian** di bagian atas lembar Sejarah.
2. **Grid Parameter Historiografi & Kartu Interaktif Pihak Terlibat / Tokoh Kunci**:
   - Menampilkan **Jenis Peristiwa**, **Era & Tahun Penanggalan**, **Lokasi Kejadian** (tautan klik ke tab **Wilayah**), serta **Korban & Kerugian Besar**.
   - Menampilkan chip interaktif **Pihak / Negara / Kelompok Terlibat (`belligerentsList`)** dan **Tokoh Kunci Sejarah (`keyHistoricalFigures`)** yang langsung melompat ke entitas terkait saat diklik.
3. **Panel Perbandingan: Sejarah Resmi Pemenang vs Kebenaran Rahasia Tersembunyi**:
   - Dua kartu berdampingan yang mengontraskan apa yang diyakini rakyat umum vs fakta rahasia kanon untuk mendukung penulisan misteri/intrik novel.
4. **Dossier Hasil Akhir & Warisan Dampak Jangka Panjang Dunia (`outcome` & `worldImpactLegacy`)**.
5. **Panel Sinkronisasi Pita Kronologi Dunia**:
   - Menampilkan daftar kejadian di tab **Kronologi** yang merujuk pada catatan Sejarah ini, disertai tombol **+ Catat / Sinkronkan ke Pita Kronologi** untuk menambahkan atau memperbarui titik lini masa secara otomatis.

### C. Form Editor Khusus Sejarah (Edit Mode)
- Mengganti form input dasar Sejarah menjadi 3 bagian terstruktur:
  1. **Klasifikasi Peristiwa, Penanggalan Era/Tahun & Lokasi Kejadian (Pemilih Hibrida Wilayah)**.
  2. **Pihak Terlibat & Tokoh Kunci Sejarah (Pemilih Hibrida Negara/Kelompok/Ras/Character)**.
  3. **Pemicu Konflik, Dampak Dunia, serta Narasi Sejarah Resmi vs Kebenaran Rahasia**.
