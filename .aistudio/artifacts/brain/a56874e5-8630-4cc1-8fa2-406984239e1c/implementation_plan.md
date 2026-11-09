# Rencana Revisi UX & Fitur Produktivitas Penulis Fantasi Tahap Lanjut

Pembaruan ini mengimplementasikan empat peningkatan alur kerja utama agar proses menulis naskah dan membangun dunia di **MythosCartograph** berjalan mulus tanpa hambatan kontekstual.

---

## 1. Popover Pembuat Entitas Instan pada Tautan `[[Nama]]` yang Belum Ada (*Interactive Redlink Creator*)
- **Mengubah Tautan `[[...]]` Kosong Menjadi Interaktif**:
  - Di `WikiTextRenderer.tsx`, setiap sebutan `[[Nama Entitas]]` yang belum terdaftar di Codex kini tampil sebagai tombol interaktif bertanda **`+ [[Nama Entitas]]`**.
- **Popover Pilih Kategori & Buat Otomatis**:
  - Saat diklik atau disentuh, muncul kartu popover *Grimoire* tempat penulis dapat memilih kategori entitas (*Karakter*, *Ras*, *Kelompok*, *Power System*, *Skill*, *Negara*, *Wilayah*, *Sejarah*, atau *Artefak & Biota*).
  - Tersedia dua tombol aksi cepat:
    1. **`+ Buat Otomatis di Codex`**: Langsung membuat entitas baru tersebut di latar belakang (sehingga tautan `[[...]]` seketika berubah menjadi tautan aktif berpratinjau) tanpa meninggalkan bab atau artikel yang sedang dibaca/ditulis.
    2. **`Buat & Buka Halaman`**: Membuat entitas sekaligus langsung melompat ke lembar profilnya.

---

## 2. Mode Fokus Menulis Layar Penuh (*Zen Manuscript Mode*)
- **Sembunyikan / Tampilkan Kolom Direktori Kiri**:
  - Pada tab **Alur Bab** (`ChapterOutlinerView`) dan **9 Tab Kategori Codex** (`CodexWorkspace`), ditambahkan tombol **`Mode Fokus Naskah (Layar Penuh)`** di pojok kanan atas lembar kerja.
  - Saat aktif, kolom daftar direktori di sebelah kiri disembunyikan sementara dan lembar perkamen utama melebar penuh (`12 kolom`) dengan lebar baca ergonomis, memudahkan penulis menyunting draf bab panjang atau membaca ensiklopedia tanpa distraksi.

---

## 3. Inspektur Kesehatan & Kelengkapan Lore (*Lore Health & Orphan Inspector*)
- **Tombol & Modal Diagnostik di Bilah Header Atas**:
  - Menambahkan tombol **`Kesehatan Lore`** (lengkap dengan indikator skor persentase ketersambungan dunia) di bilah atas aplikasi.
- **4 Pemindai Otomatis Semesta Cerita**:
  1. **Tautan `[[...]]` Belum Dibuat (*Uncreated Wiki Mentions*)**: Memindai seluruh naskah bab, kosmologi, dan artikel entitas untuk mendata semua `[[Nama]]` yang belum memiliki halaman di Codex, lengkap dengan pemilih kategori dan tombol **`+ Buat Entitas 1-Klik`** langsung dari daftar.
  2. **Entitas Yatim Relasi (*Relationship Orphans*)**: Mendeteksi Karakter, Kelompok, atau Negara yang belum memiliki satu pun ikatan di **Peta Relasi**.
  3. **Entitas Belum Muncul di Alur Bab (*Unfeatured Entities*)**: Mendeteksi Karakter, Lokasi, atau Pusaka yang belum pernah ditautkan atau disebut di dalam **Alur Bab** mana pun.
  4. **Wilayah & Negara Belum Dipetakan (*Unmapped Locations*)**: Mendeteksi entri Wilayah atau Negara yang belum tertaut ke pin lokasi di kanvas **Map Dunia**.

---

## 4. Generator Nama Fantasi & Gelar Epik (*Fantasy Name & Epithet Forge*)
- **Bilah Tempa Nama Kontekstual di Editor Entitas (`CodexWorkspace`)**:
  - Saat penulis menambah atau mengedit entitas, tersedia panel ringkas **Tempa Nama & Gelar Fantasi (*Name Forge*)** tepat di atas kolom Nama & Subjudul.
  - Menyediakan 5 nuansa bahasa/kultur fantasi:
    - *Klasik Bangsawan & Ksatria (High Fantasy)*
    - *Kekaisaran Surya & Kuno (Imperial / Latin)*
    - *Rimba Sylvan & Peri (Elven / Nature)*
    - *Besi Utara & Klan Gunung (Nordic / Dwarven)*
    - *Bayangan & Arkanum Terlarang (Dark / Eldritch)*
  - Menghasilkan kombinasi **Nama Entitas** dan **Gelar / Subjudul Epik** yang disesuaikan dengan kategori aktif (*Tokoh*, *Ras*, *Kelompok*, *Power System*, *Skill*, *Negara*, *Wilayah*, *Sejarah*, *Artefak & Biota*) dan dapat diterapkan ke formulir hanya dengan 1 klik.

---

## 5. Cakupan Berkas yang Diperbarui
- `/src/components/WikiTextRenderer.tsx`: Menambahkan prop opsional `onQuickCreateEntity` dan komponen popover interaktif **`UncreatedWikiLinkPopover`** untuk tautan `[[...]]` yang belum ada.
- `/src/components/GlobalProductivityModals.tsx`: Menambahkan komponen **`LoreHealthInspectorModal`** (pemindai tautan kosong, entitas yatim, entitas belum masuk bab, dan lokasi belum dipetakan).
- `/src/components/CodexWorkspace.tsx`: Menambahkan **Mode Fokus Menulis**, **Generator Nama Fantasi & Gelar Epik (*Fantasy Name Forge*)**, serta meneruskan `onQuickCreateEntity` ke seluruh `WikiTextRenderer`.
- `/src/components/ChapterOutlinerAndPrdView.tsx` & `/src/components/WorldOverviewTab.tsx`: Menambahkan **Mode Fokus Menulis** pada Alur Bab dan meneruskan `onQuickCreateEntity` ke seluruh `WikiTextRenderer`.
- `/src/App.tsx`: Menambahkan handler pembuatan entitas instan dari tautan `[[...]]` serta tombol **`Kesehatan Lore`** di bilah header atas.
