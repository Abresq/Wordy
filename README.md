# Wordy

A mobile-first vocabulary learning app that combines translation with spaced repetition. Translate words, build your personal dictionary, and study with flashcards — all in one place.

## Features

- **Translator** — Powered by DeepSeek AI. Translates words and phrases between multiple languages, auto-categorizes them, and generates usage examples.
- **Vocabulary** — Your personal word library. Filter by category or learning status, search across all saved words.
- **Flashcards** — Study mode with spaced repetition. Rate each word (know it / sort of / not at all) and the app prioritizes the ones you struggle with.
- **Stats** — Track your progress. See your learning level, category breakdown, and daily activity over the last 7 days.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- DeepSeek API (translation and categorization)
- localStorage (no backend required)

## Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/Abresq/Wordy.git
cd Wordy
npm install
```

2. Create a `.env` file in the project root:

```
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

3. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. For mobile access on the same network, run `npm run dev -- --host` and open the displayed network URL on your phone.

## Build

```bash
npm run build
npm run preview
```
