import { useState } from 'react'
import { Sparkles, Loader2, Mail, Lock, User, Sun, Moon, Languages } from 'lucide-react'
import { useAuth } from '../auth.jsx'
import { useTheme } from '../theme.jsx'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const { isDark, toggle } = useTheme()
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const card = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
  const inputCls = isDark
    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500'
    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
  const subtext = isDark ? 'text-zinc-500' : 'text-zinc-400'
  const text = isDark ? 'text-white' : 'text-zinc-900'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (tab === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, name)
      }
    } catch (err) {
      const msg = err.message || 'Error desconocido'
      if (msg.includes('Invalid login')) setError('Email o contraseña incorrectos')
      else if (msg.includes('already registered')) setError('Este email ya tiene una cuenta')
      else if (msg.includes('weak')) setError('La contraseña debe tener al menos 6 caracteres')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-svh flex flex-col items-center justify-center p-6 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      <div className="w-full max-w-sm">
        {/* Theme toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggle}
            className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-zinc-800 border-zinc-700 text-yellow-400' : 'bg-white border-zinc-200 text-zinc-500'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
              <Languages size={38} className="text-white" strokeWidth={1.8} />
            </div>
          </div>
          <span className="text-4xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Wordy
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Sparkles size={14} className="text-blue-400" />
            <p className={`text-sm ${subtext}`}>Tu vocabulario personal</p>
          </div>
        </div>

        {/* Card */}
        <div className={`rounded-3xl border p-6 ${card}`}>
          {/* Tabs */}
          <div className={`flex rounded-xl p-1 mb-6 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            {[
              { key: 'login', label: 'Iniciar sesión' },
              { key: 'register', label: 'Crear cuenta' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === key
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-sm'
                    : subtext
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium uppercase tracking-wide ${subtext}`}>Nombre</label>
                <div className={`flex items-center gap-2 border rounded-xl px-3 py-3 ${inputCls}`}>
                  <User size={15} className={subtext} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    required
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-medium uppercase tracking-wide ${subtext}`}>Email</label>
              <div className={`flex items-center gap-2 border rounded-xl px-3 py-3 ${inputCls}`}>
                <Mail size={15} className={subtext} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-medium uppercase tracking-wide ${subtext}`}>Contraseña</label>
              <div className={`flex items-center gap-2 border rounded-xl px-3 py-3 ${inputCls}`}>
                <Lock size={15} className={subtext} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  required
                  minLength={6}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-700 text-white disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {tab === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          <p className={`text-xs text-center mt-4 ${subtext}`}>
            Creado por Abraham Esquivel
          </p>
        </div>
      </div>
    </div>
  )
}
