# MythosCartograph — World Bible & Medieval Map Sandbox Studio (PRD & Implementation Plan)

Platform komprehensif bagi penulis fiksi, novelis fantasi, dan kreator dunia (*worldbuilder*) untuk merancang, memetakan, dan menjaga konsistensi semesta cerita mereka dalam satu ruang kerja bertema buku kartografi klasik (*Warm Parchment Cartography*).

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Dokumen ini merangkum **Product Requirements Document (PRD)** sekaligus cetak biru arsitektur berdasarkan preferensi yang telah Anda konfirmasi. Silakan tinjau cakupan modul dan alur interaksi di bawah ini sebelum kita mulai membangun aplikasinya.

- **Confirmed Decision 1 — Cakupan Modul Lengkap (Core + Ekstensi)**:
  - **Entitas Inti World Bible**: Karakter (*Character*), Sejarah (*History*), Ras (*Races*), Kelompok/Faksi (*Factions/Groups*), Negara (*Nations*), Wilayah (*Regions*), Linimasa (*Timeline*), Sistem Kekuatan (*Power System*), dan Keahlian (*Skills*).
  - **Modul Tambahan Terpilih**: *Relationship Graph* (peta jaringan relasi karakter & faksi), *Wiki Cross-Linking* (`@mention` atau `[[Nama Entitas]]` antar dokumen lore), *Plot & Chapter Outliner* terintegrasi, *Ensiklopedia Item/Artefak/Flora/Fauna*, serta *Asisten AI Pemeriksa Konsistensi Lore*.
- **Confirmed Decision 2 — Medieval Map Sandbox Canvas**: Kanvas peta interaktif bergaya *sandbox* kartografi abad pertengahan di mana penulis dapat menggambar daratan/perairan dengan *terrain brush* (pegunungan, hutan, sungai, gurun, rawa), menaruh stempel ikon kartografi klasik (kastil, ibu kota, reruntuhan, pelabuhan), memberi label kaligrafi wilayah, dan menautkan pin lokasi langsung ke entri *Negara*, *Wilayah*, atau *Sejarah* di World Bible.
- **Confirmed Decision 3 — Identitas Visual Warm Parchment Cartography**: Antarmuka bernuansa kertas perkamen hangat, tinta sepia tua, aksen merah segel lilin (*cinnabar/wax seal red*) dan emas kompas (*antique brass*), dengan tipografi serif klasik yang nyaman dibaca berjam-jam.
- **Confirmed Decision 4 — Penyimpanan Lokal Otomatis & Portabilitas JSON**: Seluruh progres disimpan otomatis di browser (`localStorage`) dilengkapi data contoh dunia fantasi awal yang kaya (*pre-populated starter world*), fitur *Export World Bible (.json)*, dan *Import (.json)*.

---

### 1. Overview & Core Concept

- **What It Does**:
  **MythosCartograph** menyatukan tiga pilar utama penulisan dunia fiksi ke dalam satu aplikasi terpadu:
  1. **Codex World Bible (10 Kategori Entitas)**: Basis data terstruktur dan saling terhubung untuk Karakter, Ras, Kelompok/Faksi, Negara, Wilayah, Sejarah, Sistem Kekuatan (*Power System*), Skill, serta Ensiklopedia Item/Artefak/Flora/Fauna.
  2. **Medieval Map Sandbox**: Studio kartografi interaktif berbasis HTML5 Canvas & SVG tempat penulis melukis geografi benua bergaya peta kuno, menempelkan simbol kartografi abad pertengahan, mengatur batas negara, dan menyematkan pin interaktif yang membuka detail wilayah saat diklik.
  3. **Chronicle, Relationship Graph & Plot Studio**: Visualisasi *Timeline* lintas era, diagram jaringan hubungan karakter/faksi (*Relationship Graph*), penyusun alur bab (*Chapter & Plot Outliner*), dan *AI Lore Consistency Auditor* untuk mendeteksi kontradiksi cerita.
- **Target Audience / Persona**:
  Novelis fantasi/sci-fi, penulis *webnovel* (LitRPG/Xianxia/High Fantasy), komikus, dan *Game Master* (TTRPG) yang membutuhkan sistem pencatatan lore mendalam terutama untuk mengatur *power scaling*, silsilah faksi, dan geografi dunia tanpa tercecer di banyak dokumen terpisah.
- **Key Value**:
  Mengubah catatan dunia yang statis menjadi ensiklopedia hidup yang saling terhubung (*living world codex*)—di mana setiap pin di peta, setiap bab di *outliner*, dan setiap keahlian (*skill*) milik karakter terhubung secara dua arah (*bidirectional backlink*).

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Eksplorasi & Manajemen Codex (World Bible)**:
     Penulis memilih kategori di bilah navigasi kiri (misal: *Karakter*, *Power System*, *Negara*, *Artefak & Biota*). Penulis dapat mencari, memfilter berdasarkan tag/faksi/ras, membuat entri baru melalui formulir terstruktur sesuai kategori, dan mengetik `[[Nama Entitas]]` di dalam catatan untuk membuat tautan otomatis (*Wiki Cross-Link*) beserta daftar *Backlinks* di bagian bawah halaman.
  2. **Pembuatan Peta di Medieval Map Sandbox**:
     Penulis membuka tab **World Map Sandbox**, lalu memilih mode alat:
     - *Terrain Sculptor*: Kuas untuk menggambar daratan perkamen, lautan bergaris klasik, pegunungan sketsa tangan, hutan pinus/rimba, sungai berkelok, dan batas wilayah kerajaan.
     - *Cartography Stamps & Pins*: Menempatkan simbol kastil, menara sihir, kota dagang, atau reruntuhan kuno. Saat pin diklik, muncul panel samping (*Lore Inspector Drawer*) yang menampilkan entri Wilayah/Negara terkait, populasi, faksi penguasa, serta peristiwa sejarah yang pernah terjadi di titik tersebut.
  3. **Perancangan Power System & Skill Tree**:
     Di modul **Power System & Skills**, penulis mendefinisikan aturan dasar kekuatan dunia (sumber energi, tingkatan/tier, batasan/biaya) dan merancang daftar *Skill* lengkap dengan elemen, tingkat kelangkaan, syarat penguasaan, serta daftar karakter pengguna skill tersebut.
  4. **Visualisasi Timeline & Relationship Graph**:
     - Pada **Timeline & Sejarah**, penulis menyusun kejadian berdasarkan Era/Tahun (misal: *Era Pertama - Tahun 412*) dan menghubungkannya dengan karakter, negara, atau lokasi peta.
     - Pada **Relationship Graph**, penulis melihat kanvas node interaktif yang memetakan ikatan antar karakter dan faksi (Sekutu, Musuh Bebuyutan, Guru-Murid, Keluarga, Pengkhianat) yang dapat digeser (*drag*) dan difilter.
  5. **Penyusunan Alur Cerita (Plot & Chapter Outliner) & AI Lore Check**:
     Penulis menyusun struktur Bab/Adegan dalam papan kanban atau daftar naskah, menyematkan karakter & lokasi yang terlibat di bab tersebut, lalu menekan tombol **Audit Konsistensi Lore** agar asisten AI memeriksa apakah draf bab atau entri baru bertabrakan dengan aturan *Power System*, *Timeline*, atau status karakter yang sudah tercatat.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: **Warm Parchment Cartography & Classical Grimoire** — Perpaduan keanggunan buku ensiklopedia abad pertengahan, atlas kartografi klasik, dan kerapian ruang kerja editorial modern.
  - *Color Palette & Mood* (Disiplin 60-30-10):
    - **60% Dominant Neutral Canvas**: Kertas perkamen hangat (`#F6F1E6` untuk latar utama) dan permukaan lembaran naskah terang (`#FBF8F1`) yang lembut di mata.
    - **30% Structural Surfaces & Ink**: Panel navigasi perkamen tua (`#EFE7D6`), garis batas tipis tinta sepia (`#D8CBB3`), teks utama tinta besi-empedu gelap (`#231C14`), serta teks sekunder cokelat arsip (`#695A47`).
    - **10% Accent Budget**: Merah segel lilin / *Cinnabar Wax* (`#9E2A2B`) untuk aksi utama & pin penting, kuningan kompas / *Antique Brass* (`#B5832A`) untuk sorotan aktif, serta hijau zamrud tua (`#2D5A43`) dan biru tinta kartografi (`#264653`) untuk pembeda kategori entitas.
  - *Typography & Hierarchy* (2+1 Font Rule):
    - **Display & Headings**: `Cormorant Garamond` atau `Cinzel` (Bold/SemiBold) untuk judul bab, nama kerajaan, dan label peta agar menghadirkan wibawa klasik.
    - **Body & UI Controls**: `Plus Jakarta Sans` (Regular 400 & Medium 500, ukuran 15px, tinggi baris 1.65) untuk keterbacaan optimal pada teks panjang dan kontrol antarmuka.
    - **Monospace & Tabular Figures**: `JetBrains Mono` (`tabular-nums`) khusus untuk penanggalan tahun di Timeline, koordinat grid peta (`X/Y`), dan statistik level/atribut karakter.
  - *Component Styling & Layout*:
    - Desktop 1440px+ menggunakan tata letak ruang kerja 3-zona: Sidebar Modul & Filter di kiri (`260px`), Area Kanvas/Editor Utama di tengah, dan *Contextual Inspector / Cross-Link Drawer* di kanan (`320px`, dapat dibuka/tutup).
    - Pemisahan konten menggunakan garis tipis tinta sepia (`1px solid`) dan ruang kosong yang lega tanpa menumpuk kartu di dalam kartu (*single-elevation depth*). Metadata ditampilkan sebagai teks bersih dengan pemisah tipografis (`·`), bukan kapsul warna-warni.
- **Interactive Feedback & Motion**:
  - Transisi antar modul dan pembukaan panel *Inspector* halus ($\le 180\text{ms}$) menggunakan kurva `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Kanvas peta mendukung *pan & zoom* mulus, pratinjau ukuran kuas secara langsung, dan *tooltip* instan saat kursor diarahkan ke pin lokasi atau node relasi.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Kanvas Peta Hybrid (Procedural Medieval Terrain Brush + Vector Pins & Stamps)**
  - *Chosen Approach*: Menggabungkan lapisan lukis grid/tekstur kanvas HTML5 (untuk daratan perkamen, lautan bertekstur garis pantai abad pertengahan, hutan, dan pegunungan) dengan lapisan vektor interaktif di atasnya untuk simbol kota/kastil, label nama wilayah, dan pin yang terhubung ke World Bible (ditambah opsi impor gambar latar jika penulis ingin melacak sketsa miliknya).
  - *Why*: Memberikan kebebasan *sandbox* sejati untuk membangun peta abad pertengahan dari nol langsung di dalam aplikasi, sekaligus menjaga setiap lokasi tetap interaktif dan dapat diklik untuk membuka data lore.
  - *Alternatives Considered*: Hanya mengunggah gambar statis (kurang fleksibel bagi penulis yang ingin merombak batas wilayah secara langsung saat cerita berkembang).

- **Decision 2: Skema Entitas Terpadu dengan Atribut Spesifik Kategori & Wiki Cross-Linking**
  - *Chosen Approach*: Menyediakan satu arsitektur penyimpanan entitas (`LoreEntity`) yang memiliki atribut inti seragam (ID, judul, kategori, ringkasan, isi lengkap dengan parser `[[Nama Entitas]]`, tag, dan relasi) ditambah *field khusus* untuk tiap kategori (misal: Karakter memiliki Ras, Faksi, Level Kekuatan, Daftar Skill; Power System memiliki Sumber Energi, Aturan/Batasan, Daftar Tier; Negara memiliki Ibu Kota, Sistem Pemerintahan, Wilayah Peta).
  - *Why*: Memudahkan pencarian lintas seluruh World Bible dan pembuatan *Relationship Graph* otomatis tanpa mengorbankan kedalaman detail tiap aspek dunia.
  - *Alternatives Considered*: Form teks bebas sepenuhnya seperti catatan biasa (membuat penulis kesulitan menjaga struktur atribut karakter dan aturan *power system*).

- **Decision 3: AI Lore Consistency Checker Berbasis Konteks Server-Side (`gemini-3.8-flash`)**
  - *Chosen Approach*: Menyediakan asisten audit konsistensi dan *brainstorming* melalui endpoint server Express (`/api/lore/audit` dan `/api/lore/brainstorm`) menggunakan SDK `@google/genai` dan model `gemini-3.8-flash` dengan output JSON terstruktur. Saat penulis meminta pengecekan konsistensi, aplikasi mengirimkan konteks entitas terkait (aturan *Power System*, *Timeline*, dan profil *Karakter*) untuk mendeteksi potensi *plot hole* atau memberikan ide pengembangan lore.
  - *Why*: Menjaga keamanan kunci API sepenuhnya di sisi server dan memberikan umpan balik terstruktur (daftar potensi kontradiksi, tingkat keparahan, dan saran perbaikan) yang langsung dapat ditindaklanjuti penulis.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        MYTHOSCARTOGRAPH WORKSPACE SHELL                             │
│  ┌──────────────────────┬───────────────────────────────────┬────────────────────┐  │
│  │  Left Codex Sidebar  │     Main Stage Viewport           │ Context Inspector  │  │
│  │  - Global Search     │                                   │ & AI Lore Auditor  │  │
│  │  - Module Switcher   │  ┌─────────────────────────────┐  │                    │  │
│  │  - Category Tree     │  │ 1. World Bible Codex Editor │  │ - Entity Quickview │  │
│  │  - Export/Import JSON│  │    (10 Lore Categories +    │  │ - Bidirectional    │  │
│  └──────────────────────┤  │     [[Wiki Cross-Links]])   │  │   Backlinks List   │  │
│                         │  ├─────────────────────────────┤  │ - Linked Map Pins  │  │
│                         │  │ 2. Medieval Map Sandbox     │  │ - AI Consistency   │  │
│                         │  │    (Terrain Brush, Stamps,  │  │   Report Panel     │  │
│                         │  │     Region Labels & Pins)   │  │                    │  │
│                         │  ├─────────────────────────────┤  └─────────▲──────────┘  │
│                         │  │ 3. Timeline & History       │            │             │
│                         │  │    Chronicle View           │            │             │
│                         │  ├─────────────────────────────┤            │             │
│                         │  │ 4. Interactive Relationship │            │             │
│                         │  │    Graph (Characters/Groups)│            │             │
│                         │  ├─────────────────────────────┤            │             │
│                         │  │ 5. Power System & Skill     │            │             │
│                         │  │    Matrix Builder           │            │             │
│                         │  ├─────────────────────────────┤            │             │
│                         │  │ 6. Plot & Chapter Outliner  │            │             │
│                         │  └──────────────┬──────────────┘            │             │
│                         └─────────────────┼───────────────────────────┘             │
└───────────────────────────────────────────┼─────────────────────────────────────────┘
                                            │
              ┌─────────────────────────────┴─────────────────────────────┐
              ▼                                                           ▼
┌───────────────────────────────────────────┐   ┌─────────────────────────────────────┐
│   Client World State & Persistence Store  │   │     Express Backend API Server      │
│  - Auto-save to Browser localStorage      │   │  - POST /api/lore/audit             │
│  - Bidirectional Link Indexer             │   │  - POST /api/lore/brainstorm        │
│  - Full World JSON Export / Import        │   │  - @google/genai (gemini-3.8-flash) │
└───────────────────────────────────────────┘   └─────────────────────────────────────┘
```

- **Data Model & State**:
  - **`WorldProject`**: Menyimpan metadata dunia (nama dunia, genre, kalender/nama era), koleksi `entities`, `relationships`, `timelineEvents`, `chapters`, dan `mapData`.
  - **`LoreEntity` (10 Kategori)**:
    1. `character` (Peran, Ras, Kelompok/Faksi, Asal Negara/Wilayah, Status, Tingkat Kekuatan, Daftar Skill ID, Biografi & Penampilan).
    2. `race` (Ciri Fisik, Rentang Usia, Habitat Wilayah, Kemampuan Bawaan, Budaya).
    3. `faction` (Jenis Kelompok, Pemimpin, Markas Wilayah, Ideologi/Tujuan, Sekutu & Rival).
    4. `nation` (Bentuk Pemerintahan, Ibu Kota, Penguasa, Ekonomi, Agama/Kepercayaan, Wilayah Bawahan).
    5. `region` (Iklim/Bioma, Bahaya Alam, Sumber Daya, Negara Penguasa, Koordinat Pin Peta).
    6. `history` (Era, Tahun Kejadian, Tokoh/Faksi Terlibat, Lokasi Wilayah, Dampak Sejarah).
    7. `power_system` (Sumber Energi, Hukum & Batasan Mutlak, Hirarki Tier/Tingkatan, Risiko Penggunaan).
    8. `skill` (Kategori/Cabang Power System, Tier/Rank, Efek & Mekanisme, Biaya/Cooldown, Pengguna).
    9. `encyclopedia` (Sub-tipe: *Artifact / Item*, *Flora*, *Fauna*; Kelangkaan, Khasiat/Efek, Habitat/Asal).
  - **`MapSandboxData`**: Menyimpan sel/poligon medan (*landmass, sea, mountains, forest, river, desert*), daftar `MapStamp` (ikon kastil, kota, reruntuhan, menara), `MapRegionLabel` (teks kaligrafi kerajaan/lautan), dan `MapPin` yang menyimpan `linkedEntityId` ke entitas World Bible.
  - **`RelationshipEdge`**: Menghubungkan `sourceEntityId` dan `targetEntityId` dengan tipe hubungan (`ally`, `rival`, `family`, `mentor`, `vassal`, `member`) dan catatan dinamika hubungan.
  - **`ChapterOutline`**: Menyimpan nomor bab, judul, status penulisan (*Draft, Revisi, Selesai*), ringkasan adegan, daftar `featuredCharacterIds`, `locationId`, dan teks catatan naskah.

- **Interactive Component & State Mapping**:
  - **Codex Manager & Wiki Linker**: Mengubah atau menambahkan entri langsung memperbarui indeks pencarian global dan menghitung ulang daftar *Backlinks* secara otomatis setiap kali teks mengandung sintaks `[[Nama Entitas]]`.
  - **Medieval Map Sandbox**: Mendukung mode *Draw Land/Water*, *Stamp Terrain/Icons*, *Place Lore Pin*, *Pan/Zoom*, *Undo/Redo*, dan *Clear/Generate Starter Continent*. Mengklik pin di kanvas langsung membuka detail entitas di *Context Inspector* tanpa meninggalkan peta.
  - **Relationship Graph Canvas**: Memungkinkan penambahan relasi baru antar karakter/faksi, filter berdasarkan jenis ikatan, dan *drag-and-drop* posisi node di atas kanvas perkamen.
  - **AI Lore Consistency Auditor**: Mengirimkan draf bab atau entri yang sedang aktif beserta ringkasan aturan *Power System*, *Timeline*, dan *Karakter* ke server `/api/lore/audit`, lalu menampilkan kartu hasil analisis berisi skor konsistensi, daftar temuan kontradiksi (jika ada), dan saran pengembangan cerita.
