# Panduan Kontribusi

MythosCartograph adalah studio World Bible, peta fantasi, dan arsitektur naskah untuk penulis novel fantasi serta perancang lore. React 19, Vite, Express, dan Gemini.

## Menjalankan

```bash
npm install
npm run dev    # http://localhost:3000
```

## Sebelum mengirim perubahan

- `npm run lint` harus bersih.
- Ekspor `.md`, `.json`, dan PDF tidak boleh merusak data world bible yang sudah ada.
- Jangan commit `.env`, kunci API, atau hasil build.

## Alur kontribusi

1. `git checkout -b fix/nama-singkat`
2. Commit dengan pesan yang jelas.
3. Buka pull request ke `main`, jelaskan **apa** dan **kenapa**.

Untuk masalah keamanan, ikuti `SECURITY.md`, jangan buka issue publik.

## Lisensi

Dengan mengirim pull request, kontribusimu dirilis di bawah [MIT License](LICENSE).