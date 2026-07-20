import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Profile } from './pages/Profile'
import Prism from './components/Prism/Prism'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-full flex-col">
        <div className="fixed inset-0 -z-10 overflow-hidden">
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
          />
        </div>
        <div className="fixed inset-0 -z-[5] bg-gradient-to-b from-[#0A1832]/60 to-transparent pointer-events-none" />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}