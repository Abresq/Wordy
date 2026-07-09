import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wordy_words'
const EVENT = 'wordy:update'

function read() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function write(words) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function useWords() {
  const [words, setWords] = useState(read)
  useEffect(() => {
    const sync = () => setWords(read())
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])
  return words
}

export function getWords() {
  return read()
}

export function saveWord(word) {
  const words = read()
  const i = words.findIndex(w =>
    w.original.toLowerCase() === word.original.toLowerCase() &&
    w.fromLang === word.fromLang
  )
  if (i >= 0) {
    words[i] = { ...words[i], ...word, updatedAt: Date.now() }
  } else {
    words.unshift({ ...word, id: Date.now(), addedAt: Date.now(), score: 0, reviewCount: 0 })
  }
  write(words)
}

export function updateWordScore(id, delta) {
  const words = read()
  const w = words.find(w => w.id === id)
  if (w) {
    w.score = Math.max(-10, Math.min(10, (w.score || 0) + delta))
    w.reviewCount = (w.reviewCount || 0) + 1
    w.lastReviewed = Date.now()
  }
  write(words)
}

export function deleteWord(id) {
  write(read().filter(w => w.id !== id))
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
