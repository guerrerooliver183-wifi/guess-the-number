import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Gamepad2,
  Gauge,
  History,
  Lightbulb,
  Languages,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";
import "./index.css";

type ModeId = "classic" | "easy" | "normal" | "hard";
type AttemptResult = "high" | "low" | "correct" | "miss";

type Mode = {
  id: ModeId;
  name: string;
  subtitle: string;
  attempts: number | null;
  accent: string;
};

type Attempt = {
  id: number;
  guess: number;
  result: AttemptResult;
  delta: number;
};

type SavedStats = {
  games: number;
  wins: number;
  bestAttempts: number | null;
  streak: number;
  lastMode: ModeId | null;
};

const MODES: Mode[] = [
  { id: "classic", name: "Clásico", subtitle: "Sin límite", attempts: null, accent: "magenta" },
  { id: "easy", name: "Fácil", subtitle: "10 intentos", attempts: 10, accent: "lime" },
  { id: "normal", name: "Normal", subtitle: "8 intentos", attempts: 8, accent: "yellow" },
  { id: "hard", name: "Difícil", subtitle: "7 intentos", attempts: 7, accent: "orange" },
];

const DEFAULT_STATS: SavedStats = {
  games: 0,
  wins: 0,
  bestAttempts: null,
  streak: 0,
  lastMode: null,
};

type GameRecord = {
  id: string;
  attempts: number;
  mode: ModeId;
  timestamp: string;
  won: boolean;
};

function loadSelectedMode(): ModeId {
  try {
    const saved = localStorage.getItem("neon-guesser-mode-v1") as ModeId | null;
    return saved && MODES.some((mode) => mode.id === saved) ? saved : "classic";
  } catch {
    return "classic";
  }
}

function loadGameHistory(): GameRecord[] {
  try {
    const saved = localStorage.getItem("neon-guesser-game-history-v1");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadStats(): SavedStats {
  try {
    const saved = localStorage.getItem("neon-guesser-stats-v1");
    return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

function modeFor(id: ModeId) {
  return MODES.find((mode) => mode.id === id) ?? MODES[2];
}

const LANGUAGE = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en") ? "en" : "es";

const COPY = {
  es: {
    language: "ES", languageName: "Español", online: "ONLINE", offline: "SIN CONEXIÓN", install: "Instalar",
    eyebrow: "SISTEMA DE ADIVINANZA // 01", heroTitle: "Adivina la", heroAccent: "señal", heroDescription: "Un número. Cien posibilidades. Elige tu nivel, sigue las pistas y encuentra la frecuencia correcta.",
    gameModes: "MODOS DE JUEGO", activeGame: "PARTIDA ACTIVA", target: "FRECUENCIA OBJETIVO", rangeHint: "El número secreto está entre 1 y 100.", synced: "Frecuencia sincronizada.", introduce: "INTRODUCE TU", prediction: "Predicción", yourNumber: "Tu número", submit: "ENVIAR", energy: "ENERGÍA DE INTENTOS", remaining: "restantes", initial: "El sistema está calibrado. ¿Puedes leer la señal?", invalid: "Introduce un número entero entre 1 y 100.", duplicate: "Ese pulso ya fue registrado. Prueba con otra frecuencia.", found: (n: number) => `Señal encontrada en ${n} ${n === 1 ? "intento" : "intentos"}.`, exhausted: (n: number) => `Se agotó la señal. El número era ${n}.`, higher: "La señal está más arriba.", lower: "La señal está más abajo.",
    mode: "MODO", clue: "PISTA", higherShort: "MÁS ALTO", lowerShort: "MÁS BAJO", correctShort: "ACIERTO", reset: "Reiniciar", profile: "PERFIL DE JUEGO", stats: "Estadísticas", games: "PARTIDAS", total: "TOTAL", hits: "ACIERTOS", accuracy: "PRECISIÓN", streak: "RACHA", consecutive: "SEGUIDAS", best: "MEJOR", mark: "MARCA", attemptsShort: "INT.", liveTelemetry: "TELEMETRÍA EN VIVO", history: "Historial", noPulses: "Aún no hay pulsos.", historyWill: "Tu historial aparecerá aquí.", local: "REGISTRO LOCAL", events: "eventos", higherHistory: "MÁS ALTO", lowerHistory: "MÁS BAJO", hitHistory: "¡ACIERTO!", signal: "SEÑAL", stable: "ENTORNO ESTABLE", archive: "PARTIDAS GUARDADAS", noGames: "Aún no hay partidas terminadas.", attemptsLabel: "intentos", dateLabel: "fecha", won: "GANADA", lost: "PERDIDA", syncedStatus: "SINCRONIZADO", offlineStatus: "MODO OFFLINE", madeFor: "HECHO PARA QUIENES", readBetween: "LEEN ENTRE LÍNEAS",
    cookies: "Cookies", privacy: "Privacidad", terms: "Términos", legalTitle: { cookies: "Uso de cookies", privacy: "Privacidad", terms: "Términos de uso" }, legalBody: { cookies: "Neon Guesser usa almacenamiento local para recordar tus estadísticas y preferencias en este dispositivo. No utilizamos cookies de seguimiento ni vendemos datos.", privacy: "Tus partidas y estadísticas se guardan únicamente en el almacenamiento local de tu navegador. No enviamos tus predicciones a un servidor.", terms: "Neon Guesser es un juego recreativo. Al usarlo aceptas que las estadísticas locales pueden borrarse al limpiar los datos del navegador.", }, legalClose: "Cerrar",
    modes: { classic: { name: "Clásico", subtitle: "Sin límite" }, easy: { name: "Fácil", subtitle: "10 intentos" }, normal: { name: "Normal", subtitle: "8 intentos" }, hard: { name: "Difícil", subtitle: "7 intentos" } },
  },
  en: {
    language: "EN", languageName: "English", online: "ONLINE", offline: "OFFLINE", install: "Install",
    eyebrow: "GUESSING SYSTEM // 01", heroTitle: "Guess the", heroAccent: "signal", heroDescription: "One number. One hundred possibilities. Pick your level, follow the clues, and find the right frequency.",
    gameModes: "GAME MODES", activeGame: "ACTIVE GAME", target: "TARGET FREQUENCY", rangeHint: "The secret number is between 1 and 100.", synced: "Frequency synchronized.", introduce: "ENTER YOUR", prediction: "Prediction", yourNumber: "Your number", submit: "SUBMIT", energy: "ATTEMPT ENERGY", remaining: "remaining", initial: "System calibrated. Can you read the signal?", invalid: "Enter a whole number between 1 and 100.", duplicate: "That pulse is already logged. Try a different frequency.", found: (n: number) => `Signal found in ${n} ${n === 1 ? "attempt" : "attempts"}.`, exhausted: (n: number) => `Signal depleted. The number was ${n}.`, higher: "The signal is higher.", lower: "The signal is lower.",
    mode: "MODE", clue: "CLUE", higherShort: "HIGHER", lowerShort: "LOWER", correctShort: "HIT", reset: "Reset", profile: "PLAYER PROFILE", stats: "Statistics", games: "GAMES", total: "TOTAL", hits: "HITS", accuracy: "ACCURACY", streak: "STREAK", consecutive: "IN A ROW", best: "BEST", mark: "MARK", attemptsShort: "ATT.", liveTelemetry: "LIVE TELEMETRY", history: "History", noPulses: "No pulses yet.", historyWill: "Your history will appear here.", local: "LOCAL LOG", events: "events", higherHistory: "HIGHER", lowerHistory: "LOWER", hitHistory: "HIT!", signal: "SIGNAL", stable: "STABLE ENVIRONMENT", archive: "SAVED GAMES", noGames: "No completed games yet.", attemptsLabel: "attempts", dateLabel: "date", won: "WON", lost: "LOST", syncedStatus: "SYNCED", offlineStatus: "OFFLINE MODE", madeFor: "MADE FOR THOSE WHO", readBetween: "READ BETWEEN LINES",
    cookies: "Cookies", privacy: "Privacy", terms: "Terms", legalTitle: { cookies: "Cookie use", privacy: "Privacy", terms: "Terms of use" }, legalBody: { cookies: "Neon Guesser uses local storage to remember your statistics and preferences on this device. We do not use tracking cookies or sell data.", privacy: "Your games and statistics are stored only in your browser's local storage. We do not send your predictions to a server.", terms: "Neon Guesser is a recreational game. By using it, you accept that local statistics may be erased when browser data is cleared.", }, legalClose: "Close",
    modes: { classic: { name: "Classic", subtitle: "No limit" }, easy: { name: "Easy", subtitle: "10 attempts" }, normal: { name: "Normal", subtitle: "8 attempts" }, hard: { name: "Hard", subtitle: "7 attempts" } },
  },
} as const;

type LegalSection = "cookies" | "privacy" | "terms";

function App() {
  const t = COPY[LANGUAGE];
  const [modeId, setModeId] = useState<ModeId>(loadSelectedMode);
  const [secret, setSecret] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState<string>(t.initial);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [stats, setStats] = useState<SavedStats>(loadStats);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [legalSection, setLegalSection] = useState<LegalSection | null>(null);
  const [gameHistory, setGameHistory] = useState<GameRecord[]>(loadGameHistory);
  const mode = modeFor(modeId);
  const attemptsLeft = mode.attempts === null ? null : Math.max(mode.attempts - attempts.length, 0);
  const progress = mode.attempts === null ? 0 : Math.min((attempts.length / mode.attempts) * 100, 100);
  const isWin = attempts.some((attempt) => attempt.result === "correct");
  const canPlay = !completed && attemptsLeft !== 0;
  const lastAttempt = attempts[0];

  const accuracy = stats.games ? Math.round((stats.wins / stats.games) * 100) : 0;
  const currentModeLabel = t.modes[modeId].name.toUpperCase();

  useEffect(() => {
    document.documentElement.lang = LANGUAGE;
    document.title = LANGUAGE === "en" ? "Neon Guesser — Guess the signal" : "Neon Guesser — Adivina la señal";
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onInstall);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstall);
    };
  }, []);

  useEffect(() => {
    resetGame();
  }, [modeId]);

  const recentSignal = useMemo(() => attempts.slice(0, 4), [attempts]);

  function resetGame() {
    setSecret(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setAttempts([]);
    setCompleted(false);
    setMessage(t.initial);
  }

  function selectMode(nextMode: ModeId) {
    setModeId(nextMode);
    try {
      localStorage.setItem("neon-guesser-mode-v1", nextMode);
    } catch {
      // Persistence is best-effort for private browsing.
    }
  }

  function saveGameRecord(win: boolean, usedAttempts: number) {
    const record: GameRecord = {
      id: `${Date.now()}-${modeId}`,
      attempts: usedAttempts,
      mode: modeId,
      timestamp: new Date().toISOString(),
      won: win,
    };
    setGameHistory((previous) => {
      const next = [record, ...previous].slice(0, 50);
      try {
        localStorage.setItem("neon-guesser-game-history-v1", JSON.stringify(next));
      } catch {
        // Persistence is best-effort for private browsing.
      }
      return next;
    });
  }

  function saveResult(win: boolean, usedAttempts: number) {
    setStats((previous) => {
      const next: SavedStats = {
        games: previous.games + 1,
        wins: previous.wins + (win ? 1 : 0),
        bestAttempts:
          win && (previous.bestAttempts === null || usedAttempts < previous.bestAttempts)
            ? usedAttempts
            : previous.bestAttempts,
        streak: win ? previous.streak + 1 : 0,
        lastMode: modeId,
      };
      try {
        localStorage.setItem("neon-guesser-stats-v1", JSON.stringify(next));
      } catch {
        // Local persistence is best-effort for private browsing.
      }
      return next;
    });
  }

  function handleGuess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericGuess = Number(guess);

    if (!Number.isInteger(numericGuess) || numericGuess < 1 || numericGuess > 100) {
      setMessage(t.invalid);
      return;
    }

    if (attempts.some((attempt) => attempt.guess === numericGuess)) {
      setMessage(t.duplicate);
      return;
    }

    const delta = Math.abs(secret - numericGuess);
    const result: AttemptResult = numericGuess === secret ? "correct" : numericGuess < secret ? "low" : "high";
    const nextAttempt: Attempt = { id: Date.now(), guess: numericGuess, result, delta };
    const nextAttempts = [nextAttempt, ...attempts];
    setAttempts(nextAttempts);
    setGuess("");

    if (result === "correct") {
      setCompleted(true);
      setMessage(t.found(nextAttempts.length));
      saveResult(true, nextAttempts.length);
      saveGameRecord(true, nextAttempts.length);
      return;
    }

    const outOfAttempts = mode.attempts !== null && nextAttempts.length >= mode.attempts;
    if (outOfAttempts) {
      setCompleted(true);
      setMessage(t.exhausted(secret));
      setAttempts((current) => [...current, { id: Date.now() + 1, guess: secret, result: "miss", delta: 0 }]);
      saveResult(false, nextAttempts.length);
      saveGameRecord(false, nextAttempts.length);
      return;
    }

    setMessage(numericGuess < secret ? t.higher : t.lower);
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="ambient ambient-four" />
      <div className="grid-overlay" />
      <div className="scanline" />

      <header className="topbar">
        <a className="brand" href="#game" aria-label="Neon Guesser home">
          <span className="brand-mark"><Zap size={17} strokeWidth={2.8} /></span>
          <span>
            <strong>NEON</strong>
            <em>GUESSER</em>
          </span>
        </a>
        <div className="topbar-actions">
          <div className={`connection-chip ${isOnline ? "online" : "offline"}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? t.online : t.offline}</span>
          </div>
          {installPrompt && (
            <button className="install-button" onClick={installApp} type="button">
              <Download size={15} /> {t.install}
            </button>
          )}
        </div>
      </header>

      <main className="main-content" id="game">
        <section className="intro-block reveal-up">
          <div className="eyebrow"><span className="eyebrow-line" /> {t.eyebrow}</div>
          <h1>{t.heroTitle} <span>{t.heroAccent}</span>.</h1>
          <p>{t.heroDescription}</p>
        </section>

        <section className="mode-strip reveal-up" aria-label={t.gameModes}>
          <div className="strip-label"><Gamepad2 size={15} /> {t.gameModes}</div>
          <div className="mode-list">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mode-button ${modeId === item.id ? `active ${item.accent}` : ""}`}
                onClick={() => selectMode(item.id)}
              >
                <span className="mode-dot" />
                <span className="mode-copy"><strong>{t.modes[item.id].name}</strong><small>{t.modes[item.id].subtitle}</small></span>
                {modeId === item.id && <Check size={15} className="mode-check" />}
              </button>
            ))}
          </div>
        </section>

        <div className="workspace">
          <section className={`game-card mode-${mode.accent} reveal-up`}>
            <div className="card-topline">
              <div className="live-label"><span className="live-dot" /> {t.activeGame}</div>
              <div className="round-label">RND. 0{Math.min(attempts.length + 1, 9)} / 10</div>
            </div>

            <div className="game-card-body">
              <div className="signal-column">
                <div className="signal-label">{t.target}</div>
                <div className={`signal-number ${isWin ? "found" : ""}`} aria-live="polite">
                  {isWin ? secret : "?"}
                </div>
                <div className="signal-range"><span>01</span><i /><span>100</span></div>
                <p className="signal-hint">
                  <Lightbulb size={15} />
                  {isWin ? t.synced : t.rangeHint}
                </p>
              </div>

              <div className="input-column">
                <div className="input-heading">
                  <div><span className="mini-kicker">{t.introduce}</span><h2>{t.prediction}</h2></div>
                  <div className="attempt-counter"><span>{attempts.length.toString().padStart(2, "0")}</span> / {mode.attempts ?? "∞"}</div>
                </div>
                <form onSubmit={handleGuess} className="guess-form">
                  <label htmlFor="guess">{t.yourNumber}</label>
                  <div className="input-row">
                    <input
                      id="guess"
                      value={guess}
                      onChange={(event) => setGuess(event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                      inputMode="numeric"
                      placeholder="00"
                      min={1}
                      max={100}
                      disabled={!canPlay}
                      autoComplete="off"
                    />
                    <button className="submit-button" type="submit" disabled={!canPlay}>
                      <span>{t.submit}</span><ChevronRight size={19} />
                    </button>
                  </div>
                </form>
                <div className={`status-message ${isWin ? "success" : completed ? "failure" : ""}`} aria-live="polite">
                  {isWin ? <CheckCircle2 size={16} /> : completed ? <XCircle size={16} /> : <Sparkles size={16} />}
                  <span>{message}</span>
                </div>
                <div className="progress-area">
                  <div className="progress-meta"><span>{t.energy}</span><strong>{attemptsLeft === null ? "∞" : `${attemptsLeft} ${t.remaining}`}</strong></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${mode.attempts === null ? 26 : Math.max(progress, 4)}%` }} /></div>
                </div>
              </div>
            </div>

            <div className="game-footer">
              <div><span className="footer-key">{t.mode}</span><strong>{currentModeLabel}</strong></div>
              <div><span className="footer-key">{t.clue}</span><strong>{lastAttempt ? (lastAttempt.result === "low" ? t.higherShort : lastAttempt.result === "high" ? t.lowerShort : lastAttempt.result === "correct" ? t.correctShort : "—") : "—"}</strong></div>
              <button type="button" onClick={resetGame} className="reset-button"><RotateCcw size={14} /> {t.reset}</button>
            </div>
          </section>

          <aside className="side-column">
            <section className="stats-card reveal-up" aria-label={t.stats}>
              <div className="section-heading"><div><span className="mini-kicker">{t.profile}</span><h3>{t.stats}</h3></div><BarChart3 size={18} /></div>
              <div className="stat-grid">
                <div className="stat-box"><span>{t.games}</span><strong>{stats.games.toString().padStart(2, "0")}</strong><small>{t.total}</small></div>
                <div className="stat-box accent-lime"><span>{t.hits}</span><strong>{accuracy}<small>%</small></strong><small>{t.accuracy}</small></div>
                <div className="stat-box accent-violet"><span>{t.streak}</span><strong>{stats.streak.toString().padStart(2, "0")}</strong><small>{t.consecutive}</small></div>
                <div className="stat-box accent-cyan"><span>{t.best}</span><strong>{stats.bestAttempts ?? "—"}<small>{stats.bestAttempts ? ` ${t.attemptsShort}` : ""}</small></strong><small>{t.mark}</small></div>
              </div>
            </section>

            <section className="history-card reveal-up" aria-label={t.history}>
              <div className="section-heading"><div><span className="mini-kicker">{t.liveTelemetry}</span><h3>{t.history}</h3></div><History size={18} /></div>
              {recentSignal.length === 0 ? (
                <div className="empty-history"><Target size={22} /><span>{t.noPulses}<br />{t.historyWill}</span></div>
              ) : (
                <div className="history-list">
                  {recentSignal.map((attempt, index) => (
                    <div className={`history-row ${attempt.result}`} key={attempt.id}>
                      <span className="history-index">{(attempts.length - index).toString().padStart(2, "0")}</span>
                      <strong>{attempt.guess.toString().padStart(2, "0")}</strong>
                      <span className="history-direction">{attempt.result === "low" ? <><ArrowUpRight size={14} /> {t.higherHistory}</> : attempt.result === "high" ? <><ArrowDownRight size={14} /> {t.lowerHistory}</> : attempt.result === "correct" ? <><Trophy size={13} /> {t.hitHistory}</> : t.signal}</span>
                      <span className="history-delta">{attempt.result === "correct" || attempt.result === "miss" ? "—" : `±${attempt.delta}`}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="history-footer"><span><span className="pulse-dot" /> {t.local}</span><span>{attempts.length} {t.events}</span></div>
            </section>

            <section className="archive-card reveal-up" aria-label={t.archive}>
              <div className="section-heading"><div><span className="mini-kicker">{t.archive}</span><h3>{t.history}</h3></div><CalendarDays size={18} /></div>
              {gameHistory.length === 0 ? (
                <div className="archive-empty">{t.noGames}</div>
              ) : (
                <div className="archive-list">
                  {gameHistory.slice(0, 6).map((record) => {
                    const date = new Intl.DateTimeFormat(LANGUAGE === "en" ? "en-US" : "es-ES", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(record.timestamp));
                    return (
                      <div className="archive-row" key={record.id}>
                        <div className={`archive-status ${record.won ? "won" : "lost"}`}>{record.won ? "✓" : "×"}</div>
                        <div className="archive-main"><strong>{t.modes[record.mode].name}</strong><span>{record.attempts} {t.attemptsLabel}</span></div>
                        <div className="archive-meta"><b>{record.won ? t.won : t.lost}</b><span>{date}</span></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>
        </div>

        <footer className="page-footer reveal-up">
          <span>NEON GUESSER <b>v1.0.0</b></span>
          <span className="footer-center"><Gauge size={14} /> {t.stable} · {isOnline ? t.syncedStatus : t.offlineStatus}</span>
          <span>{t.madeFor} <b>{t.readBetween}</b></span>
          <div className="legal-links" aria-label="Legal information">
            <Languages size={13} />
            <span className="language-badge">{t.language} · {t.languageName}</span>
            <button type="button" onClick={() => setLegalSection("cookies")}>{t.cookies}</button>
            <button type="button" onClick={() => setLegalSection("privacy")}>{t.privacy}</button>
            <button type="button" onClick={() => setLegalSection("terms")}>{t.terms}</button>
          </div>
        </footer>

        {legalSection && (
          <div className="legal-backdrop" role="dialog" aria-modal="true" aria-labelledby="legal-title" onClick={() => setLegalSection(null)}>
            <section className="legal-modal" onClick={(event) => event.stopPropagation()}>
              <div className="legal-modal-top"><span className="mini-kicker">NEON GUESSER // {t.language}</span><button className="legal-close" type="button" onClick={() => setLegalSection(null)} aria-label={t.legalClose}><X size={18} /></button></div>
              <h2 id="legal-title">{t.legalTitle[legalSection]}</h2>
              <p>{t.legalBody[legalSection]}</p>
              <button className="legal-confirm" type="button" onClick={() => setLegalSection(null)}>{t.legalClose}</button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }
}

export default App;
