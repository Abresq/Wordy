import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wordy_words'

// Module-level state shared across all components
let _words = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
})()

const subscribers = new Set()

function notify() {
  subscribers.forEach(fn => fn([..._words]))
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(_words))
}

// Hook — any component using this re-renders automatically when words change
export function useWords() {
  const [words, setWords] = useState(() => [..._words])
  useEffect(() => {
    subscribers.add(setWords)
    return () => subscribers.delete(setWords)
  }, [])
  return words
}

// Plain getter for non-reactive reads (stats calculations, etc.)
export function getWords() {
  return [..._words]
}

export function saveWord(word) {
  const existing = _words.findIndex(w =>
    w.original.toLowerCase() === word.original.toLowerCase() &&
    w.fromLang === word.fromLang
  )
  if (existing >= 0) {
    _words[existing] = { ..._words[existing], ...word, updatedAt: Date.now() }
  } else {
    _words.unshift({ ...word, id: Date.now(), addedAt: Date.now(), score: 0, reviewCount: 0 })
  }
  persist()
  notify()
}

export function updateWordScore(id, delta) {
  const w = _words.find(w => w.id === id)
  if (w) {
    w.score = Math.max(-10, Math.min(10, (w.score || 0) + delta))
    w.reviewCount = (w.reviewCount || 0) + 1
    w.lastReviewed = Date.now()
  }
  persist()
  notify()
}

export function deleteWord(id) {
  _words = _words.filter(w => w.id !== id)
  persist()
  notify()
}

export function getStats(words) {
  const total = words.length
  const byCategory = {}
  const scoreGroups = { known: 0, learning: 0, new: 0 }

  words.forEach(w => {
    const cat = w.category || 'Sin categoría'
    byCategory[cat] = (byCategory[cat] || 0) + 1
    if (w.score >= 3) scoreGroups.known++
    else if (w.score >= 0) scoreGroups.learning++
    else scoreGroups.new++
  })

  const levelPercent = total === 0 ? 0 : Math.round((scoreGroups.known / total) * 100)
  return { total, byCategory, scoreGroups, levelPercent }
}
