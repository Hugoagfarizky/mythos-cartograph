# Rencana Penyempurnaan Tab Alur Bab (Novel Outliner, Adegan & Studio Manuskrip)

Rencana ini menyempurnakan tab terakhir **Alur Bab** (`outliner` di `ChapterOutlinerAndPrdView.tsx`) menjadi studio perencanaan bab novel, urutan adegan (*scene beats*), dan penulisan manuskrip yang terhubung langsung dengan seluruh entitas World Bible.

---

### 1. Anatomi Struktur Naratif Bab, Parameter Latar & Bar Progres Kata
Memperluas skema `ChapterOutline` di `src/types/world.ts` dan data awal di `src/data/starterWorld.ts`:
- **Konteks Waktu, Sudut Pandang (POV) & Lokasi Utama Bab**:
  - `storyDateOrTime?: string` (Penanggalan waktu cerita bab, misal: *Malam 14 Bulan Keempat Tahun 214 PG*).
  - `primaryPov?: string` (Pemilih hibrida dari tab **Character** atau ketik manual, menjadi tautan klik ke profil tokoh di mode baca).
  - `primaryLocation?: string` (Pemilih hibrida dari tab **Wilayah / Negara** atau ketik manual, menjadi tautan klik ke profil wilayah di mode baca).
- **Dossier Dramaturgi Bab**:
  - `chapterGoal?: string` (*Tujuan Naratif Bab* — apa yang harus dicapai tokoh atau plot di bab ini).
  - `centralConflict?: string` (*Konflik & Rintangan Utama* — benturan kepentingan atau bahaya yang menghalangi tujuan).
  - `endingHookOrTwist?: string` (*Cliffhanger / Pengungkapan Lore Akhir Bab* — kejutan penutup yang mendorong pembaca ke bab berikutnya).
  - `foreshadowingNotes?: string` (*Catatan Revisi & Foreshadowing Rahasia Penulis* — petunjuk tersembunyi yang ditanam untuk babak selanjutnya).
- **Target Kata, Penghitung Kata Real-Time & Bar Progres Visual**:
  - Mengukur progres kata per bab maupun total manuskrip novel dengan bar progres visual serta opsi hitung otomatis dari panjang naskah atau input manual.

---

### 2. Direktori Bab Berfilter, Pengurutan Bab (`↑`/`↓`) & Studio Adegan (*Scene Beats*) Lengkap
Meningkatkan kolom direktori kiri dan pengelola adegan di `ChapterOutlinerView`:
- **Filter Direktori Bab di Kiri**:
  - Pencarian cepat bab, filter berdasarkan **Babak / Act** (*Semua Babak*, *Babak I*, *Babak II*, *Babak III*), dan filter **Status Penulisan** (*Semua Status*, *Rencana*, *Sedang Ditulis*, *Revisi*, *Selesai*).
  - Tombol **Geser Urutan Bab Naik/Turun (`↑`/`↓`)** dan **Hapus Bab** dengan penomoran ulang otomatis (`Bab 1, 2, 3...`).
- **Pengelola Adegan (*Scene Beats*) Berfitur Edit & Reorder**:
  - Memperluas `ChapterScene` dengan `sceneGoalOrConflict?: string` (*Tujuan & Konflik Adegan*), `sceneOutcome?: string` (*Hasil Akhir / Perubahan Situasi Adegan*), dan `timeOfDay?: string` (*Waktu Adegan*).
  - **Pemilih Hibrida Tokoh POV & Lokasi Adegan**: Pilih tokoh POV langsung dari daftar **Character** dan lokasi adegan dari daftar **Wilayah / Negara** (atau ketik bebas). Di mode baca, nama tokoh POV dan lokasi adegan dapat diklik langsung menuju lembar World Bible-nya.
  - Setiap adegan dapat **disunting ulang (Mode Edit Adegan)** dan **diurutkan naik/turun (`↑`/`↓`)** di dalam bab.

---

### 3. Deteksi Otomatis `[[Nama Entitas]]` dari Naskah & Bilah Sisipkan Cepat World Bible
Menghubungkan penulisan manuskrip bab secara dua arah dengan World Bible:
- **Bilah Sisipkan Cepat Tautan World Bible**:
  - Saat menyunting naskah bab (`draftNotes`), penulis dapat memfilter kategori entitas (*Character*, *Wilayah*, *Negara*, *Pusaka*, *Skill*, *Sejarah*) dan mengklik tombol `+[[Nama Entitas]]` untuk menyisipkan tautan langsung ke dalam teks naskah.
- **Sinkronisasi Otomatis Entitas Terlibat dari Kurung Ganda (`[[...]]`)**:
  - Memindai otomatis seluruh penyebutan `[[Nama Entitas]]` di dalam Sinopsis, Naskah Bab, Dossier Konflik, dan Rincian Adegan.
  - Menampilkan daftar gabungan **Elemen World Bible yang Muncul di Bab Ini** (baik yang ditautkan manual maupun yang terdeteksi otomatis dari teks `[[...]]`) beserta tombol **+ Simpan Semua Tautan Terdeteksi ke Bab** dengan 1 klik.
