import { useState } from 'react'
import { ArrowLeftRight, Loader2, BookmarkPlus, Check, Sparkles, Sun, Moon, Zap, LogOut } from 'lucide-react'
import { LANGUAGES, translateAndAnalyze } from '../api'
import { saveWord, useWords } from '../store'
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

export default function Translator() {
  const { isDark, toggle } = useTheme()
  const { user, signOut } = useAuth()
  const words = useWords(user?.id)
  const [text, setText] = useState('')
  const [fromLang, setFromLang] = useState('de')
  const [toLang, setToLang] = useState('es')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const card = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
  const input = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
  const subtext = isDark ? 'text-zinc-500' : 'text-zinc-400'
  const label = isDark ? 'text-zinc-300' : 'text-zinc-600'

  function swapLangs() {
    setFromLang(toLang)
    setToLang(fromLang)
    setResult(null)
    setText('')
  }

  async function handleTranslate() {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)
    try {
      const data = await translateAndAnalyze(text.trim(), fromLang, toLang)
      setResult(data)
    } catch (e) {
      setError('Error al traducir. Verifica tu conexión o API key.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result) return
    await saveWord({
      original: text.trim(),
      translation: result.translation,
      fromLang,
      toLang,
      category: result.category,
      example: result.example,
      exampleTranslation: result.exampleTranslation,
      type: result.type,
    }, user.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTranslate()
    }
  }

  const catColor = result ? (CATEGORY_COLORS[result.category] || '#6366f1') : '#6366f1'
  const today = new Date().toDateString()
  const recentWords = words.slice(0, 5)
  const todayCount = words.filter(w => new Date(w.added_at).toDateString() === today).length
  const dominatedCount = words.filter(w => (w.score || 0) >= 3).length

  return (
    <div className="flex flex-col gap-4 p-4 pb-28 max-w-lg mx-auto">
      {/* Header */}
      <div className="pt-6 pb-1 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Wordy
            </span>
            <Sparkles size={18} className="text-fuchsia-400" />
          </div>
          <p className={`text-xs mt-0.5 ${subtext}`}>Tu vocabulario personal</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-zinc-800 border-zinc-700 text-yellow-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={signOut}
            className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500'}`}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Guardadas', value: words.length, color: '#8b5cf6', emoji: '📚' },
          { label: 'Hoy', value: todayCount, color: '#0ea5e9', emoji: '⚡' },
          { label: 'Dominadas', value: dominatedCount, color: '#22c55e', emoji: '✅' },
        ].map(({ label, value, color, emoji }) => (
          <div key={label} className={`rounded-2xl border p-3 text-center ${card}`}>
            <p className="text-lg">{emoji}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color }}>{value}</p>
            <p className={`text-[10px] mt-0.5 ${subtext}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Language selector */}
      <div className={`flex items-center gap-2 rounded-2xl p-3 border ${input}`}>
        <select
          value={fromLang}
          onChange={e => setFromLang(e.target.value)}
          className={`flex-1 bg-transparent text-sm font-medium outline-none cursor-pointer ${isDark ? 'text-white' : 'text-zinc-800'}`}
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code} className={isDark ? 'bg-zinc-900' : 'bg-white'}>{l.label}</option>
          ))}
        </select>
        <button
          onClick={swapLangs}
          className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500'}`}
        >
          <ArrowLeftRight size={16} />
        </button>
        <select
          value={toLang}
          onChange={e => setToLang(e.target.value)}
          className={`flex-1 bg-transparent text-sm font-medium outline-none cursor-pointer ${isDark ? 'text-white' : 'text-zinc-800'}`}
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code} className={isDark ? 'bg-zinc-900' : 'bg-white'}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Input */}
      <div className={`rounded-2xl border overflow-hidden ${input}`}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe una palabra o frase..."
          rows={3}
          className={`w-full bg-transparent p-4 text-lg placeholder-zinc-400 outline-none resize-none ${isDark ? 'text-white' : 'text-zinc-900'}`}
        />
        <div className={`flex justify-between items-center px-4 pb-3 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
          <span className={`text-xs ${subtext}`}>{text.length} chars · Enter para traducir</span>
          <button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            Traducir
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-2xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className="px-4 pt-4 flex items-center gap-2">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: catColor + '25', color: catColor }}
            >
              {result.category}
            </span>
            <span className={`text-xs ${subtext}`}>{result.type}</span>
          </div>
          <div className="p-4">
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{result.translation}</p>
          </div>
          {result.example && (
            <div className={`mx-4 mb-4 rounded-xl p-3 ${isDark ? 'bg-zinc-800' : 'bg-zinc-50 border border-zinc-100'}`}>
              <p className={`text-sm italic ${label}`}>"{result.example}"</p>
              {result.exampleTranslation && (
                <p className={`text-sm mt-1 ${subtext}`}>"{result.exampleTranslation}"</p>
              )}
            </div>
          )}
          <div className="px-4 pb-4">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: saved ? '#22c55e20' : catColor + '20',
                color: saved ? '#22c55e' : catColor,
                border: `1px solid ${saved ? '#22c55e40' : catColor + '40'}`,
              }}
            >
              {saved ? <Check size={16} /> : <BookmarkPlus size={16} />}
              {saved ? '¡Guardado!' : 'Guardar en mi vocabulario'}
            </button>
          </div>
        </div>
      )}

      {/* Recent words */}
      {recentWords.length > 0 && (
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${subtext}`}>Recientes</p>
          <div className="flex flex-col gap-2">
            {recentWords.map(w => {
              const color = CATEGORY_COLORS[w.category] || '#6366f1'
              return (
                <div
                  key={w.id}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer ${card}`}
                  onClick={() => { setText(w.original); setFromLang(w.from_lang); setToLang(w.to_lang); setResult(null) }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex flex-col">
                      <span className={`text-base font-semibold ${isDark ? 'text-white' : 'text-zinc-800'}`}>{w.translation}</span>
                      <span className={`text-xs ${subtext}`}>{w.original}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: color + '20', color }}>
                    {w.category}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
