import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useAdminAuthStore } from '@/stores/admin-auth'
import AuthPage from '@/pages/AuthPage'
import HomePage from '@/pages/HomePage'
import RoomPage from '@/pages/RoomPage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminRooms from '@/pages/admin/AdminRooms'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminGifts from '@/pages/admin/AdminGifts'
import AdminSettings from '@/pages/admin/AdminSettings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return <Navigate to="/auth" state={{ from: location }} replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const { verify } = useAdminAuthStore()
  const location = useLocation()

  useEffect(() => {
    (async () => {
      const ok = await verify()
      setAuthed(ok)
      setChecking(false)
    })()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) return <Navigate to="/admin/login" state={{ from: location }} replace />
  return <>{children}</>
}

export default function App() {
  const { init } = useAuthStore()

  useEffect(() => {
    init()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/room/:roomId" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="gifts" element={<AdminGifts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
