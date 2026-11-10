# Rencana Ekspansi 6 Section Baru di Keempat Pilar Fantasi MythosCartograph

## 1. Gambaran Umum & Tujuan Ekspansi
Menambahkan **6 section/tab baru** yang terdistribusi secara presisi ke dalam **4 Pilar Fantasi** untuk memperkaya kedalaman *worldbuilding* dan arsitektur plot novel tanpa merusak tata letak yang sudah ada:

- **Pilar I — Kosmos & Atlas** *(ditambah 2 tab terpisah)*:
  1. **Entitas Kosmik**: Wujud primordial, titan astral, naga kosmik, dan manifestasi hukum semesta yang berada di atas atau di luar konsep ketuhanan biasa.
  2. **Dewa-Dewi & Pantheon**: Dewa-dewi yang disembah makhluk fana, lengkap dengan domain ilahi, simbol suci, kultus/kuil, berkat, dan kutukan.
- **Pilar II — Penghuni & Arcana** *(ditambah 1 tab)*:
  3. **Bestiary & Monster**: Ensiklopedia monster, naga, dan makhluk mitologi beserta tingkat bahaya, habitat wilayah, kelemahan anatomis, serta material hasil buruan (*loot/alchemy drops*).
- **Pilar III — Geopolitik & Kronik** *(ditambah 1 tab)*:
  4. **Agama, Adat & Budaya**: Sistem kepercayaan terorganisir, tradisi bangsa, ritual, festival tahunan, pantangan sosial (*taboo*), tata krama, serta busana dan kuliner khas tiap peradaban.
- **Pilar IV — Takdir, Naskah & Kanvas** *(ditambah 2 tab studio interaktif)*:
  5. **Pohon Silsilah & Dinasti**: Studio silsilah keluarga bangsawan dan dinasti kerajaan lintas generasi dengan status suksesi, ikatan pernikahan/aliansi darah, dan tautan langsung ke profil Tokoh.
  6. **Tracker Misteri, Nubuat & Foreshadowing**: Papan pelacak nubuat kuno, misteri utama cerita, daftar petunjuk (*clues*) yang ditanam di bab tertentu, pengecoh (*red herrings*), serta bab pengungkapan (*payoff/revelation*).

---

## 2. Arsitektur Navigasi & Integrasi Antar-Pilar

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       NAVIGASI 4 PILAR FANTASI (RATA ATAS)                             │
├──────────────────────┬──────────────────────┬────────────────────┬─────────────────────┤
│ PILAR I              │ PILAR II             │ PILAR III          │ PILAR IV            │
│ Kosmos & Atlas       │ Penghuni & Arcana    │ Geopolitik & Kronik│ Takdir & Naskah     │
├──────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ • Kosmologi & Hukum  │ • Ras & Spesies      │ • Kerajaan & Faksi │ • Jejaring Relasi   │
│ • Entitas Kosmik [*] │ • Bestiary Monster[*]│ • Agama & Budaya[*]│ • Silsilah Dinasti[*]│
│ • Dewa-Dewi [*]      │ • Tokoh & Karakter   │ • Sejarah & Era    │ • Tracker Nubuat [*]│
│ • Wilayah & Geografi │ • Sistem Sihir       │ • Garis Waktu      │ • Bab & Alur Cerita │
│ • Atlas Peta         │ • Pusaka & Artefak   │                    │ • Kanvas Bebas      │
└──────────┬───────────┴──────────┬───────────┴─────────┬──────────┴──────────┬──────────┘
           │                      │                     │                     │
           ▼                      ▼                     ▼                     ▼
┌───────────────────────────────────────────────────────┐  ┌─────────────────────────────┐
│        CODEX WORKSPACE & WIKI ENGINE ([[...]])        │  │  STUDIO SILSILAH & NUBUAT   │
│ • Atribut terstruktur spesifik per kategori baru      │◄─┤ • Pohon generasi wangsa     │
│ • Kartu sorotan Dossier (Kosmik/Ilahi/Monster/Budaya) │  │ • Matriks petunjuk per Bab  │
│ • Generator Nama Fantasi & Deteksi Kesehatan Lore     │  │ • Tautan klik ke Tokoh/Bab  │
└───────────────────────────────────────────────────────┘  └─────────────────────────────┘
```

---

## 3. Rincian Fitur Tiap Section Baru

### A. Pilar I: Pemisahan Tegas Entitas Kosmik vs Dewa-Dewi
1. **Tab Entitas Kosmik (`cosmic_entity`)**
   - **Fokus Lore**: Eksistensi purba sebelum dewa-dewi lahir (misal: *Sang Penenun Kehampaan*, *Naga Bintang Aethel*, *Arsitek Dimensi*).
   - **Atribut Khusus Dossier**:
     - *Skala Eksistensi & Dimensi Asal* (misal: Kehampaan Astral, Inti Kosmos, Luar Ruang-Waktu)
     - *Manifestasi Hukum Semesta* (hukum realitas yang dikendalikan atau dilahirkan oleh keberadaannya)
     - *Bentuk Penampakan & Pertanda Kemunculan* (fenomena langit atau anomali sihir saat entitas ini bergerak)
     - *Tingkat Ancaman Eksistensial & Sikap terhadap Dunia Fana* (Apatis / Penjaga / Pemusnah Siklus)
2. **Tab Dewa-Dewi (`deity`)**
   - **Fokus Lore**: Sosok ilahi dalam pantheon yang berinteraksi dengan doa manusia, memiliki kuil, pendeta, dan dogma.
   - **Atribut Khusus Dossier**:
     - *Gelar Ilahi & Peringkat Pantheon* (Dewa Utama, Dewi Pelindung, Setengah-Dewa)
     - *Domain Kekuasaan & Simbol Suci* (misal: Matahari & Sumpah, Pedang Perak Bersayap)
     - *Kuil Utama, Ordo Pendeta & Hari Raya Suci*
     - *Berkat bagi Pengikut & Kutukan Pelanggar Sumpah*

### B. Pilar II: Bestiary Monster & Makhluk Mitologi (`bestiary`)
- **Fokus Lore**: Katalog makhluk buas, monster sihir, dan satwa mitologis di daratan, laut, maupun langit.
- **Atribut Khusus Dossier**:
  - *Klasifikasi Makhluk & Tingkat Bahaya* (misal: Naga Purba, Chimera, Roh Hutan — Kelas Bencana / Berbahaya / Jinak)
  - *Habitat Alami & Wilayah Sebaran* (terhubung dengan entitas Wilayah/Peta)
  - *Kemampuan Serangan, Racun & Anomali Sihir*
  - *Kelemahan Anatomis & Cara Menaklukkan*
  - *Material Buruan & Komponen Alkimia* (sisik, inti mana, taring untuk bahan tempaan pusaka atau ramuan)

### C. Pilar III: Agama, Adat Budaya & Tradisi Bangsa (`culture_religion`)
- **Fokus Lore**: Identitas sosiokultural, agama institusional, adat istiadat masyarakat, dan gaya hidup bangsa-bangsa.
- **Atribut Khusus Dossier**:
  - *Jenis Tradisi / Institusi Keagamaan & Bangsa Penganut*
  - *Ritus Kehidupan, Upacara & Festival Tahunan* (tradisi kelahiran, penobatan, panen, hingga pemakaman)
  - *Struktur Sosial, Kasta & Nilai Kehormatan*
  - *Pantangan Adat (Taboo) & Hukum Moral*
  - *Ciri Khas Busana, Arsitektur & Kuliner Tradisional*

### D. Pilar IV: Studio Pohon Silsilah Dinasti & Tracker Misteri Nubuat
1. **Tab Pohon Silsilah & Dinasti (`family_tree`)**
   - **Pemilih Wangsa / Dinasti**: Penulis dapat membuat dan berpindah antar-wangsa (contoh starter: *Wangsa Valorian dari Gondoria* dan *Klan Besi-Bintang Nidavellir*).
   - **Bagan Generasi Visual**: Menampilkan anggota dinasti yang dikelompokkan per generasi (Leluhur Pendiri → Generasi Penguasa → Pewaris & Keturunan).
   - **Detail Anggota & Relasi Darah**: Menampilkan gelar, tahun hidup, status (*Hidup / Gugur / Menghilang*), status suksesi (*Penguasa Takhta / Pewaris Utama / Cabang Kadet*), pasangan (*Spouse/Consort*), dan orang tua.
   - **Integrasi Tokoh**: Tombol sekali klik untuk membuka halaman Kodex Tokoh terkait atau menambahkan anggota baru ke dalam silsilah.
2. **Tab Tracker Misteri, Nubuat & Foreshadowing (`prophecy_tracker`)**
   - **Kartu Nubuat & Misteri Plot**: Mencatat bait nubuat kuno atau pertanyaan misteri besar dalam novel beserta status kemajuannya (*Belum Terungkap*, *Petunjuk Ditanam*, *Terungkap Sebagian*, *Terungkap Penuh*).
   - **Rantai Petunjuk (*Foreshadowing Clues*) & Bab Terkait**: Daftar petunjuk yang ditanam di bab tertentu (terhubung langsung ke daftar Bab Naskah), lengkap dengan penanda apakah petunjuk tersebut adalah petunjuk asli atau pengecoh (*Red Herring*).
   - **Catatan Solusi Kanonik (Rahasia Penulis)**: Kolom khusus bagi penulis untuk menyimpan kebenaran sejati di balik nubuat/misteri serta target bab pengungkapan (*Payoff Chapter*).

---

## 4. Desain Visual & Pengalaman Pengguna (UX)
- **Konsistensi Tema Siang & Malam**: Seluruh tab, lencana kategori, bagan silsilah, dan kartu nubuat mendukung penuh tema **Perkamen Siang** dan **Grimoire Malam** dengan kontras teks yang tajam dan nyaman dibaca.
- **Dukungan Penuh Fitur Pintar**: Keempat kategori ensiklopedia baru (`Entitas Kosmik`, `Dewa-Dewi`, `Bestiary Monster`, `Agama & Budaya`) otomatis terintegrasi ke dalam:
  - **Popover Tautan Kurung Ganda (`[[...]]`)** saat membuat entitas baru dari teks cerita.
  - **Generator Nama Fantasi & Gelar Epik** dengan kosakata khusus untuk nama entitas kosmik, dewa-dewi, monster mitologi, dan tradisi budaya.
  - **Starter World Kronik Benua Aethelia** yang langsung dilengkapi contoh entitas kosmik, dewa-dewi, monster bestiary, adat budaya, pohon silsilah wangsa kerajaan, dan nubuat kuno agar siap dijelajahi.
