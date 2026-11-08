# Rencana Pengembangan Tab Power System (Magic & Combat Architecture Bible) — MythosCartograph

Berdasarkan pilihan Anda, berikut adalah rancangan peningkatan menyeluruh untuk tab **Power System** (`CodexWorkspace.tsx`, `types/world.ts`, dan `starterWorld.ts`) agar berfungsi sebagai *Hard Magic & Combat Architecture Codex* yang terhubung langsung dengan tab **Skill**, **Character**, **Ras**, dan **Artefak & Biota**:

---

## 1. Perluasan Skema Atribut Power System (`LoreAttributes` di `src/types/world.ts`)
Menambahkan atribut terstruktur khusus entitas berkategori `'power_system'`:
- **Klasifikasi & Fondasi Energi**:
  - `systemTypology`: Tipologi Sistem Kekuatan (*Hard Magic / Terukur*, *Kultivasi & Meridian*, *Runik & Kriya Artefak*, *Ilahi & Pakta Kosmik*, *Bela Diri & Aura Fisik*).
  - `energySource`: Sumber energi utama (matahari, eter, emosi, panas bumi, dll.).
  - `originSource`: Asal-usul historis, ras pencipta, atau wilayah tempat sistem ini pertama kali ditemukan (mendukung tautan ke **Ras** / **Wilayah** / **Sejarah**).
  - `awakeningCondition`: Syarat bangkit (*Awakening*) atau bakat yang dibutuhkan seseorang untuk mempelajari sistem ini.
  - `catalystMedium`: Medium fokus, senjata, segel, atau artefak penyalur yang dibutuhkan (mendukung tautan ke **Artefak & Biota**).
- **Tangga Tingkatan (*Power Tiers*) & Cabang Aliran (*Schools / Affinities*)**:
  - `powerTiersList`: Daftar urutan tingkatan penguasaan dari pemula hingga puncak mitos (`string[]`).
  - `elementBranches`: Daftar cabang aliran, disiplin, atau elemen turunan di dalam sistem kekuatan ini (`string[]`).
- **Hukum Besi (*Hard Rules*), Kelemahan Lingkungan & Harga Kekuatan (*Corruption Cost*)**:
  - `hardRules`: Hukum mutlak yang tidak pernah bisa dilanggar oleh sistem kekuatan ini (menjaga cerita bebas dari *plot hole* / *deus ex machina*).
  - `systemWeakness`: Kondisi cuaca, material penangkal (*anti-magic*), atau situasi di mana sistem ini lumpuh/melemah.
  - `corruptionCost`: Risiko fisik, mental, atau kutukan permanen apabila pengguna melampaui kapasitasnya (*Overload / Backlash*).

---

## 2. Lima Pembaruan Utama pada Antarmuka Tab Power System (`src/components/CodexWorkspace.tsx`)

### A. Filter Tipologi Sistem Kekuatan di Direktori Kiri
- Menambahkan barisan tombol filter tipologi di atas daftar direktori Power System:
  - `Semua`, `Hard Magic / Terukur`, `Kultivasi & Meridian`, `Runik & Kriya Artefak`, `Ilahi & Pakta Kosmik`, `Bela Diri & Aura Fisik`.
- Setiap kartu di direktori kiri menampilkan tipologi sistem, sumber energi, jumlah cabang aliran, serta jumlah **Skill turunan** yang tercatat.

### B. Panel Fondasi Energi, Syarat Bangkit (*Awakening*) & Medium Penyalur (*Catalyst*)
- Menampilkan kartu informasi terstruktur untuk **Tipologi Sistem**, **Sumber Energi**, **Asal-Usul / Pencipta** (dapat diklik ke entitas Ras/Wilayah/Sejarah), **Syarat Bangkit & Bakat**, serta **Medium Fokus / Alat Penyalur** (dapat diklik ke entitas Artefak).

### C. Panel Tangga Tingkatan (*Power Tiers*) & Cabang Aliran / Disiplin (*Branches*)
- Menampilkan kartu **Tangga Tingkatan Kekuatan (Tier Hierarchy)** secara berurutan dari tingkat dasar hingga puncak.
- Menampilkan kartu **Cabang Aliran & Disiplin Elemen** sebagai daftar yang terstruktur rapi.

### D. Panel Hukum Besi (*Hard Magic Rules*), Penangkal & Risiko Efek Samping (*Backlash*)
- Menampilkan perbandingan berdampingan antara **Hukum Mutlak & Batasan Sistem (Hard Rules)** dengan **Risiko Over-Resonansi & Harga Kekuatan (Corruption / Backlash)** serta **Kelemahan & Material Penangkal**, lengkap dengan dukungan tautan `[[Nama Entitas]]`.

### E. Daftar Otomatis Skill Turunan & Praktisi Terkait + Tombol 1-Klik `+ Buat Skill dari Sistem Ini`
- Di bagian bawah lembar Power System, sistem secara otomatis menampilkan:
  1. **Daftar Teknik & Skill Turunan** dari tab **Skill** yang memiliki `parentPowerSystem` yang merujuk pada sistem kekuatan ini, dilengkapi tombol **`+ Buat Skill dari Sistem Ini`** yang langsung membuat entri **Skill** baru dengan `parentPowerSystem` dan `elementAffinity` yang sudah terisi otomatis.
  2. **Daftar Praktisi & Pengguna Tercatat** dari tab **Character** yang menguasai skill dari sistem ini atau memiliki *Power Tier* yang sesuai, lengkap dengan klik langsung menuju lembar karakter tersebut.

---

## 3. Pemilih Hibrida Saat Mengedit Power System & Pengayaan Data Awal (`src/data/starterWorld.ts`)
- Pada mode edit Power System, penulis dapat:
  - Memilih **Asal-Usul / Pencipta** dari daftar **Ras**, **Wilayah**, atau **Sejarah** yang ada (atau mengetik manual).
  - Memilih **Medium Fokus / Penyalur** dari daftar **Artefak & Biota** (atau mengetik manual).
  - Mengelola daftar **Tangga Tingkatan (Power Tiers)** dan **Cabang Aliran / Elemen** secara interaktif.
- Memperkaya data awal di `starterWorld.ts`:
  - Melengkapi **Resonansi Eteris Astral** (`pwr-resonansi-astral`) dengan seluruh atribut Power System baru (3 cabang aliran: *Jalur Solar*, *Jalur Lunar*, *Jalur Sidereal*; 6 tangga Lingkar Jiwa; syarat bangkit; medium penyalur; penangkal; dan kutukan kristalisasi).
  - Menambahkan sistem kekuatan kedua **Tempaan Runik Besi-Bintang (Khaz-Vahl Artifice)** (`pwr-tempaan-runik`) sebagai contoh sistem bertipologi *Runik & Kriya Artefak* milik bangsa Dvergr, sehingga direktori Power System memiliki perbandingan dua sistem kekuatan yang kontras.
