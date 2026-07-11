import { useState, useEffect } from 'react'
import { RotateCw, ThumbsUp, Minus, ThumbsDown, CheckCircle2, GalleryHorizontal } from 'lucide-react'
import { useWords, updateWordScore } from '../store'
import { useTheme } from '../theme.jsx'
import { useAuth } from '../auth.jsx'

const CATEGORY_COLORS = {
  'General': '#6366f1', 'Comida': '#f97316', 'Viajes': '#0ea5e9',
  'Trabajo': '#8b5cf6', 'Familia': '#ec4899', 'Naturaleza': '#22c55e',
  'Tecnología': '#14b8a6', 'Salud': '#ef4444', 'Ropa': '#f59e0b',
  'Casa': '#84cc16', 'Tiempo': '#64748b', 'Emociones': '#d946ef',
  'Animales': '#fb923c', 'Deportes': '#3b82f6', 'Arte': '#a855f7',
  'Educación': '#06b6d4', 'Negocios': '#10b981',
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
function smartSort(words) { return shuffle(words).sort((a, b) => (a.score || 0) - (b.score || 0)) }

export default function Flashcards() {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [sessionResults, setSessionResults] = useState({ known: 0, learning: 0, unknown: 0 })

  const allWords = useWords(user?.id)

  useEffect(() => { if (allWords.length > 0 && deck.length === 0) loadDeck(allWords) }, [allWords])

  function loadDeck(words = allWords) {
    if (!words.length) { setDeck([]); return }
    setDeck(smartSort(words))
    setIndex(0)
    setFlipped(false)
    setDone(false)
    setSessionResults({ known: 0, learning: 0, unknown: 0 })
  }

  function handleRate(rating) {
    const delta = rating === 'known' ? 2 : rating === 'learning' ? 1 : -1
    updateWordScore(deck[index].id, delta)
    setSessionResults(prev => ({ ...prev, [rating]: prev[rating] + 1 }))
    const next = index + 1
    if (next >= deck.length) setDone(true)
    else { setIndex(next); setFlipped(false) }
  }

  const card = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
  const subtext = isDark ? 'text-zinc-500' : 'text-zinc-400'
  const text = isDark ? 'text-white' : 'text-zinc-900'
  const muted = isDark ? 'text-zinc-300' : 'text-zinc-600'
  const innerCard = isDark ? 'bg-zinc-800' : 'bg-zinc-50 border border-zinc-100'

  if (deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 gap-4 text-center">
        <p className="text-6xl">🃏</p>
        <p className={`text-xl font-bold ${text}`}>Sin flashcards</p>
        <p className={`text-sm ${subtext}`}>Guarda palabras en el traductor<br />para estudiarlas aquí.</p>
      </div>
    )
  }

  if (done) {
    const total = sessionResults.known + sessionResults.learning + sessionResults.unknown
    const pctKnown = Math.round((sessionResults.known / total) * 100)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 gap-6 text-center max-w-sm mx-auto">
        <div>
          <CheckCircle2 size={56} className="text-green-400 mx-auto mb-3" />
          <p className={`text-2xl font-bold ${text}`}>¡Sesión completada!</p>
          <p className={`text-sm mt-1 ${subtext}`}>{total} palabras repasadas · {pctKnown}% dominaste</p>
        </div>
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { key: 'known', label: 'Me la sé', color: '#22c55e', emoji: '✅' },
            { key: 'learning', label: 'Más o menos', color: '#f59e0b', emoji: '🤔' },
            { key: 'unknown', label: 'Para nada', color: '#ef4444', emoji: '❌' },
          ].map(({ key, label, color, emoji }) => (
            <div key={key} className={`rounded-2xl border p-3 text-center ${card}`}>
              <p className="text-xl">{emoji}</p>
              <p className="text-2xl font-bold mt-1" style={{ color }}>{sessionResults[key]}</p>
              <p className={`text-[10px] mt-0.5 ${subtext}`}>{label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={loadDeck}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm"
        >
          <RotateCw size={16} /> Otra ronda
        </button>
      </div>
    )
  }

  const cardData = deck[index]
  const catColor = CATEGORY_COLORS[cardData.category] || '#6366f1'
  const progress = (index / deck.length) * 100

  return (
    <div className="flex flex-col gap-4 p-4 pb-28 max-w-lg mx-auto">
      <div className="pt-6 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GalleryHorizontal size={22} className="text-violet-400" />
            <h1 className={`text-2xl font-bold ${text}`}>Flashcards</h1>
          </div>
          <span className={`text-sm font-medium ${subtext}`}>{index + 1} / {deck.length}</span>
        </div>
        <div className={`rounded-full h-2 mt-3 overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Session mini stats */}
      <div className="flex gap-2">
        {[
          { key: 'known', color: '#22c55e', emoji: '✅' },
          { key: 'learning', color: '#f59e0b', emoji: '🤔' },
          { key: 'unknown', color: '#ef4444', emoji: '❌' },
        ].map(({ key, color, emoji }) => (
          <div key={key} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-bold ${card}`} style={{ color }}>
            {emoji} {sessionResults[key]}
          </div>
        ))}
      </div>

      {/* Card */}
      <div
        className={`rounded-3xl border p-6 min-h-[280px] flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform ${card}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: catColor + '25', color: catColor }}>
            {cardData.category}
          </span>
          <span className={`text-xs ${subtext}`}>{cardData.type}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6">
          {!flipped ? (
            <>
              <p className={`text-4xl font-bold text-center ${text}`}>{cardData.original}</p>
              <p className={`text-xs uppercase tracking-wider ${subtext}`}>{cardData.from_lang} → {cardData.to_lang}</p>
              <div className={`mt-2 px-4 py-2 rounded-full text-xs ${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                Toca para ver la traducción
              </div>
            </>
          ) : (
            <>
              <p className={`text-sm uppercase tracking-wider ${subtext}`}>{cardData.original}</p>
              <p className={`text-4xl font-bold text-center ${text}`}>{cardData.translation}</p>
              {cardData.example && (
                <div className={`rounded-xl p-3 w-full mt-1 ${innerCard}`}>
                  <p className={`text-xs italic text-center ${muted}`}>"{cardData.example}"</p>
                  {cardData.example_translation && (
                    <p className={`text-xs text-center mt-1 ${subtext}`}>"{cardData.example_translation}"</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className={`text-center text-xs ${subtext}`}>
          {!flipped ? '👆 Toca la tarjeta' : '¿Cuánto la sabías?'}
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleRate('unknown')}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl border active:scale-95 transition-transform"
            style={{ backgroundColor: '#ef444415', borderColor: '#ef444440', color: '#ef4444' }}
          >
            <ThumbsDown size={22} />
            <span className="text-xs font-semibold">Para nada</span>
          </button>
          <button
            onClick={() => handleRate('learning')}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl border active:scale-95 transition-transform"
            style={{ backgroundColor: '#f59e0b15', borderColor: '#f59e0b40', color: '#f59e0b' }}
          >
            <Minus size={22} />
            <span className="text-xs font-semibold">Más o menos</span>
          </button>
          <button
            onClick={() => handleRate('known')}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl border active:scale-95 transition-transform"
            style={{ backgroundColor: '#22c55e15', borderColor: '#22c55e40', color: '#22c55e' }}
          >
            <ThumbsUp size={22} />
            <span className="text-xs font-semibold">Me la sé</span>
          </button>
        </div>
      )}
    </div>
  )
}
