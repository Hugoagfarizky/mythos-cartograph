# Rencana Penyempurnaan UI/UX Penulis Fantasi (*Royal Parchment & Candlelight Grimoire*)

Pembaruan ini menyulap atmosfer visual dan pengalaman pengguna (**UI/UX**) **MythosCartograph** agar terasa seperti meja kerja kartografer dan kitab *Grimoire / Bestiary* abad pertengahan yang autentik, nyaman dipakai menulis berjam-jam, dan kaya akan detail estetika fantasi.

---

## 1. Tipografi Epik (`Cinzel` & `Cinzel Decorative`) & *Illuminated Drop Cap*
- **Integrasi Font Epik Fantasi**:
  - Memuat font **Cinzel** dan **Cinzel Decorative** melalui Google Fonts di `index.html` untuk judul dunia, kepala bagian kodeks, lambang pilar navigasi, dan tajuk bab.
- **Huruf Awal Paragraf Besar (*Illuminated Manuscript Drop Cap*)**:
  - Menambahkan gaya `.fantasy-dropcap` pada artikel panjang World Bible dan draf naskah bab sehingga huruf pertama pada paragraf pembuka tampil besar dengan bingkai emas/merah lilin bergaya naskah kuno abad pertengahan.

---

## 2. Ornamen Sudut Filigri Emas, Pembatas Bab & Tekstur Perkamen
- **Ornamen Sudut & Pembatas Bab (*Ornate Corner Filigree & Flourish Dividers*)**:
  - Menambahkan ornamen sudut kuningan/emas bergaya manuskrip (*SVG corner filigree*) dan garis pembatas bab bertanda kompas bintang pada kartu utama Overview, lembar detail entitas Codex, serta lembar kerja Alur Bab.
- **Tekstur Lembaran Perkamen Halus**:
  - Menambahkan pola serat perkamen halus dan bayangan tepi halaman buku (*parchment vignette*) yang mempertegas kesan lembaran kulit/kertas tua tanpa mengganggu keterbacaan teks.

---

## 3. Mode Tema Ganda: *Perkamen Siang* vs *Grimoire Malam Lilin*
- **Tombol Pengalih Suasana Meja Penulis di Bilah Atas**:
  - **Mode Perkamen Siang (*Royal Parchment*)**: Palet kertas vellum hangat (`#F6F1E6`), tinta besi tua (`#231C14`), segel merah (`#9E2A2B`), dan sepuhan kuningan (`#B5832A`).
  - **Mode Grimoire Malam Lilin (*Candlelight Obsidian Grimoire*)**: Palet ruang kerja malam bertema kulit buku hitam-cokelat tua (`#16120E` & `#1F1914`), teks krem gading hangat (`#EFE6D5`), dan pendaran cahaya lilin emas (`#D4A349`) yang sangat nyaman di mata saat menulis fantasi di malam hari.
  - Pilihan tema disimpan otomatis di `localStorage`.

---

## 4. Navigasi 14 Tab dalam 4 Pilar Semesta Fantasi
- Mengorganisir ke-14 tab ke dalam **4 Pilar Dunia** yang dikelompokkan secara visual di bilah navigasi utama lengkap dengan ikon fantasi pada setiap tab:
  1. **Pilar I — Kosmos & Atlas**: `Overview` (Kompas Kosmik), `Map Dunia` (Peta Kartografi)
  2. **Pilar II — Penghuni & Kekuatan**: `Character` (Tokoh), `Ras` (Silsilah), `Kelompok` (Panji Faksi), `Power System` (Esensi Sihir), `Skill` (Jurus & Mantra)
  3. **Pilar III — Geopolitik & Kronik**: `Negara` (Kerajaan), `Wilayah` (Bentang Alam), `Sejarah` (Arsip Kuno), `Timeline` (Jam Pasir Waktu), `Artefak & Biota` (Relik & Bestiary)
  4. **Pilar IV — Takdir & Naskah**: `Peta Relasi` (Jaring Ikatan), `Alur Bab` (Pena Manuskrip)

---

## 5. Kartu Entitas Bergaya Kartu Tarot / Lembaran Bestiary Kuno
- Memperbarui tampilan kartu di direktori kiri **CodexWorkspace** dan kartu sorotan di **WorldOverviewTab** dengan bingkai ganda tipis beraksen kuningan (`double-border arcana frame`), lencana segel kategori, potongan potret bergaya ilustrasi *bestiary*, dan penomoran arkana/indeks.

---

## 6. Kartu Pratinjau Cepat (*Hover Grimoire Card*) pada Tautan `[[Nama Entitas]]`
- Memperbarui `WikiTextRenderer.tsx` sehingga ketika kursor penulis menyentuh (*hover*) tautan `[[Nama Entitas]]` di artikel lore mana pun atau di naskah bab:
  - Muncul **Kartu Pratinjau Grimoire** mengambang (*floating popover card*) yang menampilkan:
    - Potret / Ikon lambang kategori & nama entitas
    - Subjudul / gelar kehormatan
    - 3 atribut utama entitas (misalnya Peran, Status, Afiliasi, Negara Induk, atau Tingkat Bahaya)
    - Ringkasan kanon singkat & petunjuk *"Klik untuk membuka halaman kodeks"*.

---

## 7. Berkas yang Akan Diperbarui
- `/index.html`: Menambahkan Google Fonts `Cinzel` dan `Cinzel Decorative`.
- `/src/index.css`: Menambahkan aturan tipografi `.font-epic`, `.fantasy-dropcap`, tekstur perkamen, ornamen bingkai *arcana/bestiary*, serta variabel CSS otomatis untuk **Mode Grimoire Malam Lilin (`data-theme="grimoire-dark"`)**.
- `/src/components/WikiTextRenderer.tsx`: Menambahkan **Kartu Pratinjau Cepat (*Hover Grimoire Card*)** pada setiap tautan `[[Nama Entitas]]` serta komponen ornamen pembatas manuskrip.
- `/src/App.tsx`: Merombak bilah navigasi 14 tab menjadi **4 Pilar Dunia Fantasi** lengkap dengan ikon fantasi, ornamen header, dan tombol pengalih **Mode Perkamen Siang / Grimoire Malam Lilin**.
- `/src/components/WorldOverviewTab.tsx`, `/src/components/CodexWorkspace.tsx`, & `/src/components/ChapterOutlinerAndPrdView.tsx`: Menerapkan kartu bergaya *Tarot / Bestiary Folio*, *Illuminated Drop Cap* pada artikel & naskah, serta ornamen sudut manuskrip emas.
