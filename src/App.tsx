import React, { useState, useEffect } from "react";
import { 
  Music, 
  Volume2, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Youtube, 
  Share2, 
  Flame, 
  Zap, 
  Disc, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Gauge, 
  Radio, 
  VolumeX, 
  ChevronRight,
  Download,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SongInput, SongGenerationResult } from "./types";

export default function App() {
  // Input states
  const [theme, setTheme] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [genre, setGenre] = useState<string>("Pop");
  const [subGenre, setSubGenre] = useState<string>("Modern Pop");
  const [language, setLanguage] = useState<string>("Indonesia");
  const [mood, setMood] = useState<string>("Sedih");
  const [tempo, setTempo] = useState<string>("Medium");
  const [duration, setDuration] = useState<string>("±3 menit");
  const [targetAudience, setTargetAudience] = useState<string>("Semua Umur");
  const [dominantInstrument, setDominantInstrument] = useState<string>("Piano");
  const [writingStyle, setWritingStyle] = useState<string>("Puitis");
  const [vocalistType, setVocalistType] = useState<string>("Pria");

  // Checklist for Instruments
  const availableInstruments = [
    "Piano",
    "Gitar Akustik",
    "Gitar Elektrik",
    "Bass Elektrik",
    "Synthesizer",
    "Drum & Perkusi",
    "Biola / Strings",
    "Organ / Keyboard",
    "DJ Beats"
  ];
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(["Piano"]);
  const [customInstrument, setCustomInstrument] = useState<string>("");

  // Sync checklist selections to dominantInstrument
  useEffect(() => {
    const list = [...selectedInstruments];
    if (customInstrument.trim()) {
      list.push(customInstrument.trim());
    }
    setDominantInstrument(list.join(", ") || "Piano");
  }, [selectedInstruments, customInstrument]);

  const handleInstrumentToggle = (instName: string) => {
    setSelectedInstruments((prev) => {
      if (prev.includes(instName)) {
        return prev.filter((i) => i !== instName);
      } else {
        return [...prev, instName];
      }
    });
  };

  // Output states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [result, setResult] = useState<SongGenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("lyrics");
  const [error, setError] = useState<string | null>(null);

  // Cover generation states
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState<boolean>(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  // Copy feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dynamic loading messages
  const loadingMessages = [
    "Menganalisis tema dan emosi lagu...",
    "Menyusun skema rima dan harmoni lirik...",
    "Meramu bait Intro, Verse, dan Chorus yang emosional...",
    "Memformulasikan prompt musik Suno AI kualitas studio...",
    "Memetakan style tags Suno AI terbaik...",
    "Menghitung potensi viral dan menyusun data SEO YouTube...",
    "Menyelesaikan aransemen versi alternatif lagu..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // List of Main Genres and dynamic sub-genres map
  const genres = [
    "Pop", "Pop Rock", "Rock", "Slow Rock", "Indie", "Folk", "Ballad", 
    "EDM", "DJ Remix", "Reggae", "Dangdut", "Musik Tradisional", 
    "Hip Hop", "Trap", "Jazz", "Lo-fi", "Acoustic", "Orchestra", "Country", "Metal", "Punk", "Gospel", "Cinematic"
  ];

  const subGenresMap: Record<string, string[]> = {
    "Pop": ["Modern Pop", "Synthpop", "Indie Pop", "Dance Pop", "K-Pop Style", "R&B Pop"],
    "Pop Rock": ["Alternative Pop Rock", "Modern Rock Pop", "Power Pop", "Soft Rock"],
    "Rock": ["Alternative Rock", "Hard Rock", "Garage Rock", "Classic Rock", "Indie Rock"],
    "Slow Rock": ["90s Slow Rock", "Emotional Slow Rock", "Acoustic Slow Rock", "Classic Slow Rock"],
    "Indie": ["Indie Folk", "Indie Pop", "Dream Pop", "Shoegaze", "Alternative Indie"],
    "Folk": ["Neo-Folk", "Contemporary Folk", "Indie Folk", "Traditional Folk"],
    "Ballad": ["Emotional Piano Ballad", "Acoustic Ballad", "Power Ballad", "Orchestral Ballad"],
    "EDM": ["Future Bass", "Progressive House", "Electro House", "Slap House", "Deep House", "Tech House", "Trance", "Electro Pop", "Dance Pop"],
    "DJ Remix": [
      "DJ Slow Remix", "DJ Breakbeat", "DJ Jedag Jedug", "DJ Funkot", "DJ Full Bass", 
      "DJ Bass Boost", "DJ Tiktok Remix", "DJ Viral Remix", "DJ Koplo Remix", "DJ Dangdut Remix", 
      "DJ Reggae Remix", "DJ House Remix", "DJ Progressive House", "DJ Tropical House"
    ],
    "Reggae": [
      "Reggae Roots", "Reggae Modern", "Pop Reggae", "Reggae Fusion", 
      "Lovers Rock", "Dancehall", "Dub Reggae", "Ska", "Rocksteady", "Island Reggae", "Tropical Reggae"
    ],
    "Dangdut": ["Dangdut Klasik", "Dangdut Koplo", "Dangdut Remix", "Dangdut Modern", "Campursari Modern"],
    "Musik Tradisional": ["Gamelan Etnik", "Keroncong Modern", "Angklung Orchestra", "Etnik Fusion", "Sunda Pop", "Jawa Pop"],
    "Hip Hop": ["Rap", "Trap", "Drill", "Boom Bap", "Alternative Hip Hop", "Lo-fi Hip Hop"],
    "Trap": ["Melodic Trap", "Hard Trap", "Chill Trap", "Latin Trap"],
    "Jazz": ["Smooth Jazz", "Bossa Nova", "Swing", "Acid Jazz", "Lo-fi Jazz"],
    "Lo-fi": ["Lo-fi Chillhop", "Lo-fi Sleep", "Mellow Lo-fi", "Lo-fi Study Beats"],
    "Acoustic": ["Acoustic Guitar Folk", "Piano Acoustic", "Soft Acoustic Duet"],
    "Orchestra": ["Cinematic Orchestra", "Epic Symphony", "Neo-Classical", "Melodic Strings"],
    "Country": ["Modern Country", "Country Pop", "Classic Country", "Bluegrass"],
    "Metal": ["Heavy Metal", "Metalcore", "Symphonic Metal", "Nu Metal"],
    "Punk": ["Pop Punk", "Post-Punk", "Skate Punk", "Hardcore Punk"],
    "Gospel": ["Contemporary Gospel", "Worship Ballad", "Soulful Gospel"],
    "Cinematic": ["Epic Cinematic", "Ambient Cinematic", "Dark Cinematic Drama", "Sci-Fi Ambient"]
  };

  // Update default sub-genre when main genre changes
  const handleGenreChange = (selectedGenre: string) => {
    setGenre(selectedGenre);
    const options = subGenresMap[selectedGenre] || ["General"];
    setSubGenre(options[0]);
  };

  // Copy logic
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Generate Song Details
  const handleGenerateSong = async () => {
    if (!theme.trim()) {
      setError("Silakan isi Tema Lagu terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCoverUrl(null);
    setCoverError(null);

    try {
      const response = await fetch("/api/songwriter/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        let errorMessage = "Gagal menghubungi server.";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch (e) {
          errorMessage = `HTTP error! Status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const songData = await response.json();
      setResult(songData);
      setActiveTab("lyrics");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat membuat lagu. Pastikan API Key diaktifkan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Cover Image using Gemini lite-image model
  const handleGenerateCover = async () => {
    if (!result) return;
    setIsGeneratingCover(true);
    setCoverError(null);
    try {
      const response = await fetch("/api/songwriter/generate-cover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: result.albumCoverPrompt,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Gagal membuat cover album.";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch (e) {
          errorMessage = `HTTP error! Status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const imageData = await response.json();
      setCoverUrl(imageData.imageUrl);
    } catch (err: any) {
      console.error(err);
      setCoverError(err.message || "Gagal membuat gambar cover. Coba lagi.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // Pre-fill standard configurations
  const handleFillExample = (exampleType: string) => {
    if (exampleType === "percintaan_sedih") {
      setTheme("Kehilangan seseorang yang sangat dicintai karena dia memilih pergi tanpa pamit di saat rindu memuncak.");
      setTitle("Senja Tanpa Pamit");
      handleGenreChange("Ballad");
      setSubGenre("Emotional Piano Ballad");
      setLanguage("Indonesia");
      setMood("Sedih");
      setTempo("Slow");
      setSelectedInstruments(["Piano", "Biola / Strings"]);
      setCustomInstrument("");
      setWritingStyle("Puitis");
      setVocalistType("Wanita");
    } else if (exampleType === "semangat_jedug") {
      setTheme("Perjuangan anak muda mengejar mimpi besar tanpa peduli rintangan, bangkit setiap kali jatuh.");
      setTitle("Hantam Batas");
      handleGenreChange("DJ Remix");
      setSubGenre("DJ Jedag Jedug");
      setLanguage("Indonesia");
      setMood("Semangat");
      setTempo("Fast");
      setSelectedInstruments(["Synthesizer", "DJ Beats"]);
      setCustomInstrument("");
      setWritingStyle("Modern");
      setVocalistType("Pria");
    } else if (exampleType === "reggae_santai") {
      setTheme("Menikmati sore hari di pantai bersama teman-teman, melupakan semua beban pekerjaan.");
      setTitle("Lupakan Penat");
      handleGenreChange("Reggae");
      setSubGenre("Reggae Roots");
      setLanguage("Campuran");
      setMood("Santai");
      setTempo("Medium");
      setSelectedInstruments(["Gitar Akustik", "Organ / Keyboard"]);
      setCustomInstrument("");
      setWritingStyle("Kekinian");
      setVocalistType("Duet");
    }
  };

  const isDjGenre = genre === "DJ Remix" || genre === "EDM";

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#D44E31] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A1A1A] flex items-center justify-center text-white font-bold">
              <Music className="w-4 h-4 text-white" id="app-logo-icon" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                SONARA PRO
              </h1>
              <p className="text-[10px] uppercase tracking-wider opacity-60 text-[#1A1A1A]">Asisten Penulisan Lagu Kelas Dunia & Suno AI Optimizer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D44E31] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D44E31]"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#1A1A1A] uppercase bg-[#F4F1EA] px-2.5 py-1 rounded-none border border-[#1A1A1A]/20">
              Studio Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Inputs (5 Columns on Large Screens) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#F4F1EA] border border-[#1A1A1A] rounded-none p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
              <h2 className="font-serif font-bold text-xl italic text-[#1A1A1A] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#D44E31]" />
                Parameter Lagu
              </h2>
              <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">Sesuaikan Nuansa</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60">Contoh Cepat (Klik untuk mengisi):</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleFillExample("percintaan_sedih")}
                  className="text-[10px] uppercase font-bold tracking-wider bg-white hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] px-3 py-1.5 rounded-none border border-[#1A1A1A] transition duration-200 flex items-center gap-1.5 cursor-pointer"
                >
                  💔 Ballad Sedih
                </button>
                <button 
                  onClick={() => handleFillExample("semangat_jedug")}
                  className="text-[10px] uppercase font-bold tracking-wider bg-white hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] px-3 py-1.5 rounded-none border border-[#1A1A1A] transition duration-200 flex items-center gap-1.5 cursor-pointer"
                >
                  ⚡ DJ Jedag-Jedug
                </button>
                <button 
                  onClick={() => handleFillExample("reggae_santai")}
                  className="text-[10px] uppercase font-bold tracking-wider bg-white hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] px-3 py-1.5 rounded-none border border-[#1A1A1A] transition duration-200 flex items-center gap-1.5 cursor-pointer"
                >
                  🌴 Reggae Pantai
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Tema Lagu */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest flex items-center justify-between">
                  <span>Tema Utama <span className="text-[#D44E31]">*</span></span>
                  <span className="text-[9px] opacity-60 normal-case italic">Jelaskan emosi/cerita</span>
                </label>
                <textarea
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Contoh: Tentang perjuangan rindu sepasang kekasih yang dipisahkan jarak, dengan akhir yang bahagia..."
                  rows={3}
                  className="bg-white border border-[#1A1A1A] rounded-none px-4 py-3 text-xs text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition resize-none"
                  id="song-theme-input"
                />
              </div>

              {/* Judul Lagu */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                  Judul Lagu <span className="text-[#1A1A1A]/40 text-[9px] normal-case italic">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Biarkan kosong untuk judul kreatif dari AI"
                  className="bg-white border border-[#1A1A1A] rounded-none px-4 py-3 text-xs text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  id="song-title-input"
                />
              </div>

              {/* Grid 2 Column */}
              <div className="grid grid-cols-2 gap-4">
                {/* Genre Utama */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                    Genre Utama
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => handleGenreChange(e.target.value)}
                    className="bg-white border border-[#1A1A1A] rounded-none px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Sub Genre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                    Sub-Genre
                  </label>
                  <select
                    value={subGenre}
                    onChange={(e) => setSubGenre(e.target.value)}
                    className="bg-white border border-[#1A1A1A] rounded-none px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  >
                    {(subGenresMap[genre] || ["Lainnya"]).map((sg) => (
                      <option key={sg} value={sg}>{sg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bahasa & Gaya Penulisan */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                    Bahasa Lirik
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white border border-[#1A1A1A] rounded-none px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  >
                    <option value="Indonesia">Indonesia</option>
                    <option value="Jawa">Jawa</option>
                    <option value="Inggris">Inggris</option>
                    <option value="Campuran">Campuran (Indo-Inggris)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                    Gaya Penulisan
                  </label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="bg-white border border-[#1A1A1A] rounded-none px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  >
                    <option value="Sederhana">Sederhana</option>
                    <option value="Puitis">Puitis</option>
                    <option value="Modern">Modern / Populer</option>
                    <option value="Kekinian">Kekinian / Slang</option>
                    <option value="Religius">Religius / Spiritual</option>
                    <option value="Dramatis">Dramatis / Teatrikal</option>
                  </select>
                </div>
              </div>

              {/* Mood & Karakter Vokal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                    Mood Lagu
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="bg-white border border-[#1A1A1A] rounded-none px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  >
                    <option value="Semangat">Semangat / Energetik</option>
                    <option value="Sedih">Sedih / Melankolis</option>
                    <option value="Bahagia">Bahagia / Ceria</option>
                    <option value="Romantis">Romantis / Intim</option>
                    <option value="Haru">Haru / Sentimental</option>
                    <option value="Nasionalis">Nasionalis / Bangga</option>
                    <option value="Heroik">Heroik / Epik</option>
                    <option value="Motivasi">Motivasi / Inspiratif</option>
                    <option value="Santai">Santai / Chill</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                    Penyanyi / Vokal
                  </label>
                  <select
                    value={vocalistType}
                    onChange={(e) => setVocalistType(e.target.value)}
                    className="bg-white border border-[#1A1A1A] rounded-none px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  >
                    <option value="Pria">Pria (Male)</option>
                    <option value="Wanita">Wanita (Female)</option>
                    <option value="Duet (Pria & Wanita)">Duet (Pria & Wanita)</option>
                    <option value="Duet Pria">Duet Pria</option>
                    <option value="Duet Wanita">Duet Wanita</option>
                    <option value="Anak-anak">Anak-anak (Kids)</option>
                    <option value="Paduan Suara (Choir)">Paduan Suara (Choir)</option>
                    <option value="Musik Instrumental">Musik Instrumental (Tanpa Vokal)</option>
                  </select>
                </div>
              </div>

              {/* Instrumen Dominan */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest flex items-center justify-between">
                    <span>Instrumen Utama (Ceklist)</span>
                    <span className="text-[9px] opacity-60 normal-case italic">Pilih satu atau lebih</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {availableInstruments.map((inst) => {
                      const isChecked = selectedInstruments.includes(inst);
                      return (
                        <button
                          key={inst}
                          type="button"
                          onClick={() => handleInstrumentToggle(inst)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 border text-[11px] text-left transition duration-150 cursor-pointer ${
                            isChecked
                              ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                              : "bg-white text-[#1A1A1A] border-[#1A1A1A]/20 hover:border-[#1A1A1A]/50"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${
                            isChecked ? "border-white bg-[#D44E31]" : "border-[#1A1A1A]/30"
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="truncate">{inst}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Custom instrument field */}
                  <div className="flex gap-2 items-center mt-1.5">
                    <span className="text-[10px] font-bold text-[#1A1A1A]/50 uppercase tracking-wider shrink-0">Lainnya:</span>
                    <input
                      type="text"
                      value={customInstrument}
                      onChange={(e) => setCustomInstrument(e.target.value)}
                      placeholder="Suling, Saxophone, dll."
                      className="flex-1 bg-white border border-[#1A1A1A]/30 rounded-none px-3 py-1.5 text-xs text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Tempo, Durasi & Target Pendengar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                    Tempo
                  </label>
                  <select
                    value={tempo}
                    onChange={(e) => setTempo(e.target.value)}
                    className="bg-white border border-[#1A1A1A] rounded-none px-2 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  >
                    <option value="Slow">Slow</option>
                    <option value="Medium">Medium</option>
                    <option value="Fast">Fast</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                    Durasi
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-white border border-[#1A1A1A] rounded-none px-2 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  >
                    <option value="±2 menit">±2 menit</option>
                    <option value="±3 menit">±3 menit</option>
                    <option value="±4 menit">±4 menit</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest">
                    Target
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="bg-white border border-[#1A1A1A] rounded-none px-2 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D44E31] focus:border-[#D44E31] transition"
                  >
                    <option value="Semua Umur">Semua Umur</option>
                    <option value="Remaja">Remaja</option>
                    <option value="Dewasa">Dewasa</option>
                    <option value="Anak-anak">Anak-anak</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerateSong}
              disabled={isLoading || !theme.trim()}
              className={`w-full py-4 px-6 rounded-none font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition duration-300 cursor-pointer ${
                isLoading 
                  ? "bg-[#1A1A1A]/10 text-[#1A1A1A]/40 border border-[#1A1A1A]/10 cursor-not-allowed" 
                  : !theme.trim()
                  ? "bg-transparent border border-[#1A1A1A]/20 text-[#1A1A1A]/40 cursor-not-allowed"
                  : "bg-[#1A1A1A] hover:bg-[#333333] text-white"
              }`}
              id="generate-song-btn"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Meracik Bait Lagu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Ciptakan Lagu & Prompt Suno AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Showcase (7 Columns on Large Screens) */}
        <div className="lg:col-span-7 flex flex-col min-h-[600px]">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#F4F1EA] border border-[#D44E31] rounded-none text-[#1A1A1A] text-sm flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-[#D44E31] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold italic text-[#1A1A1A]">Gagal Memproses Permintaan</h4>
                <p className="mt-1 text-xs opacity-80">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !result && (
            <div className="flex-1 bg-white border border-[#1A1A1A] rounded-none p-10 flex flex-col items-center justify-center text-center">
              <div className="bg-[#F4F1EA] p-5 rounded-none border border-[#1A1A1A] mb-6">
                <Music className="w-10 h-10 text-[#1A1A1A]" />
              </div>
              <h3 className="text-xl font-serif font-bold italic text-[#1A1A1A]">Menunggu Inspirasi</h3>
              <p className="text-[#1A1A1A]/70 text-xs max-w-sm mt-2">
                Pilih parameter lagu di panel kiri dan klik tombol untuk melahirkan bait lirik emosional serta arahan Suno AI terlengkap.
              </p>

              {/* Helpful Tips Card */}
              <div className="mt-8 max-w-md bg-[#F4F1EA] border border-[#1A1A1A]/20 rounded-none p-5 text-left">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#D44E31]">💡 Tips Suno AI</span>
                <h4 className="text-xs font-serif font-bold italic text-[#1A1A1A] mt-1">Mengapa format prompt Suno AI kami terbaik?</h4>
                <ul className="text-[11px] text-[#1A1A1A]/70 space-y-2 mt-2 list-disc list-inside">
                  <li>Mengintegrasikan genre dan aransemen instrumen secara berlapis.</li>
                  <li>Menyertakan instruksi mixing professional seperti <code className="text-[#D44E31] bg-white px-1 border border-[#1A1A1A]/10 rounded-none">warm analog reverb</code>.</li>
                  <li>Lirik terstruktur rapi dengan tag penanda yang dikenali mesin Suno AI.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Loading Animation State */}
          {isLoading && (
            <div className="flex-1 bg-white border border-[#1A1A1A] rounded-none p-10 flex flex-col items-center justify-center text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-[#1A1A1A]/10 rounded-full flex items-center justify-center">
                  <div className="absolute w-24 h-24 border-4 border-[#1A1A1A] rounded-full border-t-transparent animate-spin"></div>
                  <Disc className="w-10 h-10 text-[#1A1A1A] animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>

              <h3 className="text-lg font-serif font-bold italic text-[#1A1A1A]">Dapur Lagu Sedang Meramu...</h3>
              
              {/* Dynamic Steps Display */}
              <div className="w-full max-w-xs bg-[#F4F1EA] border border-[#1A1A1A]/20 rounded-none p-4 mt-6">
                <div className="flex items-center justify-between text-[10px] text-[#1A1A1A]/70 mb-2 font-sans font-bold uppercase tracking-wider">
                  <span>Proses Pembuatan</span>
                  <span>{loadingStep + 1} / {loadingMessages.length}</span>
                </div>
                <div className="w-full bg-white h-1.5 border border-[#1A1A1A]/10 rounded-none overflow-hidden">
                  <div 
                    className="bg-[#1A1A1A] h-full transition-all duration-1000"
                    style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#1A1A1A] mt-3 font-medium min-h-[32px] flex items-center justify-center italic font-serif">
                  "{loadingMessages[loadingStep]}"
                </p>
              </div>
            </div>
          )}

          {/* Main Results Showcase */}
          {result && !isLoading && (
            <div className="flex-1 flex flex-col gap-6">
              
              {/* Output Tabs Header */}
              <div className="bg-white p-1 rounded-none border border-[#1A1A1A] flex flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab("lyrics")}
                  className={`flex-1 py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                    activeTab === "lyrics" 
                      ? "bg-[#1A1A1A] text-white" 
                      : "text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F4F1EA]"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Lirik & Deskripsi
                </button>
                <button
                  onClick={() => setActiveTab("suno")}
                  className={`flex-1 py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                    activeTab === "suno" 
                      ? "bg-[#1A1A1A] text-white" 
                      : "text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F4F1EA]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Suno Prompts
                </button>
                <button
                  onClick={() => setActiveTab("artwork")}
                  className={`flex-1 py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                    activeTab === "artwork" 
                      ? "bg-[#1A1A1A] text-white" 
                      : "text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F4F1EA]"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Cover Art
                </button>
                <button
                  onClick={() => setActiveTab("video_seo")}
                  className={`flex-1 py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                    activeTab === "video_seo" 
                      ? "bg-[#1A1A1A] text-white" 
                      : "text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F4F1EA]"
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5" />
                  Video & SEO
                </button>
                <button
                  onClick={() => setActiveTab("alternatif")}
                  className={`flex-1 py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                    activeTab === "alternatif" 
                      ? "bg-[#1A1A1A] text-white" 
                      : "text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F4F1EA]"
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Versi & Viral
                </button>
              </div>

              {/* Dynamic Content Window */}
              <div className="flex-1 bg-white border border-[#1A1A1A] rounded-none p-6">
                
                {/* ----------------- TAB: LYRICS ----------------- */}
                {activeTab === "lyrics" && (
                  <div className="flex flex-col gap-6">
                    {/* Song Meta Head */}
                    <div className="border-b border-[#1A1A1A]/20 pb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-[#F4F1EA] border border-[#1A1A1A]/20 text-[#1A1A1A] px-2.5 py-1 rounded-none">
                          {result.genre} - {result.subGenre}
                        </span>
                        <span className="text-[10px] font-bold bg-[#F4F1EA] border border-[#1A1A1A]/20 text-[#1A1A1A] px-2.5 py-1 rounded-none flex items-center gap-1">
                          <Radio className="w-3 h-3 text-[#D44E31]" />
                          {result.bpm} BPM
                        </span>
                      </div>
                      <h3 className="text-3xl font-serif italic text-[#1A1A1A] flex items-center justify-between font-bold">
                        <span>{result.judul}</span>
                        <button 
                          onClick={() => handleCopy(result.lirik.fullText, "full_lyrics")}
                          className="text-[10px] bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 py-1.5 rounded-none transition flex items-center gap-1.5 cursor-pointer uppercase tracking-widest font-bold"
                        >
                          {copiedKey === "full_lyrics" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Lirik Lengkap</span>
                            </>
                          )}
                        </button>
                      </h3>
                    </div>

                    {/* Deskripsi Singkat */}
                    <div className="bg-[#F4F1EA] rounded-none p-5 border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/80 leading-relaxed font-serif italic space-y-3">
                      <h4 className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest">Makna & Nuansa Lagu</h4>
                      {result.deskripsi.split('\n\n').map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>

                    {/* Vocal and Mixing Suggestions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#F4F1EA] border border-[#1A1A1A]/10 rounded-none p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[#D44E31] font-bold text-[10px] uppercase tracking-wider">
                          <Volume2 className="w-4 h-4" />
                          Saran Vokal
                        </div>
                        <p className="text-xs text-[#1A1A1A]/85 font-serif italic leading-relaxed">{result.vokalSaran}</p>
                      </div>

                      <div className="bg-[#F4F1EA] border border-[#1A1A1A]/10 rounded-none p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[#D44E31] font-bold text-[10px] uppercase tracking-wider">
                          <Sliders className="w-4 h-4" />
                          Saran Mixing
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.mixingSaran.map((mix, i) => (
                            <span key={i} className="text-[9px] font-mono bg-white text-[#1A1A1A] border border-[#1A1A1A]/10 px-2 py-0.5 rounded-none">
                              {mix}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lyric Display with Structure Cards */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-[#1A1A1A]/50 uppercase tracking-widest mb-2">Bait Lirik Lengkap</h4>
                      
                      {[
                        { label: "Intro", text: result.lirik.intro },
                        { label: "Verse 1", text: result.lirik.verse1 },
                        { label: "Pre-Chorus", text: result.lirik.preChorus },
                        { label: "Chorus", text: result.lirik.chorus },
                        { label: "Verse 2", text: result.lirik.verse2 },
                        { label: "Bridge", text: result.lirik.bridge },
                        { label: "Final Chorus", text: result.lirik.finalChorus },
                        { label: "Outro", text: result.lirik.outro }
                      ].map((section, idx) => {
                        if (!section.text) return null;
                        const isChorus = section.label.toLowerCase().includes("chorus");
                        return (
                          <div key={idx} className="bg-[#F4F1EA] border border-[#1A1A1A]/20 rounded-none overflow-hidden">
                            <div className="bg-white border-b border-[#1A1A1A]/10 px-4 py-2.5 flex items-center justify-between">
                              <span className={`text-[9px] font-bold tracking-widest uppercase ${isChorus ? "text-[#D44E31]" : "text-[#1A1A1A]/40"}`}>
                                [{section.label}]
                              </span>
                              <button
                                onClick={() => handleCopy(section.text || "", `section_${section.label}`)}
                                className="text-[9px] text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center gap-1 transition cursor-pointer uppercase tracking-widest font-bold"
                              >
                                {copiedKey === `section_${section.label}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600">Salin!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Salin</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className={`p-6 text-[#1A1A1A] text-sm whitespace-pre-line leading-relaxed text-center font-serif ${isChorus ? "text-[#D44E31] font-bold italic" : ""}`}>
                              {section.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ----------------- TAB: SUNO PROMPTS ----------------- */}
                {activeTab === "suno" && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-lg font-display font-semibold text-slate-200 mb-1">Prompt Suno AI Teroptimasi</h3>
                      <p className="text-xs text-slate-500">Salin prompt di bawah ini ke kolom "Style of Music" di Suno AI.</p>
                    </div>

                    {/* Master Suno Prompt Box */}
                    <div className="relative bg-[#F4F1EA] border border-[#1A1A1A]/20 rounded-none p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#D44E31] bg-white px-2 py-0.5 rounded-none border border-[#1A1A1A]/10">
                          Suno Music Prompt
                        </span>
                        <button
                          onClick={() => handleCopy(result.sunoPrompt, "suno_prompt")}
                          className="text-[10px] bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 py-1.5 rounded-none transition flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-widest"
                        >
                          {copiedKey === "suno_prompt" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Prompt</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-[#1A1A1A] leading-relaxed font-mono select-all">
                        {result.sunoPrompt}
                      </p>
                    </div>

                    {/* Style Tags Container */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest">Style Tags ({result.sunoStyleTags.length})</h4>
                          <p className="text-[9px] text-[#1A1A1A]/50 uppercase font-bold tracking-widest">Klik tag individu untuk menyalin</p>
                        </div>
                        <button
                          onClick={() => handleCopy(result.sunoStyleTags.join(", "), "all_tags")}
                          className="text-[10px] text-[#1A1A1A] hover:text-[#D44E31] font-bold uppercase tracking-widest transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === "all_tags" ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Tersalin Semua</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin Semua Tag</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.sunoStyleTags.map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleCopy(tag, `tag_${idx}`)}
                            className="text-[11px] font-mono bg-white hover:bg-[#F4F1EA] text-[#1A1A1A] border border-[#1A1A1A]/20 px-2.5 py-1 rounded-none transition duration-200 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{tag}</span>
                            {copiedKey === `tag_${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DJ Specific Info Panels */}
                    {isDjGenre && (
                      <div className="bg-[#F4F1EA] border border-[#1A1A1A]/20 rounded-none p-5 mt-4 space-y-4">
                        <h4 className="text-[10px] font-bold text-[#D44E31] uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#D44E31]" />
                          Detail Karakter DJ & EDM
                        </h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="bg-white p-3 rounded-none border border-[#1A1A1A]/10">
                            <span className="block text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider">Tingkat Energi</span>
                            <span className="block text-sm text-[#D44E31] font-serif italic font-bold mt-1 uppercase">{result.tingkatEnergi || "High"}</span>
                          </div>
                          <div className="bg-white p-3 rounded-none border border-[#1A1A1A]/10">
                            <span className="block text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider">Estimasi BPM</span>
                            <span className="block text-sm text-emerald-600 font-serif italic font-bold mt-1">{result.bpm} BPM</span>
                          </div>
                          <div className="bg-white p-3 rounded-none border border-[#1A1A1A]/10 col-span-2">
                            <span className="block text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider">Suasana Lagu</span>
                            <span className="block text-sm text-[#1A1A1A] font-serif italic font-bold mt-1">{result.suasanaLagu || "Festival Dance Floor"}</span>
                          </div>
                        </div>

                        {/* Audio Effects Suggested */}
                        {result.efekAudioDisarankan && result.efekAudioDisarankan.length > 0 && (
                          <div>
                            <span className="block text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-widest mb-2">Audio Effects Disarankan</span>
                            <div className="flex flex-wrap gap-1.5">
                              {result.efekAudioDisarankan.map((efek, i) => (
                                <span key={i} className="text-xs bg-white text-[#1A1A1A] border border-[#1A1A1A]/10 px-2 py-1 rounded-none">
                                  {efek}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Platforms Suitability */}
                        {result.platformCocok && result.platformCocok.length > 0 && (
                          <div>
                            <span className="block text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-widest mb-2">Sangat Cocok Untuk Platform</span>
                            <div className="flex flex-wrap gap-1.5">
                              {result.platformCocok.map((plat, i) => (
                                <span key={i} className="text-xs font-mono bg-[#1A1A1A] text-white px-2 py-0.5 rounded-none">
                                  {plat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ----------------- TAB: ARTWORK ----------------- */}
                {activeTab === "artwork" && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-lg font-serif font-bold italic text-[#1A1A1A] mb-1">Cover Art & Desain Thumbnail</h3>
                      <p className="text-xs text-[#1A1A1A]/60">Visualisasikan lagu dengan artwork modern yang dihasilkan langsung oleh AI.</p>
                    </div>

                    {/* Album Cover generator box */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#F4F1EA] border border-[#1A1A1A] rounded-none p-4 aspect-video relative overflow-hidden group">
                        {coverUrl ? (
                          <div className="relative w-full h-full flex flex-col">
                            <img 
                              src={coverUrl} 
                              alt="Generated Album Cover" 
                              className="w-full h-full object-cover rounded-none shadow-none border border-[#1A1A1A]/10"
                              referrerPolicy="no-referrer"
                            />
                            {/* Re-generate button hover */}
                            <div className="absolute inset-0 bg-white/85 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2">
                              <button 
                                onClick={handleGenerateCover}
                                disabled={isGeneratingCover}
                                className="bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-[10px] uppercase tracking-widest py-2 px-3 rounded-none transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCover ? "animate-spin" : ""}`} />
                                Buat Ulang
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-white p-4 rounded-none border border-[#1A1A1A]/10 mb-4">
                              <ImageIcon className="w-8 h-8 text-[#1A1A1A]/40" />
                            </div>
                            <span className="text-xs text-[#1A1A1A]/50 uppercase tracking-widest font-bold">Artwork Belum Dibuat</span>
                            <button
                              onClick={handleGenerateCover}
                              disabled={isGeneratingCover}
                              className="mt-4 bg-[#1A1A1A] hover:bg-[#333333] text-white text-[10px] uppercase tracking-widest font-bold py-2.5 px-4 rounded-none shadow-none transition flex items-center gap-1.5 cursor-pointer"
                            >
                              {isGeneratingCover ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Menggambar...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Buat Cover Art</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        {coverError && (
                          <div className="absolute bottom-2 left-2 right-2 bg-white border border-[#D44E31] text-[#D44E31] text-[10px] p-2 rounded-none text-center font-bold">
                            {coverError}
                          </div>
                        )}
                      </div>

                      {/* Cover Prompt Details */}
                      <div className="md:col-span-7 flex flex-col justify-between gap-4">
                        <div className="bg-[#F4F1EA] border border-[#1A1A1A]/10 rounded-none p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#D44E31] uppercase tracking-wider">Album Cover Prompt (Midjourney/DALL-E)</span>
                            <button
                              onClick={() => handleCopy(result.albumCoverPrompt, "album_prompt")}
                              className="text-[9px] bg-[#1A1A1A] hover:bg-[#333333] text-white px-2.5 py-1 rounded-none transition flex items-center gap-1 cursor-pointer font-bold uppercase tracking-widest"
                            >
                              {copiedKey === "album_prompt" ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Copy Prompt</span>
                            </button>
                          </div>
                          <p className="text-xs text-[#1A1A1A] leading-relaxed font-serif italic select-all">
                            {result.albumCoverPrompt}
                          </p>
                        </div>

                        {/* YouTube Thumbnail Prompt */}
                        <div className="bg-[#F4F1EA] border border-[#1A1A1A]/10 rounded-none p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#D44E31] uppercase tracking-wider">YouTube Thumbnail Prompt (Bahasa Indonesia)</span>
                            <button
                              onClick={() => handleCopy(result.thumbnailPrompt, "thumb_prompt")}
                              className="text-[9px] bg-[#1A1A1A] hover:bg-[#333333] text-white px-2.5 py-1 rounded-none transition flex items-center gap-1 cursor-pointer font-bold uppercase tracking-widest"
                            >
                              {copiedKey === "thumb_prompt" ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Copy</span>
                            </button>
                          </div>
                          <p className="text-xs text-[#1A1A1A] leading-relaxed font-serif italic">
                            {result.thumbnailPrompt}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------- TAB: VIDEO & SEO ----------------- */}
                {activeTab === "video_seo" && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-lg font-serif font-bold italic text-[#1A1A1A] mb-1">Materi Video Musik & SEO YouTube</h3>
                      <p className="text-xs text-[#1A1A1A]/60">Materi siap guna untuk mempublikasikan lagu viral Anda ke YouTube, TikTok, dan Shorts.</p>
                    </div>

                    {/* Video Prompt */}
                    <div className="bg-[#F4F1EA] border border-[#1A1A1A]/10 rounded-none p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#D44E31] uppercase tracking-wider">Prompt Video Musik AI (Veo/Luma)</span>
                        <button
                          onClick={() => handleCopy(result.videoMusicPrompt, "video_prompt")}
                          className="text-[9px] bg-[#1A1A1A] hover:bg-[#333333] text-white px-2.5 py-1 rounded-none transition flex items-center gap-1 cursor-pointer font-bold uppercase tracking-widest"
                        >
                          {copiedKey === "video_prompt" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy Video Prompt</span>
                        </button>
                      </div>
                      <p className="text-xs text-[#1A1A1A] leading-relaxed font-mono select-all">
                        {result.videoMusicPrompt}
                      </p>
                    </div>

                    {/* SEO Block */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-[#1A1A1A]/50 uppercase tracking-widest">Optimasi SEO Video</h4>
                      
                      {/* SEO Title */}
                      <div className="bg-[#F4F1EA] border border-[#1A1A1A]/10 rounded-none p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-[#1A1A1A]/50 uppercase font-bold tracking-wider">Judul Video YouTube (SEO)</span>
                          <button
                            onClick={() => handleCopy(result.seo.judulSEO, "seo_title")}
                            className="text-[10px] text-[#1A1A1A] hover:text-[#D44E31] font-bold uppercase tracking-widest transition cursor-pointer"
                          >
                            {copiedKey === "seo_title" ? "Tersalin" : "Salin"}
                          </button>
                        </div>
                        <p className="text-sm text-[#1A1A1A] font-serif font-bold italic">{result.seo.judulSEO}</p>
                      </div>

                      {/* SEO Description */}
                      <div className="bg-[#F4F1EA] border border-[#1A1A1A]/10 rounded-none p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-[#1A1A1A]/50 uppercase font-bold tracking-wider">Deskripsi Video (SEO)</span>
                          <button
                            onClick={() => handleCopy(result.seo.deskripsiSEO, "seo_desc")}
                            className="text-[10px] text-[#1A1A1A] hover:text-[#D44E31] font-bold uppercase tracking-widest transition cursor-pointer"
                          >
                            {copiedKey === "seo_desc" ? "Tersalin" : "Salin Deskripsi"}
                          </button>
                        </div>
                        <p className="text-xs text-[#1A1A1A]/80 leading-relaxed whitespace-pre-wrap select-all font-mono">
                          {result.seo.deskripsiSEO}
                        </p>
                      </div>

                      {/* Keywords & Hashtags */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#F4F1EA] border border-[#1A1A1A]/10 rounded-none p-4 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] text-[#1A1A1A]/50 uppercase font-bold tracking-wider">Hashtags ({result.seo.hashtags.length})</span>
                            <button
                              onClick={() => handleCopy(result.seo.hashtags.join(" "), "seo_hash")}
                              className="text-[10px] text-[#D44E31] hover:text-[#1A1A1A] font-bold uppercase tracking-widest transition cursor-pointer"
                            >
                              Salin Semua
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {result.seo.hashtags.map((h, i) => (
                              <span key={i} className="text-[10px] bg-white text-[#1A1A1A] px-1.5 py-0.5 rounded-none border border-[#1A1A1A]/10">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-[#F4F1EA] border border-[#1A1A1A]/10 rounded-none p-4 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] text-[#1A1A1A]/50 uppercase font-bold tracking-wider">Kata Kunci / Keywords ({result.seo.keywords.length})</span>
                            <button
                              onClick={() => handleCopy(result.seo.keywords.join(", "), "seo_keys")}
                              className="text-[10px] text-[#D44E31] hover:text-[#1A1A1A] font-bold uppercase tracking-widest transition cursor-pointer"
                            >
                              Salin Semua
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto">
                            {result.seo.keywords.map((k, i) => (
                              <span key={i} className="text-[9px] bg-white text-[#1A1A1A]/70 px-1.5 py-0.5 rounded-none border border-[#1A1A1A]/10">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------- TAB: ALTERNATIVES ----------------- */}
                {activeTab === "alternatif" && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-lg font-serif font-bold italic text-[#1A1A1A] mb-1">Versi Alternatif & Potensi Viral</h3>
                      <p className="text-xs text-[#1A1A1A]/60">Mengeksplorasi lirik yang sama dengan genre/aransemen alternatif di Suno AI.</p>
                    </div>

                    {/* Potential Viral Meter card */}
                    <div className="bg-[#F4F1EA] border border-[#1A1A1A]/20 rounded-none p-5 flex flex-col md:flex-row items-center gap-6">
                      <div className="flex flex-col items-center">
                        <div className="relative flex items-center justify-center">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" className="stroke-white" strokeWidth="8" fill="transparent" />
                            <circle 
                              cx="48" cy="48" r="40" 
                              className="stroke-[#D44E31]" 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray={`${2 * Math.PI * 40}`} 
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.potensiViral.skor / 100)}`}
                            />
                          </svg>
                          <span className="absolute text-2xl font-bold tracking-tight font-serif italic text-[#1A1A1A]">{result.potensiViral.skor}%</span>
                        </div>
                        <span className="text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-widest mt-2">Potensi Viral</span>
                      </div>
                      
                      <div className="flex-1 space-y-1 text-center md:text-left">
                        <h4 className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest">Analisis Daya Tarik Medsos</h4>
                        <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-serif italic">
                          {result.potensiViral.alasan}
                        </p>
                      </div>
                    </div>

                    {/* Alternatives Grid */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-[#1A1A1A]/50 uppercase tracking-widest">Prompt Versi Alternatif Suno</h4>
                      
                      {[
                        { title: "🎹 Versi Akustik", prompt: result.versiAlternatif.akustik, key: "alt_akustik" },
                        { title: "⚡ Versi DJ Remix", prompt: result.versiAlternatif.djRemix, key: "alt_remix" },
                        { title: "🎸 Versi Rock", prompt: result.versiAlternatif.rock, key: "alt_rock" },
                        { title: "☕ Versi Lo-Fi", prompt: result.versiAlternatif.loFi, key: "alt_lofi" },
                        { title: "🎻 Versi Orchestra", prompt: result.versiAlternatif.orchestra, key: "alt_orch" }
                      ].map((alt, idx) => (
                        <div key={idx} className="bg-[#F4F1EA] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-none p-4 space-y-2 transition animate-none">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-serif font-bold italic text-[#1A1A1A]">{alt.title}</span>
                            <button
                              onClick={() => handleCopy(alt.prompt, alt.key)}
                              className="text-[10px] text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center gap-1 transition cursor-pointer uppercase font-bold tracking-widest"
                            >
                              {copiedKey === alt.key ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>Copy Prompt</span>
                            </button>
                          </div>
                          <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-mono select-all">
                            {alt.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A]/20 bg-white py-6 mt-12 text-center text-xs text-[#1A1A1A]/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 SONARA PRO. Semua output dioptimalkan khusus untuk Suno AI, Midjourney & Veo.</p>
          <div className="flex gap-4">
            <span className="text-[#1A1A1A]/20">|</span>
            <span className="text-[#D44E31] font-bold tracking-widest uppercase text-[10px]">Premium Songwriting Studio v2.5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
