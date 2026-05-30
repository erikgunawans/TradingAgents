// Bahasa Indonesia message catalog. Typed as `typeof en` so it must mirror the
// English catalog key-for-key. Polished for natural Indonesian: tech/finance
// jargon kept in English (ticker, P&L, Sharpe, Watchlist, Monitor, Rating),
// generic copy translated naturally, no literal calques or stiff bureaucratic
// vocabulary.
import { en } from "./en";

export const id: typeof en = {
  lang: {
    label: "Bahasa",
    english: "English",
    indonesian: "Bahasa Indonesia",
    switchTo: ({ name }) => `Ganti ke ${name}`,
  },

  nav: {
    history: "Riwayat",
    live: "Live",
    launch: "Luncurkan",
    portfolio: "Portofolio",
    watchlist: "Watchlist",
    signals: "Sinyal",
    signOut: "Keluar",
  },

  common: {
    error: "Kesalahan",
    newAnalysis: "Analisis baru",
    launchAnalysis: "Luncurkan analisis",
    cancel: "Batal",
    remove: "Hapus",
    add: "Tambah",
    enable: "Aktifkan",
    disable: "Nonaktifkan",
  },

  login: {
    title: "Masuk",
    subtitle: "Lanjutkan dengan akun pilihan Anda",
    continueWithGithub: "Lanjutkan dengan GitHub",
    continueWithGoogle: "Lanjutkan dengan Google",
    guestHeading: "Akses cepat",
    guestNameLabel: "Nama Anda",
    guestNamePlaceholder: "Nama Anda (opsional)",
    guestButton: "Lanjut sebagai tamu",
    errors: {
      OAuthAccountNotLinked:
        "Akun dengan email ini sudah terdaftar lewat metode masuk yang berbeda. Coba masuk dengan penyedia yang Anda pakai sebelumnya.",
      AccessDenied: "Proses masuk dibatalkan atau ditolak.",
      Configuration: "Pengaturan proses masuk bermasalah. Silakan hubungi administrator.",
      Verification: "Tautan masuk sudah tidak berlaku. Silakan minta tautan baru.",
      generic: ({ code }) => `Gagal masuk (${code}). Silakan coba lagi.`,
    },
  },

  history: {
    eyebrow: "Analisis",
    title: "Riwayat",
    description: "Setiap analisis yang pernah Anda jalankan, dari yang terbaru.",
    filterPlaceholder: "Saring berdasarkan ticker",
    newAnalysis: "Analisis baru",
    emptyTitle: "Belum ada analisis",
    emptyTitleFiltered: ({ ticker }) => `Belum ada analisis untuk ${ticker}`,
    emptyDesc: "Jalankan analisis pertama Anda dan hasilnya akan muncul di sini.",
    emptyDescFiltered: "Coba ticker lain, atau jalankan analisis baru.",
    launchFirst: "Luncurkan analisis",
  },

  live: {
    eyebrow: "Real-time",
    title: "Analisis live",
    description: "Analisis yang sedang berjalan + 10 yang terakhir selesai.",
    active: "Aktif",
    recent: "Terbaru",
    emptyTitle: "Tidak ada yang berjalan",
    emptyDesc: "Luncurkan analisis untuk melihatnya berjalan secara langsung di sini.",
  },

  runDetail: {
    backToHistory: "Kembali ke riwayat",
    watchLive: "Tonton live",
    viewFinalReports: "Lihat laporan akhir",
  },

  launch: {
    eyebrow: "Analisis baru",
    title: "Luncurkan",
    description:
      "Jalankan seluruh pipeline multi-agen — analis, debat riset, trader, tim risiko, manajer portofolio.",
    infoBanner:
      "Worker memakai kredensial penyedia LLM yang dikonfigurasi di server. Kunci per pengguna akan hadir di rilis mendatang.",
  },

  launchForm: {
    symbolDateEyebrow: "Simbol & tanggal",
    symbolDateDesc: "Ticker yang dievaluasi para analis, dan tanggal acuannya.",
    tickerLabel: "Ticker",
    tickerHintPrefix: "Saham AS atau akhiran bursa luar negeri yang didukung — mis. ",
    tickerHintTokyo: "(Tokyo)",
    tickerHintJakarta: "(Jakarta)",
    tradeDateLabel: "Tanggal transaksi",
    tradeDateHint: "Hari bursa yang sudah lewat; analis mengevaluasi berdasarkan tanggal ini.",
    analystsEyebrow: "Analis",
    analystsDesc: "Keempatnya aktif secara default. Nonaktifkan yang tidak Anda perlukan.",
    analysts: {
      market: { label: "Pasar", hint: "Pergerakan harga, indikator teknikal" },
      social: { label: "Sosial", hint: "Sentimen dari sinyal media sosial" },
      news: { label: "Berita", hint: "Berita terkini + transaksi insider" },
      fundamentals: { label: "Fundamental", hint: "Neraca, arus kas, laba rugi" },
    },
    watchLiveLabel: "Tonton live",
    watchLiveHint:
      "— streaming log worker selagi berjalan. Kalau tidak, Anda diarahkan ke Riwayat dan bisa membukanya nanti.",
    launching: "Meluncurkan…",
    submit: "Luncurkan analisis",
    conflict: "Sudah ada analisis yang berjalan untuk ticker + tanggal ini.",
    viewRunningRun: "Lihat analisis yang berjalan",
  },

  portfolio: {
    eyebrow: "Kinerja",
    title: "Portofolio",
    description: "P&L per keputusan dari setiap analisis yang sudah terselesaikan.",
    cumulativePnl: "P&L Kumulatif",
    perDecisionTag: "per keputusan · bukan mark-to-market",
    caveat: "Catatan: P&L dihitung per keputusan; Sharpe belum disetahunkan. Lihat catatan spec §5.3.",
    stats: {
      cumulativePnl: "P&L Kumulatif",
      winRate: "Win rate",
      sharpe: "Sharpe",
      maxDrawdown: "Max drawdown",
      trades: "Transaksi",
    },
    chartEmptyTitle: "Belum ada keputusan yang selesai dievaluasi",
    chartEmptyDesc:
      "Begitu hasil sebuah keputusan diketahui (return + alpha tersedia), ia muncul di sini sebagai titik P&L.",
  },

  ticker: {
    decisionCount: ({ count }) => `${count} keputusan`,
    decisionsHeading: "Keputusan",
    timelineEmpty: "Belum ada keputusan untuk ticker ini.",
    colDate: "Tanggal",
    colRating: "Rating",
    colStatus: "Status",
    colRealizedReturn: "Return terealisasi",
    intervalAria: "Interval grafik",
    chartUnavailable: "Data harga tidak tersedia untuk rentang ini — hanya menampilkan keputusan di bawah.",
    dataRangeClipped: "Data per jam hanya tersedia untuk 60 hari terakhir.",
  },

  rating: {
    Buy: "Beli",
    Overweight: "Akumulasi",
    Hold: "Tahan",
    Underweight: "Kurangi",
    Sell: "Jual",
  },

  decisionStatus: {
    pending: "menunggu",
    resolved: "selesai",
  },

  reportTabs: {
    market: "Pasar",
    sentiment: "Sentimen",
    news: "Berita",
    fundamentals: "Fundamental",
    research: "Riset",
    trader: "Trader",
    final: "Final",
    empty: "Tidak ada laporan tersimpan untuk analisis ini.",
  },

  status: {
    queued: "Dalam antrean",
    running: "Berjalan",
    succeeded: "Berhasil",
    failed: "Gagal",
  },

  runCard: {
    monitor: "Monitor",
    monitorTitle: "Dijalankan otomatis oleh Monitor harian",
    relative: ({ value, unit }) => `${value}${unit} lalu`,
    units: { s: " dtk", m: " mnt", h: " jam", d: " hr" },
  },

  runsBadge: {
    label: ({ count }) => `${count} analisis`,
    aria: ({ count }) => `${count} analisis sedang berjalan`,
  },

  liveLog: {
    reconnecting: "Menyambung ulang…",
    streamUnavailable: "Stream tidak tersedia — muat ulang untuk mencoba lagi",
    waiting: "Menunggu output…",
    logLabel: "Stream log worker",
  },

  monitor: {
    title: "Monitor harian",
    enable: "Aktifkan",
    disable: "Nonaktifkan",
    subtitleOff: ({ count }) => `Analisis otomatis ${count} ticker Anda sekali sehari.`,
    subtitleNoTickers:
      "Tambahkan ticker di atas, lalu aktifkan untuk menganalisisnya otomatis setiap hari.",
    nextBriefing: ({ countdown }) => `Briefing berikutnya: ${countdown}`,
    dueNow: "sekarang",
    time: "Waktu",
    timezone: "Zona waktu",
    timeAria: "Waktu briefing",
    timezoneAria: "Zona waktu",
    tickerSummary: ({ count, sample }) => `kami menganalisis ${count} ticker${sample}`,
    noTickersSummary: "belum ada ticker di watchlist",
    summary: ({ time, tz, tickers }) => `Setiap hari pukul ${time} ${tz}, ${tickers}.`,
  },

  notifications: {
    title: "Notifikasi sinyal",
    titleOn: "Notifikasi sinyal aktif",
    enable: "Aktifkan notifikasi",
    disable: "Nonaktifkan notifikasi",
    descOff:
      "Dapatkan email saat ada sinyal yang bisa ditindaklanjuti — tidak ada email di hari semua HOLD.",
    alertOnRatings: "Notifikasi untuk rating",
    alertRatingsAria: "Rating notifikasi",
    descOn: ({ label }) =>
      `Kami akan mengirim email saat ada sinyal ${label}. Tidak ada email di hari tanpa sinyal yang perlu ditindaklanjuti.`,
    noEmail: "Akun Anda belum punya email — notifikasi tidak bisa dikirim sampai Anda menambahkannya.",
    enableFailed: "Gagal mengaktifkan notifikasi.",
    addEmailReason: "Tambahkan email ke akun Anda untuk mengaktifkan notifikasi.",
    thresholdActionable: "yang bisa ditindaklanjuti",
    thresholdJoiner: "atau",
  },

  quickAdd: {
    tickerPlaceholder: "mis. BBCA.JK",
    notesPlaceholder: "Catatan opsional (mis. menunggu breakout)",
    tickerAria: "Ticker",
    notesAria: "Catatan",
    add: "Tambah",
    patternError: "Ticker harus huruf kapital, angka, '.' atau '-' (1-12 karakter).",
    alreadyOnWatchlist: ({ ticker }) => `${ticker} sudah ada di watchlist Anda.`,
    serverRejected:
      "Server menolak ticker ini. Gunakan hanya huruf kapital, angka, '.' atau '-'.",
  },

  watchlistTable: {
    empty: "Tambahkan ticker di atas untuk mulai memantau.",
    colTicker: "Ticker",
    colNotes: "Catatan",
    colAdded: "Ditambahkan",
    actionsAria: "Aksi",
    clickToAddNotes: "Klik untuk menambah catatan",
    removeTitle: "Hapus dari watchlist?",
    removeBodyPrefix: "Hapus ",
    removeBodySuffix: " dari watchlist Anda?",
    cancel: "Batal",
    remove: "Hapus",
    removeAria: ({ ticker }) => `Hapus ${ticker} dari watchlist`,
  },

  watchlistPage: {
    eyebrow: "Ticker",
    title: "Watchlist",
    description: "Ticker yang dipantau Monitor harian untuk sinyal beli/jual.",
  },

  signals: {
    eyebrow: "Briefing harian",
    title: "Sinyal",
    descWithDate: ({ date }) => `Kondisi watchlist Anda per ${date}.`,
    descDefault: "Analisis otomatis setiap ticker di watchlist — begitu Monitor harian aktif.",
    monitorOffTitle: "Monitor harian nonaktif",
    monitorOffDesc:
      "Aktifkan Monitor harian di /watchlist agar setiap pagi Anda dapat sinyal baru untuk tiap ticker.",
    goToWatchlist: "Buka Watchlist",
    noSignalsTitle: ({ date }) => `Belum ada sinyal untuk ${date}`,
    today: "hari ini",
    noSignalsDescTz: ({ tz }) =>
      `Menunggu briefing berikutnya. Monitor berjalan pada waktu yang Anda atur (${tz}).`,
    noSignalsDescNoTz: "Atur waktu briefing di /watchlist.",
    manageMonitor: "Kelola Monitor",
    actionable: "Bisa ditindaklanjuti",
    holdingPattern: "Menahan posisi",
  },
};
