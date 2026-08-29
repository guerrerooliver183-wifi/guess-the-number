/* =========================================================
   GUESS THE NUMBER — GAME LOGIC
   ========================================================= */

"use strict";

// ─────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;

// ─────────────────────────────────────────────────────────
// ELEMENTOS DEL DOM
// ─────────────────────────────────────────────────────────

const guessForm = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess-input");
const guessButton = document.querySelector("#guess-button");
const newGameButton = document.querySelector("#new-game-button");

const hint = document.querySelector("#hint");
const attemptsDisplay = document.querySelector("#attempts");
const result = document.querySelector("#result");

// ─────────────────────────────────────────────────────────
// ESTADO DEL JUEGO
// ─────────────────────────────────────────────────────────

let secretNumber = 0;
let attempts = 0;
let gameOver = false;

// ─────────────────────────────────────────────────────────
// NÚMERO ALEATORIO
// ─────────────────────────────────────────────────────────

function generateSecretNumber() {
  return Math.floor(
    Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)
  ) + MIN_NUMBER;
}

// ─────────────────────────────────────────────────────────
// NUEVA PARTIDA
// ─────────────────────────────────────────────────────────

function startNewGame() {
  secretNumber = generateSecretNumber();
  attempts = 0;
  gameOver = false;

  attemptsDisplay.textContent = attempts;

  hint.textContent =
    "Introduce un número para comenzar.";

  result.textContent = "";
  result.className = "result";

  guessInput.value = "";
  guessInput.disabled = false;

  guessButton.disabled = false;

  guessInput.focus();
}

// ─────────────────────────────────────────────────────────
// MOSTRAR RESULTADO
// ─────────────────────────────────────────────────────────

function showResult(message, success = false) {
  result.textContent = message;
  result.className = success
    ? "result success"
    : "result";
}

// ─────────────────────────────────────────────────────────
// COMPROBAR INTENTO
// ─────────────────────────────────────────────────────────

function checkGuess() {
  if (gameOver) {
    return;
  }

  const guess = Number(guessInput.value);

  // Validación
  if (!Number.isInteger(guess)) {
    showResult("⚠️ Introduce un número entero.");
    guessInput.focus();
    return;
  }

  if (
    guess < MIN_NUMBER ||
    guess > MAX_NUMBER
  ) {
    showResult(
      `⚠️ El número debe estar entre ${MIN_NUMBER} y ${MAX_NUMBER}.`
    );

    guessInput.focus();
    return;
  }

  // Contar intento válido
  attempts++;
  attemptsDisplay.textContent = attempts;

  // ───────────────────────────────────────────────────────
  // ACIERTO
  // ───────────────────────────────────────────────────────

  if (guess === secretNumber) {
    gameOver = true;

    hint.textContent =
      "¡Has encontrado el número secreto!";

    showResult(
      `⚡ ¡CORRECTO! Era ${secretNumber}. Lo lograste en ${attempts} ${
        attempts === 1 ? "intento" : "intentos"
      }.`,
      true
    );

    guessInput.disabled = true;
    guessButton.disabled = true;

    return;
  }

  // ───────────────────────────────────────────────────────
  // DEMASIADO BAJO
  // ───────────────────────────────────────────────────────

  if (guess < secretNumber) {
    hint.textContent =
      "⬆️ El número secreto es MÁS ALTO.";

    showResult(
      "Sigue buscando... sube un poco."
    );
  }

  // ───────────────────────────────────────────────────────
  // DEMASIADO ALTO
  // ───────────────────────────────────────────────────────

  if (guess > secretNumber) {
    hint.textContent =
      "⬇️ El número secreto es MÁS BAJO.";

    showResult(
      "Te has pasado... baja un poco."
    );
  }

  // Preparar el siguiente intento
  guessInput.value = "";
  guessInput.focus();
}

// ─────────────────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────────────────

guessForm.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();
    checkGuess();
  }
);

newGameButton.addEventListener(
  "click",
  startNewGame
);

// ─────────────────────────────────────────────────────────
// INICIAR
// ─────────────────────────────────────────────────────────

startNewGame();
