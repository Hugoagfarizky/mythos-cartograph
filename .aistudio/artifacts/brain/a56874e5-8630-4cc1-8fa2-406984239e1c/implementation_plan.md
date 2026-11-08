# Rencana Pembaruan Tab Map Dunia (Medieval Cartography Studio)

Pembaruan ini menyempurnakan tab **Map Dunia** menjadi studio kartografi abad pertengahan yang lengkap bagi penulis *World Bible*—mulai dari melukis jaringan sungai dan jalur ekspedisi hingga menghitung jarak serta hari tempuh perjalanan antarkota.

---

## 1. Alat Gambar Sungai & Rute Jalan / Ekspedisi (`Sungai & Rute`)
- **Mode Gambar Alur Sungai (`river`)**:
  - Penulis dapat mengeklik titik-titik berurutan di atas kanvas peta (misalnya dari pegunungan menuju pesisir laut) untuk membentuk aliran sungai melengkung (*smooth quadratic curve*) bergaya tinta sepia dan air biru-kelabu abad pertengahan, lalu menekan **"Selesai Gambar Sungai"**.
  - Dilengkapi daftar sungai di panel inspektor untuk memberi nama sungai atau menghapus alur sungai tertentu.
- **Mode Gambar Jalan Kerajaan & Rute Ekspedisi (`route`)**:
  - Menambahkan struktur data `routes: MapRoute[]` pada `MapSandboxData` dengan3 gaya jalur kartografi:
    1. **Jalan Raya Kerajaan / Jalur Dagang** (garis putus-putus tinta cokelat tua)
    2. **Rute Ekspedisi / Perjalanan Tokoh** (garis titik-titik merah segel `#9E2A2B`)
    3. **Jalur Pelayaran Samudra** (garis lengkung biru-sepia di lautan)
  - Menampilkan nama rute di sepanjang jalur atau di daftar rute pada panel kanan.

---

## 2. Pengukur Jarak & Kalkulator Waktu Tempuh (`Ukur Jarak & Hari Tempuh`)
- **Interaksi Klik 2 Titik di Peta**:
  - Saat mode **Ukur Jarak** aktif, penulis cukup mengeklik **Titik Awal (A)** dan **Titik Tujuan (B)** di mana saja pada peta (otomatis menempel/*snap* ke nama kota/kastil terdekat bila diklik di atas simbol lokasi).
  - Kanvas menampilkan garis kompas terukur di antara Titik A dan Titik B lengkap dengan lencana jarak dalam **Liga** dan **Kilometer** berdasarkan skala peta.
- **Kalkulator Waktu Tempuh Otomatis**:
  - Menampilkan kartu estimasi waktu perjalanan di bilah alat dan panel samping untuk 5 moda transportasi fiksi abad pertengahan:
    - **Berjalan Kaki / Infanteri** (~15 mil / 5 liga per hari)
    - **Kereta Kuda / Karavan Dagang** (~24 mil / 8 liga per hari)
    - **Kavaleri / Kuda Perang Cepat** (~40 mil / 13 liga per hari)
    - **Kapal Layar Kerajaan** (~75 mil / 25 liga per hari)
    - **Tunggangan Udara / Naga / Wyvern** (~150 mil / 50 liga per hari)

---

## 3. Editor Label Kaligrafi Wilayah & Warna Bendera Kerajaan
- **Inspektor Label Kaligrafi**:
  - Mengeklik teks kaligrafi wilayah di peta pada mode *Jelajah* akan membuka editor label di panel kanan: penulis dapat mengubah **isi teks**, **gaya kaligrafi** (*Kerajaan Besar*, *Wilayah/Rimba*, *Samudra/Teluk*), mengatur **kemiringan/rotasi (`-45°` s.d. `+45°`)**, atau **menghapus label**.
- **Pemilih Warna Bendera / Panji Faksi pada Simbol Lokasi**:
  - Setiap simbol Ibu Kota, Kastil, Menara, atau Pelabuhan dapat diatur **Warna Panji Kerajaannya** (Merah Kekaisaran, Emas Surya, Hijau Sylvan, Biru Samudra, Ungu Arkana, atau Hitam Besi) untuk membedakan penguasa wilayah secara visual.

---

## 4. Pengaturan Judul & Skala Peta + Sakelar Layer Kartografi
- **Sunting Identitas Peta**:
  - Tombol **"Atur Judul & Skala Peta"** untuk mengubah *Judul Peta* (yang tercetak pada lencana *Liber Mundi Cartouche* di pojok kiri atas peta), *Subjudul*, serta *Skala Liga per Grid* (yang langsung menjadi acuan rumus Pengukur Jarak).
- **Toggle Visibilitas Layer Peta**:
  - Baris sakelar cepat untuk menampilkan/menyembunyikan: **Simbol Kota/Kastil**, **Kaligrafi Wilayah**, **Jaringan Sungai**, **Rute Jalan/Ekspedisi**, dan **Garis Kompas Portolan**.
- **Ekspor Peta PNG Utuh**:
  - Memperbarui fungsi **Unduh Peta PNG** agar menggambar daratan, sungai, rute perjalanan, lencana judul *Liber Mundi*, simbol kastil/kota, dan kaligrafi wilayah ke dalam satu gambar PNG resolusi tinggi yang siap diunduh.

---

## 5. Buat Entri World Bible Langsung dari Pin Lokasi Peta
- **1-Klik Promosi Pin ke Entitas Kanon**:
  - Jika sebuah pin lokasi di peta belum terhubung ke entitas *World Bible*, panel kanan menyediakan tombol **"+ Buat Entri World Bible dari Lokasi Ini"** (dengan pilihan kategori *Wilayah*, *Negara*, atau *Artefak/Situs*) yang otomatis membuat lembar lore baru, menautkannya ke pin tersebut, dan membuka tabnya bila diinginkan.
