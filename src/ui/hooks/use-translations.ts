export type Language = 'en' | 'id';

interface Translations {
  app: {
    title: string;
    loading: string;
  };
  scrape: {
    enterUrl: string;
    scrape: string;
    scraping: string;
    success: string;
    error: string;
  };
  pdf: {
    generate: string;
    generating: string;
    download: string;
    saveToDrive: string;
    format: string;
  };
  history: {
    title: string;
    empty: string;
    search: string;
    filter: string;
    all: string;
    page: string;
    sequence: string;
  };
  ai: {
    title: string;
    summarize: string;
    findTopics: string;
    placeholder: string;
  };
  errors: {
    generic: string;
    network: string;
    unauthorized: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    app: {
      title: "IAI Material Scraper",
      loading: "Loading...",
    },
    scrape: {
      enterUrl: "Enter material URL",
      scrape: "Scrape",
      scraping: "Scraping...",
      success: "Found {count} images",
      error: "Failed to scrape",
    },
    pdf: {
      generate: "Generate PDF",
      generating: "Generating...",
      download: "Download",
      saveToDrive: "Save to Drive",
      format: "Format",
    },
    history: {
      title: "Recent Scrapes",
      empty: "No history yet",
      search: "Search history...",
      filter: "Filter",
      all: "All",
      page: "Page",
      sequence: "Sequence",
    },
    ai: {
      title: "AI Assistant",
      summarize: "Summarize material",
      findTopics: "Find main topics",
      placeholder: "Ask about the material...",
    },
    errors: {
      generic: "An error occurred",
      network: "Network error",
      unauthorized: "Please login first",
    },
  },
  id: {
    app: {
      title: "Peng scrape Materi IAI",
      loading: "Memuat...",
    },
    scrape: {
      enterUrl: "Masukkan URL materi",
      scrape: "Ambil Data",
      success: "Ditemukan {count} gambar",
      scraping: "Mengambil data...",
      error: "Gagal mengambil data",
    },
    pdf: {
      generate: "Buat PDF",
      generating: "Membuat...",
      download: "Unduh",
      saveToDrive: "Simpan ke Drive",
      format: "Format",
    },
    history: {
      title: "Riwayat Terbaru",
      empty: "Belum ada riwayat",
      search: "Cari riwayat...",
      filter: "Filter",
      all: "Semua",
      page: "Halaman",
      sequence: "Urutan",
    },
    ai: {
      title: "Asisten AI",
      summarize: "Ringkas materi ini",
      findTopics: "Temukan topik utama",
      placeholder: "Tanya tentang materi...",
    },
    errors: {
      generic: "Terjadi kesalahan",
      network: "Kesalahan jaringan",
      unauthorized: "Silakan login terlebih dahulu",
    },
  },
};

export function useTranslations(lang: Language = 'en') {
  return translations[lang];
}