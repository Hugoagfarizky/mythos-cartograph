import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi pada environment server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Endpoint 1: AI Lore Consistency Audit
  app.post('/api/lore/audit', async (req, res) => {
    try {
      const { targetTitle, targetContent, targetCategory, worldContext } = req.body;

      if (!targetContent && !targetTitle) {
        res.status(400).json({ error: 'Konten atau judul target diperlukan untuk melakukan audit konsistensi.' });
        return;
      }

      const prompt = `
Anda adalah Editor Kepala & Auditor Konsistensi World Bible untuk proyek fiksi/fantasi.
Tugas Anda adalah memeriksa apakah draf entri atau bab yang sedang ditulis konsisten dengan aturan semesta cerita (World Bible) yang sudah ada.

=== TARGET YANG SEDANG DIAUDIT ===
Kategori: ${targetCategory || 'Umum'}
Judul: ${targetTitle || 'Tanpa Judul'}
Isi / Draf:
${targetContent || '-'}

=== KONTEKS WORLD BIBLE SAAT INI ===
${worldContext || 'Belum ada konteks tambahan.'}

Analisis apakah ada potensi kontradiksi (plot hole), pelanggaran aturan Power System/Skill, ketidaksesuaian Timeline/Sejarah, atau inkonsistensi karakter/geografi. Berikan respons dalam Bahasa Indonesia yang jelas, tajam, dan konstruktif untuk penulis.
`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah asisten editor World Bible profesional berbahasa Indonesia. Kembalikan analisis konsistensi lore dalam format JSON sesuai skema yang ditentukan.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallStatus: {
                type: Type.STRING,
                description: 'Status ringkas: Konsisten, Perlu Perhatian, atau Ada Kontradiksi',
              },
              summary: {
                type: Type.STRING,
                description: 'Ringkasan 2-3 kalimat mengenai kualitas dan konsistensi entri ini terhadap dunia cerita.',
              },
              issues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    severity: {
                      type: Type.STRING,
                      description: 'Tinggi, Sedang, atau Catatan Kecil',
                    },
                    category: {
                      type: Type.STRING,
                      description: 'Aspek yang terdampak: Power System, Timeline, Karakter, atau Geografi',
                    },
                    title: {
                      type: Type.STRING,
                      description: 'Judul singkat temuan atau potensi celah plot',
                    },
                    explanation: {
                      type: Type.STRING,
                      description: 'Penjelasan mengapa hal ini berpotensi bertabrakan dengan entri lain di World Bible',
                    },
                    suggestedFix: {
                      type: Type.STRING,
                      description: 'Saran konkret bagi penulis untuk memperbaiki atau menjelaskan celah tersebut',
                    },
                  },
                },
              },
              creativeSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: '3 ide pengembangan lore atau kaitan menarik dengan entitas lain di dunia cerita',
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: unknown) {
      console.error('Error in /api/lore/audit:', error);
      const message = error instanceof Error ? error.message : 'Gagal menjalankan audit konsistensi lore.';
      res.status(500).json({ error: message });
    }
  });

  // Endpoint 2: AI Lore Brainstorming & Expansion
  app.post('/api/lore/brainstorm', async (req, res) => {
    try {
      const { category, promptFocus, worldSummary } = req.body;

      const prompt = `
Bantu penulis mengembangkan elemen World Bible baru untuk kategori "${category || 'Lore'}".
Fokus permintaan penulis: "${promptFocus || 'Berikan ide elemen dunia yang unik dan terhubung dengan konflik utama'}"

Ringkasan Dunia Saat Ini:
${worldSummary || 'Dunia fantasi klasik dengan kerajaan, faksi sihir, dan artefak kuno.'}

Buat 3 konsep entitas mendalam dalam Bahasa Indonesia lengkap dengan nama, ringkasan, detail lore (gunakan tanda [[Nama Entitas]] bila merujuk ke entitas yang sudah ada di ringkasan dunia), serta kaitannya dengan plot cerita.
`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah arsitek worldbuilding fantasi dan fiksi ilmiah berbahasa Indonesia. Berikan ide yang orisinal, kaya nuansa sejarah, dan siap dimasukkan ke dalam World Bible.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ideas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: 'Nama entitas, karakter, negara, skill, atau sejarah baru',
                    },
                    subtitle: {
                      type: Type.STRING,
                      description: 'Julukan atau sub-klasifikasi singkat',
                    },
                    summary: {
                      type: Type.STRING,
                      description: 'Ringkasan 1-2 kalimat',
                    },
                    content: {
                      type: Type.STRING,
                      description: 'Uraian lore lengkap 2-3 paragraf dengan cross-link [[Nama Entitas]]',
                    },
                    plotHook: {
                      type: Type.STRING,
                      description: 'Pemicu konflik atau ide adegan yang bisa dipakai penulis di dalam cerita',
                    },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: unknown) {
      console.error('Error in /api/lore/brainstorm:', error);
      const message = error instanceof Error ? error.message : 'Gagal menghasilkan ide worldbuilding.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MythosCartograph server running on http://localhost:${PORT}`);
  });
}

startServer();
