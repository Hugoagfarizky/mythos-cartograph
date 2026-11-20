# Kebijakan Keamanan

Repo ini berisi studio World Bible dan peta fantasi abad pertengahan (MythosCartograph). Ada server Express kecil (`server.ts`) dan integrasi Gemini API, jadi kunci API wajib ada di `.env`.

## Melaporkan celah

- **Jangan** membuka issue publik untuk masalah keamanan.
- Kirim email ke **nugrahaagfarizky@gmail.com** dengan subjek `[SECURITY] mythos-cartograph`.
- Sertakan langkah reproduksi, dampak, dan saran perbaikan kalau ada.

Balasan diusahakan dalam **7 hari**.

## Cakupan

| Termasuk | Tidak termasuk |
| --- | --- |
| Kode di repo ini | Layanan pihak ketiga: Google Gemini API |

## Kunci rahasia

Kunci Gemini hanya boleh di `.env` (lihat `.env.example`). Kalau pernah ter-commit, segera revoke di Google AI Studio.

## Versi yang didukung

Hanya branch `main`.