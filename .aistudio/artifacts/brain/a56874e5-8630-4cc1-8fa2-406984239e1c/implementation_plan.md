# Rencana Penyempurnaan Tab Negara (Atlas Geopolitik & Kedaulatan Kerajaan)

Berdasarkan jawaban Anda, kita akan menyempurnakan tab **Negara** (`nation`) menjadi **Atlas Geopolitik & Kedaulatan Kerajaan (*Sovereign Realm Bible*)** yang menghubungkan penguasa, demografi ras, kekuatan militer, ekonomi, diplomasi, serta wilayah-wilayah di bawah kedaulatannya.

---

## 1. Perluasan Skema Atribut Negara (`src/types/world.ts`)
Menambahkan atribut geopolitik baru pada `LoreAttributes` untuk kategori `nation`:
- `governmentType?: string` — Klasifikasi bentuk pemerintahan untuk filter direktori (mis. *Kekaisaran / Monarki*, *Dewan Serikat / Republik*, *Persemakmuran / Otonom*, *Teokrasi / Magokrasi*).
- `nationalEmblem?: string` — Lambang panji kerajaan, warna kebesaran, dan semboyan resmi negara.
- `dominantRaces?: string[]` — Daftar Ras mayoritas dan kelompok demografi penghuni negara (terhubung langsung ke entitas **Ras**).
- `economicCommodities?: string` — Komoditas ekspor/impor utama, pusat industri/perdagangan, dan penopang ekonomi negara (mendukung sintaks `[[Nama Entitas]]`).
- `militaryStrength?: string` — Kekuatan militer darat/laut, ordo pertahanan negara, benteng strategis, dan doktrin perang (mendukung sintaks `[[Nama Entitas]]`).
- `lawsAndCulture?: string` — Hukum utama kerajaan, larangan/tabu negara, struktur kelas warga, serta tradisi masyarakat (mendukung sintaks `[[Nama Entitas]]`).
- `diplomaticAllies?: string` — Hubungan diplomasi, pakta pertahanan, dan mitra dagang luar negeri (mendukung sintaks `[[Nama Entitas]]`).
- `borderConflicts?: string` — Rival geopolitik, sengketa wilayah perbatasan, embargo, dan potensi pecahnya perang (mendukung sintaks `[[Nama Entitas]]`).

*(Tetap mempertahankan atribut `government`, `capitalCity`, `ruler`, `stateReligion`, dan `currency` yang sudah ada).*

---

## 2. Pengayaan Data Awal (`src/data/starterWorld.ts`)
- Memperkaya **Kekaisaran Gondoria** (`nat-gondoria`) dan **Kerajaan Bawah Tanah Nidavellir** (`nat-nidavellir`) dengan seluruh atribut geopolitik baru (lambang & semboyan negara, demografi ras, komoditas ekonomi, kekuatan militer, hukum & budaya, serta peta diplomasi dan konflik perbatasan).
- Menambahkan 1 entitas Negara/Kedaulatan ke-3 sebagai pelengkap peta geopolitik Aethelia: **Persemakmuran Kanopi Eldath** (`nat-eldath`, konfederasi otonom bangsa [[Sylvan Aelfir]] di wilayah [[Rimba Bayang-Bayang (Shadowwood)]]).

---

## 3. Desain Lembar Profil Negara (`src/components/CodexWorkspace.tsx`)

### A. Filter Bentuk Pemerintahan di Direktori Kiri
- Menambahkan barisan tombol filter di kolom kiri untuk tab **Negara**:
  - `Semua`, `Kekaisaran / Monarki`, `Dewan Serikat / Republik`, `Persemakmuran / Otonom`, `Teokrasi / Magokrasi`.
- Setiap kartu Negara pada daftar kiri menampilkan **Bentuk Pemerintahan**, **Ibu Kota**, **Penguasa Saat Ini**, dan jumlah **Ras Mayoritas**.

### B. Tampilan Lembar Geopolitik Negara (Mode Baca)
1. **Banner Lambang Panji & Semboyan Negara (`nationalEmblem`)**: Ditampilkan di bagian atas lembar profil negara.
2. **Kartu Spesifikasi Kedaulatan & Tautan Relasional**:
   - **Penguasa Saat Ini (`ruler`)** → Tautan klik langsung menuju profil **Character** penguasa.
   - **Ibu Kota (`capitalCity`)** → Tautan klik langsung menuju **Wilayah** terkait (jika ada).
   - **Bentuk Pemerintahan (`government`)**, **Kepercayaan Resmi (`stateReligion`)**, dan **Mata Uang (`currency`)**.
3. **Kartu Interaktif Demografi Ras Penghuni (`dominantRaces`)**: Menampilkan *chip* Ras yang mendiami negara tersebut, yang dapat diklik untuk langsung melompat ke lembar **Ras**.
4. **Panel Ekonomi, Kekuatan Militer & Hukum Masyarakat**:
   - Kartu berdampingan **Komoditas Ekonomi & Perdagangan (`economicCommodities`)** dan **Kekuatan Militer & Pertahanan Strategis (`militaryStrength`)**.
   - Kartu **Hukum Kerajaan, Ketertiban & Budaya Masyarakat (`lawsAndCulture`)**.
5. **Panel Peta Diplomasi & Konflik Perbatasan**:
   - Kartu berdampingan **Mitra Aliansi & Hubungan Diplomatik (`diplomaticAllies`)** vs **Konflik Perbatasan & Rival Geopolitik (`borderConflicts`)**.

### C. Mode Sunting dengan Pemilih Hibrida (Pilih dari Entitas atau Ketik Baru)
- **Pemilih Hibrida Penguasa (`ruler`)**: Dropdown dari daftar **Tokoh** (`character`) yang ada + kolom ketik manual.
- **Pemilih Hibrida Ibu Kota (`capitalCity`)**: Dropdown dari daftar **Wilayah** (`region`) / titik peta yang ada + kolom ketik manual.
- **Pemilih Hibrida Demografi Ras (`dominantRaces`)**: Tombol *chip* interaktif untuk memilih satu atau beberapa **Ras** (`race`) yang ada di dunia + kolom tambah ras/etnis kustom.
- Editor terstruktur untuk **Lambang & Semboyan Negara**, **Komoditas Ekonomi**, **Kekuatan Militer**, **Hukum & Budaya**, serta **Diplomasi & Konflik Perbatasan**.

### D. Direktori Otomatis Wilayah, Kelompok & Warga Negara + Tombol 1-Klik
Di bagian bawah lembar profil Negara:
1. **Daftar Otomatis Wilayah & Provinsi (`regionsOfActiveNation`)**: Menghimpun semua entitas di tab **Wilayah** yang berada di bawah kedaulatan negara ini, dilengkapi tombol 1-klik **`+ Buat Wilayah di Negara Ini`** (otomatis membuat Wilayah baru dengan `parentNation` terisi nama negara ini).
2. **Daftar Otomatis Kelompok & Organisasi (`factionsOfActiveNation`)**: Menghimpun semua **Kelompok** yang bermarkas atau beroperasi di negara ini.
3. **Daftar Otomatis Tokoh & Warga Negara (`citizensOfActiveNation`)**: Menghimpun semua **Tokoh** yang berasal dari atau memimpin negara ini.
