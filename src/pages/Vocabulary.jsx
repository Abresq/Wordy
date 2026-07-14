import { useState } from 'react'
import { Search, Trash2, Filter, BookOpen } from 'lucide-react'
import { useWords, deleteWord } from '../store'
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

const SCORE_LABELS = {
  known: { label: 'Dominada', color: '#22c55e' },
  learning: { label: 'Aprendiendo', color: '#f59e0b' },
  new: { label: 'Nueva', color: '#6366f1' },
}

function scoreGroup(score) {
  if (score >= 3) return 'known'
  if (score >= 0) return 'learning'
  return 'new'
}

export default function Vocabulary() {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [words, setWords] = useWords()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todas')
  const [showFilter, setShowFilter] = useState(false)

  function handleDelete(id) { deleteWord(id, setWords) }

  const card = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
  const subtext = isDark ? 'text-zinc-500' : 'text-zinc-400'
  const text = isDark ? 'text-white' : 'text-zinc-900'
  const muted = isDark ? 'text-zinc-300' : 'text-zinc-600'

  const categories = ['Todas', ...new Set(words.map(w => w.category).filter(Boolean))]

  const filtered = words.filter(w => {
    const matchSearch = !search ||
      w.original.toLowerCase().includes(search.toLowerCase()) ||
      w.translation.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'Todas' || w.category === catFilter
    return matchSearch && matchCat
  })

  return (
    <div className="flex flex-col gap-4 p-4 pb-28 max-w-lg mx-auto">
      <div className="pt-6 pb-1">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-blue-600" />
          <h1 className={`text-2xl font-bold ${text}`}>Mi Vocabulario</h1>
        </div>
        <p className={`text-sm mt-1 ${subtext}`}>{words.length} palabras guardadas</p>
      </div>

      {/* Summary pills */}
      {words.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'known', label: 'Dominadas', color: '#22c55e' },
            { key: 'learning', label: 'Aprendiendo', color: '#f59e0b' },
            { key: 'new', label: 'Sin repasar', color: '#6366f1' },
          ].map(({ key, label, color }) => {
            const count = words.filter(w => scoreGroup(w.score || 0) === key).length
            return (
              <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className={muted}>{count} {label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Search & filter */}
      <div className="flex gap-2">
        <div className={`flex-1 flex items-center gap-2 border rounded-xl px-3 py-2 ${card}`}>
          <Search size={16} className={subtext} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar palabra..."
            className={`flex-1 bg-transparent text-sm outline-none placeholder-zinc-400 ${text}`}
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2.5 rounded-xl border transition-colors ${
            showFilter
              ? 'bg-gradient-to-r from-blue-600 to-teal-500 border-blue-500 text-white'
              : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-400'
          }`}
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Category filter pills */}
      {showFilter && (
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => {
            const color = CATEGORY_COLORS[cat] || '#6366f1'
            const active = catFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={{
                  backgroundColor: active ? color : color + '15',
                  color: active ? '#fff' : color,
                  border: `1px solid ${color}40`,
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Words list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📚</p>
          <p className={`text-sm ${subtext}`}>No hay palabras aún.<br />¡Empieza traduciendo algo!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(word => {
            const catColor = CATEGORY_COLORS[word.category] || '#6366f1'
            const sg = scoreGroup(word.score || 0)
            const status = SCORE_LABELS[sg]
            return (
              <div key={word.id} className={`rounded-2xl border p-4 ${card}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-lg ${text}`}>{word.original}</span>
                      <span className={`text-sm ${subtext}`}>→</span>
                      <span className={muted}>{word.translation}</span>
                    </div>
                    {word.example && (
                      <p className={`text-xs italic mt-1 ${subtext} line-clamp-1`}>"{word.example}"</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: catColor + '20', color: catColor }}>
                        {word.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: status.color + '20', color: status.color }}>
                        {status.label}
                      </span>
                      {word.review_count > 0 && (
                        <span className={`text-xs ${subtext}`}>{word.review_count} repasos</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(word.id)}
                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'text-zinc-600 hover:text-red-400 hover:bg-red-950' : 'text-zinc-300 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
