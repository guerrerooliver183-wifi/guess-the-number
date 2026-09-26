import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Gamepad2,
  History,
  Languages,
  Lightbulb,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

type ModeKey = "classic" | "easy" | "normal" | "hard";
type Language = "en" | "es";
type GameStatus = "playing" | "won" | "lost";
type LegalDoc = "cookies" | "privacy" | "terms" | null;

type HistoryEntry = {
  id: string;
  attempts: number;
  mode: ModeKey;
  timestamp: string;
  outcome: "won" | "lost";
};

type Stats = {
  games: number;
  wins: number;
  bestAttempts: number | null;
  streak: number;
};

const STORAGE_KEYS = {
  mode: "neon-guesser-mode",
  history: "neon-guesser-history",
  stats: "neon-guesser-stats",
  language: "neon-guesser-language",
  cookies: "neon-guesser-cookies",
};

const copy = {
  en: {
    navGame: "Game",
    navStats: "Stats",
    live: "LIVE",
    offline: "OFFLINE",
    eyebrow: "The neon number arena",
    heroTitle: "Guess the",
    heroAccent: "signal.",
    heroBody: "A clean read. A sharp hunch. One hidden number between 1 and 100.",
    modesLabel: "SELECT YOUR PROTOCOL",
    classic: "Classic",
    classicSub: "Infinite attempts",
    easy: "Easy",
    easySub: "10 attempts",
    normal: "Normal",
    normalSub: "8 attempts",
    hard: "Hard",
    hardSub: "7 attempts",
    newRound: "New round",
    activeRound: "ACTIVE ROUND",
    secretNode: "SECRET NUMBER NODE",
    range: "Range 01—100",
    attempt: "attempt",
    attempts: "attempts",
    remaining: "remaining",
    unlimited: "unlimited",
    makeGuess: "Make your guess",
    guessPlaceholder: "Enter a number",
    lockGuess: "Lock guess",
    higher: "Go higher",
    lower: "Go lower",
    gotIt: "Signal acquired. You found the hidden number.",
    lost: "The signal went dark. The number was",
    tryAgain: "Try another round",
    classicHint: "No countdown. Just intuition and the next move.",
    easyHint: "A forgiving protocol for your first signal hunt.",
    normalHint: "Read the feedback. Spend each attempt with intent.",
    hardHint: "Seven chances. Zero wasted motion.",
    hint: "HINT",
    cold: "The signal is waiting.",
    statsTitle: "Signal stats",
    games: "Games",
    winRate: "Win rate",
    best: "Best run",
    streak: "Streak",
    noBest: "—",
    historyTitle: "Attempt history",
    viewAll: "All local",
    emptyHistory: "Your first signal is waiting to be logged.",
    won: "Won",
    lostLabel: "Lost",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    footerLine: "A tiny game for big hunches.",
    cookieTitle: "Local-first cookies",
    cookieBody: "Neon Guesser uses local storage to remember your mode, stats and history. No tracking pixels. No account required.",
    accept: "Accept",
    learnMore: "Learn more",
    close: "Close",
    cookieDocTitle: "Cookie notice",
    cookieDocBody: "We only use essential browser storage to keep your selected mode, game history, language preference and statistics on this device. Nothing is sent to a server.",
    privacyDocTitle: "Privacy",
    privacyDocBody: "Your game activity stays in your browser. You can clear it any time by clearing site data in your browser settings. Neon Guesser does not ask for your name, email or location.",
    termsDocTitle: "Terms of play",
    termsDocBody: "Neon Guesser is a casual entertainment game. Scores and streaks are stored locally and are not verified or shared. Play fair, have fun, and take the next shot.",
    languageLabel: "Language",
    modeLabel: "Mode",
    roundComplete: "ROUND COMPLETE",
    turn: "Turn",
    useHint: "Use the feedback to tune the next shot.",
    switchLanguage: "Switch language",
    ariaInput: "Your guess from 1 to 100",
  },
  es: {
    navGame: "Juego",
    navStats: "Stats",
    live: "EN VIVO",
    offline: "SIN CONEXIÓN",
    eyebrow: "La arena numérica neón",
    heroTitle: "Adivina la",
    heroAccent: "señal.",
    heroBody: "Una lectura limpia. Una corazonada precisa. Un número oculto entre 1 y 100.",
    modesLabel: "ELIGE TU PROTOCOLO",
    classic: "Clásico",
    classicSub: "Intentos infinitos",
    easy: "Fácil",
    easySub: "10 intentos",
    normal: "Normal",
    normalSub: "8 intentos",
    hard: "Difícil",
    hardSub: "7 intentos",
    newRound: "Nueva ronda",
    activeRound: "RONDA ACTIVA",
    secretNode: "NODO NUMÉRICO SECRETO",
    range: "Rango 01—100",
    attempt: "intento",
    attempts: "intentos",
    remaining: "restantes",
    unlimited: "ilimitados",
    makeGuess: "Haz tu intento",
    guessPlaceholder: "Escribe un número",
    lockGuess: "Fijar intento",
    higher: "Más alto",
    lower: "Más bajo",
    gotIt: "Señal adquirida. Encontraste el número oculto.",
    lost: "La señal se apagó. El número era",
    tryAgain: "Jugar otra ronda",
    classicHint: "Sin cuenta atrás. Solo intuición y el siguiente movimiento.",
    easyHint: "Un protocolo amable para tu primera cacería de señales.",
    normalHint: "Lee el feedback. Usa cada intento con intención.",
    hardHint: "Siete oportunidades. Cero movimientos desperdiciados.",
    hint: "PISTA",
    cold: "La señal está esperando.",
    statsTitle: "Stats de señal",
    games: "Partidas",
    winRate: "Victorias",
    best: "Mejor ronda",
    streak: "Racha",
    noBest: "—",
    historyTitle: "Historial de intentos",
    viewAll: "Todo local",
    emptyHistory: "Tu primera señal está esperando ser registrada.",
    won: "Ganada",
    lostLabel: "Perdida",
    privacy: "Privacidad",
    terms: "Términos",
    cookies: "Cookies",
    footerLine: "Un juego pequeño para grandes corazonadas.",
    cookieTitle: "Cookies locales",
    cookieBody: "Neon Guesser usa almacenamiento local para recordar tu modo, estadísticas e historial. Sin píxeles de seguimiento. Sin cuenta.",
    accept: "Aceptar",
    learnMore: "Saber más",
    close: "Cerrar",
    cookieDocTitle: "Aviso de cookies",
    cookieDocBody: "Solo usamos almacenamiento esencial del navegador para guardar el modo, historial, idioma y estadísticas en este dispositivo. Nada se envía a un servidor.",
    privacyDocTitle: "Privacidad",
    privacyDocBody: "Tu actividad de juego se queda en tu navegador. Puedes borrarla cuando quieras desde los ajustes del navegador. Neon Guesser no pide tu nombre, email ni ubicación.",
    termsDocTitle: "Términos de juego",
    termsDocBody: "Neon Guesser es un juego casual de entretenimiento. Las puntuaciones y rachas se guardan localmente y no se verifican ni comparten. Juega limpio y diviértete.",
    languageLabel: "Idioma",
    modeLabel: "Modo",
    roundComplete: "RONDA COMPLETA",
    turn: "Turno",
    useHint: "Usa el feedback para ajustar tu siguiente intento.",
    switchLanguage: "Cambiar idioma",
    ariaInput: "Tu intento del 1 al 100",
  },
} as const;

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const modeInfo = (mode: ModeKey, language: Language) => {
  const labels = copy[language];
  const meta = {
    classic: { name: labels.classic, sub: labels.classicSub, max: Infinity, accent: "#ff3cac", rgb: "255, 60, 172", icon: Sparkles },
    easy: { name: labels.easy, sub: labels.easySub, max: 10, accent: "#b7ff00", rgb: "183, 255, 0", icon: Zap },
    normal: { name: labels.normal, sub: labels.normalSub, max: 8, accent: "#ffe600", rgb: "255, 230, 0", icon: Target },
    hard: { name: labels.hard, sub: labels.hardSub, max: 7, accent: "#ff6b1a", rgb: "255, 107, 26", icon: Activity },
  } as const;
  return meta[mode];
};

export default function Home() {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = getStored<Language | null>(STORAGE_KEYS.language, null);
    if (stored === "en" || stored === "es") return stored;
    return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
  });
  const labels = copy[language];
  const [mode, setMode] = useState<ModeKey>(() => {
    const stored = getStored<ModeKey>(STORAGE_KEYS.mode, "classic");
    return stored in { classic: 1, easy: 1, normal: 1, hard: 1 } ? stored : "classic";
  });
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<number[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => getStored<HistoryEntry[]>(STORAGE_KEYS.history, []));
  const [stats, setStats] = useState<Stats>(() => getStored<Stats>(STORAGE_KEYS.stats, { games: 0, wins: 0, bestAttempts: null, streak: 0 }));
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);
  const [cookiesAccepted, setCookiesAccepted] = useState(() => getStored<boolean>(STORAGE_KEYS.cookies, false));
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  const modeMeta = useMemo(() => modeInfo(mode, language), [mode, language]);
  const winRate = stats.games ? Math.round((stats.wins / stats.games) * 100) : 0;
  const finiteMax = Number.isFinite(modeMeta.max) ? modeMeta.max : null;
  const remaining = finiteMax ? Math.max(finiteMax - guesses.length, 0) : Infinity;
  const progress = finiteMax ? Math.min((guesses.length / finiteMax) * 100, 100) : Math.min(guesses.length * 6, 100);
  const hint = mode === "classic" ? labels.classicHint : mode === "easy" ? labels.easyHint : mode === "normal" ? labels.normalHint : labels.hardHint;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.mode, mode);
  }, [mode]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./service-worker.js").catch(() => undefined);
    }
    const setNetwork = () => setOnline(navigator.onLine);
    window.addEventListener("online", setNetwork);
    window.addEventListener("offline", setNetwork);
    return () => {
      window.removeEventListener("online", setNetwork);
      window.removeEventListener("offline", setNetwork);
    };
  }, []);

  const startRound = (nextMode = mode) => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setGuesses([]);
    setStatus("playing");
    setMessage("");
    if (nextMode !== mode) setMode(nextMode);
  };

  const selectMode = (nextMode: ModeKey) => {
    if (nextMode === mode) return;
    startRound(nextMode);
  };

  const finishRound = (outcome: "won" | "lost", attemptCount: number) => {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      attempts: attemptCount,
      mode,
      timestamp: new Date().toISOString(),
      outcome,
    };
    const nextHistory = [entry, ...history].slice(0, 50);
    const nextStats: Stats = {
      games: stats.games + 1,
      wins: stats.wins + (outcome === "won" ? 1 : 0),
      bestAttempts: outcome === "won" ? Math.min(stats.bestAttempts ?? Infinity, attemptCount) : stats.bestAttempts,
      streak: outcome === "won" ? stats.streak + 1 : 0,
    };
    setHistory(nextHistory);
    setStats(nextStats);
    window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(nextHistory));
    window.localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(nextStats));
  };

  const submitGuess = () => {
    if (status !== "playing") return;
    const value = Number(guess);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      setMessage(labels.range);
      return;
    }
    const nextGuesses = [...guesses, value];
    setGuesses(nextGuesses);
    setGuess("");

    if (value === target) {
      setStatus("won");
      setMessage(labels.gotIt);
      finishRound("won", nextGuesses.length);
      return;
    }
    if (finiteMax && nextGuesses.length >= finiteMax) {
      setStatus("lost");
      setMessage(`${labels.lost} ${target}.`);
      finishRound("lost", nextGuesses.length);
      return;
    }
    setMessage(value < target ? labels.higher : labels.lower);
  };

  const onGuessKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") submitGuess();
  };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  const changeLanguage = () => {
    setLanguage((current) => (current === "en" ? "es" : "en"));
    setMessage("");
  };
  const themeStyle = { "--mode-accent": modeMeta.accent, "--mode-glow": modeMeta.rgb } as CSSProperties;
  const isComplete = status !== "playing";

  return (
    <div className="app-shell" style={themeStyle}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-overlay" />

      <header className="topbar shell-width">
        <a className="brand" href="#game" aria-label="Neon Guesser home">
          <span className="brand-mark"><Gamepad2 size={18} strokeWidth={2.5} /></span>
          <span className="brand-name">NEON <b>GUESSER</b></span>
        </a>
        <div className="top-actions">
          <div className={`connection-pill ${online ? "is-online" : "is-offline"}`}>
            {online ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{online ? labels.live : labels.offline}</span>
          </div>
          <button className="language-button" onClick={changeLanguage} aria-label={labels.switchLanguage} title={labels.languageLabel}>
            <Languages size={16} />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </header>

      <main className="shell-width page-content" id="game">
        <section className="hero-copy reveal">
          <div className="eyebrow"><span className="eyebrow-dot" /> {labels.eyebrow}</div>
          <h1>{labels.heroTitle}<br /><span>{labels.heroAccent}</span></h1>
          <p>{labels.heroBody}</p>
          <div className="hero-meta"><span><LockKeyhole size={13} /> {labels.viewAll}</span><span><Sparkles size={13} /> {labels.cold}</span></div>
        </section>

        <div className="content-grid">
          <section className="game-panel neon-border reveal reveal-delay-1">
            <div className="panel-heading">
              <div>
                <span className="section-kicker"><span className="live-dot" /> {isComplete ? labels.roundComplete : labels.activeRound}</span>
                <h2>{labels.makeGuess}</h2>
              </div>
              <button className="icon-button" onClick={() => startRound()} aria-label={labels.newRound} title={labels.newRound}>
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="mode-picker">
              <div className="field-label">{labels.modesLabel}</div>
              <div className="mode-grid">
                {(["classic", "easy", "normal", "hard"] as ModeKey[]).map((modeKey) => {
                  const info = modeInfo(modeKey, language);
                  const Icon = info.icon;
                  return (
                    <button
                      key={modeKey}
                      className={`mode-card ${mode === modeKey ? "selected" : ""}`}
                      style={{ "--card-accent": info.accent, "--card-glow": info.rgb } as CSSProperties}
                      onClick={() => selectMode(modeKey)}
                      aria-pressed={mode === modeKey}
                    >
                      <span className="mode-icon"><Icon size={16} /></span>
                      <span className="mode-text"><b>{info.name}</b><small>{info.sub}</small></span>
                      {mode === modeKey && <Check className="mode-check" size={15} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="game-core">
              <div className="secret-node">
                <div className="node-ring node-ring-one" />
                <div className="node-ring node-ring-two" />
                <span className="node-label"><Target size={13} /> {labels.secretNode}</span>
                <strong>{isComplete && status === "lost" ? target : "??"}</strong>
                <span className="node-range">{labels.range}</span>
              </div>

              <div className="guess-interface">
                <div className="guess-status" aria-live="polite">
                  <span className={`status-icon ${status}`}>
                    {status === "won" ? <Trophy size={16} /> : status === "lost" ? <X size={16} /> : <CircleHelp size={16} />}
                  </span>
                  <span>{message || hint}</span>
                </div>
                <div className="input-row">
                  <input
                    value={guess}
                    onChange={(event) => setGuess(event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                    onKeyDown={onGuessKeyDown}
                    disabled={isComplete}
                    type="text"
                    inputMode="numeric"
                    placeholder={labels.guessPlaceholder}
                    aria-label={labels.ariaInput}
                  />
                  <button className="guess-button" onClick={isComplete ? () => startRound() : submitGuess}>
                    {isComplete ? labels.tryAgain : labels.lockGuess}<ChevronRight size={18} />
                  </button>
                </div>
                <div className="micro-hint"><Lightbulb size={13} /> {isComplete ? labels.useHint : hint}</div>
              </div>
            </div>

            <div className="round-footer">
              <div className="attempt-copy"><span>{labels.turn} {guesses.length + (isComplete ? 0 : 1)}</span><b>{finiteMax ? `${remaining} ${remaining === 1 ? labels.attempt : labels.attempts} ${labels.remaining}` : labels.unlimited}</b></div>
              <div className="attempt-meter" aria-label={`${guesses.length} ${labels.attempts}`}>
                <div className="meter-track"><span style={{ width: `${progress}%` }} /></div>
                <div className="meter-dots">
                  {[0, 1, 2, 3, 4, 5, 6].map((dot) => <span key={dot} className={guesses.length > dot ? "used" : ""} />)}
                </div>
              </div>
              <div className="mode-chip" style={{ color: modeMeta.accent }}><span />{modeMeta.name}</div>
            </div>
          </section>

          <aside className="side-rail">
            <section className="stats-card reveal reveal-delay-2">
              <div className="rail-heading"><span><BarChart3 size={16} /> {labels.statsTitle}</span><span className="rail-live">{labels.live}</span></div>
              <div className="stats-grid">
                <div className="stat-cell"><span>{labels.games}</span><b>{stats.games.toString().padStart(2, "0")}</b></div>
                <div className="stat-cell"><span>{labels.winRate}</span><b>{winRate}%</b></div>
                <div className="stat-cell"><span>{labels.best}</span><b>{stats.bestAttempts ?? labels.noBest}</b></div>
                <div className="stat-cell"><span>{labels.streak}</span><b>{stats.streak.toString().padStart(2, "0")}</b></div>
              </div>
              <div className="stats-foot"><Activity size={13} /> {stats.games ? `${stats.wins} ${labels.won.toLowerCase()} · ${stats.games - stats.wins} ${labels.lostLabel.toLowerCase()}` : labels.cold}</div>
            </section>

            <section className="history-card reveal reveal-delay-3">
              <div className="rail-heading"><span><History size={16} /> {labels.historyTitle}</span><span className="history-count">{history.length.toString().padStart(2, "0")}</span></div>
              {history.length === 0 ? (
                <div className="empty-history"><div className="empty-icon"><Clock3 size={19} /></div><p>{labels.emptyHistory}</p></div>
              ) : (
                <div className="history-list">
                  {history.slice(0, 5).map((item) => {
                    const itemInfo = modeInfo(item.mode, language);
                    return (
                      <div className="history-item" key={item.id}>
                        <div className={`history-result ${item.outcome}`}><span>{item.outcome === "won" ? <Check size={13} /> : <X size={13} />}</span></div>
                        <div className="history-detail"><b>{itemInfo.name}</b><small><CalendarDays size={11} /> {formatDate(item.timestamp)}</small></div>
                        <div className="history-attempts"><b>{item.attempts}</b><small>{item.attempts === 1 ? labels.attempt : labels.attempts}</small></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>

      <footer className="footer shell-width">
        <div className="footer-brand"><span className="brand-mark small"><Gamepad2 size={14} /></span><span>NEON GUESSER</span><small>© 2026</small></div>
        <span className="footer-line">{labels.footerLine}</span>
        <nav className="legal-nav" aria-label="Legal">
          <button onClick={() => setLegalDoc("cookies")}>{labels.cookies}</button>
          <button onClick={() => setLegalDoc("privacy")}>{labels.privacy}</button>
          <button onClick={() => setLegalDoc("terms")}>{labels.terms}</button>
        </nav>
      </footer>

      {!cookiesAccepted && (
        <div className="cookie-banner">
          <div className="cookie-icon"><ShieldCheck size={18} /></div>
          <div className="cookie-copy"><b>{labels.cookieTitle}</b><p>{labels.cookieBody}</p></div>
          <div className="cookie-actions"><button className="text-button" onClick={() => setLegalDoc("cookies")}>{labels.learnMore}</button><button className="accept-button" onClick={() => { setCookiesAccepted(true); window.localStorage.setItem(STORAGE_KEYS.cookies, "true"); }}>{labels.accept}</button></div>
        </div>
      )}

      {legalDoc && (
        <div className="legal-backdrop" role="presentation" onClick={() => setLegalDoc(null)}>
          <div className="legal-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => setLegalDoc(null)} aria-label={labels.close}><X size={18} /></button>
            <span className="dialog-kicker"><ShieldCheck size={14} /> NEON GUESSER</span>
            <h3>{legalDoc === "cookies" ? labels.cookieDocTitle : legalDoc === "privacy" ? labels.privacyDocTitle : labels.termsDocTitle}</h3>
            <p>{legalDoc === "cookies" ? labels.cookieDocBody : legalDoc === "privacy" ? labels.privacyDocBody : labels.termsDocBody}</p>
            <button className="dialog-action" onClick={() => setLegalDoc(null)}>{labels.close}<Check size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
