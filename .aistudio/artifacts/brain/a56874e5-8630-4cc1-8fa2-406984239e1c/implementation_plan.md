# Peningkatan Tab Overview — Beranda Ensiklopedia World Bible

Merombak tab **Overview** dari tampilan berbasis formulir menjadi halaman pembuka buku ensiklopedia klasik (*Book Frontispiece & World Command Center*) yang memadukan estetika sastra dengan alat produktivitas cepat bagi penulis.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Seluruh pilihan yang Anda konfirmasi untuk tab **Overview** telah dirangkum ke dalam cetak biru di bawah ini. Silakan tinjau dan klik **Proceed** untuk menerapkan pembaruan pada aplikasi.

- **Confirmed Decision 1 — Mode Baca Buku Bersih (*Clean Book Mode*) dengan Tombol Sunting**: Menghilangkan kolom-kolom input yang selalu terbuka di halaman Overview. Identitas dunia, epigrafi, sinopsis, dan kosmologi ditampilkan sebagai tipografi buku yang bersih, dan hanya berubah menjadi formulir saat tombol **Sunting Identitas & Kosmologi** diklik.
- **Confirmed Decision 2 — Kutipan Epigrafi / Ramalan Kuno Pembuka Dunia**: Menambahkan blok kutipan epigrafi bergaya halaman depan novel fantasi klasik lengkap dengan sumber kutipan/nubuat di bagian pembuka Overview.
- **Confirmed Decision 3 — Sinopsis Utama, Konflik Pusat, & Pilar Kosmologi**: Menambahkan bagian khusus untuk **Sinopsis & Konflik Utama Cerita**, **Tema Naratif**, serta **Tiga Pilar Kosmologi** (*Mitos Penciptaan*, *Hukum Alam & Eter*, dan *Benda Langit & Siklus Era*) yang mendukung tautan `[[Nama Entitas]]`.
- **Confirmed Decision 4 — Global Search & Catatan Ide Kilat (*Quick Idea Scratchpad*)**: Menyediakan bilah pencarian instan lintas seluruh kategori World Bible serta papan catatan kilat tempat penulis menyimpan ide mendadak dan mengubahnya menjadi entri Character/Ras/Skill/Sejarah baru hanya dengan satu klik.
- **Confirmed Decision 5 — Pratinjau Mini Peta Dunia & Sorotan Tokoh/Konflik Kelompok**: Menampilkan kartu visual interaktif di bagian bawah Overview berisi pratinjau lokasi kunci di Peta Dunia serta sorotan tokoh utama beserta sengketa faksi/kerajaan yang sedang berlangsung.

---

### 1. Overview & Core Concept

- **What It Does**:
  Menjadikan tab **Overview** sebagai "sampul dalam dan daftar isi hidup" dari World Bible penulis. Saat penulis membuka proyeknya, mereka langsung disambut oleh kutipan ramalan kuno, premis konflik besar, pencarian cepat ke seluruh entitas, buku catatan ide kilat (*scratchpad*), dan sorotan visual peta serta tokoh kunci.
- **Target Audience / Persona**:
  Penulis cerita dan *worldbuilder* yang membutuhkan satu halaman ringkasan eksekutif untuk menjaga fokus pada tema besar cerita sekaligus menangkap ide spontan tanpa harus berpindah-pindah tab.
- **Key Value**:
  Memisahkan dengan tegas antara **Mode Membaca Kanon** (yang imersif seperti membaca buku cetak) dan **Mode Menyunting**, sembari mempercepat alur kerja melalui *Global Search* dan *Idea Scratchpad*.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Membaca & Menyunting Sampul Dalam Dunia (*Book Frontispiece & Cosmology*)**:
     - Secara bawaan, bagian atas menampilkan judul dunia (`Fraunces`), kutipan epigrafi berhuruf miring (`Lora Italic`), sinopsis konflik utama, dan pilar kosmologi dalam tata letak editorial buku.
     - Saat penulis menekan tombol **Sunting Overview Dunia**, muncul panel editor terstruktur untuk mengubah nama dunia, genre, kalender, epigrafi, sinopsis konflik, hingga mitos penciptaan.
  2. **Pencarian Lintas Semesta (*Global Search*)**:
     - Penulis mengetik kata kunci di bilah pencarian Overview (misal: *"Astrolabe"*, *"Surya"*, atau *"Vaelen"*).
     - Hasil pencarian langsung dikelompokkan berdasarkan tab asal (*Character, Ras, Kelompok, Power System, Lokasi Peta, Timeline, Bab*) dan mengklik hasilnya langsung membawa penulis ke tab dan entri terkait.
  3. **Menangkap Ide Mendadak (*Quick Idea Scratchpad*)**:
     - Penulis mengetik ide singkat di panel *Catatan Ide Kilat* (misal: *"Klan pembunuh bayangan yang menggunakan gerhana bulan untuk menghilangkan jejak"*).
     - Ide tersimpan otomatis di `localStorage`, dapat ditandai selesai/dihapus, atau ditekan tombol **Jadikan Entri →** untuk langsung mempromosikan ide tersebut menjadi entri baru di tab *Character*, *Kelompok*, *Skill*, atau *Sejarah*.
  4. **Menjelajahi Pratinjau Peta & Sorotan Tokoh/Konflik**:
     - Pada kartu **Pratinjau Atlas & Lokasi Kunci**, penulis melihat ilustrasi kanvas peta mini beserta daftar titik penting (Ibu Kota, Benteng, Menara) dan tombol untuk langsung melompat ke *Map Dunia*.
     - Pada kartu **Sorotan Tokoh & Konflik Kelompok**, penulis melihat potret tokoh utama beserta ketegangan politik/rivalitas utama yang tercatat di *Peta Relasi*.

- **Visual Identity & Theme**:
  - Tetap mempertahankan palet **Warm Parchment Cartography** (`#F6F1E6` latar perkamen, `#FBF8F1` permukaan lembaran buku, `#231C14` tinta utama, `#9E2A2B` aksen merah segel lilin, dan `#B5832A` kuningan kompas) serta pasangan tipografi `Fraunces` + `Lora` + `JetBrains Mono` (`tabular-nums`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Mengganti Form Statis dengan Tampilan Editorial Buku + Toggle Sunting**
  - *Chosen Approach*: Menyajikan seluruh metadata dunia dan kosmologi sebagai artikel buku yang rapi secara default, dengan mode sunting (*edit mode*) yang diaktifkan lewat tombol.
  - *Why*: Mencegah ketidaksengajaan mengubah pengaturan dunia saat sedang membaca lore, serta memberikan kesan buku World Bible yang sesungguhnya.

- **Decision 2: Menyematkan Konversi Satu Klik pada Quick Idea Scratchpad**
  - *Chosen Approach*: Setiap butir ide di *Scratchpad* memiliki pemilih kategori cepat (*Character, Ras, Kelompok, Power System, Skill, Sejarah, dll.*) dan tombol **Buat Entri** yang otomatis membuat draf entitas baru dari teks catatan tersebut.
  - *Why*: Ketika penulis mendapat inspirasi mendadak, mereka sering kali belum tahu detail atributnya; *Scratchpad* menjembatani ide mentah menjadi entitas terstruktur tanpa hambatan.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         OVERVIEW TAB (WORLD FRONTISPIECE)                     │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ 1. Hero Frontispiece & World Epigraph Banner                            │  │
│  │    - World Title, Genre, Calendar, Author & Toggle [Sunting Overview]   │  │
│  │    - Italicized Ancient Prophecy / Epigraph Quote Block                 │  │
│  │    - Project Actions: Impor JSON, Buat Dunia Kosong, Reset Contoh       │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌────────────────────────────────────┬────────────────────────────────────┐  │
│  │ 2. Global Omnibar Search           │ 3. Quick Idea Scratchpad           │  │
│  │    - Live search across Entities,  │    - Instant note capture          │  │
│  │      Map Pins, Timeline & Chapters │    - 1-Click "Promote to Entity"   │  │
│  └────────────────────────────────────┴────────────────────────────────────┘  │
│                                                                               │
│  ┌────────────────────────────────────┬────────────────────────────────────┐  │
│  │ 4. Sinopsis & Konflik Pusat Dunia  │ 5. Tiga Pilar Kosmologi Semesta    │  │
│  │    - Core Conflict & Story Themes  │    - Mitos Penciptaan              │  │
│  │    - Supports [[Wiki Cross-Links]] │    - Hukum Alam & Kosmos           │  │
│  └────────────────────────────────────┴────────────────────────────────────┘  │
│                                                                               │
│  ┌────────────────────────────────────┬────────────────────────────────────┐  │
│  │ 6. Pratinjau Mini Peta Dunia       │ 7. Sorotan Tokoh & Konflik Kelompok│  │
│  │    - Visual Map Preview & Key Pins │    - Featured Character Portraits  │  │
│  │    - Direct Jump to Map Sandbox    │    - Active Faction Rivalries      │  │
│  └────────────────────────────────────┴────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State Extensions**:
  - Memperluas `WorldProject` dengan atribut opsional yang kompatibel ke belakang (*backward-compatible* dengan data `localStorage` yang sudah ada):
    - `epigraphQuote`: Teks kutipan atau ramalan kuno pembuka dunia.
    - `epigraphSource`: Sumber kutipan / nama naskah kuno.
    - `centralConflict`: Uraian sinopsis utama dan konflik pusat cerita (mendukung `[[Nama Entitas]]`).
    - `storyThemes`: Tema-tema utama cerita.
    - `cosmologyCreationMyth`: Mitos penciptaan dan asal-usul semesta.
    - `cosmologyLaws`: Hukum alam, arsitektur benda langit, atau anomali dunia.
    - `scratchpadNotes`: Daftar catatan ide kilat (`id`, `text`, `targetCategory`, `createdAt`).
