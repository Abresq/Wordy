import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useWords(userId) {
  const [words, setWords] = useState([])

  useEffect(() => {
    if (!userId) { setWords([]); return }

    supabase
      .from('words')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
      .then(({ data }) => setWords(data || []))

    const channel = supabase
      .channel('words-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'words', filter: `user_id=eq.${userId}` }, () => {
        supabase
          .from('words')
          .select('*')
          .eq('user_id', userId)
          .order('added_at', { ascending: false })
          .then(({ data }) => setWords(data || []))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  return words
}

export async function saveWord(word, userId) {
  const { data: existing } = await supabase
    .from('words')
    .select('id')
    .eq('user_id', userId)
    .eq('original', word.original)
    .eq('from_lang', word.fromLang)
    .maybeSingle()

  if (existing) {
    await supabase.from('words').update({
      translation: word.translation,
      to_lang: word.toLang,
      category: word.category,
      example: word.example,
      example_translation: word.exampleTranslation,
      type: word.type,
      updated_at: new Date().toISOString(),
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

export async function deleteWord(id) {
  await supabase.from('words').delete().eq('id', id)
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
