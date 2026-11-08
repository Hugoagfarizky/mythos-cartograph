# Rencana Peningkatan Tab Wilayah (Regional Atlas & Scene-Setting Sheet) — MythosCartograph

## 1. Konteks & Tujuan
Menyempurnakan tab **Wilayah** (`region`) agar berfungsi sebagai **Atlas Lokasi & Panduan Latar Adegan Novel (Scene-Setting Dossier)** yang membantu penulis menggambarkan suasana lokasi secara hidup sekaligus menjaga keterkaitan geografis dengan **Negara**, **Map Dunia**, **Kelompok**, **Character**, dan **Artefak & Flora**.

Berdasarkan preferensi Anda, pembaruan tab **Wilayah** mencakup 5 fokus utama:
1. **Atmosfer Sensorik, Cuaca & Detail Latar Adegan Novel**: Panel khusus untuk mencatat suasana visual, pencahayaan, suara latar, aroma udara, serta arsitektur/lanskap khas agar penulis mudah menyusun deskripsi adegan di lokasi tersebut.
2. **Daftar Titik Penting (Landmark), Distrik & Reruntuhan Lokal**: Daftar terstruktur titik-titik lokasi spesifik di dalam wilayah (misal: *Menara Lonceng Surya*, *Pelabuhan Kabut*, *Gerbang Bawah Tanah*) beserta catatan akses dan fungsinya.
3. **Ekologi Monster, Flora/Fauna Endemik & Anomali Bahaya**:
   - Pemilih hibrida **Flora, Fauna & Sumber Daya Endemik** yang dapat ditautkan langsung ke entri di tab **Artefak & Flora** (`encyclopedia`) atau diketik manual.
   - Panel **Anomali Magis, Monster Liar & Bahaya Lingkungan** yang merinci ancaman spesifik wilayah tersebut sesuai tingkat bahayanya.
4. **Pemilih Hibrida Negara Induk & Tautan Pin Peta Dunia**:
   - Saat mengedit Wilayah, pengguna dapat memilih **Kedaulatan Negara Induk** dari daftar entitas di tab **Negara** (`nation`) atau mengetik wilayah independen/tak bertuan secara bebas.
   - Pengguna juga dapat menautkan Wilayah ke **Pin Lokasi di Map Dunia** (`mapStamps`) sehingga tersedia informasi koordinat peta di lembar wilayah.
5. **Filter Tipologi Wilayah di Direktori Kiri & Daftar Otomatis Entitas Terkait**:
   - Menambahkan tombol filter di kolom kiri: **Semua**, **Ibu Kota / Metropolis**, **Benteng & Kota Perbatasan**, **Alam Liar & Hutan Magis**, dan **Zona Terkutuk / Reruntuhan**.
   - Di bagian bawah lembar Wilayah, menampilkan daftar otomatis **Pin Peta Dunia Terkait**, **Kelompok / Faksi yang Bermarkas di Wilayah Ini**, serta **Tokoh / Karakter Terkait Wilayah Ini** (lengkap dengan tombol pintas **+ Buat Karakter di Wilayah Ini**).

---

## 2. Perubahan Struktur Data (`src/types/world.ts` & `src/data/starterWorld.ts`)
- Menambahkan properti baru yang kompatibel ke belakang pada `LoreAttributes` di `src/types/world.ts`:
  - `regionType?: string` — Klasifikasi tipologi wilayah (`Ibu Kota / Metropolis`, `Benteng & Kota Perbatasan`, `Alam Liar & Hutan Magis`, `Zona Terkutuk / Reruntuhan`).
  - `sensoryAtmosphere?: string` — Panduan sensorik latar adegan (visual, suara, aroma, suhu, dan suasana jalanan/alam).
  - `landmarksList?: string[]` — Daftar titik penting, distrik, atau bangunan ikonik di dalam wilayah.
  - `endemicFloraFauna?: string[]` — Daftar tanaman magis, bijih, atau makhluk endemik (mendukung tautan klik ke tab **Artefak & Flora**).
  - `localEcologyAndHazards?: string` — Detail ekologi monster liar, anomali sihir, kutukan cuaca, atau bahaya medan.
  - `linkedMapStampLabel?: string` — Label pin lokasi di **Map Dunia** yang terhubung dengan wilayah ini.
- Memperkaya data awal Wilayah di `src/data/starterWorld.ts`:
  - Memperbarui **Kawah Abu Vaelen** (`reg-vaelen`) dan **Hutan Kabut Eldath** (`reg-shadowwood`) dengan atmosfer sensorik adegan, daftar landmark lokal, ekologi bahaya, flora/artefak endemik, dan tautan pin peta.
  - Menambahkan wilayah ketiga **Sol-Aurea, Ibu Kota Cincin Marmer** (`reg-sol-aurea`, tipologi: `Ibu Kota / Metropolis`, negara induk: `Kekaisaran Gondoria`) agar ibu kota Kekaisaran Gondoria memiliki lembar wilayah lengkap yang langsung terhubung dengan Negara, Kelompok, dan Karakter.

---

## 3. Desain Antarmuka & Komponen (`src/components/CodexWorkspace.tsx`)

### A. Filter Tipologi Wilayah di Kolom Direktori Kiri
- Saat berada di tab **Wilayah** (`category === 'region'`), menampilkan baris tombol filter:
  - `Semua`
  - `Ibu Kota / Metropolis`
  - `Benteng & Kota Perbatasan`
  - `Alam Liar & Hutan Magis`
  - `Zona Terkutuk / Reruntuhan`
- Setiap kartu wilayah di daftar kiri menampilkan lencana tipologi wilayah, nama **Negara Induk**, serta **Tingkat Bahaya**.

### B. Lembar Profil Wilayah (View Mode)
1. **Banner Atmosfer Sensorik & Panduan Latar Adegan Novel** di bagian atas kartu Wilayah (menampilkan deskripsi visual, suara, dan aroma khas lokasi untuk inspirasi penulisan adegan).
2. **Grid Parameter Geografis & Kedaulatan (Dengan Tautan Relasional Klik)**:
   - Menampilkan **Tipologi Wilayah**, **Kedaulatan Negara Induk** (tautan interaktif ke tab **Negara**), **Iklim & Cuaca**, **Sumber Daya Utama**, **Tingkat Bahaya**, serta **Tautan Pin Peta Dunia**.
3. **Panel Titik Penting (Landmark) & Flora/Fauna/Sumber Daya Endemik**:
   - Menampilkan chip daftar **Titik Penting & Distrik Lokal (`landmarksList`)**.
   - Menampilkan chip interaktif **Flora, Fauna & Artefak Endemik (`endemicFloraFauna`)** yang langsung melompat ke tab **Artefak & Flora** (`encyclopedia`) jika namanya cocok.
4. **Dossier Ekologi Monster, Anomali Magis & Bahaya Medan**:
   - Kartu khusus yang merinci ancaman lingkungan, monster penguasa wilayah, atau fenomena cuaca ekstrem dengan dukungan tautan silang `[[Nama Entitas]]`.
5. **Daftar Otomatis Kelompok Bermarkas & Tokoh di Wilayah Ini**:
   - Menampilkan daftar otomatis organisasi dari tab **Kelompok** yang bermarkas atau beroperasi di wilayah ini.
   - Menampilkan daftar otomatis tokoh dari tab **Character** yang berasal dari atau terkait dengan wilayah ini, dilengkapi tombol **+ Buat Karakter di Wilayah Ini**.

### C. Form Editor Khusus Wilayah (Edit Mode)
- Mengganti form input dasar Wilayah menjadi 3 bagian terstruktur:
  1. **Klasifikasi Geografis, Negara Induk (Pemilih Hibrida) & Pin Peta Dunia**: Dropdown tipologi wilayah, pemilih hibrida Negara Induk dari daftar **Negara**, pemilih Pin Peta dari `mapStamps`, serta input iklim dan tingkat bahaya.
  2. **Atmosfer Sensorik Adegan & Titik Penting (Landmark Builder)**: Textarea panduan sensorik latar adegan novel dan manajemen chip daftar Landmark/Distrik lokal.
  3. **Sumber Daya, Ekologi Flora/Fauna Endemik (Pemilih Hibrida) & Anomali Bahaya**: Pemilih cepat entri dari tab **Artefak & Flora** (`encyclopedia`) atau ketik manual, disertai textarea detail bahaya medan dan monster lokal.
