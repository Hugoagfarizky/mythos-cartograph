# Sinkronisasi Studio Ekspor Buku (.MD & PDF) & Modal Panduan Arsitektur Cerita Interaktif

Pembaruan ini menyempurnakan alur kerja penulis di **MythosCartograph** melalui dua fitur utama: (1) mengintegrasikan seluruh **6 section baru** (*Entitas Kosmik*, *Dewa-Dewi*, *Bestiary Monster*, *Agama & Budaya*, *Silsilah Dinasti*, dan *Tracker Nubuat*) beserta label atribut berbahasa Indonesia ke dalam **Studio Ekspor Buku Markdown (`.md`) & Cetak PDF**, serta (2) menghadirkan tombol **`Panduan Cerita`** di bilah atas aplikasi yang membuka **Modal Panduan & Checklist Interaktif 5 Tahap Menyusun Cerita**.

## User Review & Critical Decisions

> [!IMPORTANT]
> Rencana ini disusun berdasarkan dua keputusan yang telah Anda konfirmasi:
> - **Keputusan 1 (Sinkronisasi Ekspor Buku .MD & PDF)**: Memasukkan data *Pohon Silsilah & Dinasti*, *Tracker Misteri, Nubuat & Foreshadowing*, catatan *Kanvas Bebas*, serta terjemahan label atribut *Entitas Kosmik*, *Dewa-Dewi*, *Bestiary Monster*, dan *Agama & Budaya* ke dalam hasil kompilasi Markdown (`.md`) dan lembar pratinjau cetak PDF.
> - **Keputusan 2 (Tombol Panduan Cerita Interaktif di Bilah Atas)**: Menambahkan tombol **`Panduan Cerita`** di bilah atas (*Top Bar*) yang membuka modal interaktif berisi *Checklist Progres 5 Tahap Menyusun Cerita*, *Kamus 4 Pilar (21 Tab)* dengan tombol lompat langsung ke masing-masing tab, serta tombol unduh panduan `.md`.

---

## 1. Overview & Core Concept

- **Apa yang Dilakukan Fitur Ini**:
  1. **Studio Ekspor Buku Lengkap (`.MD` & PDF)**: Memastikan saat penulis mengekspor *World Bible* ke Markdown atau mencetaknya ke PDF, seluruh silsilah wangsa kerajaan per generasi, daftar nubuat/misteri (beserta petunjuk bab dan opsi menampilkan/menyembunyikan *spoiler* rahasia kanonik), serta atribut spesifik kategori baru tercetak rapi dengan nama label Bahasa Indonesia.
  2. **Modal Panduan & Checklist Menyusun Cerita (`Panduan Cerita`)**: Memberikan peta jalan (*roadmap*) interaktif di dalam aplikasi agar penulis tahu persis langkah apa yang sudah selesai dan langkah apa yang harus dikerjakan berikutnya saat membangun dunia dan menulis bab.
- **Target Pengguna**: Penulis novel fantasi, perancang *lore* RPG, dan kreator dunia fiksi yang membutuhkan panduan alur kerja terstruktur sekaligus hasil ekspor dokumen *World Bible* yang utuh.
- **Nilai Utama**: Menghilangkan kebingungan saat memulai proyek dunia baru dan menjamin tidak ada data dari 21 tab yang tertinggal saat diekspor ke `.md` atau PDF.

---

## 2. User Experience & Visual Design

- **Alur Pengguna Utama (Key User Flows)**:
  1. **Membuka Panduan Cerita dari Bilah Atas**:
     - Penulis mengeklik tombol **`Panduan Cerita`** di bilah navigasi atas.
     - Modal terbuka dengan 3 sub-tab interaktif:
       - **Tab 1: Checklist 5 Tahap Menyusun Cerita**: Menampilkan progres otomatis proyek aktif (misal: *Tahap 1: Premis & Peta Dunia*, *Tahap 2: Aturan Sihir & Bangsa*, *Tahap 3: Tokoh & Silsilah Dinasti*, *Tahap 4: Misteri Nubuat & Rangka Adegan*, *Tahap 5: Audit & Ekspor Buku*). Setiap langkah dilengkapi indikator status selesai/belum dan tombol **`Buka Tab →`** yang langsung mengarahkan penulis ke tab terkait.
       - **Tab 2: Peta 4 Pilar & 21 Section**: Menjelaskan fungsi setiap tab di Pilar I–IV beserta tips penggunaannya dan tombol pintas untuk langsung membuka tab tersebut.
       - **Tab 3: Tautan Pintar `[[...]]` & Tips Produktivitas**: Panduan visual cara memakai tautan kurung ganda `[[Nama Entitas]]`, *Generator Nama Fantasi*, *Mode Fokus Menulis*, *Kanvas Bebas*, serta tombol **`Unduh Buku Panduan (.MD)`**.
  2. **Mengekspor & Mencetak Buku World Bible Utuh**:
     - Penulis mengeklik tombol **`Ekspor & Cetak Buku`** di bilah atas.
     - Pada tab **Buku World Bible (.MD)**, dokumen Markdown kini otomatis menyertakan bagian **Silsilah Keluarga & Dinasti Kerajaan** (kelompok generasi, gelar, orang tua, pasangan, status suksesi), **Tracker Misteri, Nubuat & Foreshadowing** (syair nubuat, tafsir umum, kebenaran kanonik, dan rantai petunjuk bab), serta **Halaman Catatan Kanvas Bebas**.
     - Pada tab **Lembar Cetak / Simpan PDF**, tersedia kotak centang tambahan untuk menyertakan/menyembunyikan **Silsilah Dinasti** dan **Tracker Nubuat & Misteri** di lembar cetak buku.

- **Identitas Visual & Tema**:
  - **Aesthetic Direction**: *Illuminated Cartographer's Grimoire* — selaras dengan tema ganda **Perkamen Siang** (`#F6F1E6` / `#FBF8F1`) dan **Grimoire Malam** (`#15110D` / `#1E1812`) tanpa masalah kontras.
  - **Typography & Hierarchy**: Menggunakan `Cinzel` untuk judul pilar/bab, `Cormorant Garamond` untuk kutipan dan subjudul buku cetak, `Plus Jakarta Sans` untuk teks panduan dan checklist, serta `JetBrains Mono` (`tabular-nums`) untuk indikator persentase dan hitungan item.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Checklist Progres Otomatis Berbasis Data Proyek Aktif**
  - *Pendekatan yang Dipilih*: Menghitung status penyelesaian 5 Tahap Menyusun Cerita secara langsung dari isi proyek dunia yang sedang dibuka (apakah premis sudah diisi, apakah ada *Power System*, apakah sudah ada *Character* dan *Silsilah Dinasti*, apakah ada *Tracker Nubuat*, dan apakah *Alur Bab* sudah memiliki adegan/draf).
  - *Alasan*: Penulis tidak perlu mencentang manual satu per satu; aplikasi secara cerdas mendeteksi bagian mana dari dunia cerita yang masih kosong dan memberikan tombol lompat 1-klik ke tab tersebut.
- **Keputusan 2: Label Atribut Berbahasa Indonesia di Ekspor Markdown & PDF**
  - *Pendekatan yang Dipilih*: Memetakan seluruh kunci atribut teknis (termasuk 20+ atribut baru dari *Entitas Kosmik*, *Dewa-Dewi*, *Bestiary Monster*, dan *Agama & Budaya*) ke label Bahasa Indonesia yang rapi saat menghasilkan teks `.md` dan kartu cetak PDF.
  - *Alasan*: Menghasilkan dokumen `.md` dan cetakan PDF yang langsung layak baca layaknya buku ensiklopedia resmi, bukan kumpulan nama variabel kode.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                          App Shell & Top Bar                            │
│  [Cari (Ctrl+K)] [Panduan Cerita] [Kesehatan Lore] [Proyek] [Ekspor]    │
└───────────────┬─────────────────────────────────────────┬───────────────┘
                │                                         │
                ▼                                         ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐
│       StoryArchitectGuideModal        │ │        WorldExportStudioModal         │
│ ───────────────────────────────────── │ │ ───────────────────────────────────── │
│ • Tab 1: Checklist 5 Tahap Cerita     │ │ • buildWorldBibleMarkdown(project)    │
│   (Auto-evaluasi progres WorldProject │ │   ├─ Kosmologi & 13 Kategori Entitas  │
│    + Tombol Lompat ke Tab Terkait)    │ │   │  (Label Atribut Bahasa Indonesia) │
│ • Tab 2: Direktori 4 Pilar & 21 Tab   │ │   ├─ Pohon Silsilah & Dinasti         │
│ • Tab 3: Sintaks [[...]] & Tips       │ │   ├─ Tracker Misteri & Nubuat         │
│ • Aksi: Unduh Panduan Lengkap (.MD)   │ │   ├─ Pita Kronologi & Peta Relasi     │
│                                       │ │   └─ Catatan Dokumen Kanvas Bebas     │
│                                       │ │ • Lembar Cetak PDF (Checkbox Silsilah │
│                                       │ │   & Tracker Nubuat terintegrasi)      │
└───────────────────────────────────────┘ └───────────────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - `StoryArchitectGuideModal`: Menerima `project`, `onClose`, dan `onNavigateToTab(tabId: WorkspaceTab)` sehingga saat penulis mengeklik tombol aksi pada tahap checklist atau direktori 21 tab, modal otomatis tertutup dan mengaktifkan tab yang dituju.
  - `WorldExportStudioModal`: Menambahkan *state* filter cetak `printIncludeDynasties` dan `printIncludeProphecies`, memperbarui fungsi kompilasi `buildWorldBibleMarkdown` dengan kamus label atribut Bahasa Indonesia (`ATTRIBUTE_LABELS_ID`), serta merender seksi cetak **Silsilah Dinasti** dan **Tracker Nubuat** di lembar pratinjau PDF.
