// English message catalog. This is the source of truth for the message shape:
// `id.ts` is typed as `typeof en`, so any key added here must be added there.
// Plain object (no `as const`) so leaf strings widen to `string`.

export const en = {
  lang: {
    label: "Language",
    english: "English",
    indonesian: "Bahasa Indonesia",
    switchTo: ({ name }: { name: string }) => `Switch to ${name}`,
  },

  nav: {
    history: "History",
    live: "Live",
    launch: "Launch",
    portfolio: "Portfolio",
    watchlist: "Watchlist",
    signals: "Signals",
    signOut: "Sign out",
  },

  common: {
    error: "Error",
    newAnalysis: "New analysis",
    launchAnalysis: "Launch analysis",
    cancel: "Cancel",
    remove: "Remove",
    add: "Add",
    enable: "Enable",
    disable: "Disable",
  },

  login: {
    title: "Sign in",
    subtitle: "Continue with your preferred account",
    continueWithGithub: "Continue with GitHub",
    continueWithGoogle: "Continue with Google",
    guestHeading: "Quick access",
    guestNameLabel: "Your name",
    guestNamePlaceholder: "Your name (optional)",
    guestButton: "Continue as guest",
    errors: {
      OAuthAccountNotLinked:
        "An account with this email already exists with a different sign-in method. Try signing in with your original provider.",
      AccessDenied: "Sign-in was cancelled or denied.",
      Configuration: "Sign-in is misconfigured. Please contact the administrator.",
      Verification: "The sign-in link is no longer valid. Please request a new one.",
      generic: ({ code }: { code: string }) => `Sign-in failed (${code}). Please try again.`,
    },
  },

  history: {
    eyebrow: "Runs",
    title: "History",
    description: "Every analysis you've launched, newest first.",
    filterPlaceholder: "Filter by ticker",
    newAnalysis: "New analysis",
    emptyTitle: "No runs yet",
    emptyTitleFiltered: ({ ticker }: { ticker: string }) => `No runs for ${ticker}`,
    emptyDesc: "Launch your first analysis to see it appear here.",
    emptyDescFiltered: "Try a different ticker, or launch a new analysis.",
    launchFirst: "Launch analysis",
  },

  live: {
    eyebrow: "Real-time",
    title: "Live runs",
    description: "Active analyses + the last 10 completions.",
    active: "Active",
    recent: "Recent",
    emptyTitle: "Nothing running",
    emptyDesc: "Launch an analysis to watch it stream here in real time.",
  },

  runDetail: {
    backToHistory: "Back to history",
    watchLive: "Watch live",
    viewFinalReports: "View final reports",
  },

  launch: {
    eyebrow: "New analysis",
    title: "Launch",
    description:
      "Spin up the full multi-agent pipeline — analysts, research debate, trader, risk team, portfolio manager.",
    infoBanner:
      "The worker uses LLM provider credentials configured on the server. Per-user keys land in a future release.",
  },

  launchForm: {
    symbolDateEyebrow: "Symbol & date",
    symbolDateDesc: "The ticker the analysts evaluate, and the reference date.",
    tickerLabel: "Ticker",
    tickerHintPrefix: "US listing or supported foreign suffix — e.g. ",
    tickerHintTokyo: "(Tokyo)",
    tickerHintJakarta: "(Jakarta)",
    tradeDateLabel: "Trade date",
    tradeDateHint: "Past trading day; the analysts evaluate against this date.",
    analystsEyebrow: "Analysts",
    analystsDesc: "All four run by default. Disable any you don't want.",
    analysts: {
      market: { label: "Market", hint: "Price action, technical indicators" },
      social: { label: "Social", hint: "Sentiment from social signals" },
      news: { label: "News", hint: "Recent news + insider transactions" },
      fundamentals: { label: "Fundamentals", hint: "Balance sheet, cashflow, income" },
    },
    watchLiveLabel: "Watch live",
    watchLiveHint:
      "— stream the worker's log as it runs. Otherwise you land on History and can open it later.",
    launching: "Launching…",
    submit: "Launch analysis",
    conflict: "A run is already in progress for this ticker + date.",
    viewRunningRun: "View running run",
  },

  portfolio: {
    eyebrow: "Performance",
    title: "Portfolio",
    description: "Per-decision P&L from every resolved analysis.",
    cumulativePnl: "Cumulative P&L",
    perDecisionTag: "per-decision · not mark-to-market",
    caveat: "Note: P&L is per-decision; Sharpe is unannualized. See spec §5.3 caveats.",
    stats: {
      cumulativePnl: "Cumulative P&L",
      winRate: "Win rate",
      sharpe: "Sharpe",
      maxDrawdown: "Max drawdown",
      trades: "Trades",
    },
    chartEmptyTitle: "No resolved decisions yet",
    chartEmptyDesc:
      "Once a decision is reflected on (return + alpha known), it appears here as a P&L point.",
  },

  ticker: {
    decisionCount: ({ count }: { count: number }) =>
      `${count} ${count === 1 ? "decision" : "decisions"}`,
    decisionsHeading: "Decisions",
    timelineEmpty: "No decisions yet for this ticker.",
    colDate: "Date",
    colRating: "Rating",
    colStatus: "Status",
    colRealizedReturn: "Realized return",
    intervalAria: "Chart interval",
    chartUnavailable: "Price data unavailable for this range — showing decisions below only.",
  },

  reportTabs: {
    market: "Market",
    sentiment: "Sentiment",
    news: "News",
    fundamentals: "Fundamentals",
    research: "Research",
    trader: "Trader",
    final: "Final",
    empty: "No reports on disk for this run.",
  },

  status: {
    queued: "Queued",
    running: "Running",
    succeeded: "Succeeded",
    failed: "Failed",
  },

  runCard: {
    monitor: "Monitor",
    monitorTitle: "Auto-dispatched by the daily Monitor",
    relative: ({ value, unit }: { value: number; unit: string }) => `${value}${unit} ago`,
    units: { s: "s", m: "m", h: "h", d: "d" },
  },

  runsBadge: {
    label: ({ count }: { count: number }) => `${count} ${count === 1 ? "run" : "runs"}`,
    aria: ({ count }: { count: number }) =>
      `${count} ${count === 1 ? "run" : "runs"} in progress`,
  },

  liveLog: {
    reconnecting: "Reconnecting…",
    streamUnavailable: "Stream unavailable — reload to retry",
    waiting: "Waiting for output…",
    logLabel: "Worker log stream",
  },

  monitor: {
    title: "Daily monitor",
    enable: "Enable",
    disable: "Disable",
    subtitleOff: ({ count }: { count: number }) =>
      `Auto-analyze your ${count} ${count === 1 ? "ticker" : "tickers"} once a day.`,
    subtitleNoTickers: "Add tickers above, then enable to auto-analyze them daily.",
    nextBriefing: ({ countdown }: { countdown: string }) => `Next briefing: ${countdown}`,
    dueNow: "due now",
    time: "Time",
    timezone: "Timezone",
    timeAria: "Briefing time",
    timezoneAria: "Timezone",
    tickerSummary: ({ count, sample }: { count: number; sample: string }) =>
      `we analyze ${count} ${count === 1 ? "ticker" : "tickers"}${sample}`,
    noTickersSummary: "no tickers on the watchlist yet",
    summary: ({ time, tz, tickers }: { time: string; tz: string; tickers: string }) =>
      `At ${time} ${tz} each day, ${tickers}.`,
  },

  notifications: {
    title: "Signal alerts",
    titleOn: "Signal alerts on",
    enable: "Enable alerts",
    disable: "Disable alerts",
    descOff: "Get an email when an actionable signal lands — silent on all-HOLD days.",
    alertOnRatings: "Alert on ratings",
    alertRatingsAria: "Alert ratings",
    descOn: ({ label }: { label: string }) =>
      `We'll email you when a ${label} signal lands. Quiet on days with nothing actionable.`,
    noEmail: "No email on your account — alerts can't be delivered until you add one.",
    enableFailed: "Couldn't enable alerts.",
    addEmailReason: "Add an email to your account to enable alerts.",
    thresholdActionable: "actionable",
    thresholdJoiner: "or",
  },

  quickAdd: {
    tickerPlaceholder: "e.g. BBCA.JK",
    notesPlaceholder: "Optional notes (e.g. watching for breakout)",
    tickerAria: "Ticker",
    notesAria: "Notes",
    add: "Add",
    patternError: "Ticker must be uppercase letters, digits, '.' or '-' (1-12 chars).",
    alreadyOnWatchlist: ({ ticker }: { ticker: string }) =>
      `${ticker} is already on your watchlist.`,
    serverRejected:
      "Server rejected this ticker. Use only uppercase letters, digits, '.' or '-'.",
  },

  watchlistTable: {
    empty: "Add a ticker above to start watching.",
    colTicker: "Ticker",
    colNotes: "Notes",
    colAdded: "Added",
    actionsAria: "Actions",
    clickToAddNotes: "Click to add notes",
    removeTitle: "Remove from watchlist?",
    removeBodyPrefix: "Remove ",
    removeBodySuffix: " from your watchlist?",
    cancel: "Cancel",
    remove: "Remove",
    removeAria: ({ ticker }: { ticker: string }) => `Remove ${ticker} from watchlist`,
  },

  watchlistPage: {
    eyebrow: "Tickers",
    title: "Watchlist",
    description: "Tickers the agentic monitor will track for buy/sell signals.",
  },

  signals: {
    eyebrow: "Daily briefing",
    title: "Signals",
    descWithDate: ({ date }: { date: string }) =>
      `What your watchlist looks like as of ${date}.`,
    descDefault: "Auto-analyses of every watchlist ticker — once the daily Monitor is on.",
    monitorOffTitle: "Daily Monitor is off",
    monitorOffDesc:
      "Enable the daily Monitor on /watchlist to get a fresh signal for every ticker every morning.",
    goToWatchlist: "Go to Watchlist",
    noSignalsTitle: ({ date }: { date: string }) => `No signals yet for ${date}`,
    today: "today",
    noSignalsDescTz: ({ tz }: { tz: string }) =>
      `Waiting for the next briefing run. The Monitor fires at your configured time (${tz}).`,
    noSignalsDescNoTz: "Configure a briefing time on /watchlist.",
    manageMonitor: "Manage Monitor",
    actionable: "Actionable",
    holdingPattern: "Holding pattern",
  },
};
