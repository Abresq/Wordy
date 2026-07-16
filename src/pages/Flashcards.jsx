import { useState } from 'react'
import { RotateCw, ThumbsUp, Minus, ThumbsDown, CheckCircle2, GalleryHorizontal, Settings2, ChevronRight, ChevronDown, Volume2, Library, BookOpen, XCircle } from 'lucide-react'
import { useWords, updateWordScore } from '../store'
import { useTheme } from '../theme.jsx'

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

function scoreGroup(word) {
  if ((word.review_count || 0) === 0) return 'new'
  if ((word.score || 0) >= 3) return 'known'
  if ((word.score || 0) >= 0) return 'learning'
  return 'unknown'
}

const STATUS_OPTIONS = [
  { key: 'all',     label: 'Todo el vocabulario', Icon: Library,       desc: 'Todas las palabras guardadas',     color: '#8b5cf6' },
  { key: 'new',     label: 'Sin repasar',          Icon: BookOpen,      desc: 'Palabras que nunca has estudiado', color: '#64748b' },
  { key: 'unknown', label: 'No me las sé',         Icon: XCircle,       desc: 'Palabras con puntuación baja',     color: '#ef4444' },
  { key: 'learning',label: 'Más o menos',          Icon: BookOpen,      desc: 'Palabras que estás aprendiendo',   color: '#f59e0b' },
  { key: 'known',   label: 'Ya me las sé',         Icon: CheckCircle2,  desc: 'Palabras que ya dominas',          color: '#22c55e' },
]

export default function Flashcards() {
  const { isDark } = useTheme()
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [sessionResults, setSessionResults] = useState({ known: 0, learning: 0, unknown: 0 })
  const [screen, setScreen] = useState('setup') // 'setup' | 'playing' | 'done'
  const [pendingUpdates, setPendingUpdates] = useState([])

  // Setup state
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCats, setSelectedCats] = useState([])
  const [catsOpen, setCatsOpen] = useState(false)

  const [allWords, , refetch] = useWords()

  const card = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
  const subtext = isDark ? 'text-zinc-500' : 'text-zinc-400'
  const text = isDark ? 'text-white' : 'text-zinc-900'
  const muted = isDark ? 'text-zinc-300' : 'text-zinc-600'
  const innerCard = isDark ? 'bg-zinc-800' : 'bg-zinc-50 border border-zinc-100'

  const availableCategories = [...new Set(allWords.map(w => w.category).filter(Boolean))].sort()

  function getFilteredWords() {
    let filtered = allWords
    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => scoreGroup(w) === statusFilter)
    }
    if (selectedCats.length > 0) {
      filtered = filtered.filter(w => selectedCats.includes(w.category))
    }
    return filtered
  }

  const previewCount = getFilteredWords().length

  function startDeck() {
    const filtered = getFilteredWords()
    if (!filtered.length) return
    setDeck(smartSort(filtered))
    setIndex(0)
    setFlipped(false)
    setDone(false)
    setSessionResults({ known: 0, learning: 0, unknown: 0 })
    setPendingUpdates([])
    setScreen('playing')
  }

  function playAgain() {
    setScreen('setup')
  }

  function handleRate(rating) {
    const delta = rating === 'known' ? 2 : rating === 'learning' ? 1 : -1
    const promise = updateWordScore(deck[index].id, delta)
    setSessionResults(prev => ({ ...prev, [rating]: prev[rating] + 1 }))
    const next = index + 1
    if (next >= deck.length) {
      Promise.all([...pendingUpdates, promise]).then(() => refetch())
      setPendingUpdates([])
      setScreen('done')
    } else {
      setPendingUpdates(prev => [...prev, promise])
      setIndex(next)
      setFlipped(false)
    }
  }

  function toggleCat(cat) {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  // ── Setup screen ──
  if (screen === 'setup') {
    return (
      <div className="flex flex-col gap-5 p-4 pb-28 max-w-lg mx-auto">
        <div className="pt-6 pb-1">
          <div className="flex items-center gap-2">
            <GalleryHorizontal size={22} className="text-blue-600" />
            <h1 className={`text-2xl font-bold ${text}`}>Estudio</h1>
          </div>
          <p className={`text-sm mt-1 ${subtext}`}>Elige qué quieres repasar</p>
        </div>

        {allWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <GalleryHorizontal size={48} className={subtext} />
            <p className={`text-lg font-bold ${text}`}>Sin palabras aún</p>
            <p className={`text-sm ${subtext}`}>Guarda palabras en el traductor<br />para estudiarlas aquí.</p>
          </div>
        ) : (
          <>
            {/* Status filter */}
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${subtext}`}>¿Cuáles quieres repasar?</p>
              <div className="flex flex-col gap-2">
                {STATUS_OPTIONS.map(opt => {
                  const count = opt.key === 'all'
                    ? allWords.length
                    : allWords.filter(w => scoreGroup(w) === opt.key).length
                  const active = statusFilter === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setStatusFilter(opt.key)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                        active
                          ? 'border-blue-500 bg-blue-500/10'
                          : isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'
                      }`}
                    >
                      <opt.Icon size={20} style={{ color: active ? '#3b82f6' : opt.color }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${active ? 'text-blue-500' : text}`}>{opt.label}</p>
                        <p className={`text-xs ${subtext}`}>{opt.desc}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${active ? 'text-blue-500' : subtext}`}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category filter */}
            {availableCategories.length > 0 && (
              <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                <button
                  onClick={() => setCatsOpen(o => !o)}
                  className="flex items-center justify-between w-full px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${text}`}>Filtrar por categoría</p>
                    {selectedCats.length > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">{selectedCats.length}</span>
                    )}
                  </div>
                  <ChevronDown size={16} className={`${subtext} transition-transform duration-200 ${catsOpen ? 'rotate-180' : ''}`} />
                </button>
                {catsOpen && (
                  <div className={`px-4 pb-4 pt-1 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                    {selectedCats.length > 0 && (
                      <button onClick={() => setSelectedCats([])} className={`text-xs ${subtext} underline mb-3 block`}>
                        Quitar filtros
                      </button>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map(cat => {
                        const color = CATEGORY_COLORS[cat] || '#6366f1'
                        const active = selectedCats.includes(cat)
                        return (
                          <button
                            key={cat}
                            onClick={() => toggleCat(cat)}
                            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                            style={{
                              backgroundColor: active ? color : color + '18',
                              color: active ? '#fff' : color,
                              border: `1px solid ${color}40`,
                            }}
                          >
                            {cat}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Start button */}
            <button
              onClick={startDeck}
              disabled={previewCount === 0}
              className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm transition-all ${
                previewCount > 0
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white active:scale-[0.98]'
                  : isDark ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              }`}
            >
              {previewCount > 0
                ? <><ChevronRight size={18} /> Empezar con {previewCount} {previewCount === 1 ? 'palabra' : 'palabras'}</>
                : 'Sin palabras con ese filtro'
              }
            </button>
          </>
        )}
      </div>
    )
  }

  // ── Done screen ──
  if (screen === 'done') {
    const total = sessionResults.known + sessionResults.learning + sessionResults.unknown
    const pctKnown = Math.round((sessionResults.known / total) * 100)

    const slices = [
      { key: 'known', color: '#22c55e', value: sessionResults.known },
      { key: 'learning', color: '#f59e0b', value: sessionResults.learning },
      { key: 'unknown', color: '#ef4444', value: sessionResults.unknown },
    ]
    const cx = 80, cy = 80, r = 70
    let angle = -Math.PI / 2
    const paths = slices.map(s => {
      if (s.value === 0) return null
      if (s.value === total) return { ...s, d: null, full: true }
      const sweep = (s.value / total) * 2 * Math.PI
      const x1 = cx + r * Math.cos(angle)
      const y1 = cy + r * Math.sin(angle)
      angle += sweep
      const x2 = cx + r * Math.cos(angle)
      const y2 = cy + r * Math.sin(angle)
      const large = sweep > Math.PI ? 1 : 0
      return { ...s, d: `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z` }
    }).filter(Boolean)

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 gap-6 text-center max-w-sm mx-auto">
        <div>
          <CheckCircle2 size={56} className="text-green-400 mx-auto mb-3" />
          <p className={`text-2xl font-bold ${text}`}>¡Sesión completada!</p>
          <p className={`text-sm mt-1 ${subtext}`}>{total} palabras repasadas · {pctKnown}% dominaste</p>
        </div>

        <div className="relative flex items-center justify-center">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {total > 0 && paths.map(s => (
              s.full
                ? <circle key={s.key} cx={cx} cy={cy} r={r} fill={s.color} />
                : <path key={s.key} d={s.d} fill={s.color} />
            ))}
            <circle cx="80" cy="80" r="40" fill={isDark ? '#09090b' : '#ffffff'} />
          </svg>
          <div className="absolute flex flex-col items-center justify-center gap-0.5">
            <span className="text-xl font-black leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: isDark ? '#fff' : '#18181b' }}>
              {pctKnown}%
            </span>
            <span className="text-[9px] leading-none" style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>
              dominadas
            </span>
          </div>
        </div>

        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { key: 'known', label: 'Me la sé', color: '#22c55e', Icon: CheckCircle2 },
            { key: 'learning', label: 'Más o menos', color: '#f59e0b', Icon: BookOpen },
            { key: 'unknown', label: 'Para nada', color: '#ef4444', Icon: XCircle },
          ].map(({ key, label, color, Icon }) => (
            <div key={key} className={`rounded-2xl border p-3 text-center ${card}`}>
              <Icon size={20} className="mx-auto" style={{ color }} />
              <p className="text-2xl font-bold mt-1" style={{ color }}>{sessionResults[key]}</p>
              <p className={`text-[10px] mt-0.5 ${subtext}`}>{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={playAgain}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${isDark ? 'border-zinc-700 text-zinc-300' : 'border-zinc-200 text-zinc-600'}`}
          >
            <Settings2 size={15} /> Cambiar filtros
          </button>
          <button
            onClick={startDeck}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold text-sm"
          >
            <RotateCw size={15} /> Otra ronda
          </button>
        </div>
      </div>
    )
  }

  // ── Playing screen ──
  const cardData = deck[index]
  const catColor = CATEGORY_COLORS[cardData.category] || '#6366f1'
  const progress = (index / deck.length) * 100

  // lang code → BCP-47 for Web Speech API
  const LANG_MAP = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-BR', ja: 'ja-JP', zh: 'zh-CN', ko: 'ko-KR', ru: 'ru-RU', nl: 'nl-NL', pl: 'pl-PL', ar: 'ar-SA' }
  function speak(text, lang) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = LANG_MAP[lang] || lang
    u.rate = 1
    window.speechSynthesis.speak(u)
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-28 max-w-lg mx-auto">
      <div className="pt-6 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GalleryHorizontal size={22} className="text-blue-600" />
            <h1 className={`text-2xl font-bold ${text}`}>Flashcards</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${subtext}`}>{index + 1} / {deck.length}</span>
            <button onClick={playAgain} className={`p-1.5 rounded-lg ${isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-500'}`}>
              <Settings2 size={16} />
            </button>
          </div>
        </div>
        <div className={`rounded-full h-2 mt-3 overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Session mini stats */}
      <div className="flex gap-2">
        {[
          { key: 'known', color: '#22c55e', Icon: CheckCircle2 },
          { key: 'learning', color: '#f59e0b', Icon: BookOpen },
          { key: 'unknown', color: '#ef4444', Icon: XCircle },
        ].map(({ key, color, Icon }) => (
          <div key={key} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-bold ${card}`} style={{ color }}>
            <Icon size={14} /> {sessionResults[key]}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="flashcard-scene" style={{ height: cardData.example ? 360 : 300 }} onClick={() => setFlipped(!flipped)}>
        <div className={`flashcard-inner${flipped ? ' flipped' : ''}`} style={{ height: '100%' }}>
          {/* Front */}
          <div className={`flashcard-face rounded-3xl border p-6 flex flex-col justify-between cursor-pointer ${card}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: catColor + '25', color: catColor }}>
                {cardData.category}
              </span>
              <span className={`text-xs ${subtext}`}>{cardData.type}</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <p className={`text-4xl font-bold text-center ${text}`}>{cardData.original}</p>
              <p className={`text-xs uppercase tracking-wider ${subtext}`}>{cardData.from_lang} → {cardData.to_lang}</p>
              <button
                onClick={e => { e.stopPropagation(); speak(cardData.original, cardData.from_lang) }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${isDark ? 'bg-zinc-800 text-zinc-400 hover:text-blue-400' : 'bg-zinc-100 text-zinc-500 hover:text-blue-500'}`}
              >
                <Volume2 size={13} /> Escuchar
              </button>
            </div>
            <div className={`text-center text-xs ${subtext}`}>👆 Toca la tarjeta</div>
          </div>

          {/* Back */}
          <div className={`flashcard-face flashcard-face-back rounded-3xl border p-5 flex flex-col justify-between ${card}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: catColor + '25', color: catColor }}>
                {cardData.category}
              </span>
              <span className={`text-xs ${subtext}`}>{cardData.type}</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className={`text-xs uppercase tracking-wider ${subtext}`}>{cardData.original}</p>
              <p className={`text-3xl font-bold text-center ${text}`}>{cardData.translation}</p>
              <button
                onClick={e => { e.stopPropagation(); speak(cardData.translation, cardData.to_lang) }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${isDark ? 'bg-zinc-800 text-zinc-400 hover:text-blue-400' : 'bg-zinc-100 text-zinc-500 hover:text-blue-500'}`}
              >
                <Volume2 size={13} /> Escuchar traducción
              </button>
            </div>
            {cardData.example ? (
              <div className={`rounded-xl p-3 ${innerCard}`}>
                <p className={`text-xs italic text-center ${muted}`}>"{cardData.example}"</p>
                {cardData.example_translation && (
                  <p className={`text-xs text-center mt-1 ${subtext}`}>"{cardData.example_translation}"</p>
                )}
              </div>
            ) : <div />}
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="flex flex-col gap-2">
          <p className={`text-center text-xs ${subtext}`}>¿Cuánto la sabías?</p>
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
        </div>
      )}
    </div>
  )
}
