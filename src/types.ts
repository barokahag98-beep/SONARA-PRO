export interface SongInput {
  theme: string;
  title: string;
  genre: string;
  subGenre: string;
  language: string;
  mood: string;
  tempo: string;
  duration: string;
  targetAudience: string;
  dominantInstrument: string;
  writingStyle: string;
}

export interface SongGenerationResult {
  judul: string;
  genre: string;
  subGenre: string;
  mood: string;
  tempo: string;
  bpm: number;
  instrumen: string[];
  deskripsi: string;
  sunoPrompt: string;
  sunoStyleTags: string[];
  lirik: {
    intro?: string;
    verse1?: string;
    preChorus?: string;
    chorus?: string;
    verse2?: string;
    bridge?: string;
    finalChorus?: string;
    outro?: string;
    fullText: string;
  };
  vokalSaran: string;
  mixingSaran: string[];
  videoMusicPrompt: string;
  thumbnailPrompt: string;
  albumCoverPrompt: string;
  seo: {
    judulSEO: string;
    deskripsiSEO: string;
    hashtags: string[];
    keywords: string[];
  };
  versiAlternatif: {
    akustik: string;
    djRemix: string;
    rock: string;
    loFi: string;
    orchestra: string;
  };
  potensiViral: {
    skor: number;
    alasan: string;
  };
  tingkatEnergi?: string;
  suasanaLagu?: string;
  efekAudioDisarankan?: string[];
  platformCocok?: string[];
}
