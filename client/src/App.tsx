import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Gamepad2,
  Gauge,
  History,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
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
  { id: "classic", name: "Clásico", subtitle: "Sin límite", attempts: null, accent: "violet" },
  { id: "easy", name: "Fácil", subtitle: "10 intentos", attempts: 10, accent: "cyan" },
  { id: "normal", name: "Normal", subtitle: "8 intentos", attempts: 8, accent: "lime" },
  { id: "hard", name: "Difícil", subtitle: "7 intentos", attempts: 7, accent: "orange" },
];

const DEFAULT_STATS: SavedStats = {
  games: 0,
  wins: 0,
  bestAttempts: null,
  streak: 0,
  lastMode: null,
};

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

function App() {
  const [modeId, setModeId] = useState<ModeId>("normal");
  const [secret, setSecret] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("El sistema está calibrado. ¿Puedes leer la señal?");
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [stats, setStats] = useState<SavedStats>(loadStats);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const mode = modeFor(modeId);
  const attemptsLeft = mode.attempts === null ? null : Math.max(mode.attempts - attempts.length, 0);
  const progress = mode.attempts === null ? 0 : Math.min((attempts.length / mode.attempts) * 100, 100);
  const isWin = attempts.some((attempt) => attempt.result === "correct");
  const canPlay = !completed && attemptsLeft !== 0;
  const lastAttempt = attempts[0];

  const accuracy = stats.games ? Math.round((stats.wins / stats.games) * 100) : 0;
  const currentModeLabel = mode.name.toUpperCase();

  useEffect(() => {
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
    setMessage("El sistema está calibrado. ¿Puedes leer la señal?");
  }

  function selectMode(nextMode: ModeId) {
    setModeId(nextMode);
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
      setMessage("Introduce un número entero entre 1 y 100.");
      return;
    }

    if (attempts.some((attempt) => attempt.guess === numericGuess)) {
      setMessage("Ese pulso ya fue registrado. Prueba con otra frecuencia.");
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
      setMessage(`Señal encontrada en ${nextAttempts.length} ${nextAttempts.length === 1 ? "intento" : "intentos"}.`);
      saveResult(true, nextAttempts.length);
      return;
    }

    const outOfAttempts = mode.attempts !== null && nextAttempts.length >= mode.attempts;
    if (outOfAttempts) {
      setCompleted(true);
      setMessage(`Se agotó la señal. El número era ${secret}.`);
      setAttempts((current) => [...current, { id: Date.now() + 1, guess: secret, result: "miss", delta: 0 }]);
      saveResult(false, nextAttempts.length);
      return;
    }

    setMessage(numericGuess < secret ? "La señal está más arriba." : "La señal está más abajo.");
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
      <div className="grid-overlay" />

      <header className="topbar">
        <a className="brand" href="#game" aria-label="Neon Guesser inicio">
          <span className="brand-mark"><Zap size={17} strokeWidth={2.8} /></span>
          <span>
            <strong>NEON</strong>
            <em>GUESSER</em>
          </span>
        </a>
        <div className="topbar-actions">
          <div className={`connection-chip ${isOnline ? "online" : "offline"}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
          </div>
          {installPrompt && (
            <button className="install-button" onClick={installApp} type="button">
              <Download size={15} /> Instalar
            </button>
          )}
        </div>
      </header>

      <main className="main-content" id="game">
        <section className="intro-block reveal-up">
          <div className="eyebrow"><span className="eyebrow-line" /> SISTEMA DE ADIVINANZA // 01</div>
          <h1>Adivina la <span>señal</span>.</h1>
          <p>Un número. Cien posibilidades. Elige tu nivel, sigue las pistas y encuentra la frecuencia correcta.</p>
        </section>

        <section className="mode-strip reveal-up" aria-label="Modos de juego">
          <div className="strip-label"><Gamepad2 size={15} /> MODO DE JUEGO</div>
          <div className="mode-list">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mode-button ${modeId === item.id ? `active ${item.accent}` : ""}`}
                onClick={() => selectMode(item.id)}
              >
                <span className="mode-dot" />
                <span className="mode-copy"><strong>{item.name}</strong><small>{item.subtitle}</small></span>
                {modeId === item.id && <Check size={15} className="mode-check" />}
              </button>
            ))}
          </div>
        </section>

        <div className="workspace">
          <section className={`game-card mode-${mode.accent} reveal-up`}>
            <div className="card-topline">
              <div className="live-label"><span className="live-dot" /> PARTIDA ACTIVA</div>
              <div className="round-label">RND. 0{Math.min(attempts.length + 1, 9)} / 10</div>
            </div>

            <div className="game-card-body">
              <div className="signal-column">
                <div className="signal-label">FRECUENCIA OBJETIVO</div>
                <div className={`signal-number ${isWin ? "found" : ""}`} aria-live="polite">
                  {isWin ? secret : "?"}
                </div>
                <div className="signal-range"><span>01</span><i /><span>100</span></div>
                <p className="signal-hint">
                  <Lightbulb size={15} />
                  {isWin ? "Frecuencia sincronizada." : "El número secreto está entre 1 y 100."}
                </p>
              </div>

              <div className="input-column">
                <div className="input-heading">
                  <div><span className="mini-kicker">INTRODUCE TU</span><h2>Predicción</h2></div>
                  <div className="attempt-counter"><span>{attempts.length.toString().padStart(2, "0")}</span> / {mode.attempts ?? "∞"}</div>
                </div>
                <form onSubmit={handleGuess} className="guess-form">
                  <label htmlFor="guess">Tu número</label>
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
                      <span>ENVIAR</span><ChevronRight size={19} />
                    </button>
                  </div>
                </form>
                <div className={`status-message ${isWin ? "success" : completed ? "failure" : ""}`} aria-live="polite">
                  {isWin ? <CheckCircle2 size={16} /> : completed ? <XCircle size={16} /> : <Sparkles size={16} />}
                  <span>{message}</span>
                </div>
                <div className="progress-area">
                  <div className="progress-meta"><span>ENERGÍA DE INTENTOS</span><strong>{attemptsLeft === null ? "∞" : `${attemptsLeft} restantes`}</strong></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${mode.attempts === null ? 26 : Math.max(progress, 4)}%` }} /></div>
                </div>
              </div>
            </div>

            <div className="game-footer">
              <div><span className="footer-key">MODO</span><strong>{currentModeLabel}</strong></div>
              <div><span className="footer-key">PISTA</span><strong>{lastAttempt ? (lastAttempt.result === "low" ? "MÁS ALTO" : lastAttempt.result === "high" ? "MÁS BAJO" : lastAttempt.result === "correct" ? "ACIERTO" : "—") : "—"}</strong></div>
              <button type="button" onClick={resetGame} className="reset-button"><RotateCcw size={14} /> Reiniciar</button>
            </div>
          </section>

          <aside className="side-column">
            <section className="stats-card reveal-up" aria-label="Estadísticas">
              <div className="section-heading"><div><span className="mini-kicker">PERFIL DE JUEGO</span><h3>Estadísticas</h3></div><BarChart3 size={18} /></div>
              <div className="stat-grid">
                <div className="stat-box"><span>PARTIDAS</span><strong>{stats.games.toString().padStart(2, "0")}</strong><small>TOTAL</small></div>
                <div className="stat-box accent-lime"><span>ACIERTOS</span><strong>{accuracy}<small>%</small></strong><small>PRECISIÓN</small></div>
                <div className="stat-box accent-violet"><span>RACHA</span><strong>{stats.streak.toString().padStart(2, "0")}</strong><small>SEGUIDAS</small></div>
                <div className="stat-box accent-cyan"><span>MEJOR</span><strong>{stats.bestAttempts ?? "—"}<small>{stats.bestAttempts ? " INT." : ""}</small></strong><small>MARCA</small></div>
              </div>
            </section>

            <section className="history-card reveal-up" aria-label="Historial de intentos">
              <div className="section-heading"><div><span className="mini-kicker">TELEMETRÍA EN VIVO</span><h3>Historial</h3></div><History size={18} /></div>
              {recentSignal.length === 0 ? (
                <div className="empty-history"><Target size={22} /><span>Aún no hay pulsos.<br />Tu historial aparecerá aquí.</span></div>
              ) : (
                <div className="history-list">
                  {recentSignal.map((attempt, index) => (
                    <div className={`history-row ${attempt.result}`} key={attempt.id}>
                      <span className="history-index">{(attempts.length - index).toString().padStart(2, "0")}</span>
                      <strong>{attempt.guess.toString().padStart(2, "0")}</strong>
                      <span className="history-direction">{attempt.result === "low" ? <><ArrowUpRight size={14} /> MÁS ALTO</> : attempt.result === "high" ? <><ArrowDownRight size={14} /> MÁS BAJO</> : attempt.result === "correct" ? <><Trophy size={13} /> ¡ACIERTO!</> : "SEÑAL"}</span>
                      <span className="history-delta">{attempt.result === "correct" || attempt.result === "miss" ? "—" : `±${attempt.delta}`}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="history-footer"><span><span className="pulse-dot" /> REGISTRO LOCAL</span><span>{attempts.length} eventos</span></div>
            </section>
          </aside>
        </div>

        <footer className="page-footer reveal-up">
          <span>NEON GUESSER <b>v1.0.0</b></span>
          <span className="footer-center"><Gauge size={14} /> ENTORNO ESTABLE · {isOnline ? "SINCRONIZADO" : "MODO OFFLINE"}</span>
          <span>HECHO PARA QUIENES <b>LEEN ENTRE LÍNEAS</b></span>
        </footer>
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
