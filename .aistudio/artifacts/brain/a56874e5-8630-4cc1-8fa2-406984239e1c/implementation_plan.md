# Rencana Peningkatan Produktivitas Global: Omni-Search (`Ctrl+K`), Studio Ekspor Buku & Naskah, serta Manajer Multi-Proyek & Snapshot

Pembaruan ini menghadirkan tiga fitur produktivitas lintas tab di bilah atas (**Top Header Bar**) **MythosCartograph** agar penulis dapat menavigasi ratusan entri secara instan, mengelola lebih dari satu semesta cerita sekaligus dengan titik cadangan (*snapshot*), serta mengekspor karya menjadi dokumen **Markdown (`.md`)** atau **Buku Panduan Siap Cetak / PDF**.

---

## 1. Pencarian Global Kilat (`Ctrl+K` / Omni-Search Command Palette)
- **Tombol & Pintasan Keyboard Global**:
  - Menambahkan tombol pencarian cepat di bilah atas (`Cari di Dunia... [Ctrl+K]`) serta listener keyboard global `Ctrl+K` / `Cmd+K` (dan `Escape` untuk menutup) yang dapat dipanggil dari tab mana pun.
- **Cakupan Pencarian Lintas 4 Dimensi Semesta**:
  - **Entitas World Bible**: Mencari berdasarkan judul, subjudul, ringkasan, isi artikel, tag, maupun atribut pada seluruh 9 kategori (*Character*, *Ras*, *Kelompok*, *Power System*, *Skill*, *Negara*, *Wilayah*, *Sejarah*, *Artefak & Biota*).
  - **Alur Bab & Adegan**: Mencari judul bab, sinopsis, tujuan bab, atau judul adegan, lalu langsung membuka bab tersebut di tab **Alur Bab**.
  - **Peristiwa Kronologi (Timeline)**: Mencari peristiwa berdasarkan tahun/penanggalan, judul, era, atau lokasi, lalu melompat ke tab **Timeline**.
  - **Pin Lokasi Peta Dunia**: Mencari label pin lokasi di kanvas **Map Dunia**, lalu membuka peta atau entitas wilayah yang tertaut.
- **Filter Cepat & Navigasi Keyboard (`↑` / `↓` / `Enter`)**:
  - Dilengkapi filter cakupan (*Semua*, *Entitas Lore*, *Alur Bab*, *Timeline*, *Pin Peta*) dan navigasi panah atas/bawah untuk berpindah halaman dalam 1 detik.

---

## 2. Manajer Multi-Proyek Dunia & Slot Snapshot Versi
- **Penyimpanan Multi-Semesta di Browser**:
  - Memperbarui arsitektur penyimpanan lokal agar penulis dapat menyimpan dan mengelola **banyak proyek dunia fiksi sekaligus** (misalnya *Kronik Benua Aethelia* berdampingan dengan proyek novel kedua atau ketiga).
  - Saat penulis menekan **+ Buat Dunia Baru** atau **Impor Berkas JSON**, dunia yang sedang aktif tidak akan tertimpa, melainkan tersimpan aman di daftar proyek.
- **Slot Snapshot (Titik Simpan Versi)**:
  - Penulis dapat membuat **Snapshot Versi** kapan saja dengan label catatan (contoh: *"Sebelum rombak struktur Babak II"* atau *"Versi Draf Awal"*).
  - Setiap snapshot mencatat waktu pembuatan, jumlah entitas, dan jumlah bab, serta dapat dipulihkan (*Restore*) atau diunduh sebagai berkas `.JSON` mandiri kapan saja.
- **Aksi Proyek Lengkap**:
  - Beralih antar proyek dunia dengan 1 klik, menduplikasi dunia (*Clone World*), mengganti nama proyek, atau menghapus proyek lama dengan aman.

---

## 3. Studio Ekspor Buku World Bible & Naskah Bab (Markdown `.md` & Cetak / PDF)
- **Modal Studio Ekspor & Publikasi Terpadu**:
  - Menggantikan tombol ekspor tunggal di header dengan **Studio Ekspor & Cadangan** yang menyediakan 4 format keluaran:
    1. **Unduh Kompilasi Buku World Bible (`.md` Markdown)**: Menghasilkan dokumen Markdown terstruktur berisi Kosmologi & Konflik Utama, Daftar Isi, seluruh Entitas per kategori lengkap dengan tabel atribut, Pita Kronologi Sejarah, serta Daftar Ikatan Relasi—siap dibuka di Obsidian, Notion, Scrivener, atau Google Docs.
    2. **Unduh Naskah & Kerangka Alur Bab (`.md` Markdown)**: Menghasilkan dokumen naskah berurutan per Babak dan Bab lengkap dengan Tujuan Bab, Konflik, Urutan Adegan (*Scene Beats*), dan Draf Naskah.
    3. **Mode Cetak / Simpan PDF Buku Ensiklopedia & Naskah**: Membuka lembar pratinjau cetak bergaya buku kodeks klasik yang bersih (menyembunyikan bilah navigasi aplikasi saat dicetak melalui dialog cetak browser / *Save as PDF*), dengan opsi memilih bagian yang ingin disertakan (*Kosmologi*, *Ensiklopedia Entitas*, *Kronologi Sejarah*, *Alur Bab & Naskah*).
    4. **Cadangan & Pemulihan Data Mentah (`.JSON`)**: Ekspor dan impor berkas `.JSON` World Bible utuh untuk pencadangan penuh.

---

## 4. Cakupan Berkas yang Diperbarui
- `/src/components/GlobalProductivityModals.tsx` *(berkas komponen baru)*: Memuat komponen **GlobalOmniSearchModal**, **MultiWorldProjectManagerModal**, dan **WorldExportStudioModal** (termasuk tampilan pratinjau cetak/PDF).
- `/src/App.tsx`: Mengintegrasikan pintasan keyboard `Ctrl+K`, state daftar multi-proyek dan snapshot di `localStorage`, serta tombol akses cepat di bilah header atas.
