# MythosCartograph — Panduan Lengkap Fitur & Cara Menyusun Cerita Fantasi

**MythosCartograph** adalah studio *World Bible*, Peta Fantasi Abad Pertengahan (*Medieval Map Sandbox*), dan Arsitektur Naskah Cerita yang dirancang khusus untuk penulis novel fantasi, perancang *lore* game/RPG, dan kreator semesta fiksi.

---

## Daftar Isi
1. [Arsitektur 4 Pilar Semesta Fantasi (21 Tab Utama)](#1-arsitektur-4-pilar-semesta-fantasi-21-tab-utama)
2. [Fitur Produktivitas & Otomasi Penulis](#2-fitur-produktivitas--otomasi-penulis)
3. [Alur Langkah-demi-Langkah Cara Menyusun Cerita dari Nol](#3-alur-langkah-demi-langkah-cara-menyusun-cerita-dari-nol)
4. [Cara Menggunakan Sistem Tautan Kurung Ganda `[[Nama Entitas]]`](#4-cara-menggunakan-sistem-tautan-kurung-ganda-nama-entitas)
5. [Cara Mengekspor World Bible & Naskah ke File `.md` / PDF / `.json`](#5-cara-mengekspor-world-bible--naskah-ke-file-md--pdf--json)

---

## 1. Arsitektur 4 Pilar Semesta Fantasi (21 Tab Utama)

Seluruh ruang kerja **MythosCartograph** dikelompokkan secara logis dari skala paling makro (Kosmos & Peta Dunia) hingga skala mikro (Silsilah, Nubuat, Bab Naskah, & Kanvas Coretan):

### Pilar I · Kosmos & Atlas *(Pondasi Alam Semesta & Geografi)*
1. **Overview (`Overview`)**:
   - Beranda utama dunia Anda. Menyimpan **Nama Dunia**, **Logline / Premis Utama**, **Hukum Kosmologi & Mitos Penciptaan**, serta **Sistem Kalender & Era**.
   - Dilengkapi **Papan Catatan Cepat (*Scratchpad*)** di mana ide mendadak bisa langsung diubah (*promote*) menjadi entitas resmi dengan 1 klik.
2. **Entitas Kosmik (`Entitas Kosmik`)**:
   - Direktori khusus untuk makhluk primordial, titan astral, entitas kehampaan (*void*), dan perwujudan hukum alam semesta (dibedakan dari Dewa-Dewi).
   - Atribut khusus: *Skala Kosmik & Eksistensi*, *Asal-Usul Primordial*, *Hukum Alam & Manifestasi*, serta *Pengaruh terhadap Realitas*.
3. **Dewa-Dewi (`Dewa-Dewi`)**:
   - Direktori pantheon dewa dan dewi yang disembah oleh makhluk fana.
   - Atribut khusus: *Jajaran Pantheon & Takhta*, *Domain Ilahi*, *Simbol Suci & Relik*, *Kuil Utama & Ordo Pemujaan*, serta *Berkah & Kutukan Ilahi*.
4. **Map Dunia (`Map Dunia`)**:
   - Studio kartografi interaktif bergaya perkamen abad pertengahan.
   - **Mode Lukis Daratan & Bioma**: Lukis samudra, padang rumput, hutan purba, pegunungan, gurun, tundra es, rawa, dan tanah vulkanik dengan ukuran kuas yang bisa diatur.
   - **Mode Stempel (*Stamp*) & Pin Lokasi**: Tempatkan ikon Ibu Kota, Benteng, Menara Sihir, Reruntuhan Kuno, Pelabuhan, dan Puncak Gunung.
   - **Tautan Peta ↔ Lore**: Setiap pin di peta dapat dihubungkan langsung ke entitas Negara/Wilayah, atau membuat entitas baru langsung dari titik peta.

---

### Pilar II · Penghuni & Arcana *(Tokoh, Makhluk Hidup, & Sistem Kekuatan)*
5. **Character (`Character`)**:
   - Profil mendalam tokoh protagonis, antagonis, mentor, dan figuran penting.
   - Atribut khusus: *Peran Naratif*, *Ras/Garis Darah*, *Afiliasi/Faksi*, *Tempat Asal*, *Tingkat Kekuatan*, *Motivasi Batin*, dan *Rahasia Tersembunyi*.
   - Terintegrasi langsung dengan **Jaringan Relasi Tokoh** di bagian bawah halaman profil.
6. **Ras (`Ras`)**:
   - Dokumentasi spesies berakal (Manusia, Elf, Kurcaci, ras orisinal).
   - Atribut khusus: *Rentang Usia*, *Ciri Fisik*, *Habitat Utama*, dan *Bakat Bawaan*.
7. **Bestiary Monster (`Bestiary Monster`)**:
   - Ensiklopedia monster, naga purba, dan satwa mitologi.
   - Atribut khusus: *Tingkat Bahaya (Tier)*, *Klasifikasi Makhluk*, *Habitat Alami*, *Pola Serangan & Kemampuan*, *Kelemahan Anatomi / Elemen*, dan *Material Buruan / Alkimia (Loot/Drop)*.
8. **Kelompok (`Kelompok`)**:
   - Ordo ksatria, serikat penyihir, sindikat kriminal, atau dewan rahasia.
   - Atribut khusus: *Pemimpin*, *Markas Utama*, *Ideologi & Sumpah*, serta *Sumber Pengaruh*.
9. **Power System (`Power System`)**:
   - Aturan sistem sihir, kultivasi, atau kekuatan supranatural di dunia Anda.
   - Atribut khusus: *Sumber Energi*, *Syarat Penggunaan*, *Harga / Risiko / Efek Samping*, dan *Batas Mutlak (Hard Limit)* agar tidak terjadi *plot hole*.
10. **Skill (`Skill`)**:
    - Daftar jurus, mantra, teknik pedang, atau kemampuan khusus yang menginduk pada *Power System*.
    - Atribut khusus: *Induk Power System*, *Tier / Tingkat Kesulitan*, *Biaya Mana/Stamina*, dan *Efek Utama*.

---

### Pilar III · Geopolitik & Kronik *(Peradaban, Budaya, & Sejarah)*
11. **Negara (`Negara`)**:
    - Kerajaan, kekaisaran, republik dagang, atau federasi.
    - Atribut khusus: *Bentuk Pemerintahan*, *Ibu Kota*, *Kepala Negara*, *Ekonomi Utama*, dan *Kekuatan Militer*.
12. **Agama & Budaya (`Agama & Budaya`)**:
    - Sistem kepercayaan, adat istiadat, dan tradisi masyarakat.
    - Atribut khusus: *Bangsa/Ras Penganut*, *Ajaran Inti & Filosofi*, *Ritual Suci & Festival Tahunan*, *Tabu & Pantangan Sosial*, serta *Busana Adat, Arsitektur & Kuliner*.
13. **Wilayah (`Wilayah`)**:
    - Lokasi spesifik seperti lembah terlarang, hutan berkabut, pulau terapung, atau distrik kota.
    - Atribut khusus: *Negara Induk*, *Iklim & Geografi*, *Tingkat Bahaya*, dan *Sumber Daya Alam*.
14. **Sejarah (`Sejarah`)**:
    - Arsip naratif peristiwa besar masa lalu (perang kuno, bencana kosmik, perjanjian damai) yang bisa disinkronkan ke **Timeline**.
15. **Timeline (`Timeline`)**:
    - Pita kronologi visual berurutan dari tahun paling kuno hingga era cerita saat ini. Setiap peristiwa dapat menautkan lokasi peta, tokoh yang terlibat, dan bab cerita terkait.
16. **Artefak & Biota (`Artefak & Biota`)**:
    - Ensiklopedia benda pusaka legendaris, senjata kutukan, tanaman obat langka, dan bijih logam magis.

---

### Pilar IV · Takdir, Naskah & Kanvas *(Arsitektur Plot, Silsilah, & Penulisan Bab)*
17. **Peta Relasi (`Peta Relasi`)**:
    - Kanvas graf interaktif untuk memetakan hubungan antar entitas (*Sekutu*, *Musuh Bebuyutan*, *Keluarga*, *Vassal*, *Pengkhianat*, dll.). Node dapat digeser bebas.
18. **Silsilah Dinasti (`Silsilah Dinasti`)**:
    - Studio pohon keluarga kerajaan dan klan bangsawan yang dikelompokkan berdasarkan **Generasi (Gen 1, Gen 2, Gen 3, dst.)**.
    - Mencatat status hidup/gugur, status suksesi (*Penguasa Saat Ini*, *Pewaris Utama*, *Cabang Kadet*, dll.), hubungan *Orang Tua–Anak* dan *Pasangan*, serta terhubung langsung ke profil **Character**.
19. **Tracker Nubuat (`Tracker Nubuat`)**:
    - Pelacak khusus untuk **Nubuat Kuno**, **Misteri Cerita**, **Foreshadowing**, dan **Rahasia Plot**.
    - Memisahkan **Tafsir Umum Masyarakat di Dunia** vs **Kebenaran Kanonik Rahasia Penulis**, dilengkapi daftar petunjuk (*Clue*) dan pengecoh (*Red Herring*) yang tertaut ke bab tempat petunjuk ditanam hingga bab pengungkapan (*Payoff Chapter*).
20. **Alur Bab (`Alur Bab`)**:
    - Ruang kerja penulisan naskah cerita (*Chapter Outliner & Manuscript Editor*).
    - Setiap bab memiliki:
      - Status progres (*Ide Awal*, *Outline*, *Sedang Ditulis*, *Revisi*, *Selesai*).
      - **Tokoh POV (Sudut Pandang)**, **Lokasi Latar**, dan **Waktu Kronologis**.
      - **Daftar Adegan (*Scene Beats*)**: Rincian adegan demi adegan (*Tujuan Adegan*, *Konflik*, dan *Hasil/Perubahan*).
      - **Draf Naskah / Catatan Bab**: Mendukung tautan `[[Nama Entitas]]` dan **Mode Fokus Menulis**.
21. **Kanvas Bebas (`Kanvas Bebas`)**:
    - Studio multi-halaman gabungan **Google Docs + OneNote + Paint**.
    - Anda dapat menulis dokumen panjang, menempelkan *Sticky Note* & kartu catatan di mana saja di atas kanvas polos, serta menggambar/mencoret sketsa bebas dengan kuas warna-warni. Kartu catatan dapat dipromosikan menjadi entitas World Bible kapan saja.

---

## 2. Fitur Produktivitas & Otomasi Penulis

Di bilah atas (*Top Bar*) dan di dalam editor, tersedia fitur pintar untuk mempercepat kerja penulis:

1. **Pencarian Kilat (`Ctrl+K` / Tombol `Cari (Ctrl+K)`)**:
   - Lompat instan ke karakter, negara, peristiwa timeline, pin peta, atau bab cerita mana pun hanya dengan mengetik beberapa huruf.
2. **Inspektur Kesehatan Lore (Tombol `Kesehatan Lore (%)`)**:
   - Memindai seluruh dunia Anda secara otomatis untuk mendeteksi:
     - **Tautan Merah (`[[...]]`) yang Belum Dibuat Entitasnya** (lengkap dengan tombol buat otomatis).
     - **Entitas Yatim (*Orphan*)** yang belum memiliki relasi atau belum disebut di entitas lain.
     - **Karakter yang Belum Muncul di Bab Mana Pun**.
     - **Negara/Wilayah yang Belum Dipin di Peta Dunia**.
3. **Generator Nama Fantasi & Gelar Epik (*Fantasy Name Forge*)**:
   - Saat mengedit entitas apa pun, klik tombol **Generator Nama Fantasi** untuk menghasilkan nama dan julukan epik sesuai kategori dan budaya (*Aelfir/Sylvan*, *Nidavellir/Rune*, *Solis/Imperial*, *Kosmik/Void*, dll.).
4. **Mode Fokus Menulis**:
   - Sembunyikan panel direktori kiri di ruang kerja entitas maupun di Alur Bab agar Anda bisa menulis dengan layar lebar tanpa distraksi.
5. **AI Lore Consistency Auditor & AI Worldbuilding Brainstorm**:
   - **Audit Konsistensi**: Memeriksa apakah karakter, skill, atau bab yang baru Anda tulis bertabrakan dengan aturan *Power System* atau *Timeline* yang sudah ada.
   - **Brainstorm Entitas**: Menghasilkan 3 ide entitas baru yang langsung nyambung dengan konflik dunia Anda.
6. **Manajer Multi-Proyek Dunia & Snapshot Versi (Tombol `Proyek Dunia`)**:
   - Kelola banyak dunia fantasi sekaligus di satu aplikasi, duplikasi dunia untuk cabang cerita *What-If*, dan simpan **Snapshot (Titik Simpan)** sebelum melakukan perombakan besar.
7. **Tema Perkamen Siang & Grimoire Malam**:
   - Beralih antara tampilan perkamen hangat untuk siang hari atau mode gelap beraksen emas (*Grimoire Malam*) untuk menulis di malam hari.

---

## 3. Alur Langkah-demi-Langkah Cara Menyusun Cerita dari Nol

Jika Anda ingin membangun cerita baru dari awal, ikuti urutan terbaik (*best practice*) berikut:

### Tahap 1: Buat Proyek Dunia Baru & Tetapkan Premis (Pilar I)
1. Klik tombol **`Proyek Dunia`** di kanan atas, lalu buat dunia baru (atau gunakan tombol **Mulai Dunia Kosong Baru** di tab `Overview`).
2. Di tab **`Overview`**, isi:
   - **Nama Dunia** & **Premis / Logline Utama** (1–2 kalimat inti konflik dunia Anda).
   - **Mitos Penciptaan & Hukum Kosmologi** serta **Nama Kalender**.
3. Jika cerita Anda melibatkan kekuatan kosmik atau dewa, isi beberapa entitas kunci di **`Entitas Kosmik`** dan **`Dewa-Dewi`**.
4. Buka **`Map Dunia`**, gambar bentuk benua utama Anda, lalu pasang pin untuk 2–3 ibu kota atau lokasi penting.

### Tahap 2: Bangun Kekuatan, Bangsa, & Konflik Politik (Pilar II & III)
1. Buka **`Power System`** lebih dulu untuk menetapkan **aturan dan batas kekuatan** di dunia Anda (agar kekuatan karakter nanti terukur). Tambahkan beberapa jurus/mantra di **`Skill`**.
2. Buka **`Negara`**, **`Wilayah`**, dan **`Agama & Budaya`** untuk membangun panggung peradaban tempat cerita berlangsung.
3. Buka **`Ras`**, **`Bestiary Monster`**, dan **`Kelompok`** untuk mengisi penghuni dunia dan faksi-faksi yang saling berebut pengaruh.
4. Catat 3–5 peristiwa masa lalu paling krusial di **`Sejarah`** dan **`Timeline`** sebagai latar belakang konflik saat cerita dimulai.

### Tahap 3: Ciptakan Tokoh, Silsilah, & Jaringan Relasi (Pilar II & IV)
1. Buat tokoh utama (Protagonis), musuh utama (Antagonis), dan tokoh pendukung di tab **`Character`**.
2. Jika cerita Anda bertema kerajaan, politik dinasti, atau garis keturunan kuno, susun silsilahnya di **`Silsilah Dinasti`**.
3. Buka **`Peta Relasi`** untuk menghubungkan siapa bersekutu dengan siapa, siapa mengkhianati siapa, dan bagaimana faksi-faksi saling terkait.

### Tahap 4: Rancang Misteri, Nubuat, & Rangka Bab (Pilar IV)
1. Sebelum menulis bab, buka **`Tracker Nubuat`** untuk mencatat misteri besar atau nubuat di cerita Anda:
   - Tulis apa yang dipercaya masyarakat umum (*Tafsir Umum*) vs apa rahasia sebenarnya (*Kebenaran Kanonik*).
   - Rencanakan petunjuk (*Clue*) dan pengecoh (*Red Herring*) yang akan disebar di bab-bab awal.
2. Gunakan **`Kanvas Bebas`** jika Anda ingin mencoret-coret diagram alur kasar atau menempelkan ide-ide liar terlebih dahulu.
3. Buka **`Alur Bab`**:
   - Buat daftar bab (Bab 1, Bab 2, dst.).
   - Di setiap bab, pilih **Tokoh POV**, **Lokasi**, dan susun **Daftar Adegan (*Scene Beats*)** (Tujuan → Konflik → Hasil).
   - Tulis draf naskah atau catatan adegan di editor bab.

### Tahap 5: Audit Konsistensi & Ekspor Buku
1. Klik **`Kesehatan Lore (%)`** di kanan atas untuk mengecek apakah ada tautan `[[...]]` yang belum dibuat atau tokoh yang belum terpakai.
2. Klik **`Audit Konsistensi AI`** pada bab atau entitas penting untuk memastikan tidak ada *plot hole*.
3. Klik **`Ekspor & Cetak Buku`** untuk mengunduh seluruh *World Bible* dan naskah Anda dalam format **Markdown (`.md`)**, **JSON Cadangan (`.json`)**, atau **Cetak PDF**.

---

## 4. Cara Menggunakan Sistem Tautan Kurung Ganda `[[Nama Entitas]]`

Di semua kolom teks (ringkasan, isi lore, catatan bab, nubuat, hingga kartu di Kanvas Bebas), Anda dapat mengetik nama entitas di dalam kurung siku ganda, contohnya:

```markdown
Pada malam gerhana, [[Kaelen Vance]] membawa [[Pedang Surya Patah]] menuju gerbang [[Solis Prime]].
```

- **Jika entitas sudah ada**: Teks tersebut otomatis berubah menjadi **tautan emas interaktif**. Saat diarahkan kursor (*hover*), muncul kartu pratinjau (*tooltip*); saat diklik, Anda langsung berpindah ke halaman entitas tersebut, dan sistem otomatis mencatat **Backlink (Rujukan Balik)** di entitas tujuan.
- **Jika entitas belum ada**: Teks tersebut akan tampil sebagai **tautan merah bergaris putus-putus (`+`)**. Cukup **klik tautan merah tersebut**, pilih kategorinya di *popover* yang muncul, dan entitas baru akan langsung dibuat secara otomatis!

---

## 5. Cara Mengekspor World Bible & Naskah ke File `.md` / PDF / `.json`

1. Klik tombol merah **`Ekspor & Cetak Buku`** di pojok kanan atas aplikasi.
2. Pilih cakupan dokumen (*Seluruh World Bible + Bab Naskah*, *Hanya Ensiklopedia Lore*, atau *Hanya Naskah Bab*).
3. Anda dapat:
   - **Salin Markdown** ke *clipboard* atau **Unduh File `.md`** (siap dibuka di Obsidian, Notion, Google Docs, atau VS Code).
   - **Cetak / Simpan sebagai PDF** dengan tata letak buku ensiklopedia.
   - **Unduh Cadangan `.json`** untuk menyimpan seluruh data proyek (termasuk peta, silsilah, tracker nubuat, dan kanvas) di komputer Anda.
