import { useEffect, useMemo, useRef, useState } from "react";
import LegalPage from "./LegalPage";

const AUTO_RESET_SECONDS = 5;
const DEFAULT_DIFFICULTY = "normal";
const HISTORY_STORAGE_KEY = "neon-guesser:game-history";
const STATS_STORAGE_KEY = "neon-guesser:stats";

const DIFFICULTIES = {
  easy: { min: 1, max: 50, maxAttempts: 10, multiplier: 1 },
  normal: { min: 1, max: 100, maxAttempts: 8, multiplier: 2 },
  hard: { min: 1, max: 200, maxAttempts: 7, multiplier: 3 },
};

const DEFAULT_STATS = {
  played: 0,
  wins: 0,
  totalAttempts: 0,
  bestScore: null,
  totalScore: 0,
  currentStreak: 0,
  bestStreak: 0,
};

const translations = {
  es: {
    brand: "NEON GUESSER",
    eyebrow: "NEON // CHALLENGE",
    title: "Adivina el Número",
    description: "He elegido un número entre",
    question: "¿Puedes encontrarlo?",
    ready: "Introduce un número para comenzar.",
    attempts: "Intentos",
    inputLabel: "Tu número",
    guess: "Adivinar",
    inputHelp: "Tienes {maxAttempts} intentos en este nivel.",
    latestAttempts: "Últimos intentos",
    noAttempts: "Aún no hay intentos",
    newGame: "Nueva partida",
    integerError: "Introduce un número entero.",
    rangeError: "El número debe estar entre {min} y {max}.",
    higherHint: "El número secreto es más alto.",
    lowerHint: "El número secreto es más bajo.",
    closeHint: "¡Muy cerca! Ajusta un poco el tiro.",
    higherResult: "Sigue buscando: sube un poco.",
    lowerResult: "Te has pasado: baja un poco.",
    foundHint: "¡Has encontrado el número secreto!",
    lostHint: "Ronda terminada. ¡La próxima es tuya!",
    correctResult: "¡CORRECTO! Era {secret}. Lo lograste en {attempts} {attemptLabel} y sumaste {score} puntos.",
    lostResult: "Se agotaron tus intentos. El número era {secret}.",
    attempt: "intento",
    attemptsPlural: "intentos",
    autoReset: "Nueva partida en {seconds}s",
    autoResetHint: "La siguiente ronda comenzará automáticamente.",
    historyTitle: "Historial de partidas",
    historyEmpty: "Completa una ronda para verla aquí.",
    solvedIn: "Ganada en {attempts} {attemptLabel}",
    lostIn: "Perdida en {attempts} {attemptLabel}",
    games: "partidas",
    best: "Mejor",
    clearHistory: "Borrar historial",
    languageAuto: "Idioma del navegador",
    switchLanguage: "Cambiar a inglés",
    switchLanguageBack: "Cambiar a español",
    offlineReady: "OFFLINE READY",
    difficulty: "Nivel",
    easy: "Fácil",
    normal: "Normal",
    hard: "Difícil",
    statsTitle: "Estadísticas",
    gamesPlayed: "Jugadas",
    wins: "Victorias",
    winRate: "Tasa de acierto",
    average: "Promedio",
    points: "Puntos",
    streak: "Racha",
    bestStreak: "Mejor racha",
    score: "puntos",
    termsTitle: "Términos y condiciones",
    privacyTitle: "Política de privacidad",
    cookiesTitle: "Política de cookies",
    termsLink: "Términos",
    privacyLink: "Privacidad",
    cookiesLink: "Cookies",
  },
  en: {
    brand: "NEON GUESSER",
    eyebrow: "NEON // CHALLENGE",
    title: "Guess the Number",
    description: "I picked a number between",
    question: "Can you find it?",
    ready: "Enter a number to begin.",
    attempts: "Attempts",
    inputLabel: "Your number",
    guess: "Guess",
    inputHelp: "You have {maxAttempts} attempts at this level.",
    latestAttempts: "Latest guesses",
    noAttempts: "No guesses yet",
    newGame: "New game",
    integerError: "Enter a whole number.",
    rangeError: "The number must be between {min} and {max}.",
    higherHint: "The secret number is higher.",
    lowerHint: "The secret number is lower.",
    closeHint: "So close! Adjust your aim a little.",
    higherResult: "Keep searching: go higher.",
    lowerResult: "Too high: bring it down.",
    foundHint: "You found the secret number!",
    lostHint: "Round over. You will get it next time!",
    correctResult: "CORRECT! It was {secret}. You got it in {attempts} {attemptLabel} and scored {score} points.",
    lostResult: "No attempts left. The number was {secret}.",
    attempt: "attempt",
    attemptsPlural: "attempts",
    autoReset: "New game in {seconds}s",
    autoResetHint: "The next round will begin automatically.",
    historyTitle: "Game history",
    historyEmpty: "Complete a round to see it here.",
    solvedIn: "Won in {attempts} {attemptLabel}",
    lostIn: "Lost in {attempts} {attemptLabel}",
    games: "games",
    best: "Best",
    clearHistory: "Clear history",
    languageAuto: "Browser language",
    switchLanguage: "Switch to Spanish",
    switchLanguageBack: "Switch to English",
    offlineReady: "OFFLINE READY",
    difficulty: "Difficulty",
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    statsTitle: "Statistics",
    gamesPlayed: "Played",
    wins: "Wins",
    winRate: "Win rate",
    average: "Average",
    points: "Points",
    streak: "Streak",
    bestStreak: "Best streak",
    score: "points",
    termsTitle: "Terms and conditions",
    privacyTitle: "Privacy policy",
    cookiesTitle: "Cookie policy",
    termsLink: "Terms",
    privacyLink: "Privacy",
    cookiesLink: "Cookies",
  },
};

function getBrowserLanguage() {
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return browserLanguages.some((language) => language?.toLowerCase().startsWith("es")) ? "es" : "en";
}

function loadHistory() {
  try {
    const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];
    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // The game remains usable when storage is disabled or unavailable.
  }
}

function loadStats() {
  try {
    const savedStats = window.localStorage.getItem(STATS_STORAGE_KEY);
    const parsedStats = savedStats ? JSON.parse(savedStats) : {};
    return { ...DEFAULT_STATS, ...parsedStats };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveStats(stats) {
  try {
    window.localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // The game remains usable when storage is disabled or unavailable.
  }
}

function getLegalPageFromHash() {
  const page = window.location.hash.replace(/^#\//, "");
  return ["terms", "privacy", "cookies"].includes(page) ? page : null;
}

function createSecretNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createHistoryId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function calculateScore(attempts, settings) {
  return Math.max(10, (settings.maxAttempts - attempts + 1) * 25 * settings.multiplier);
}

function App() {
  const inputRef = useRef(null);
  const [language, setLanguage] = useState(getBrowserLanguage);
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const settings = DIFFICULTIES[difficulty];
  const [secretNumber, setSecretNumber] = useState(() => createSecretNumber(settings.min, settings.max));
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [currentGuesses, setCurrentGuesses] = useState([]);
  const [hintState, setHintState] = useState({ key: "ready" });
  const [resultState, setResultState] = useState({ key: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [autoResetIn, setAutoResetIn] = useState(null);
  const [currentPage, setCurrentPage] = useState(getLegalPageFromHash);
  const [gameHistory, setGameHistory] = useState(loadHistory);
  const [stats, setStats] = useState(loadStats);

  const translate = (key, values = {}) => {
    if (!key) return "";
    const template = translations[language][key] ?? translations.en[key] ?? key;
    return Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, String(value)), template);
  };

  const attemptLabel = (value) => translate(value === 1 ? "attempt" : "attemptsPlural");
  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  const averageAttempts = stats.wins ? (stats.totalAttempts / stats.wins).toFixed(1) : "—";
  const bestAttempts = useMemo(() => {
    const wins = gameHistory.filter((game) => game.won !== false);
    return wins.length ? Math.min(...wins.map((game) => game.attempts)) : "—";
  }, [gameHistory]);

  useEffect(() => {
    document.documentElement.lang = language;
    const pageTitle = currentPage ? translations[language][`${currentPage}Title`] : translations[language].title;
    document.title = `${pageTitle} — ${translations[language].brand}`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", language === "es"
      ? "Neon Guesser: un juego cyberpunk bilingüe para adivinar el número secreto."
      : "Neon Guesser: a bilingual cyberpunk game to guess the secret number.");
  }, [language, currentPage]);

  useEffect(() => {
    const updatePage = () => setCurrentPage(getLegalPageFromHash());
    const toggleLanguage = () => setLanguage((currentLanguage) => (currentLanguage === "es" ? "en" : "es"));
    window.addEventListener("hashchange", updatePage);
    window.addEventListener("neon-guesser:toggle-language", toggleLanguage);
    return () => {
      window.removeEventListener("hashchange", updatePage);
      window.removeEventListener("neon-guesser:toggle-language", toggleLanguage);
    };
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (autoResetIn === null) return undefined;
    if (autoResetIn === 0) {
      startNewGame();
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setAutoResetIn((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [autoResetIn]);

  function startNewGame(nextDifficulty = difficulty) {
    const nextSettings = DIFFICULTIES[nextDifficulty];
    setSecretNumber(createSecretNumber(nextSettings.min, nextSettings.max));
    setGuess("");
    setAttempts(0);
    setCurrentGuesses([]);
    setHintState({ key: "ready" });
    setResultState({ key: "" });
    setIsSuccess(false);
    setIsGameOver(false);
    setAutoResetIn(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function changeDifficulty(nextDifficulty) {
    setDifficulty(nextDifficulty);
    startNewGame(nextDifficulty);
  }

  function recordCompletedGame({ won, nextAttempts, score }) {
    const finishedGame = {
      id: createHistoryId(),
      attempts: nextAttempts,
      secretNumber,
      difficulty,
      won,
      score,
      timestamp: Date.now(),
    };
    const nextHistory = [finishedGame, ...gameHistory].slice(0, 12);
    setGameHistory(nextHistory);
    saveHistory(nextHistory);

    setStats((previousStats) => {
      const nextStreak = won ? previousStats.currentStreak + 1 : 0;
      const nextStats = {
        ...previousStats,
        played: previousStats.played + 1,
        wins: previousStats.wins + (won ? 1 : 0),
        totalAttempts: previousStats.totalAttempts + nextAttempts,
        bestScore: won && (previousStats.bestScore === null || score > previousStats.bestScore)
          ? score
          : previousStats.bestScore,
        totalScore: previousStats.totalScore + score,
        currentStreak: nextStreak,
        bestStreak: Math.max(previousStats.bestStreak, nextStreak),
      };
      saveStats(nextStats);
      return nextStats;
    });
  }

  function checkGuess(event) {
    event.preventDefault();
    if (isGameOver) return;

    const value = Number(guess);
    if (!guess.trim() || !Number.isInteger(value)) {
      setResultState({ key: "integerError" });
      inputRef.current?.focus();
      return;
    }

    if (value < settings.min || value > settings.max) {
      setResultState({ key: "rangeError", values: { min: settings.min, max: settings.max } });
      inputRef.current?.focus();
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setCurrentGuesses((previousGuesses) => [value, ...previousGuesses].slice(0, 6));

    if (value === secretNumber) {
      const score = calculateScore(nextAttempts, settings);
      recordCompletedGame({ won: true, nextAttempts, score });
      setIsSuccess(true);
      setIsGameOver(true);
      setHintState({ key: "foundHint" });
      setResultState({ key: "correctResult", values: { secret: secretNumber, attempts: nextAttempts, attemptLabel: attemptLabel(nextAttempts), score } });
      setAutoResetIn(AUTO_RESET_SECONDS);
      return;
    }

    if (nextAttempts >= settings.maxAttempts) {
      recordCompletedGame({ won: false, nextAttempts, score: 0 });
      setIsGameOver(true);
      setHintState({ key: "lostHint" });
      setResultState({ key: "lostResult", values: { secret: secretNumber } });
      setAutoResetIn(AUTO_RESET_SECONDS);
      return;
    }

    const closeDistance = Math.max(3, Math.round((settings.max - settings.min) * 0.08));
    if (Math.abs(value - secretNumber) <= closeDistance) {
      setHintState({ key: "closeHint" });
      setResultState({ key: "" });
    } else if (value < secretNumber) {
      setHintState({ key: "higherHint" });
      setResultState({ key: "higherResult" });
    } else {
      setHintState({ key: "lowerHint" });
      setResultState({ key: "lowerResult" });
    }

    setGuess("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function clearHistory() {
    setGameHistory([]);
    saveHistory([]);
  }

  const hintText = translate(hintState.key, hintState.values);
  const resultText = translate(resultState.key, resultState.values);

  if (currentPage) {
    return <LegalPage type={currentPage} language={language} onBack={() => { window.location.hash = ""; }} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <img className="brand-icon" src="/guess-the-number/icons/icon-192.png" alt="" />
          <span>{translate("brand")}</span>
        </div>
        <button
          type="button"
          className="language-switch"
          onClick={() => setLanguage((currentLanguage) => (currentLanguage === "es" ? "en" : "es"))}
          aria-label={language === "es" ? translate("switchLanguage") : translate("switchLanguageBack")}
          title={translate("languageAuto")}
        >
          <span>{language.toUpperCase()}</span>
          <span className="language-dot" aria-hidden="true">/</span>
          <span>{language === "es" ? "EN" : "ES"}</span>
        </button>
      </header>

      <main className="game-container">
        <section className={`game-card ${isSuccess ? "is-success" : ""}`} aria-labelledby="game-title">
          <div className="scan-line" aria-hidden="true" />
          <div className="neon-icon" aria-hidden="true">?</div>
          <p className="eyebrow">{translate("eyebrow")}</p>
          <h1 id="game-title">{translate("title")}</h1>
          <p className="instructions">
            {translate("description")} <strong>{settings.min} — {settings.max}</strong>. {translate("question")}
          </p>

          <div className="difficulty-picker" role="group" aria-label={translate("difficulty")}>
            <span className="difficulty-label">{translate("difficulty")}</span>
            <div className="difficulty-options">
              {Object.keys(DIFFICULTIES).map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`difficulty-button ${difficulty === level ? "is-active" : ""}`}
                  onClick={() => changeDifficulty(level)}
                  aria-pressed={difficulty === level}
                >
                  {translate(level)}
                </button>
              ))}
            </div>
          </div>

          <div className="game-status">
            <p className="hint" aria-live="polite">{hintText}</p>
            <div className="score-row" aria-label={`${translate("attempts")}: ${attempts}`}>
              <span>{translate("attempts")}</span>
              <strong>{String(attempts).padStart(2, "0")} / {String(settings.maxAttempts).padStart(2, "0")}</strong>
            </div>
          </div>

          <form onSubmit={checkGuess}>
            <label htmlFor="guess-input">{translate("inputLabel")}</label>
            <div className="input-group">
              <input
                ref={inputRef}
                id="guess-input"
                name="guess"
                type="number"
                min={settings.min}
                max={settings.max}
                inputMode="numeric"
                autoComplete="off"
                placeholder="00"
                value={guess}
                onChange={(event) => setGuess(event.target.value)}
                disabled={isGameOver}
                aria-describedby="input-help"
                required
              />
              <button type="submit" className="primary-button" disabled={isGameOver}>{translate("guess")}</button>
            </div>
            <small id="input-help">{translate("inputHelp", { maxAttempts: settings.maxAttempts })}</small>
          </form>

          <div className="latest-guesses" aria-live="polite">
            <span>{translate("latestAttempts")}</span>
            <div className="guess-list">
              {currentGuesses.length
                ? currentGuesses.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)
                : <span className="empty-chip">{translate("noAttempts")}</span>}
            </div>
          </div>

          <p className={`result ${isSuccess ? "success" : ""}`} aria-live="assertive" role="status">
            {resultText || " "}
          </p>

          {autoResetIn !== null && (
            <div className="auto-reset" role="status" aria-live="polite">
              <span className="timer-ring">{autoResetIn}</span>
              <span><strong>{translate("autoReset", { seconds: autoResetIn })}</strong><small>{translate("autoResetHint")}</small></span>
            </div>
          )}

          <button type="button" className="secondary-button" onClick={startNewGame}>{translate("newGame")}</button>
        </section>

        <aside className="history-panel" aria-labelledby="history-title">
          <section className="stats-section" aria-labelledby="stats-title">
            <div className="panel-heading stats-heading">
              <div>
                <p className="panel-kicker">01 // STATS</p>
                <h2 id="stats-title">{translate("statsTitle")}</h2>
              </div>
              <div className="streak-badge"><strong>{stats.currentStreak}</strong><span>{translate("streak")}</span></div>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><strong>{stats.played}</strong><span>{translate("gamesPlayed")}</span></div>
              <div className="stat-card"><strong>{stats.wins}</strong><span>{translate("wins")}</span></div>
              <div className="stat-card"><strong>{winRate}%</strong><span>{translate("winRate")}</span></div>
              <div className="stat-card"><strong>{averageAttempts}</strong><span>{translate("average")}</span></div>
              <div className="stat-card"><strong>{stats.bestScore ?? "—"}</strong><span>{translate("points")}</span></div>
              <div className="stat-card"><strong>{stats.bestStreak}</strong><span>{translate("bestStreak")}</span></div>
            </div>
          </section>

          <section className="history-section" aria-labelledby="history-title">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">02 // LOG</p>
                <h2 id="history-title">{translate("historyTitle")}</h2>
              </div>
              <div className="history-stats">
                <span><strong>{gameHistory.length}</strong> {translate("games")}</span>
                <span><strong>{bestAttempts}</strong> {translate("best")}</span>
              </div>
            </div>
            {gameHistory.length ? (
              <ol className="history-list">
                {gameHistory.map((game, index) => (
                  <li key={game.id ?? `${game.timestamp}-${index}`} className={`history-item ${game.won === false ? "is-loss" : ""}`} style={{ "--item-delay": `${index * 45}ms` }}>
                    <span className="history-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="history-detail">
                      <strong>{game.won === false
                        ? translate("lostIn", { attempts: game.attempts, attemptLabel: attemptLabel(game.attempts) })
                        : translate("solvedIn", { attempts: game.attempts, attemptLabel: attemptLabel(game.attempts) })}</strong>
                      <small>{new Intl.DateTimeFormat(language, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(game.timestamp)}</small>
                    </span>
                    <span className="history-secret">{String(game.secretNumber).padStart(2, "0")}</span>
                  </li>
                ))}
              </ol>
            ) : <p className="history-empty">{translate("historyEmpty")}</p>}
            {gameHistory.length > 0 && <button type="button" className="clear-button" onClick={clearHistory}>{translate("clearHistory")}</button>}
          </section>
        </aside>
      </main>

      <footer>
        <div className="footer-brand"><span>{translate("brand")}</span><span aria-hidden="true">•</span><span>{translate("offlineReady")}</span></div>
        <nav className="footer-links" aria-label={language === "es" ? "Enlaces legales" : "Legal links"}>
          <a href="#/terms">{translate("termsLink")}</a>
          <a href="#/privacy">{translate("privacyLink")}</a>
          <a href="#/cookies">{translate("cookiesLink")}</a>
        </nav>
      </footer>
    </div>
  );
}

export default App;
