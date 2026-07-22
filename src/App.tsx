import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Profile } from './pages/Profile'
import { Weekly } from './pages/Weekly'
import { Friends } from './pages/Friends'
import Prism from './components/Prism/Prism'

export default function App() {
  const [bgVisible, setBgVisible] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setBgVisible(!e.matches)
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <BrowserRouter>
      <div className="flex min-h-full flex-col">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {bgVisible ? (
            <Prism
              animationType="3drotate"
              timeScale={0.2}
              height={3.5}
              baseWidth={5.5}
              scale={3}
              glow={0.4}
              noise={0.2}
              colorFrequency={0.8}
              hueShift={0.8}
              bloom={0.5}
              transparent
              suspendWhenOffscreen
            />
          ) : (
            <div className="h-full w-full bg-[#0A1832]" />
          )}
        </div>
        <div className="fixed inset-0 -z-[5] bg-gradient-to-b from-[#0A1832]/60 to-transparent pointer-events-none" />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/weekly" element={<Weekly />} />
            <Route path="/friends" element={<Friends />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}