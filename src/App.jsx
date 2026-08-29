import { useEffect, useMemo, useRef, useState } from "react";

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const AUTO_RESET_SECONDS = 5;
const HISTORY_STORAGE_KEY = "neon-guesser:game-history";

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
    inputHelp: "Escribe un número entre 1 y 100.",
    latestAttempts: "Últimos intentos",
    noAttempts: "Aún no hay intentos",
    newGame: "Nueva partida",
    integerError: "Introduce un número entero.",
    rangeError: "El número debe estar entre 1 y 100.",
    higherHint: "El número secreto es más alto.",
    lowerHint: "El número secreto es más bajo.",
    higherResult: "Sigue buscando: sube un poco.",
    lowerResult: "Te has pasado: baja un poco.",
    foundHint: "¡Has encontrado el número secreto!",
    correctResult: "¡CORRECTO! Era {secret}. Lo lograste en {attempts} {attemptLabel}.",
    attempt: "intento",
    attemptsPlural: "intentos",
    autoReset: "Nueva partida en {seconds}s",
    autoResetHint: "La siguiente ronda comenzará automáticamente.",
    historyTitle: "Historial de partidas",
    historyEmpty: "Completa una ronda para verla aquí.",
    solvedIn: "Resuelta en {attempts} {attemptLabel}",
    games: "partidas",
    best: "Mejor",
    clearHistory: "Borrar historial",
    languageAuto: "Idioma del navegador",
    switchLanguage: "Cambiar a inglés",
    switchLanguageBack: "Cambiar a español",
    offlineReady: "OFFLINE READY",
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
    inputHelp: "Enter a number between 1 and 100.",
    latestAttempts: "Latest guesses",
    noAttempts: "No guesses yet",
    newGame: "New game",
    integerError: "Enter a whole number.",
    rangeError: "The number must be between 1 and 100.",
    higherHint: "The secret number is higher.",
    lowerHint: "The secret number is lower.",
    higherResult: "Keep searching: go higher.",
    lowerResult: "Too high: bring it down.",
    foundHint: "You found the secret number!",
    correctResult: "CORRECT! It was {secret}. You got it in {attempts} {attemptLabel}.",
    attempt: "attempt",
    attemptsPlural: "attempts",
    autoReset: "New game in {seconds}s",
    autoResetHint: "The next round will begin automatically.",
    historyTitle: "Game history",
    historyEmpty: "Complete a round to see it here.",
    solvedIn: "Solved in {attempts} {attemptLabel}",
    games: "games",
    best: "Best",
    clearHistory: "Clear history",
    languageAuto: "Browser language",
    switchLanguage: "Switch to Spanish",
    switchLanguageBack: "Switch to English",
    offlineReady: "OFFLINE READY",
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

function createSecretNumber() {
  return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
}

function createHistoryId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function App() {
  const inputRef = useRef(null);
  const [language, setLanguage] = useState(getBrowserLanguage);
  const [secretNumber, setSecretNumber] = useState(createSecretNumber);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [currentGuesses, setCurrentGuesses] = useState([]);
  const [hintState, setHintState] = useState({ key: "ready" });
  const [resultState, setResultState] = useState({ key: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const [autoResetIn, setAutoResetIn] = useState(null);
  const [gameHistory, setGameHistory] = useState(loadHistory);

  const translate = (key, values = {}) => {
    if (!key) return "";
    const template = translations[language][key] ?? translations.en[key] ?? key;
    return Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, String(value)), template);
  };

  const attemptLabel = (value) => translate(value === 1 ? "attempt" : "attemptsPlural");

  const bestScore = useMemo(() => {
    if (!gameHistory.length) return "—";
    return Math.min(...gameHistory.map((game) => game.attempts));
  }, [gameHistory]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${translations[language].brand} — ${translations[language].title}`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", language === "es"
      ? "Neon Guesser: un juego cyberpunk bilingüe para adivinar el número secreto."
      : "Neon Guesser: a bilingual cyberpunk game to guess the secret number.");
  }, [language]);

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

  function startNewGame() {
    setSecretNumber(createSecretNumber());
    setGuess("");
    setAttempts(0);
    setCurrentGuesses([]);
    setHintState({ key: "ready" });
    setResultState({ key: "" });
    setIsSuccess(false);
    setAutoResetIn(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function checkGuess(event) {
    event.preventDefault();
    if (isSuccess) return;

    const value = Number(guess);
    if (!guess.trim() || !Number.isInteger(value)) {
      setResultState({ key: "integerError" });
      inputRef.current?.focus();
      return;
    }

    if (value < MIN_NUMBER || value > MAX_NUMBER) {
      setResultState({ key: "rangeError" });
      inputRef.current?.focus();
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setCurrentGuesses((previousGuesses) => [value, ...previousGuesses].slice(0, 6));

    if (value === secretNumber) {
      const finishedGame = {
        id: createHistoryId(),
        attempts: nextAttempts,
        secretNumber,
        timestamp: Date.now(),
      };
      const nextHistory = [finishedGame, ...gameHistory].slice(0, 12);
      setGameHistory(nextHistory);
      saveHistory(nextHistory);
      setIsSuccess(true);
      setHintState({ key: "foundHint" });
      setResultState({ key: "correctResult", values: { secret: secretNumber, attempts: nextAttempts, attemptLabel: attemptLabel(nextAttempts) } });
      setAutoResetIn(AUTO_RESET_SECONDS);
      return;
    }

    if (value < secretNumber) {
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
            {translate("description")} <strong>{MIN_NUMBER} — {MAX_NUMBER}</strong>. {translate("question")}
          </p>

          <div className="game-status">
            <p className="hint" aria-live="polite">{hintText}</p>
            <div className="score-row" aria-label={`${translate("attempts")}: ${attempts}`}>
              <span>{translate("attempts")}</span>
              <strong>{String(attempts).padStart(2, "0")}</strong>
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
                min={MIN_NUMBER}
                max={MAX_NUMBER}
                inputMode="numeric"
                autoComplete="off"
                placeholder="00"
                value={guess}
                onChange={(event) => setGuess(event.target.value)}
                disabled={isSuccess}
                aria-describedby="input-help"
                required
              />
              <button type="submit" className="primary-button" disabled={isSuccess}>{translate("guess")}</button>
            </div>
            <small id="input-help">{translate("inputHelp")}</small>
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
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">01 // LOG</p>
              <h2 id="history-title">{translate("historyTitle")}</h2>
            </div>
            <div className="history-stats">
              <span><strong>{gameHistory.length}</strong> {translate("games")}</span>
              <span><strong>{bestScore}</strong> {translate("best")}</span>
            </div>
          </div>
          {gameHistory.length ? (
            <ol className="history-list">
              {gameHistory.map((game, index) => (
                <li key={game.id} className="history-item" style={{ "--item-delay": `${index * 45}ms` }}>
                  <span className="history-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="history-detail">
                    <strong>{translate("solvedIn", { attempts: game.attempts, attemptLabel: attemptLabel(game.attempts) })}</strong>
                    <small>{new Intl.DateTimeFormat(language, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(game.timestamp)}</small>
                  </span>
                  <span className="history-secret">{String(game.secretNumber).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          ) : <p className="history-empty">{translate("historyEmpty")}</p>}
          {gameHistory.length > 0 && <button type="button" className="clear-button" onClick={clearHistory}>{translate("clearHistory")}</button>}
        </aside>
      </main>

      <footer>
        <span>{translate("brand")}</span><span aria-hidden="true">•</span><span>{translate("offlineReady")}</span>
      </footer>
    </div>
  );
}

export default App;
