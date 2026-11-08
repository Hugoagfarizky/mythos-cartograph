# Rencana Pembaruan Tab Ras (Ancestry & Species Codex)

Pembaruan ini menyempurnakan tab **Ras** menjadi ensiklopedia bangsa & spesies (*Ancestry & Species Codex*) yang terhubung secara dua arah dengan tab **Character**, **Wilayah**, **Negara**, dan **Skill**.

---

## 1. Biologi, Klasifikasi Asal-Usul, Bakat Bawaan & Kelemahan Rasial
Menambahkan atribut khusus ras pada `LoreAttributes` (`src/types/world.ts`) dan menampilkannya secara terstruktur di lembar profil Ras:
- **Klasifikasi Asal-Usul (`raceOriginClass`)**: Kategorisasi spesies seperti *Bangsa Manusia (Aethel-Born)*, *Bangsa Hutan / Fae (Sylvan)*, *Bangsa Bawah Tanah (Subterranean)*, *Drakonik / Astral*, atau *Hibrida / Kuno*.
- **Anatomi & Ciri Fisik (`traits`)** serta **Rentang Usia (`lifespan`)**.
- **Bakat Magis & Kemampuan Bawaan (`innateAbilities`)** vs **Kelemahan Biologis / Pantangan Rasial (`racialWeakness`)**: Ditampilkan berdampingan agar kekuatan dan kerentanan ras terlihat seimbang.

---

## 2. Budaya, Bahasa, Pola Penamaan (*Naming Conventions*) & Tradisi
- **Bahasa, Aksara & Pola Nama Khas (`languageAndNaming`)**: Panduan bunyi bahasa, contoh nama depan, dan marga/gelar khas ras tersebut agar penulis selalu konsisten saat menamai tokoh baru.
- **Struktur Sosial, Kepercayaan & Tabu Budaya (`cultureAndTraditions`)**: Sistem kepemimpinan, nilai luhur, ritual, dan pantangan adat.
- **Hubungan Diplomatik Antar-Ras (`interRaceRelations`)**: Bagaimana ras ini memandang bangsa lain (sekutu alami, rival sejarah, atau terisolasi).

---

## 3. Varian Sub-Ras / Garis Keturunan & Pemilih Hibrida Tanah Kelahiran
- **Cabang Sub-Ras / Garis Keturunan Darah (`subRaces: string[]`)**:
  - Menyediakan daftar interaktif untuk mencatat sub-ras atau klan keturunan (contoh: *Sylvan Kanopi Perak*, *Sylvan Rawa Abu*, atau *Dvergr Kubah Besi* vs *Dvergr Permukaan*).
- **Pemilih Hibrida Tanah Kelahiran (`homeland`) & Skill Khas (`signatureSkills`)**:
  - Di mode sunting, penulis dapat memilih **Tanah Kelahiran / Habitat** langsung dari daftar entitas **Wilayah** atau **Negara** yang ada di *World Bible* (atau mengetik baru), serta memilih **Teknik / Skill Khas Ras**.
  - Di mode baca, mengeklik *Tanah Kelahiran* atau *Skill Khas* akan langsung membuka lembar Wilayah/Negara/Skill tersebut.

---

## 4. Daftar Otomatis Tokoh dari Ras Ini & Tombol 1-Klik "+ Buat Karakter"
- **Sensus Karakter dari Ras Ini**:
  - Di bagian bawah lembar Ras, sistem secara otomatis mendeteksi dan menampilkan kartu semua **Character** yang memiliki ras tersebut (beserta potret mini, peran, dan *power tier*-nya).
  - Dilengkapi tombol **"+ Buat Karakter Baru dari Ras Ini"** yang langsung membuat draf karakter baru dengan atribut `raceName` dan `originNation` terisi otomatis lalu membuka editor di tab **Character**.

---

## 5. Filter Klasifikasi Asal-Usul Ras di Direktori Kiri
- Menambahkan tombol filter klasifikasi di daftar direktori sebelah kiri (*Semua*, *Sylvan / Fae*, *Subterranean / Kriya*, *Manusia / Aethel-Born*, *Astral / Kuno*) serta menambahkan entri ras ketiga pada data contoh (`Aethel-Born (Manusia Tinggi)`) agar ketiga ras utama di Benua Aethelia memiliki lembar kanon lengkap.
