# Transformasi Visual Hamparan Kitab Grimoire Abad Pertengahan (*Illuminated Medieval Tome*)

Pembaruan ini menghadirkan atmosfer visual **Kitab Fantasi Abad Pertengahan (*Open Medieval Grimoire Tome*)** yang imersif ke seluruh ruang kerja **MythosCartograph**—lengkap dengan bingkai sampul jilid kulit, siku pengunci logam kuningan, efek tepi lembaran perkamen bertumpuk, bayangan lipatan jilid buku, ukiran sudut emas (*illuminated filigree*), pembatas bab sulur kompas, dan aksen segel lilin kerajaan—tanpa mengubah satu pun isi fitur maupun jenis huruf (*font*) yang sudah digunakan.

## User Review & Critical Decisions

> [!IMPORTANT]
> Rencana ini mengimplementasikan seluruh pilihan visual yang telah Anda konfirmasi:
> - **Gaya Bingkai Utama**: **Hamparan Kitab Grimoire Terbuka** dengan bingkai luar bertekstur sampul kulit tua (*tooled leather binding*), siku kuningan di keempat sudut, pita penanda buku merah kirmizi (*ribbon bookmark*), efek tumpukan lembaran kertas di tepi halaman, serta bayangan lipatan jilid buku (*book spine shadow*).
> - **Ornamen Buku Fantasi Abad Pertengahan**:
>   1. **Bingkai Ukiran Sudut Emas & Tekstur Perkamen Tua** (*Illuminated Celtic/Medieval Corner Filigree* & *Aged Vellum Vignette*).
>   2. **Ornamen Pembatas Bab Sulur Kompas & Segel Lilin Kerajaan** (*Medieval Compass Rose & Flourish Dividers* + *Royal Wax Seal Badges*).
>   3. **Efek Tepi Lembaran Kitab Bertumpuk & Bayangan Lipatan Jilid Buku** (*Stacked Parchment Page Edges & Book-Binding Crease*).
> - **Konsistensi Font & Konten**: Mempertahankan 100% seluruh 21 tab di 4 Pilar, fungsi aplikasi, serta jenis huruf (`Cinzel Decorative`, `Cinzel`, `Lora`, dan `JetBrains Mono`) baik pada mode **Perkamen Siang** maupun **Grimoire Malam**.

---

## 1. Overview & Core Concept

- **Apa yang Dilakukan Pembaruan Ini**: Mengubah tampilan kontainer aplikasi dari sekadar halaman web biasa menjadi seperti **Kitab World Bible Abad Pertengahan yang sedang dibuka di atas meja kayu kartografer**.
- **Pengalaman Visual Utama**:
  1. **Sampul Kulit & Siku Kuningan (*Leather Binding & Brass Clasps*)**: Area kerja utama dibingkai oleh sampul jilid kulit berukir tipis dengan pelindung sudut kuningan antik dan pita pembatas buku merah di bagian atas.
  2. **Tepi Lembaran Kertas Bertumpuk (*Stacked Tome Pages*)**: Sisi kiri, kanan, dan bawah hamparan kitab menampilkan berlapis-lapis tepi lembaran kertas perkamen beserta bayangan halus lipatan jilid buku di bagian tengah/tepi dalam.
  3. **Ukiran Sudut Emas & Pembatas Sulur Kompas (*Medieval Filigree & Dividers*)**: Memperkaya komponen `OrnateCornerFiligree` dengan detail sulur manuskrip abad pertengahan serta menambahkan pembatas bagian (*ornamental divider*) bergaya kompas bintang & segel lilin kerajaan.

---

## 2. User Experience & Visual Design

- **Identitas Visual & Detail Ornamen**:
  - **Tekstur Perkamen Tua (*Aged Vellum Grain & Vignette*)**: Permukaan kertas memiliki gradasi tepi perkamen hangat (*radial vignette*) dan serat kertas halus yang tetap nyaman dibaca dalam waktu lama.
  - **4 Kotak Pilar Bergaya Pelat Indeks Kitab Kerajaan**: Keempat kotak Pilar (*Pilar I–IV*) di bagian atas kitab dihiasi ornamen sudut emas, garis pembatas sulur, dan tombol tab aktif yang menyerupai pita/segel lilin merah kirmizi (`#9E2A2B`) berbingkai emas (`#B5832A`).
  - **Kompatibilitas Penuh 2 Mode Tema**:
    - **Perkamen Siang**: Sampul kulit cokelat mahoni tua (`#2C1E14`), lembaran perkamen gading hangat (`#FBF8F1` & `#F6F1E6`), tinta sepia gelap (`#231C14`), dan emas kuningan (`#B5832A`).
    - **Grimoire Malam**: Sampul kulit obsidian gelap (`#0E0A07`), lembaran perkamen malam (`#1D1712` & `#14100C`), teks gading terang (`#F5EFE4`), dan ukiran emas bercahaya (`#F0C36D`).

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Efek Kitab Terbuka Berbasis CSS & SVG Murni Tanpa Mengurangi Lebar Area Kerja**
  - *Pendekatan yang Dipilih*: Membangun efek jilid kulit, tumpukan lembaran kertas (`box-shadow` berlapis), siku kuningan SVG, dan bayangan lipatan jilid buku secara presisi di sekeliling kontainer `1440px` tanpa menyempitkan ruang baca/tulis di dalam 21 tab.
  - *Alasan*: Memberikan nuansa buku fantasi abad pertengahan yang kental sekaligus menjaga kenyamanan mengetik naskah, menggambar peta, dan memakai Kanvas Bebas.
- **Keputusan 2: Mempertahankan Seluruh Font & Struktur Fitur**
  - *Pendekatan yang Dipilih*: Tidak mengubah keluarga *font* (`Cinzel Decorative`, `Cinzel`, `Lora`, `JetBrains Mono`) maupun alur kerja 21 tab yang sudah ada.
  - *Alasan*: Sesuai permintaan eksplisit Anda agar hanya atmosfer visual buku abad pertengahannya yang diperkuat sementara isi dan *font* tetap dipertahankan.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Visual Framing Diagram**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│        Meja Kerja Kartografer (Latar Tekstur Kayu Gelap / Perkamen Tua)     │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ [Siku Kuningan]    Bilah Kepala Kitab & Segel Lilin   [Siku Kuningan] ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║ ┌───────────────────────────────────────────────────────────────────┐ ║  │
│  ║ │  ║  [Pita Buku]   Hamparan Lembaran Kitab Terbuka              ║  │ ║  │
│  ║ │  ║  ┌───────────────────────────────────────────────────────┐  ║  │ ║  │
│  ║ │  ║  │  Pelat Indeks 4 Pilar Semesta (Ornamen Sudut Emas)    │  ║  │ ║  │
│  ║ │  ║  └───────────────────────────────────────────────────────┘  ║  │ ║  │
│  ║ │  ║               ─── ❖ Pembatas Sulur Kompas ❖ ───            ║  │ ║  │
│  ║ │  ║  ┌───────────────────┬───────────────────────────────────┐  ║  │ ║  │
│  ║ │  ║  │ Lembar Kiri       │  Lembar Kanan (Bayangan Jilid &   │  ║  │ ║  │
│  ║ │  ║  │ (Direktori Kodeks │  Ukiran Sudut Manuskrip Kuno)     │  ║  │ ║  │
│  ║ │  ║  │  & Segel Kategori)│                                   │  ║  │ ║  │
│  ║ │  ║  └───────────────────┴───────────────────────────────────┘  ║  │ ║  │
│  ║ └──╨─────────────────────────────────────────────────────────────╨──┘ ║  │
│  ║    ╰── Efek Tumpukan Lembaran Kertas Perkamen (Stacked Pages) ──╯     ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Interactive Component & Styling Mapping**:
  - **Sistem CSS Kitab Abad Pertengahan (`index.css`)**: Menambahkan kelas `.medieval-tome-cover` (sampul kulit tua dengan jahitan benang emas), `.medieval-tome-pages` (efek tumpukan lembaran kertas bertingkat di sisi kiri, kanan, dan bawah beserta bayangan lipatan tengah/tepi), `.medieval-parchment-panel` (tekstur vignette perkamen tua), dan `.wax-seal-btn` (tombol beraksen segel lilin kerajaan).
  - **Komponen Ornamen SVG (`WikiTextRenderer.tsx`)**: Memperkaya `OrnateCornerFiligree` dengan lekuk ukiran manuskrip abad pertengahan yang lebih detail, serta menyediakan komponen `MedievalFlourishDivider` (pembatas sulur kompas & pedang/bintang) dan `BrassBookClasp` (siku logam kuningan di sudut jilid kitab).
  - **Pembungkus Kitab Terbuka (`App.tsx` & Workspace)**: Menerapkan bingkai hamparan kitab grimoire terbuka, pita pembatas buku merah kirmizi, dan pembatas sulur kompas di antara navigasi 4 Pilar dan lembaran kerja aktif.
