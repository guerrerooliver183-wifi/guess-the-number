import { useEffect, useRef, useState } from "react";

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;

function createSecretNumber() {
  return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
}

function App() {
  const inputRef = useRef(null);
  const [secretNumber, setSecretNumber] = useState(createSecretNumber);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState([]);
  const [hint, setHint] = useState("Introduce un número para comenzar.");
  const [result, setResult] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function startNewGame() {
    setSecretNumber(createSecretNumber());
    setGuess("");
    setAttempts(0);
    setHistory([]);
    setHint("Introduce un número para comenzar.");
    setResult("");
    setIsSuccess(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function checkGuess(event) {
    event.preventDefault();
    if (isSuccess) return;

    const value = Number(guess);
    if (!Number.isInteger(value)) {
      setResult("Introduce un número entero.");
      inputRef.current?.focus();
      return;
    }

    if (value < MIN_NUMBER || value > MAX_NUMBER) {
      setResult(`El número debe estar entre ${MIN_NUMBER} y ${MAX_NUMBER}.`);
      inputRef.current?.focus();
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setHistory((current) => [value, ...current].slice(0, 5));

    if (value === secretNumber) {
      setIsSuccess(true);
      setHint("¡Has encontrado el número secreto!");
      setResult(`¡CORRECTO! Era ${secretNumber}. Lo lograste en ${nextAttempts} ${nextAttempts === 1 ? "intento" : "intentos"}.`);
      return;
    }

    if (value < secretNumber) {
      setHint("El número secreto es más alto.");
      setResult("Sigue buscando: sube un poco.");
    } else {
      setHint("El número secreto es más bajo.");
      setResult("Te has pasado: baja un poco.");
    }

    setGuess("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <>
      <main className="game-container">
        <section className={`game-card ${isSuccess ? "is-success" : ""}`} aria-labelledby="game-title">
          <div className="neon-icon" aria-hidden="true">?</div>
          <p className="eyebrow">NEON // CHALLENGE</p>
          <h1 id="game-title">Adivina el Número</h1>
          <p className="instructions">
            He elegido un número entre <strong>{MIN_NUMBER} y {MAX_NUMBER}</strong>. ¿Puedes encontrarlo?
          </p>

          <div className="game-status">
            <p className="hint" aria-live="polite">{hint}</p>
            <div className="score-row" aria-label={`${attempts} intentos realizados`}>
              <span>Intentos</span>
              <strong>{String(attempts).padStart(2, "0")}</strong>
            </div>
          </div>

          <form onSubmit={checkGuess}>
            <label htmlFor="guess-input">Tu número</label>
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
              <button type="submit" className="primary-button" disabled={isSuccess}>Adivinar</button>
            </div>
            <small id="input-help">Escribe un número entre {MIN_NUMBER} y {MAX_NUMBER}.</small>
          </form>

          <div className="history" aria-live="polite">
            <span>Últimos intentos</span>
            <div className="history-list">
              {history.length ? history.map((item, index) => <span key={`${item}-${index}`}>{item}</span>) : <span className="history-empty">—</span>}
            </div>
          </div>

          <p className={`result ${isSuccess ? "success" : ""}`} aria-live="assertive" role="status">
            {result || " "}
          </p>

          <button type="button" className="secondary-button" onClick={startNewGame}>Nueva partida</button>
        </section>
      </main>
      <footer><span>NEON NUMBER</span><span aria-hidden="true">•</span><span>OFFLINE READY</span></footer>
    </>
  );
}

export default App;
