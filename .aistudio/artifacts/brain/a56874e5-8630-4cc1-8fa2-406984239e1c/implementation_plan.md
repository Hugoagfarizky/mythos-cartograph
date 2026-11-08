# Dokumentasi Arsitektur & Peningkatan Modul Sejarah + Timeline (Kronologi) — MythosCartograph

## 1. Status Implementasi Modul World Bible
Seluruh modul berikut telah selesai dibangun, diverifikasi, dan terhubung secara dua arah:
- **Overview** (`WorldOverviewTab.tsx`) — Dasbor Statistik Kanon, Kosmologi, Audit Kesehatan Dunia & Catatan Cepat.
- **Map Dunia** (`MedievalMapSandbox.tsx`) — Kanvas Peta Abad Pertengahan, Pin Interaktif, Rute Ekspedisi, Pengukur Jarak & Generator Benua Prosedural.
- **Character** (`CodexWorkspace.tsx`) — Profil Psikologi, Kutipan Khas, Busur 3 Babak, Pemilih Hibrida Skill/Artefak & Matriks Relasi.
- **Ras** (`CodexWorkspace.tsx`) — Biologi Spesies, Sub-Ras, Kelemahan Biologis, Bahasa/Penamaan & Daftar Karakter Otomatis.
- **Kelompok** (`CodexWorkspace.tsx`) — Hirarki Pangkat, Sumpah Perekrutan, Ideologi Publik vs Agenda Rahasia & Anggota Otomatis.
- **Power System** (`CodexWorkspace.tsx`) — Hukum Besi (*Hard Magic*), Tangga Tier, Cabang Elemen, Harga Kekuatan (*Backlash*) & Daftar Skill Turunan.
- **Skill** (`CodexWorkspace.tsx`) — Silsilah Sistem Induk, Eksklusivitas Ras/Garis Darah, Skala Dampak Strategis & Praktisi Otomatis.
- **Negara** (`CodexWorkspace.tsx`) — Pemerintahan, Penguasa, Ibu Kota, Demografi Ras, Ekonomi, Militer, Hukum & Konflik Perbatasan.
- **Wilayah** (`CodexWorkspace.tsx`) — Tipologi Geografis, Atmosfer Sensorik Latar Adegan, Landmark Lokal, Ekologi Monster/Bahaya & Pin Peta.
- **Sejarah** (`CodexWorkspace.tsx`) — Dossier Historiografi, Pemicu Awal (*Casus Belli*), Sejarah Resmi Pemenang vs Kebenaran Rahasia, Pihak Terlibat & Tokoh Kunci.
- **Timeline / Kronologi** (`TimelineAndGraphView.tsx`) — Pita Kronologi Lintas Era, Penanda Selisih Tahun (`Δ Tahun`), Kalkulator Usia & Generasi Ras, serta Sinkronisasi Dua Arah Otomatis dengan Dokumen Sejarah & Alur Bab.

---

## 2. Arsitektur Tab Timeline (Kronologi) & Sinkronisasi Dokumen Dua Arah

### A. Kalkulator Rentang Waktu, Generasi & Usia Karakter (`Kalkulator Jarak Tahun & Usia`)
- Memungkinkan penulis memilih **Titik Waktu A (Peristiwa Awal / Kelahiran)** dan **Titik Waktu B (Peristiwa Pembanding / Tahun Cerita Saat Ini)** untuk menghitung selisih waktu (`Δ Tahun`) secara otomatis.
- Menampilkan konversi langsung ke:
  - **Skala Generasi Manusia** (~25 tahun per generasi)
  - **Rentang Hidup Dvergr Besi-Bintang** (~350 tahun masa hidup)
  - **Rentang Hidup Sylvan Aelfir** (~700 tahun masa hidup)

### B. Pita Kronologi Berkelompok per Era & Penanda Selisih Waktu
- Setiap pergantian era menampilkan **Banner Babak Era Sejarah**.
- Di antara dua peristiwa berurutan pada garis waktu kuningan (`#B5832A`), sistem menghitung dan menampilkan badge jarak waktu otomatis (`+ X tahun kemudian` atau `- X tahun sebelumnya`).
- Dilengkapi filter ganda berdasarkan **Era Sejarah**, **Jenis Peristiwa** (*Peperangan*, *Bencana Arcane*, *Berdirinya Kerajaan*, *Penemuan Pusaka*, *Kelahiran Tokoh*), pencarian kata kunci, dan pengubah urutan waktu (**Kuno → Kini** vs **Kini → Kuno**).

### C. Sinkronisasi Dokumen Dua Arah Otomatis (Timeline ↔ Dokumen Sejarah & Alur Bab)
1. **Simpan di Tab Sejarah → Otomatis Memperbarui Pita Timeline**:
   - Saat Anda menyunting dan menyimpan dokumen di tab **Sejarah**, perubahan tanggal, tahun, era, lokasi, dampak, serta daftar pihak terlibat dan tokoh kunci langsung disinkronkan ke **Pita Kronologi Dunia**.
2. **Simpan di Tab Timeline → Otomatis Memperbarui Dokumen Sejarah**:
   - Saat Anda menyunting tonggak peristiwa di tab **Timeline**, sistem otomatis memperbarui dokumen **Sejarah** yang terhubung (judul, ringkasan, era, tahun, penanggalan, lokasi, dampak dunia, dan catatan rahasia).
3. **Promosi 1-Klik (`+ Jadikan Lembar Sejarah`) & Tarik Massal (`Sinkronkan dari Tab Sejarah`)**:
   - Peristiwa baru yang dibuat di **Timeline** dapat dipromosikan menjadi dokumen **Sejarah** lengkap hanya dengan 1 klik, atau seluruh dokumen **Sejarah** dapat ditarik sekaligus ke **Timeline**.
   - Setiap peristiwa di **Timeline** juga dapat ditautkan langsung ke **Bab Novel** di tab **Alur Bab**.
