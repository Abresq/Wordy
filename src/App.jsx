import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Languages, BookOpen, UserCircle, GalleryHorizontal } from 'lucide-react'
import { ThemeProvider, useTheme } from './theme.jsx'
import { AuthProvider, useAuth } from './auth.jsx'
import Translator from './pages/Translator'
import Vocabulary from './pages/Vocabulary'
import Stats from './pages/Stats'
import Flashcards from './pages/Flashcards'
import Login from './pages/Login'

const NAV = [
  { to: '/', icon: Languages, label: 'Traducir' },
  { to: '/vocab', icon: BookOpen, label: 'Vocab' },
  { to: '/flashcards', icon: GalleryHorizontal, label: 'Estudio' },
  { to: '/stats', icon: UserCircle, label: 'Perfil' },
]

function BottomNav() {
  const { isDark } = useTheme()
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center border-t px-2 ${
        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
      }`}
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-colors ${
              isActive ? 'text-fuchsia-500' : isDark ? 'text-zinc-600' : 'text-zinc-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function AppInner() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-svh max-w-lg mx-auto relative">
      <Routes>
        <Route path="/" element={<Translator />} />
        <Route path="/vocab" element={<Vocabulary />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
