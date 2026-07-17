import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please configure it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Robust generator function with exponential backoff retry logic for 503/429 transient errors
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  maxRetries = 3
) {
  let attempt = 0;
  let delay = 1000; // start with 1 second delay

  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      attempt++;
      console.warn(`[Gemini Attempt ${attempt}/${maxRetries}] Failed for model ${params.model}:`, error.message || error);

      // Check for common transient / overloaded errors
      const errorMsg = (error.message || "").toLowerCase();
      const status = error.status || (error.code ? parseInt(error.code) : null);
      const isTransient =
        status === 503 ||
        status === 429 ||
        errorMsg.includes("503") ||
        errorMsg.includes("429") ||
        errorMsg.includes("overloaded") ||
        errorMsg.includes("high demand") ||
        errorMsg.includes("unavailable") ||
        errorMsg.includes("resource exhausted") ||
        errorMsg.includes("spikes in demand");

      if (isTransient && attempt < maxRetries) {
        console.log(`[Gemini Retry] Transient error encountered. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error;
      }
    }
  }
}

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Post endpoint for songwriter generation
app.post("/api/songwriter/generate", async (req, res) => {
  try {
    const {
      theme,
      title,
      genre,
      subGenre,
      language,
      mood,
      tempo,
      duration,
      targetAudience,
      dominantInstrument,
      writingStyle,
      vocalistType,
    } = req.body;

    if (!theme) {
      return res.status(400).json({ error: "Tema lagu wajib diisi!" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Anda adalah AI Songwriter Pro, seorang penulis lagu profesional kelas dunia yang telah menciptakan ribuan lagu viral. 
Tugas Anda adalah membuat lagu yang sangat emosional, mudah diingat, memiliki hook yang kuat, dan dioptimalkan secara sempurna untuk generator musik Suno AI.

Anda harus mengikuti aturan penulisan dan genre berikut:
1. Jika pengguna memilih genre "Reggae Roots", gunakan ciri khas: classic Jamaican reggae, warm bassline, offbeat guitar skank, live drums, organ bubble, relaxed groove, soulful vocal, authentic reggae production.
2. Jika memilih "Reggae Modern", gunakan: modern reggae, tropical groove, clean electric guitar skank, deep bass, modern drums, bright synth layers, radio-ready mix, uplifting chorus, smooth male or female vocal, island vibe, streaming-quality production.
3. Jika memilih "Pop Reggae", padukan elemen pop yang catchy dengan ritme reggae yang ringan.
4. Jika memilih "Dancehall", gunakan beat yang lebih energik dengan bass yang kuat dan nuansa klub.
5. Jika memilih "Reggae Fusion", kombinasikan reggae dengan pop, rock, hip-hop, atau EDM sesuai tema lagu.

Untuk Genre DJ / EDM:
Apabila pengguna memilih salah satu subgenre DJ (seperti DJ Slow Remix, DJ Breakbeat, DJ Funkot, DJ Jedag Jedug, DJ Full Bass, DJ Viral Remix, DJ Reggae Remix, DJ House Remix, DJ Tropical House):
- Buat prompt musik Suno AI yang kuat dalam bahasa Inggris yang sesuai dengan karakter subgenre tersebut.
- Sertakan estimasi BPM, tingkat energi (Low, Medium, High, Extreme), suasana lagu, jenis vokal yang direkomendasikan, efek audio yang disarankan (reverb, delay, bass boost, sidechain, stereo widening, riser, impact, sweep), dan platform yang cocok (TikTok, YouTube Shorts, Instagram Reels, Spotify, Festival, Karaoke, Club, Radio).

Contoh Spesifik DJ:
- DJ Slow Remix: Emotional slow remix, melodic EDM, smooth synth, atmospheric pads, deep bass, soft kick, emotional female vocal, radio-ready mix, high-quality mastering.
- DJ Breakbeat: Energetic breakbeat, powerful kick drum, rolling percussion, punchy bassline, electronic synth, festival atmosphere, club-ready production.
- DJ Funkot: Indonesian Funkot style, ultra-fast dance beat, energetic synth lead, heavy kick, rolling bass, party vibe, bright electronic sound.
- DJ Jedag Jedug: Viral Indonesian DJ remix, powerful bass, punchy kick, energetic drop, modern electronic synth, catchy hook, TikTok-ready, high-energy dance production.
- DJ Full Bass: Deep sub bass, heavy kick drum, wide stereo synth, modern EDM arrangement, powerful drop, club-quality mastering.
- DJ Viral Remix: Modern viral remix, catchy melody, electronic dance beat, energetic bassline, festival-ready production, streaming quality.
- DJ Reggae Remix: Modern reggae groove combined with EDM beats, tropical rhythm, clean bass, electronic synth layers, uplifting drop, radio-ready production.
- DJ House Remix: House groove, four-on-the-floor kick, bright synth chords, deep bassline, energetic drop, club atmosphere.
- DJ Tropical House: Tropical house, soft marimba, warm piano, relaxed electronic beat, tropical percussion, smooth vocals, sunny island vibe.

Aturan Lirik:
- Sangat mudah diingat (catchy), memiliki rima yang indah, emosional, tidak bertele-tele, tidak menggunakan kata kasar, dan orisinal.
- Gunakan struktur lagu lengkap: [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Final Chorus], [Outro].
- Lirik ditulis dalam bahasa yang dipilih oleh pengguna (Indonesia, Jawa, Inggris, atau Campuran).

Output harus dikembalikan dalam format JSON terstruktur yang valid sesuai dengan responseSchema yang ditentukan.`;

    const userPrompt = `Buatkan lagu lengkap dengan detail berikut:
- Tema: ${theme}
- Judul yang diminta: ${title || "Buatkan judul yang paling viral dan bermakna"}
- Genre Utama: ${genre}
- Sub Genre: ${subGenre || "Default subgenre paling cocok"}
- Bahasa: ${language}
- Mood: ${mood}
- Tempo: ${tempo} (Estimasi BPM yang tepat)
- Durasi: ${duration}
- Target Pendengar: ${targetAudience}
- Instrumen Dominan: ${dominantInstrument}
- Gaya Penulisan: ${writingStyle}
- Karakter Vokal / Penyanyi: ${vocalistType || "Pria"}

Pastikan:
1. sunoPrompt ditulis dalam Bahasa Inggris, minimal 120 kata.
2. sunoStyleTags minimal berisi 30 tags relevan dipisahkan koma.
3. deskripsi minimal 2 paragraf yang emosional dan menjelaskan makna lagu.
4. lirik memiliki struktur penanda yang lengkap, rima yang enak, dan hook yang sangat kuat di bagian chorus.
5. videoMusicPrompt ditulis dalam Bahasa Inggris, minimal 150 kata, menceritakan visual sinematik yang WAJIB dibintangi oleh model klip / aktor / talent berparas orang Indonesia asli (Indonesian model/actor with native Indonesian look), dengan latar belakang pemandangan, lingkungan, atau estetika lokal Indonesia yang sangat relevan dengan tema lagu.
6. thumbnailPrompt dalam Bahasa Indonesia, wajib dirancang khusus untuk ukuran gambar lanskap 16:9, menampilkan model klip orang Indonesia (pria/wanita/anak-anak sesuai kecocokan vokal & tema) dengan ekspresi emosional yang dramatis, dilengkapi deskripsi teks/tulisan di gambar yang eksentrik, berani, ekspresif, dan sangat menarik perhatian penonton YouTube saat scrolling.
7. albumCoverPrompt dalam Bahasa Inggris, wajib dirancang khusus untuk ukuran gambar lanskap 16:9 (aspect ratio 16:9, sertakan tag '--ar 16:9' atau '16:9 aspect ratio' di dalamnya), dengan menampilkan potret berkarakter orang Indonesia (Indonesian look model/character portrait) sebagai subjek utama, dipadukan dengan deskripsi tulisan/tipografi judul yang eksentrik, ekspresif, artistik, dan sangat menarik menyatu dengan visual cover.
8. Pada bagian seo:
   - judulSEO harus berupa judul YouTube yang sangat menarik (clickbait aman) dan SEO-friendly.
   - deskripsiSEO WAJIB DITULIS DALAM FORMAT SUPER DETAIL HINGGA SEKITAR 800 KATA. Isi deskripsi harus memuat: penjelasan mendalam makna & filosofi lagu berdasarkan tema dan judul, lirik lengkap lagu, struktur lagu, pembagian part instrumen, saran penggunaan lagu (misal backsound, santai, dll), detail kredit/aransemen, daftar keyword pendukung, serta WAJIB menyertakan ajakan hangat untuk LIKE, SUBSCRIBE, dan SHARE video ini secara persuasif agar penonton tergerak menyebarkannya.
   - hashtags berisi 30 hashtags relevan.
   - keywords berisi 50 keywords relevan.
9. Jika genre adalah DJ atau EDM, pastikan mengisi field tambahan tingkatEnergi, suasanaLagu, efekAudioDisarankan, dan platformCocok secara mendetail. Jika bukan DJ, field tersebut bisa diisi nilai default yang relevan.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        judul: { type: Type.STRING },
        genre: { type: Type.STRING },
        subGenre: { type: Type.STRING },
        mood: { type: Type.STRING },
        tempo: { type: Type.STRING },
        bpm: { type: Type.INTEGER },
        instrumen: { type: Type.ARRAY, items: { type: Type.STRING } },
        deskripsi: { type: Type.STRING },
        sunoPrompt: { type: Type.STRING },
        sunoStyleTags: { type: Type.ARRAY, items: { type: Type.STRING } },
        lirik: {
          type: Type.OBJECT,
          properties: {
            intro: { type: Type.STRING },
            verse1: { type: Type.STRING },
            preChorus: { type: Type.STRING },
            chorus: { type: Type.STRING },
            verse2: { type: Type.STRING },
            bridge: { type: Type.STRING },
            finalChorus: { type: Type.STRING },
            outro: { type: Type.STRING },
            fullText: { type: Type.STRING }
          },
          required: ["verse1", "chorus", "fullText"]
        },
        vokalSaran: { type: Type.STRING },
        mixingSaran: { type: Type.ARRAY, items: { type: Type.STRING } },
        videoMusicPrompt: { type: Type.STRING },
        thumbnailPrompt: { type: Type.STRING },
        albumCoverPrompt: { type: Type.STRING },
        seo: {
          type: Type.OBJECT,
          properties: {
            judulSEO: { type: Type.STRING },
            deskripsiSEO: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["judulSEO", "deskripsiSEO", "hashtags", "keywords"]
        },
        versiAlternatif: {
          type: Type.OBJECT,
          properties: {
            akustik: { type: Type.STRING },
            djRemix: { type: Type.STRING },
            rock: { type: Type.STRING },
            loFi: { type: Type.STRING },
            orchestra: { type: Type.STRING }
          },
          required: ["akustik", "djRemix", "rock", "loFi", "orchestra"]
        },
        potensiViral: {
          type: Type.OBJECT,
          properties: {
            skor: { type: Type.INTEGER },
            alasan: { type: Type.STRING }
          },
          required: ["skor", "alasan"]
        },
        tingkatEnergi: { type: Type.STRING },
        suasanaLagu: { type: Type.STRING },
        efekAudioDisarankan: { type: Type.ARRAY, items: { type: Type.STRING } },
        platformCocok: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: [
        "judul", "genre", "subGenre", "mood", "tempo", "bpm", "instrumen", "deskripsi", "sunoPrompt", "sunoStyleTags",
        "lirik", "vokalSaran", "mixingSaran", "videoMusicPrompt", "thumbnailPrompt", "albumCoverPrompt",
        "seo", "versiAlternatif", "potensiViral"
      ]
    };

    let response;
    try {
      // First attempt: use gemini-3.5-flash with up to 3 retries (with backoff)
      response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          temperature: 1.0,
        },
      });
    } catch (primaryError: any) {
      console.warn("Primary model gemini-3.5-flash failed or was overloaded. Falling back to gemini-3.1-flash-lite...", primaryError.message || primaryError);
      
      try {
        // Fallback: use gemini-3.1-flash-lite which is highly available and excellent for JSON generation
        response = await generateContentWithRetry(ai, {
          model: "gemini-3.1-flash-lite",
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
            temperature: 1.0,
          },
        });
      } catch (fallbackError: any) {
        console.error("Both primary and fallback models failed:", fallbackError);
        throw new Error(
          `Layanan AI kami sedang sangat sibuk karena permintaan tinggi (High Demand). Silakan tunggu sebentar lalu tekan tombol generate kembali.\nDetail: ${primaryError.message || primaryError}`
        );
      }
    }

    const jsonText = response.text?.trim() || "{}";
    const songData = JSON.parse(jsonText);
    res.json(songData);

  } catch (error: any) {
    console.error("Error generating song details:", error);
    res.status(500).json({ error: error.message || "Gagal menghasilkan detail lagu." });
  }
});

// Image Generation Endpoint for Cover Art
app.post("/api/songwriter/generate-cover", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt cover album wajib disertakan!" });
    }

    const ai = getGeminiClient();

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            text: `${prompt}, beautiful widescreen cover art, high resolution, 16:9 landscape aspect ratio, professional digital art style, perfect composition, cinematic lighting`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("Tidak ada data gambar yang diterima dari model Gemini.");
    }

    res.json({ imageUrl: `data:image/png;base64,${base64Image}` });

  } catch (error: any) {
    console.error("Error generating album cover:", error);
    res.status(500).json({ error: error.message || "Gagal membuat gambar cover album." });
  }
});

// Vite middleware for development or Static server for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
