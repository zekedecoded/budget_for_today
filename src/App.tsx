import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { BottomNav } from './components/BottomNav'
import { HomePage } from './pages/HomePage'
import { ReceiptPage } from './pages/ReceiptPage'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Profile } from './pages/Profile'
import { Weekly } from './pages/Weekly'
import { Friends } from './pages/Friends'
import { useAuth } from './context/AuthContext'

function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className={`flex-1 ${user && !isAuthPage ? 'pb-20' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/receipt" element={<ReceiptPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/weekly" element={<Weekly />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>
      </main>
      {user && !isAuthPage && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-full flex-col">
        <AppLayout />
      </div>
    </BrowserRouter>
  )
}
