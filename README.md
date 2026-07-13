# Wordy

A mobile-first vocabulary learning app that combines AI translation with spaced repetition. Translate words, build your personal dictionary, and study with flashcards - all in one place.

## Features

- **Traductor** - Powered by DeepSeek AI. Translates words and phrases between multiple languages, auto-categorizes them, generates usage examples, and corrects spelling before saving.
- **Vocabulario** - Your personal word library. Filter by category or learning status, search across all saved words. Deleted words are soft-deleted so the translation cache is preserved for other users.
- **Estudio** - Flashcard study mode with spaced repetition. Rate each word (know it / sort of / not at all) and the app prioritizes the ones you struggle with. Session results include a visual breakdown chart.
- **Perfil** - Track your progress. See your learning level, category breakdown, and daily activity over the last 7 days.

## Stack

- React 19 + Vite 6
- Tailwind CSS v4
- React Router v7
- Supabase (Auth + Postgres)
- DeepSeek API (translation, categorization, spell correction)
- PWA (installable, offline-ready via Workbox)
