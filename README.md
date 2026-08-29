# Neon Guesser

A fast, cyberpunk-inspired number guessing game built with React and Vite. Pick a difficulty, find the hidden number, and build your winning streak.

**Play online:** [Neon Guesser on GitHub Pages](http://guerrerooliver183-wifi.github.io/guess-the-number/)

## Features

- Three game modes:
  - **Easy:** numbers from 1 to 50 with 10 attempts
  - **Normal:** numbers from 1 to 100 with 8 attempts
  - **Hard:** numbers from 1 to 200 with 7 attempts
- Score system based on difficulty and remaining attempts
- Live hints when the secret number is higher, lower, or very close
- Persistent statistics stored in the browser:
  - Games played and wins
  - Win rate and average attempts
  - Total points and best score
  - Current and best winning streak
- Local game history with the secret number and result of each round
- English and Spanish interface
- Responsive neon/cyberpunk design
- Progressive Web App support with offline-ready gameplay
- Informational pages for terms, privacy, and cookies

## How to play

1. Choose a difficulty level.
2. Enter a whole number within the displayed range.
3. Use the hints to narrow down the secret number.
4. Win with as few attempts as possible to earn more points.
5. Start a new round and try to beat your streak.

All game logic runs in the browser. No account is required, and game history and statistics stay in your browser's local storage.

## Run locally

### Requirements

- Node.js 20 or later
- npm

### Setup

```bash
git clone https://github.com/guerrerooliver183-wifi/guess-the-number.git
cd guess-the-number
npm ci
npm run dev
```

Open the local URL shown by Vite in your browser.

## Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build locally
npm run check    # Validate the production build
```

## Deployment

The project is deployed to GitHub Pages through the workflow in `.github/workflows/deploy.yml`. Every push to `main` builds the app and publishes the contents of `dist`.

## Tech stack

- React
- Vite
- JavaScript
- CSS
- GitHub Pages

## License

This project is distributed under the [Boost Software License 1.0](LICENSE).
