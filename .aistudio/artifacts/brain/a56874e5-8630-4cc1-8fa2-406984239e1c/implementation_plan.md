# Rencana Peningkatan Tab Artefak & Biota (Relic Vault, Bestiary & Alchemical Herbarium Sheet) — MythosCartograph

## 1. Konteks & Tujuan
Menyempurnakan tab **Artefak & Biota** (`encyclopedia`) menjadi **Ensiklopedia Pusaka, Bestiari Monster & Herbarium Alkimia Terpadu** yang mendukung kebutuhan penulisan novel fantasi secara mendalam dan terhubung dua arah dengan **Character**, **Kelompok**, **Ras**, **Wilayah**, dan **Power System**.

Berdasarkan pilihan Anda, peningkatan tab **Artefak & Biota** mencakup 5 pilar utama:
1. **Filter Sub-Kategori & Tingkat Kelangkaan di Direktori Kiri**:
   - Menambahkan tombol filter Sub-Kategori di kolom kiri: **Semua**, **Artefak & Pusaka**, **Flora & Herbal**, **Fauna & Monster**, serta **Bahasa & Budaya**.
   - Menambahkan filter dropdown **Tingkat Kelangkaan** (*Semua Kelangkaan*, *Artefak Tunggal (1 di Dunia)*, *Sangat Langka / Legendaris*, *Langka / Terbatas*, *Endemik / Musiman*, *Umum*).
2. **Pemilih Hibrida Pemilik Saat Ini, Pencipta/Asal-Usul & Habitat Wilayah**:
   - Saat mengedit entri Artefak atau Biota, pengguna dapat memilih **Pemilik / Pemegang Saat Ini (`currentHolder`)** dari daftar **Character** atau **Kelompok** (atau mengetik manual), memilih **Pencipta / Bangsa Penempa (`creatorOrOrigin`)** dari daftar **Ras**, **Character**, atau **Kelompok**, memilih **Sistem Kekuatan Terkait (`linkedPowerSystem`)** dari tab **Power System**, serta memilih **Habitat / Lokasi Asal (`habitatOrOrigin`)** dari daftar **Wilayah** / **Negara**.
   - Di mode baca, seluruh nama pemilik, pencipta, sistem kekuatan, dan habitat tampil sebagai tautan interaktif yang langsung membuka halaman entitas terkait saat diklik.
3. **Dossier Pusaka: Syarat Aktivasi, Kutukan/Efek Samping & Cara Menghancurkan**:
   - Menyediakan kartu khusus untuk mencatat **Syarat Penyelarasan & Aktivasi (`attunementRequirement`)**, **Kutukan, Efek Samping & Harga Penggunaan (`curseOrSideEffect`)**, **Sejarah Perpindahan Tangan (`ownershipHistory`)**, serta **Kelemahan Mutlak / Cara Menghancurkan (`destructionMethod`)**.
4. **Dossier Bestiari & Alkimia: Perilaku Monster, Bagian Tubuh Berharga & Resep Ramuan**:
   - Menyediakan bagian khusus untuk entri Flora/Fauna/Monster yang mencatat **Perilaku Ekologi, Pola Berburu & Ancaman (`creatureBehavior`)**, **Bagian Tubuh / Komponen Panen Berharga (`harvestableMaterials`)**, serta **Khasiat Alkimia, Medis & Pengolahan Kriya (`alchemicalUses`)**.
5. **Daftar Otomatis Karakter Pemilik, Kelompok & Wilayah Habitat + Tautan Cepat 1-Klik**:
   - Menampilkan secara otomatis seluruh **Character** yang memiliki artefak ini di inventaris mereka (`ownedArtifacts`), seluruh **Kelompok** yang menguasainya (`factionArtifacts`), serta seluruh **Wilayah** tempat flora/fauna ini tumbuh atau menghuni (`endemicFloraFauna`).
   - Menyediakan panel **Tautkan Cepat ke Karakter / Wilayah (1-Klik)** langsung dari lembar Artefak & Biota agar penulis dapat memberikan pusaka ke tokoh tertentu atau menanamkan monster/herbal ke suatu wilayah secara instan.

---

## 2. Perubahan Struktur Data (`src/types/world.ts` & `src/data/starterWorld.ts`)
- Menambahkan properti opsional baru yang kompatibel ke belakang pada `LoreAttributes` di `src/types/world.ts`:
  - `currentHolder?: string` — Tokoh atau organisasi yang saat ini memegang/menguasai pusaka atau spesimen.
  - `creatorOrOrigin?: string` — Empu, bangsa, atau fenomena kosmik yang menciptakan artefak/biota ini.
  - `linkedPowerSystem?: string` — Sistem sihir/kekuatan yang mengalir di dalam artefak atau makhluk ini.
  - `attunementRequirement?: string` — Syarat penyelarasan darah/meridian atau pemicu aktivasi.
  - `curseOrSideEffect?: string` — Kutukan, efek balik (*backlash*), atau risiko keracunan/korupsi.
  - `destructionMethod?: string` — Satu-satunya cara menghancurkan pusaka atau melumpuhkan monster ini.
  - `ownershipHistory?: string[]` — Urutan sejarah perpindahan kepemilikan pusaka dari masa ke masa.
  - `creatureBehavior?: string` — Pola hidup, insting berburu, atau siklus mekarnya biota di alam liar.
  - `harvestableMaterials?: string[]` — Daftar material berharga yang bisa dipanen (misal: *Kelopak Lentera*, *Sisik Wyvern Es*, *Inti Kristal*).
  - `alchemicalUses?: string` — Kegunaan dalam ramuan alkimia, penempaan senjata, atau pengobatan.
- Memperkaya data awal **Artefak & Biota** di `src/data/starterWorld.ts`:
  - Memperbarui **Astrolabe Api Surya** (`enc-astrolabe-surya` — *Artefak & Pusaka*) dan **Bunga Lentera Malam** (`enc-bunga-lentera` — *Flora & Herbal*) dengan atribut lengkap.
  - Menambahkan 2 entri kanon baru agar keempat sub-kategori terwakili:
    1. **Wyvern Sayap-Kaca Utara** (`enc-wyvern-sayap-kaca` — *Fauna & Monster*, predator puncak di [[Puncak Wyvern]] yang sayap kristalnya membiaskan cahaya surya).
    2. **Aksara Bintang Aethel & Bahasa Tinggi Sylvan** (`enc-aksara-bintang` — *Bahasa & Budaya*, sistem aksara geometris kuno yang digunakan dalam gulungan perjanjian dan segel [[Resonansi Eteris Astral]]).

---

## 3. Desain Antarmuka & Komponen (`src/components/CodexWorkspace.tsx`)

### A. Filter Sub-Kategori & Kelangkaan di Kolom Direktori Kiri
- Saat berada di tab **Artefak & Biota** (`category === 'encyclopedia'`), menampilkan:
  - Tombol filter Sub-Kategori: `Semua`, `Artefak & Pusaka`, `Flora & Herbal`, `Fauna & Monster`, `Bahasa & Budaya`.
  - Dropdown filter **Tingkat Kelangkaan**.
- Setiap kartu di daftar kiri menampilkan sub-kategori, tingkat kelangkaan, pemilik/habitat saat ini, serta jumlah komponen panen atau riwayat pemilik.

### B. Lembar Profil Artefak & Biota (View Mode)
1. **Banner Khasiat Arcane & Manifestasi Utama (`magicalProperties`)** di bagian atas lembar profil.
2. **Grid Parameter Ensiklopedia dengan Tautan Silang Klik**:
   - Menampilkan Sub-Kategori, Tingkat Kelangkaan, **Pemilik / Pemegang Saat Ini** (klik ke Character/Kelompok), **Pencipta / Bangsa Penempa** (klik ke Ras/Character), **Sistem Kekuatan Terkait** (klik ke Power System), dan **Habitat / Lokasi Asal** (klik ke Wilayah/Negara).
3. **Kartu Chip Interaktif: Riwayat Kepemilikan (`ownershipHistory`) & Material Panen Berharga (`harvestableMaterials`)**.
4. **Dossier Mekanisme Pusaka & Bestiari**:
   - Kartu berdampingan untuk **Syarat Aktivasi & Penyelarasan (`attunementRequirement`)** vs **Kutukan, Efek Samping & Risiko (`curseOrSideEffect`)**.
   - Kartu berdampingan untuk **Perilaku Ekologi & Siklus Alam (`creatureBehavior`)** vs **Khasiat Alkimia, Kriya & Cara Menghancurkan (`alchemicalUses` & `destructionMethod`)**.
5. **Panel Otomatis Karakter Pemilik, Kelompok & Wilayah Habitat + Tautan Cepat 1-Klik**:
   - Menampilkan kartu seluruh **Character**, **Kelompok**, dan **Wilayah** yang terhubung dengan entri ini, dilengkapi dropdown **+ Berikan ke Tokoh** dan **+ Tanamkan ke Wilayah** dengan 1 klik.

### C. Form Editor Khusus Artefak & Biota (Edit Mode)
- Mengganti form 3-input dasar `encyclopedia` menjadi 3 bagian terstruktur lengkap dengan pemilih hibrida dan chip builder untuk riwayat kepemilikan serta material panen.
