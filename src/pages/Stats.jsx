import { BarChart2, TrendingUp, Award, UserCircle } from 'lucide-react'
import { useWords, getStats } from '../store'
import { useTheme } from '../theme.jsx'
import { useAuth } from '../auth.jsx'

const CATEGORY_COLORS = {
  'General': '#6366f1', 'Comida': '#f97316', 'Viajes': '#0ea5e9',
  'Trabajo': '#8b5cf6', 'Familia': '#ec4899', 'Naturaleza': '#22c55e',
  'Tecnología': '#14b8a6', 'Salud': '#ef4444', 'Ropa': '#f59e0b',
  'Casa': '#84cc16', 'Tiempo': '#64748b', 'Emociones': '#d946ef',
  'Animales': '#fb923c', 'Deportes': '#3b82f6', 'Arte': '#a855f7',
  'Educación': '#06b6d4', 'Negocios': '#10b981', 'Sin categoría': '#71717a',
}

function getLevel(pct) {
  if (pct >= 80) return { label: 'Experto', emoji: '🏆', color: '#f59e0b' }
  if (pct >= 60) return { label: 'Avanzado', emoji: '🔥', color: '#22c55e' }
  if (pct >= 40) return { label: 'Intermedio', emoji: '📈', color: '#0ea5e9' }
  if (pct >= 20) return { label: 'Básico', emoji: '🌱', color: '#8b5cf6' }
  return { label: 'Principiante', emoji: '✨', color: '#6366f1' }
}

export default function Stats() {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [words] = useWords(user?.id)
  const userName = user?.user_metadata?.name
  const stats = getStats(words)

  const card = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
  const subtext = isDark ? 'text-zinc-500' : 'text-zinc-400'
  const text = isDark ? 'text-white' : 'text-zinc-900'
  const muted = isDark ? 'text-zinc-300' : 'text-zinc-600'
  const innerCard = isDark ? 'bg-zinc-800' : 'bg-zinc-50 border border-zinc-100'

  const level = getLevel(stats.levelPercent)
  const catEntries = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])
  const maxCat = catEntries[0]?.[1] || 1

  // Words added per day last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toDateString()
    return {
      day: d.toLocaleDateString('es', { weekday: 'short' }),
      count: words.filter(w => new Date(w.added_at).toDateString() === dateStr).length,
    }
  })
  const maxDay = Math.max(...last7.map(d => d.count), 1)

  return (
    <div className="flex flex-col gap-4 p-4 pb-28 max-w-lg mx-auto">
      <div className="pt-6 pb-1">
        <div className="flex items-center gap-2">
          <UserCircle size={22} className="text-blue-500" />
          <h1 className={`text-2xl font-bold ${text}`}>
            {userName ? `¡Hola, ${userName}!` : 'Perfil'}
          </h1>
        </div>
        <p className={`text-sm mt-1 ${subtext}`}>Tu progreso de aprendizaje</p>
      </div>

      {/* Level card */}
      <div className="rounded-2xl p-5 border" style={{ backgroundColor: level.color + '15', borderColor: level.color + '40' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider ${subtext}`}>Nivel actual</p>
            <p className="text-2xl font-bold mt-1" style={{ color: level.color }}>{level.emoji} {level.label}</p>
            <p className={`text-xs mt-1 ${subtext}`}>{stats.total} palabras en total</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black" style={{ color: level.color }}>{stats.levelPercent}%</p>
            <p className={`text-xs ${subtext}`}>dominadas</p>
          </div>
        </div>
        <div className={`rounded-full h-2.5 overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-white/50'}`}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${stats.levelPercent}%`, backgroundColor: level.color }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className={`text-[10px] ${subtext}`}>Principiante</span>
          <span className={`text-[10px] ${subtext}`}>Experto</span>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'known', label: 'Dominadas', color: '#22c55e', emoji: '✅' },
          { key: 'learning', label: 'Aprendiendo', color: '#f59e0b', emoji: '📖' },
          { key: 'new', label: 'Sin repasar', color: '#6366f1', emoji: '💤' },
        ].map(({ key, label, color, emoji }) => (
          <div key={key} className={`rounded-2xl border p-3 text-center ${card}`}>
            <p className="text-xl">{emoji}</p>
            <p className="text-2xl font-bold mt-1" style={{ color }}>{stats.scoreGroups[key]}</p>
            <p className={`text-[10px] mt-0.5 ${subtext}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Activity last 7 days */}
      {stats.total > 0 && (
        <div className={`rounded-2xl border p-4 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-blue-500" />
            <p className={`text-sm font-semibold ${muted}`}>Últimos 7 días</p>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {last7.map(({ day, count }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: count === 0 ? '4px' : `${(count / maxDay) * 60}px`,
                      backgroundColor: count === 0 ? (isDark ? '#27272a' : '#e4e4e7') : '#3b82f6',
                      minHeight: '4px',
                    }}
                  />
                </div>
                <span className={`text-[9px] font-medium ${subtext}`}>{day}</span>
                {count > 0 && <span className={`text-[9px] font-bold text-blue-500`}>{count}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {catEntries.length > 0 && (
        <div className={`rounded-2xl border p-4 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-blue-400" />
            <p className={`text-sm font-semibold ${muted}`}>Por categoría</p>
          </div>
          <div className="flex flex-col gap-3">
            {catEntries.map(([cat, count]) => {
              const color = CATEGORY_COLORS[cat] || '#6366f1'
              const pct = Math.round((count / stats.total) * 100)
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className={`text-sm ${muted}`}>{cat}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color }}>
                      {count} <span className={`font-normal text-xs ${subtext}`}>({pct}%)</span>
                    </span>
                  </div>
                  <div className={`rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxCat) * 100}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="text-center py-10">
          <p className="text-5xl mb-3">📊</p>
          <p className={`text-sm ${subtext}`}>Traduce y guarda palabras<br />para ver tus estadísticas</p>
        </div>
      )}
    </div>
  )
}
