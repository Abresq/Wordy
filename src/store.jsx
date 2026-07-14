import { useState, useEffect, useCallback, useContext, createContext, useRef } from 'react'
import { supabase } from './supabase'

const WordsContext = createContext(null)

export function WordsProvider({ userId, children }) {
  const cache = useRef([])
  const [words, setWords] = useState(cache.current)

  const refetch = useCallback(() => {
    if (!userId) return
    supabase
      .from('words')
      .select('*')
      .eq('user_id', userId)
      .neq('hidden', true)
      .order('added_at', { ascending: false })
      .then(({ data }) => {
        cache.current = data || []
        setWords(cache.current)
      })
  }, [userId])

  useEffect(() => {
    if (!userId) { cache.current = []; setWords([]); return }

    refetch()

    const channel = supabase
      .channel('words-changes-' + userId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'words' }, refetch)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'words' }, refetch)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'words' }, refetch)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId, refetch])

  const setWordsAndCache = useCallback((updater) => {
    setWords(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      cache.current = next
      return next
    })
  }, [])

  return (
    <WordsContext.Provider value={[words, setWordsAndCache, refetch]}>
      {children}
    </WordsContext.Provider>
  )
}

export function useWords() {
  return useContext(WordsContext)
}

export async function saveWord(word, userId) {
  const { data: existing } = await supabase
    .from('words')
    .select('id')
    .eq('user_id', userId)
    .eq('original', word.original)
    .eq('from_lang', word.fromLang)
    .maybeSingle() // busca aunque esté oculta

  if (existing) {
    await supabase.from('words').update({
      translation: word.translation,
      to_lang: word.toLang,
      category: word.category,
      example: word.example,
      example_translation: word.exampleTranslation,
      type: word.type,
      updated_at: new Date().toISOString(),
      hidden: false,
    }).eq('id', existing.id)
  } else {
    await supabase.from('words').insert({
      user_id: userId,
      original: word.original,
      translation: word.translation,
      from_lang: word.fromLang,
      to_lang: word.toLang,
      category: word.category,
      example: word.example,
      example_translation: word.exampleTranslation,
      type: word.type,
      score: 0,
      review_count: 0,
    })
  }
}

export async function updateWordScore(id, delta) {
  const { data: w } = await supabase.from('words').select('score, review_count').eq('id', id).single()
  if (!w) return
  await supabase.from('words').update({
    score: Math.max(-10, Math.min(10, (w.score || 0) + delta)),
    review_count: (w.review_count || 0) + 1,
    last_reviewed: new Date().toISOString(),
  }).eq('id', id)
}

export async function deleteWord(id, setWords) {
  setWords(prev => prev.filter(w => w.id !== id))
  await supabase.from('words').update({ hidden: true }).eq('id', id)
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
