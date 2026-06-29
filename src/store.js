// Persistent storage using localStorage
const STORAGE_KEY = 'wordy_words'

export function getWords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveWord(word) {
  const words = getWords()
  const existing = words.findIndex(w =>
    w.original.toLowerCase() === word.original.toLowerCase() &&
    w.fromLang === word.fromLang
  )
  if (existing >= 0) {
    words[existing] = { ...words[existing], ...word, updatedAt: Date.now() }
  } else {
    words.unshift({ ...word, id: Date.now(), addedAt: Date.now(), score: 0, reviewCount: 0 })
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
  return getWords()
}

export function updateWordScore(id, delta) {
  const words = getWords()
  const w = words.find(w => w.id === id)
  if (w) {
    w.score = Math.max(-10, Math.min(10, (w.score || 0) + delta))
    w.reviewCount = (w.reviewCount || 0) + 1
    w.lastReviewed = Date.now()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
  return getWords()
}

export function deleteWord(id) {
  const words = getWords().filter(w => w.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
  return words
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
