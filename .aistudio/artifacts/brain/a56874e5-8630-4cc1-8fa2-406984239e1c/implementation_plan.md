# Rencana Pembaruan Tab Character (Character Dossier & Arc Studio)

Pembaruan ini menyulap tab **Character** menjadi studio perancangan tokoh fiksi (*Character Bible*) yang lengkap, terstruktur, dan terhubung langsung dengan entitas Ras, Kelompok, Negara, Skill, Pusaka, serta Peta Relasi.

---

## 1. Anatomi Psikologi, Kutipan Khas, Penampilan & *Character Arc*
Menambahkan atribut khusus karakter pada `LoreAttributes` (`src/types/world.ts`) dan menampilkannya secara elegan di lembar profil karakter:
- **Kutipan Khas (*Signature Quote*) & Gaya Bicara (*Voice/Mannerism*)**: Ditampilkan sebagai blok epigrafi karakter di bagian atas profil tokoh.
- **Ciri Fisik & Penampilan (*Appearance*)**: Postur, ciri mata/rambut, pakaian khas, atau bekas luka/tanda sihir.
- **Psikologi & Konflik Batin**:
  - **Motivasi / Tujuan Utama (*Desire & Goal*)**: Apa yang paling ingin dicapai tokoh ini.
  - **Ketakutan / Kelemahan Fatal (*Fatal Flaw / Internal Conflict*)**: Kerentanan psikologis atau fisik yang menghambatnya.
- **Busur Perkembangan Tokoh (*Character Arc* 3 Babak)**:
  - **Fase Awal (*Starting State*)**: Jati diri dan keyakinan tokoh di awal cerita.
  - **Titik Balik / Krisis (*Crucible / Turning Point*)**: Ujian terbesar yang mengguncang prinsipnya.
  - **Transformasi Akhir (*Resolution / Endgame*)**: Akan menjadi sosok seperti apa tokoh ini di akhir cerita.

---

## 2. Pemilih Entitas Terhubung (Ras, Kelompok, Negara, Skill & Pusaka)
- **Input Hibrida (Pilih dari World Bible atau Ketik Baru)**:
  - Saat menyunting **Ras**, **Kelompok/Faksi**, dan **Negara Asal**, penulis dapat memilih langsung dari daftar entitas Ras/Kelompok/Negara yang sudah ada di *World Bible* melalui *datalist/selector* cepat atau mengetik nama baru.
- **Daftar Skill & Artefak/Pusaka Milik Tokoh (`knownSkills` & `ownedArtifacts`)**:
  - Menyediakan pemilih multi-item di mode sunting untuk menambahkan/menghapus **Skill / Teknik** (dari tab *Skill*) dan **Artefak / Senjata Pusaka** (dari tab *Artefak & Biota*).
  - Di mode baca, setiap atribut Ras, Kelompok, Negara, Skill, dan Pusaka yang cocok dengan entitas di *World Bible* dapat **diklik langsung** untuk melompat ke lembar lore entitas tersebut.

---

## 3. Panel Ikatan Relasi & Konflik Langsung di Lembar Karakter
- **Kartu Jaringan Hubungan Tokoh**:
  - Menampilkan semua relasi yang melibatkan tokoh aktif (misalnya *Rival*, *Sekutu*, *Guru/Murid*, *Keluarga*, *Anggota Faksi*) lengkap dengan catatan dinamika hubungannya dan tautan cepat ke tokoh/faksi lawan bicara.
- **Tambah Relasi Cepat Tanpa Pindah Tab**:
  - Menyediakan form ringkas **"+ Tambah Relasi Tokoh"** langsung di dalam lembar karakter untuk menghubungkan tokoh ini dengan karakter atau faksi lain (otomatis tersimpan ke `project.relationships` dan tersinkronisasi dengan tab *Peta Relasi*).

---

## 4. Direktori Karakter Kiri dengan Filter Peran, Status & Potret Mini
- **Filter Cepat Direktori Karakter**:
  - Menambahkan filter berdasarkan **Peran Cerita** (*Semua*, *Protagonis*, *Deuteragonis*, *Antagonis*, *Mentor/Pendukung*) dan **Status** (*Hidup*, *Diasingkan*, *Gugur*).
- **Kartu Daftar Berpotret Mini & Editor URL/Preset Potret**:
  - Menampilkan *thumbnail* potret karakter, peran, tingkatan kekuatan (*power tier*), serta faksi pada kartu di daftar sebelah kiri, dan menyediakan input/pilihan cepat gambar potret di dalam mode sunting karakter.
