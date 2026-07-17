import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

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
- Karakter Vokal / Penyanyi: ${vocalistType || "Pria"}`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        judul: { type: Type.STRING },
        bpm: { type: Type.INTEGER },
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
            outro: { type: Type.STRING }
          },
          required: ["verse1", "chorus"]
        },
        potensiViral: {
          type: Type.OBJECT,
          properties: {
            skor: { type: Type.INTEGER },
            alasan: { type: Type.STRING }
          },
          required: ["skor", "alasan"]
        }
      },
      required: ["judul", "bpm", "deskripsi", "sunoPrompt", "sunoStyleTags", "lirik", "potensiViral"]
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

    // Expand properties programmatically to save tokens and avoid timeout limits on Vercel
    if (songData) {
      // 1. Assign basic parameters
      songData.genre = genre;
      songData.subGenre = subGenre || "Modern";
      songData.mood = mood;
      songData.tempo = tempo;

      // 2. Build instrumen list
      const requestInstruments = Array.isArray(dominantInstrument) 
        ? dominantInstrument 
        : (dominantInstrument ? [dominantInstrument] : []);
      const extraInstruments = ["Acoustic Guitar", "Studio Piano", "Ambient Synths", "Warm Bass"];
      songData.instrumen = Array.from(new Set([...requestInstruments, ...extraInstruments])).slice(0, 5);

      // 3. Build lirik.fullText
      const parts = songData.lirik || {};
      const lirikLengkap = [
        parts.intro ? `[Intro]\n${parts.intro}\n` : "",
        parts.verse1 ? `[Verse 1]\n${parts.verse1}\n` : "",
        parts.preChorus ? `[Pre-Chorus]\n${parts.preChorus}\n` : "",
        parts.chorus ? `[Chorus]\n${parts.chorus}\n` : "",
        parts.verse2 ? `[Verse 2]\n${parts.verse2}\n` : "",
        parts.bridge ? `[Bridge]\n${parts.bridge}\n` : "",
        parts.finalChorus ? `[Final Chorus]\n${parts.finalChorus}\n` : "",
        parts.outro ? `[Outro]\n${parts.outro}\n` : ""
      ].filter(Boolean).join("\n");
      
      if (!songData.lirik) songData.lirik = {};
      songData.lirik.fullText = lirikLengkap || "Lirik belum tersedia.";

      // 4. Expand Suno Style Tags (target exactly 30 style tags)
      const defaultStyleTags = [
        genre.toLowerCase(),
        (subGenre || "").toLowerCase(),
        "high quality", "studio production", "clear vocals", "well-structured", "mastered", "expressive"
      ].filter(Boolean);
      const rawTags = Array.isArray(songData.sunoStyleTags) ? songData.sunoStyleTags : [];
      const mergedTags = Array.from(new Set([...rawTags, ...defaultStyleTags])).slice(0, 30);
      const extraPads = [
        "analog warmth", "professional mix", "radio edit", "smooth transitions", "balanced audio",
        "rich instrumentation", "dynamic range", "studio capture", "acoustic presence", "ambient space",
        "tight drums", "polished production", "melodic flow", "harmonic depth", "vocal clarity",
        "soundstage", "stereo image", "crisp highs", "solid low-end", "warm midrange", "commercial standard"
      ];
      let currentTags = [...mergedTags];
      for (const pad of extraPads) {
        if (currentTags.length >= 30) break;
        if (!currentTags.includes(pad)) {
          currentTags.push(pad);
        }
      }
      songData.sunoStyleTags = currentTags;

      // 5. Build dynamic suggestions & arrays
      songData.vokalSaran = `Direkomendasikan menggunakan vokal ${vocalistType || "Pria"} berkarakter ${mood?.toLowerCase() === "sedih" ? "melankolis, dalam, dan emosional" : "bertenaga, jelas, dan dinamis"}. Pastikan pengucapan lirik (artikulasi) sangat jelas terutama pada bagian Hook Chorus agar pesan lagu tersampaikan secara maksimal ke pendengar.`;

      songData.mixingSaran = [
        "Gunakan high-pass filter di bawah 90Hz untuk vokal utama agar frekuensi rendah tetap bersih.",
        "Berikan kompresi seimbang untuk menjaga dinamika emosi vokal tetap stabil.",
        "Tambahkan stereo plate reverb dengan pre-delay hangat untuk dimensi ruang yang lebar.",
        "Gunakan dynamic EQ pada instrumen pengiring untuk memberikan ruang frekuensi bagi vokal."
      ];

      songData.efekAudioDisarankan = [
        "Warm Analog Reverb",
        "Tape Delay Sync",
        "Stereo Widening",
        "Parallel Compression"
      ];

      songData.platformCocok = [
        "TikTok",
        "YouTube Shorts",
        "Instagram Reels",
        "Spotify",
        "RBT / Ringtone"
      ];

      // 6. Generate cover / thumbnail and video prompts programmatically
      const cleanTitle = songData.judul || "Lagu Baru";
      
      songData.videoMusicPrompt = `Cinematic music video, highly emotional storytelling style, starring a talented Indonesian model (native Indonesian look) as the main character. The video features breathtaking local Indonesian landscapes (such as misty pine forests, traditional village streets, or scenic coastlines at golden hour) that perfectly align with the song's theme of "${theme}". High-quality cinematography, 4k resolution, cinematic color grading, slow-motion emotional close-ups, and dramatic lighting.`;

      songData.thumbnailPrompt = `Desain thumbnail YouTube beresolusi tinggi (rasio 16:9), menampilkan ekspresi emosional yang dramatis dari model klip asli Indonesia berkarakter kuat. Menggunakan gradasi warna kontras tinggi yang mencolok mata, serta dilengkapi dengan teks tipografi judul "${cleanTitle.toUpperCase()}" berukuran besar yang eksentrik, berani, dan langsung menarik perhatian penonton YouTube saat scrolling.`;

      songData.albumCoverPrompt = `Aesthetic album cover art, portrait of a character with a native Indonesian look, deep emotional expression matching the song theme: "${theme}". Artistic modern typography of the title "${cleanTitle}" integrated into the cover design. High-contrast, beautiful layout, 16:9 aspect ratio, cinematic lighting, professional digital art standard --ar 16:9.`;

      // 7. Expand SEO Keywords (target exactly 50 keywords)
      const baseKeywords = [
        `lagu ${cleanTitle}`, `lirik ${cleanTitle}`, `makna lagu ${cleanTitle}`,
        `lagu ${genre} terbaru`, `suno ai ${genre}`, `video musik ${cleanTitle}`,
        "lagu viral tiktok", "lagu indonesia terbaru", "songwriter pro", "ai song generator",
        "cara membuat lagu", "lirik estetik", "musik viral", "lagu rindu", "lagu sedih",
        "lagu senja", "musik indie", "musik santai", "lagu akustik", "remix dugem terbaru",
        "lagu hits youtube", "karya seni musik", "lagu emosional", "lagu menyentuh hati", "musik relaksasi"
      ];
      const mergedKeywords = Array.from(new Set([...baseKeywords])).slice(0, 50);
      const extraKeywords = [
        "music production", "suno ai tutorial", "best ai music", "lirik lagu indonesia", "lagu hits terbaru",
        "lagu baper", "lagu patah hati", "melodi indah", "instrumen menenangkan", "vokal merdu",
        "mixing mastering pro", "lagu kafe", "teman belajar", "musik kerja", "night drive song",
        "lagu estetik tiktok", "reels instagram viral", "shorts music", "creative writing", "puisi lagu",
        "tembang kenangan", "lagu nostalgia", "kumpulan lagu hits", "lagu pop terbaik", "lagu galau"
      ];
      let currentKeywords = [...mergedKeywords];
      for (const kw of extraKeywords) {
        if (currentKeywords.length >= 50) break;
        if (!currentKeywords.includes(kw)) {
          currentKeywords.push(kw);
        }
      }
      if (!songData.seo) songData.seo = {};
      songData.seo.keywords = currentKeywords;

      // 8. Expand SEO Hashtags (target exactly 30 hashtags)
      const baseHashtags = [
        `#${cleanTitle.replace(/\s+/g, "")}`,
        `#Lirik${cleanTitle.replace(/\s+/g, "")}`,
        "#SongwriterPro", "#SunoAI", "#LaguBaru", "#MusikViral", "#AIGenerated", "#Songwriting",
        "#LaguIndonesia", "#NewRelease", "#MusicVideo", "#TiktokViral", "#CoverArt", "#Visualizer",
        "#LirikEstetik", "#LaguGalau", "#MusikIndie", "#DugemRemix", "#TrendingMusic"
      ];
      const mergedHashtags = Array.from(new Set([...baseHashtags])).slice(0, 30);
      const extraHashtags = [
        "#MelodiIndah", "#BaitEmosional", "#SeniMusik", "#MusisiAI", "#PenciptaLagu",
        "#LaguBaper", "#StudioMusik", "#MixingPro", "#AudioHQ", "#KaryaAnakBangsa", "#YouTubeMusic"
      ];
      let currentHashtags = [...mergedHashtags];
      for (const ht of extraHashtags) {
        if (currentHashtags.length >= 30) break;
        if (!currentHashtags.includes(ht)) {
          currentHashtags.push(ht);
        }
      }
      songData.seo.hashtags = currentHashtags;

      // 9. Build SEO Title & Description
      songData.seo.judulSEO = `${cleanTitle} - ${genre} ${subGenre} (Official Video Lyrics) | Lagu Terbaru 2026`;

      // 10. Build Alternative Versions (akustik, djRemix, rock, loFi, orchestra)
      const songSunoPrompt = songData.sunoPrompt || "beautiful melody, clear vocals";
      songData.versiAlternatif = {
        akustik: `Acoustic version of "${cleanTitle}". ${songSunoPrompt.slice(0, 60)}. Soft fingerstyle acoustic guitar, warm acoustic piano, emotional and delicate vocals, spacious ambient room reverb, clean acoustic mix.`,
        djRemix: `DJ Remix dance version of "${cleanTitle}". ${songSunoPrompt.slice(0, 60)}. Upbeat electronic dance music, energetic club beat, pumping synth bassline, build-up riser, euphoric drop, modern party remix.`,
        rock: `Rock version of "${cleanTitle}". ${songSunoPrompt.slice(0, 60)}. Energetic alternative rock, crunchy overdrive electric guitars, driving bass guitar, punchy drums, expressive powerful vocals.`,
        loFi: `Lo-Fi chilled version of "${cleanTitle}". ${songSunoPrompt.slice(0, 60)}. Dusty vinyl crackle, nostalgic Rhodes piano chords, mellow synth bass, relaxed vocal style, cozy late-night bedroom vibes.`,
        orchestra: `Orchestral cinematic version of "${cleanTitle}". ${songSunoPrompt.slice(0, 60)}. Majestic symphonic arrangement, sweeping violin section, concert grand piano, timpani, emotional and epic movie soundtrack feel.`
      };

      // 11. Build DJ energy levels
      if (genre === "DJ Remix" || genre === "EDM") {
        songData.tingkatEnergi = tempo === "Fast" ? "High" : "Medium";
        songData.suasanaLagu = "Energetic Dance Floor / Club Vibe";
      } else {
        songData.tingkatEnergi = "Moderate";
        songData.suasanaLagu = mood || "Emotional / Reflective";
      }

      // 12. Build deskripsiSEO to 800+ words programmatically
      const instrumenList = songData.instrumen.join(", ");
      const mixingList = songData.mixingSaran.join("\n- ");
      const keywordList = songData.seo.keywords.join(", ");
      const hashtagList = songData.seo.hashtags.join(" ");
      const efekList = songData.efekAudioDisarankan.join(", ");
      const platformList = songData.platformCocok.join(", ");

      const expandedDeskripsi = `🎵 **${cleanTitle}** - Official Song Release & Detailed Production Notes
Genre Utama: ${genre} | Sub-Genre: ${subGenre || "Modern"}
Tempo & Ritme: ${tempo || "95 BPM"} (${songData.bpm || "95"} BPM)
Rekomendasi Vokal: ${songData.vokalSaran || "Sesuai Aransemen"}
Suasana (Mood): ${mood || "Energetik, Emosional"}
Tingkat Energi: ${songData.tingkatEnergi || "Medium"}

---

📖 **I. MAKNA & FILOSOFI LAGU (DEEP MEANING)**
Lagu "${cleanTitle}" merupakan sebuah karya seni musikal yang diciptakan dengan pendekatan estetika modern yang sangat mendalam berdasarkan tema "${theme}".

Filosofi Kreatif & Pesan Utama:
${songData.deskripsi || "Lagu ini mengisahkan tentang perjalanan emosional yang jujur."}

Arsitektur melodi dan pemilihan progresi akor dirancang khusus untuk membangun ikatan emosional langsung dengan pendengar. Setiap bait merefleksikan emosi yang jujur, menciptakan ruang bagi siapa saja yang mendengarnya untuk merenung, merasakan, dan terhubung dengan memori pribadi mereka. Lagu ini bukan sekadar suara, melainkan sebuah perjalanan batin.

---

📝 **II. LIRIK LENGKAP LAGU (${cleanTitle})**
Berikut adalah susunan lirik lengkap beserta panduan struktur lagu untuk Suno AI:

${lirikLengkap || "Lirik belum tersedia secara terstruktur."}

---

🎹 **III. STRUKTUR & DETAIL ARANSEMEN MUSIK**
Aransemen instrumen lagu ini dirancang secara presisi menggunakan formula songwriting kelas dunia:
- **Instrumen Dominan**: ${instrumenList}
- **Rekomendasi Efek Audio**: ${efekList}
- **Karakter Sound & Vibe**: Kombinasi harmonis antara instrumen akustik alami dan sentuhan modern synthesizer memberikan dimensi ruang (depth) yang sangat kaya.

Detail Perjalanan Aransemen:
1. **Intro**: Membangun suasana awal yang hangat dan intim, memperkenalkan motif melodi utama lewat ${instrumenList.split(",")[0] || "instrumen akustik"}.
2. **Verse**: Cerita mulai bergulir. Ritme drum dan bassline mulai masuk secara perlahan untuk mempertegas ketukan emosi.
3. **Pre-Chorus**: Terjadi peningkatan tensi emosional. Penambahan string pads atau sapuan frekuensi tinggi mempersiapkan klimaks.
4. **Chorus (Klimaks)**: Semua instrumen (${instrumenList}) beresonansi bersama menghasilkan harmoni vokal yang sangat adiktif dan mudah diingat oleh pendengar sejak putaran pertama.
5. **Bridge**: Sesi transisi yang intim, memberikan jeda emosi bagi pendengar dengan memfokuskan aransemen pada instrumen minimalis dan vokal yang penuh penjiwaan.
6. **Outro**: Musik mereda secara perlahan (fade out), meninggalkan kesan damai dan kerinduan emosional yang manis.

---

🎛️ **IV. PANDUAN MIXING & MASTERING PROFESIONAL (PRO TIPS)**
Untuk menghasilkan kualitas audio standar industri (Radio & Streaming Ready), ikuti petunjuk mixing berikut:
- **Vokal Utama**: Berikan potongan low-cut yang bersih di bawah 100Hz, kompresi seimbang untuk mempertahankan dinamika alami, dan berikan ruang frekuensi yang lebar.
- **Instrumen & Ketukan**: Jaga frekuensi low-end agar bass tetap bulat dan hangat tanpa menutupi kejelasan vokal.
- **Rekomendasi Rantai Efek**:
  - ${mixingList}

---

💡 **V. REKOMENDASI PENGGUNAAN LAGU**
Karya musik ini sangat fleksibel dan berkarakter, sangat cocok digunakan untuk:
1. **Backsound Konten**: Pengisi video vlog perjalanan (traveling), sinematik estetik, transisi TikTok, Shorts, dan Reels.
2. **Media Relaksasi & Fokus**: Menemani aktivitas belajar, bekerja santai di kafe, meditasi emosi, atau berkendara santai di malam hari (night drive).
3. **Momen Spesial**: Playlist harian Spotify, lagu pengiring berkumpul bersama keluarga, sahabat, atau pasangan tercinta.

---

📢 **DUKUNG KARYA KAMI - LIKE, SUBSCRIBE & SHARE! (CALL TO ACTION)**
Kami mendedikasikan waktu dan energi kreatif kami untuk menciptakan karya musik yang menyentuh jiwa Anda. Dukungan kecil dari Anda adalah energi luar biasa bagi kami untuk terus berkarya:
1. 👍 **TEKAN TOMBOL LIKE** jika lagu ini berhasil menyentuh hati Anda atau membuat hari Anda menjadi lebih tenang dan indah.
2. 🔔 **KLIK SUBSCRIBE & AKTIFKAN LONCENG** agar Anda selalu menjadi orang pertama yang mendapatkan rilis lagu viral, aransemen pro, dan lirik menyentuh terbaru dari channel kami.
3. 🔄 **SHARE/BAGIKAN VIDEO INI** ke grup WhatsApp keluarga, Instagram Story, status TikTok, atau media sosial Anda lainnya. Bagikan getaran positif dan keindahan melodi ini kepada orang-orang terkasih!
4. 💬 **TULIS KOMENTAR DI BAWAH**: Tuliskan kesan pertama Anda saat mendengar lagu ini, bagian lirik mana yang paling Anda sukai, atau di mana Anda sedang mendengarkan lagu ini sekarang. Kami membaca setiap komentar Anda!

Terima kasih yang sebesar-besarnya atas apresiasi, waktu, dan cinta yang Anda berikan. Selamat menikmati lagu ini! 🙏✨

---

🔍 **VI. TAGS & KEYWORDS SEO YOUTUBE**
- **Keywords**: ${keywordList}
- **Hashtags**: ${hashtagList}
- **Platform Distribusi Populer**: ${platformList}
`;

      songData.seo.deskripsiSEO = expandedDeskripsi;
    }

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
    const { createServer: createViteServer } = await import("vite");
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
